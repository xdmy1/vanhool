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
  return { ok: true as const, supabase };
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
