import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Give back the store credit an order consumed, when that order is cancelled,
 * voided or deleted — the customer's voucher must not stay burned for a sale
 * that never happened. Mirror of the consumption in finalizeOrder.
 *
 * Idempotent via orders.credit_consumed_at: releases only when set, clears it
 * afterwards, so repeated cancels can't refund twice. Legacy schemas (columns
 * not migrated) and credit-free orders no-op silently.
 *
 * NOTE: un-cancelling an order does NOT re-consume the credit (finalize won't
 * run again) — if that ever happens with real credit involved, the operator
 * settles the voucher by hand. Cancels being final is the normal flow here.
 */
export async function releaseOrderCredits(orderId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("orders")
    .select("credit_applied, credit_ids, credit_consumed_at")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return;
  const row = data as {
    credit_applied?: number | null;
    credit_ids?: Array<{ id?: string; amount?: number }> | null;
    credit_consumed_at?: string | null;
  };
  if (!row.credit_consumed_at) return;
  const allocs = Array.isArray(row.credit_ids) ? row.credit_ids : [];
  for (const a of allocs) {
    const amt = Number(a?.amount ?? 0);
    if (!a?.id || amt <= 0) continue;
    const { data: cr } = await admin
      .from("store_credits")
      .select("amount, used_amount, status")
      .eq("id", a.id)
      .maybeSingle();
    if (!cr) continue;
    const c = cr as { amount: number | null; used_amount: number | null; status: string | null };
    const used = Math.max(0, Number((Number(c.used_amount ?? 0) - amt).toFixed(2)));
    await admin
      .from("store_credits")
      .update({
        used_amount: used,
        status: used < Number(c.amount ?? 0) - 0.01 ? "active" : c.status ?? "active",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", a.id);
  }
  await admin
    .from("orders")
    .update({ credit_consumed_at: null } as never)
    .eq("id", orderId);
}
