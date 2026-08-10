import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyCallbackSignature } from "@/lib/payments/maib/client";
import { finalizeOrder } from "@/lib/orders/actions";
import { sendResendEmail, getAdminEmail } from "@/lib/email/resend";
import { releaseOrderCredits } from "@/lib/orders/release-credits";
import { reverseOrderStock, type StockDb } from "@/lib/stock-ledger";
import type { MaibCallbackBody, MaibPayInfo } from "@/lib/payments/maib/types";

/** Money moved but the order can't follow — the admin must hear about it. */
function alertAdmin(subject: string, body: string): void {
  void sendResendEmail({
    to: getAdminEmail(),
    subject,
    html: `<p>${body}</p>`,
    text: body,
  }).catch((e) => console.error("[maib] admin alert failed:", e));
}

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
    // flipped it, no rows come back and we skip re-fulfilment. An order the
    // admin cancelled while the customer sat on the payment page must NOT be
    // resurrected and fulfilled — the money lands as a payments row for the
    // operator to refund, but stock stays untouched.
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
      .neq("status", "cancelled")
      .select("id");
    await recordPayment(admin, orderId, payId, result, "paid");
    if (updated && updated.length > 0) {
      await finalizeOrder(orderId);
      // An admin cancel can race this callback: its restore saw an unpaid
      // order (restored nothing), our finalize then decremented, and the
      // cancel's status write won. Re-read; if the order ended cancelled,
      // net the take back out and page the admin about the orphan money.
      const { data: post } = await admin
        .from("orders")
        .select("status, items, payment_method, created_at")
        .eq("id", orderId)
        .maybeSingle();
      if ((post as { status?: string } | null)?.status === "cancelled") {
        await reverseOrderStock(admin as unknown as StockDb, {
          id: orderId,
          items: (post as { items?: unknown }).items ?? [],
          payment_method:
            (post as { payment_method?: string | null }).payment_method ?? "card",
          payment_status: "paid",
          created_at: (post as { created_at?: string | null }).created_at ?? null,
        });
        alertAdmin(
          `⚠️ Plată maib pe comandă ANULATĂ #${orderId.slice(0, 8)}`,
          `Comanda ${orderId} a fost anulată în timp ce maib confirma plata (payId ${payId ?? "?"}). Stocul a fost readus la zero net; clientul trebuie rambursat manual.`,
        );
      }
    } else {
      // Either a replayed callback (fine) or money landing on a CANCELLED
      // order — the customer paid for something we won't ship. The payments
      // row alone is invisible; wake the admin up.
      const { data: cur } = await admin
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();
      if ((cur as { status?: string } | null)?.status === "cancelled") {
        alertAdmin(
          `⚠️ Plată maib pe comandă ANULATĂ #${orderId.slice(0, 8)}`,
          `Comanda ${orderId} este anulată dar maib a confirmat plata (payId ${payId ?? "?"}). Clientul trebuie rambursat manual — stocul NU a fost mișcat.`,
        );
      }
    }
    return new Response("OK", { status: 200 });
  }

  if (status === "REVERSED") {
    // Bank reversed the money. Only a payment that actually WAS paid undoes a
    // sale — a reversal on a pending/failed authorization must not touch
    // stock (nothing was ever decremented). Read the truth BEFORE writing.
    const { data: pre } = await admin
      .from("orders")
      .select("status, payment_status, items, payment_method, created_at")
      .eq("id", orderId)
      .maybeSingle();
    const preRow = pre as
      | {
          status?: string | null;
          payment_status?: string | null;
          items?: unknown;
          payment_method?: string | null;
          created_at?: string | null;
        }
      | null;
    const wasPaid = preRow?.payment_status === "paid";
    if (preRow && preRow.payment_status !== "refunded") {
      await admin
        .from("orders")
        .update({
          payment_status: "refunded",
          ...(wasPaid ? { status: "cancelled" } : {}),
        })
        .eq("id", orderId)
        .neq("payment_status", "refunded");
      if (wasPaid && preRow.status !== "cancelled") {
        const restored = await reverseOrderStock(admin as unknown as StockDb, {
          id: orderId,
          items: preRow.items ?? [],
          payment_method: preRow.payment_method ?? "card",
          payment_status: "paid",
          created_at: preRow.created_at ?? null,
        });
        if (!restored.ok) {
          console.error(`[maib] REVERSED: stock restore failed for ${orderId}: ${restored.reason}`);
        }
        await releaseOrderCredits(orderId);
        alertAdmin(
          `↩️ Plată maib STORNATĂ #${orderId.slice(0, 8)}`,
          `Banca a stornat plata comenzii ${orderId} (payId ${payId ?? "?"}). Comanda a fost anulată și stocul restaurat${restored.ok ? "" : " — ATENȚIE: restaurarea stocului a EȘUAT, verifică manual"}.`,
        );
      }
    }
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
