import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyCallbackSignature } from "@/lib/payments/maib/client";
import type { MaibCallbackBody } from "@/lib/payments/maib/types";

export const dynamic = "force-dynamic";

/**
 * Callback for a maib pay-link generated against a PROFORMA (panel B2B flow).
 * Marks the proforma paid; the operator then issues the fiscal invoice as
 * usual. DORMANT until a panel "pay by card" button is wired at go-live. Must
 * reply HTTP 200.
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
  const proformaId = result.orderId ? String(result.orderId) : null;
  const status = String(result.status ?? "");
  const payId = result.payId ? String(result.payId) : null;
  if (!proformaId) return new Response("OK", { status: 200 });

  const admin = getSupabaseAdmin() as unknown as SupabaseClient;
  const paymentStatus =
    status === "OK" ? "paid" : status === "REVERSED" ? "refunded" : "failed";
  const patch: Record<string, unknown> = {
    payment_status: paymentStatus,
    ...(payId ? { maib_pay_id: payId } : {}),
    ...(status === "OK" ? { paid_at: new Date().toISOString() } : {}),
  };
  await admin.from("invoices").update(patch).eq("id", proformaId);

  return new Response("OK", { status: 200 });
}
