import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyCallbackSignature } from "@/lib/payments/maib/client";
import { finalizeOrder } from "@/lib/orders/actions";
import type { MaibCallbackBody, MaibPayInfo } from "@/lib/payments/maib/types";

export const dynamic = "force-dynamic";

/**
 * maib posts { result, signature } here after a card payment. We MUST verify
 * the signature (never trust the body otherwise) and MUST reply HTTP 200 or
 * maib retries. status OK → mark paid + fulfil the order (stock/emails/invoice)
 * exactly once; FAILED → mark failed (stock was never touched); REVERSED →
 * refunded.
 */
export async function POST(req: NextRequest): Promise<Response> {
  let body: MaibCallbackBody | null = null;
  try {
    body = (await req.json()) as MaibCallbackBody;
  } catch {
    body = null;
  }
  if (!body || !verifyCallbackSignature(body)) {
    return new Response("invalid signature", { status: 401 });
  }

  const result = body.result;
  const orderId = result.orderId ? String(result.orderId) : null;
  const status = String(result.status ?? "");
  const payId = result.payId ? String(result.payId) : null;
  if (!orderId) return new Response("OK", { status: 200 });

  const admin = getSupabaseAdmin() as unknown as SupabaseClient;

  if (status === "OK") {
    // Idempotent transition pending → paid. If a prior callback already
    // flipped it, no rows come back and we skip re-fulfilment.
    const { data: updated } = await admin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        paid_at: new Date().toISOString(),
        ...(payId ? { maib_pay_id: payId } : {}),
      })
      .eq("id", orderId)
      .neq("payment_status", "paid")
      .select("id");
    await recordPayment(admin, orderId, payId, result, "paid");
    if (updated && updated.length > 0) {
      await finalizeOrder(orderId);
    }
    return new Response("OK", { status: 200 });
  }

  if (status === "REVERSED") {
    await admin
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("id", orderId);
    await recordPayment(admin, orderId, payId, result, "refunded");
    return new Response("OK", { status: 200 });
  }

  // FAILED / declined / anything else — mark failed (never over-write a paid).
  await admin
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("id", orderId)
    .neq("payment_status", "paid");
  await recordPayment(admin, orderId, payId, result, "failed");
  return new Response("OK", { status: 200 });
}

/** One payments row per payId (audit trail), updated with the latest status. */
async function recordPayment(
  admin: SupabaseClient,
  orderId: string,
  payId: string | null,
  result: MaibPayInfo,
  status: string,
): Promise<void> {
  if (!payId) return;
  const row = {
    order_id: orderId,
    amount: Number(result.amount ?? 0),
    currency: String(result.currency ?? "MDL"),
    method: "maib",
    status,
    gateway_reference: payId,
  };
  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("gateway_reference", payId)
    .maybeSingle();
  if (existing) {
    await admin
      .from("payments")
      .update(row)
      .eq("id", (existing as { id: string }).id);
  } else {
    await admin.from("payments").insert(row);
  }
}
