"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage } from "@/lib/admin/db-errors";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import { ORDER_STATUSES, type OrderStatus } from "./constants";

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

  // Cancelling an order rolls back the stock that was decremented when
  // the order was placed (storefront + panel sale paths both touch
  // stock now). Skip when current status is already "cancelled" so
  // a re-toggle doesn't double-restore.
  if (parsed.data === "cancelled") {
    const { data: cur } = await auth.supabase
      .from("orders")
      .select("status, items")
      .eq("id", id)
      .maybeSingle();
    if (cur && cur.status !== "cancelled") {
      const items = Array.isArray(cur.items)
        ? (cur.items as Array<Record<string, unknown>>)
        : [];
      for (const it of items) {
        const productId =
          (it as { productId?: string | null }).productId ??
          (it as { product_id?: string | null }).product_id ??
          null;
        const qty = Number((it as { quantity?: number }).quantity ?? 0);
        if (!productId || qty <= 0) continue;
        const { data: prod } = await auth.supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .maybeSingle();
        if (!prod) continue;
        const next = Number(prod.stock_quantity ?? 0) + qty;
        await auth.supabase
          .from("products")
          .update({ stock_quantity: next })
          .eq("id", productId);
      }
    }
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

  // Restore stock BEFORE removing the row. The sale path decrements
  // stock on insert; hard-delete must undo that or the catalog ends up
  // permanently short. Skip restoration if the order was already
  // cancelled (stock was put back when status flipped to cancelled).
  const { data: ord } = await supabase
    .from("orders")
    .select("id, status, items")
    .eq("id", id)
    .maybeSingle();
  if (ord && ord.status !== "cancelled") {
    const items = Array.isArray(ord.items)
      ? (ord.items as Array<Record<string, unknown>>)
      : [];
    for (const it of items) {
      const productId =
        (it as { productId?: string | null }).productId ??
        (it as { product_id?: string | null }).product_id ??
        null;
      const qty = Number((it as { quantity?: number }).quantity ?? 0);
      if (!productId || qty <= 0) continue;
      const { data: p } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .maybeSingle();
      if (!p) continue;
      await supabase
        .from("products")
        .update({ stock_quantity: Number(p.stock_quantity ?? 0) + qty })
        .eq("id", productId);
    }
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
