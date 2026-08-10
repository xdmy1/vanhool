"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage } from "@/lib/admin/db-errors";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import {
  reverseOrderStock,
  unreverseOrderStock,
  type StockDb,
} from "@/lib/stock-ledger";
import { ORDER_STATUSES, type OrderStatus } from "./constants";

/**
 * Load the fields the stock-ledger reverse helpers need. `payment_status` is
 * a maib-migration column — fall back without it on legacy schemas.
 */
async function loadOrderForStock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
): Promise<Record<string, unknown> | null> {
  const cols = "id, status, items, payment_method";
  let res = await supabase
    .from("orders")
    .select(`${cols}, payment_status` as typeof cols)
    .eq("id", id)
    .maybeSingle();
  if (res.error && /payment_status/i.test(res.error.message)) {
    res = await supabase.from("orders").select(cols).eq("id", id).maybeSingle();
  }
  return (res.data as Record<string, unknown>) ?? null;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const };
  return { ok: true as const, supabase, user };
}

const statusSchema = z.enum(ORDER_STATUSES);

export type OrderActionResult =
  | { ok: true }
  | { ok: false; code: "validation" | "server" | "forbidden"; message?: string };

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, code: "validation" };

  // Stock follows the status through the LEDGER:
  //   → cancelled: restore exactly what the order actually took (nothing for
  //     an unpaid card order, returns already credited stay credited).
  //   cancelled →: re-take exactly what the cancel restored, so
  //     cancel → un-cancel → cancel cycles never double-restore.
  const cur = await loadOrderForStock(auth.supabase, id);
  const curStatus = (cur?.status as string | null) ?? null;
  const db = auth.supabase as unknown as StockDb;
  if (cur && parsed.data === "cancelled" && curStatus !== "cancelled") {
    const restored = await reverseOrderStock(
      db,
      {
        id,
        items: cur.items,
        payment_method: (cur.payment_method as string | null) ?? null,
        payment_status: (cur.payment_status as string | null) ?? null,
      },
      auth.user.id,
    );
    // Refuse the status change if stock couldn't follow it — retry heals.
    if (!restored.ok) return { ok: false, code: "server", message: restored.reason };
  } else if (cur && parsed.data !== "cancelled" && curStatus === "cancelled") {
    const retaken = await unreverseOrderStock(db, id, auth.user.id);
    if (!retaken.ok) return { ok: false, code: "server", message: retaken.reason };
  }

  const { error } = await auth.supabase
    .from("orders")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateOrderNotes(
  id: string,
  notes: string,
): Promise<OrderActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const trimmed = notes.trim();
  const { error } = await auth.supabase
    .from("orders")
    .update({ notes: trimmed.length > 0 ? trimmed.slice(0, 4000) : null })
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Hard-delete an order. Cascades: clears any linked invoices and
 * delivery_notes first (those records get removed too — admin clicked
 * delete on the order, intent is "everything goes"). PIN-gated.
 */
export async function deleteOrderWithPin(
  id: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  const supabase = auth.supabase;

  // Restore stock BEFORE removing the row, through the LEDGER: it puts back
  // exactly what this order actually took (nothing for an unpaid card order,
  // nothing extra after an earlier cancel — the net is already zero). The
  // movements survive the delete (no FK), keeping the audit trail.
  const ord = await loadOrderForStock(supabase, id);
  if (ord && (ord.status as string | null) !== "cancelled") {
    const restored = await reverseOrderStock(
      supabase as unknown as StockDb,
      {
        id,
        items: ord.items,
        payment_method: (ord.payment_method as string | null) ?? null,
        payment_status: (ord.payment_status as string | null) ?? null,
      },
      auth.user.id,
    );
    // The order must not vanish while its stock stays out — abort the delete.
    if (!restored.ok) return { ok: false, reason: restored.reason };
  }

  // Before cascading the delete, reverse any cash drawer inflows
  // recorded against this order (conta2 + cash sales / payments).
  // Otherwise the till keeps the inflow forever even though the
  // underlying order is gone, breaking reconciliation.
  const { data: cashIns } = await supabase
    .from("cash_register_movements")
    .select("id, amount, currency, fx_rate, amount_mdl")
    .eq("order_id", id)
    .eq("direction", "in");
  for (const m of (cashIns ?? []) as Array<{
    id: string;
    amount: number | string | null;
    currency: string | null;
    fx_rate: number | string | null;
    amount_mdl: number | string | null;
  }>) {
    const amt = Number(m.amount ?? 0);
    if (amt <= 0) continue;
    const cur = (m.currency ?? "MDL").toUpperCase();
    const fxRate = Number(m.fx_rate ?? (cur === "EUR" ? 20 : cur === "USD" ? 17 : 1));
    await supabase.from("cash_register_movements").insert({
      direction: "out",
      amount: amt,
      reason: "adjustment",
      order_id: id,
      created_by: auth.user.id,
      notes: `Anulare comandă (ștergere) — reversare mișcare ${m.id.slice(0, 8)}`,
      ...({
        currency: cur,
        fx_rate: fxRate,
        amount_mdl: Number((amt * fxRate).toFixed(2)),
      } as object),
    });
  }

  // Cascade: nuke linked invoices + delivery notes so FKs don't block.
  await supabase.from("invoices").delete().eq("order_id", id);
  await supabase.from("delivery_notes").delete().eq("order_id", id);

  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/admin/orders", "page");
  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  return { ok: true };
}
