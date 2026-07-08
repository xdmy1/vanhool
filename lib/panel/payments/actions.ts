"use server";

import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import {
  createPayment,
  refund as maibRefund,
  maibConfigured,
} from "@/lib/payments/maib/client";
import type { MaibCurrency } from "@/lib/payments/maib/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://inter-bus.md";

export type ProformaLinkResult =
  | { ok: true; payUrl: string }
  | { ok: false; reason: string };

/**
 * Generate a maib card pay-link for a proforma so the operator can send it to a
 * B2B client. On payment, /api/payments/maib/proforma-callback marks the
 * proforma paid; the operator then issues the fiscal invoice as usual.
 */
export async function createProformaCardLink(
  proformaId: string,
): Promise<ProformaLinkResult> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!maibConfigured()) return { ok: false, reason: "maib_not_configured" };

  const supabase = await createClient();
  const { data: pf } = await supabase
    .from("invoices")
    .select("id, type, series, number, total, currency, customer_snapshot")
    .eq("id", proformaId)
    .maybeSingle();
  if (!pf || (pf as { type?: string }).type !== "proforma") {
    return { ok: false, reason: "not_found" };
  }
  const p = pf as {
    total: number | string | null;
    currency: string | null;
    series: string | null;
    number: string | null;
    customer_snapshot: { name?: string; email?: string; phone?: string } | null;
  };
  const total = Number(p.total ?? 0);
  if (!(total > 0)) return { ok: false, reason: "invalid_amount" };
  const cur = (p.currency ?? "MDL").toUpperCase();
  const currency: MaibCurrency =
    cur === "EUR" || cur === "USD" ? (cur as MaibCurrency) : "MDL";
  const cs = p.customer_snapshot ?? {};
  const label = `${p.series ?? ""}${p.number ?? "—"}`;

  const h = await headers();
  const clientIp =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0";

  try {
    const pay = await createPayment({
      amount: total,
      currency,
      clientIp,
      language: "ro",
      description: `Proforma ${label} — Inter Bus`,
      clientName: cs.name,
      email: cs.email,
      phone: cs.phone,
      orderId: proformaId,
      callbackUrl: `${SITE_URL}/api/payments/maib/proforma-callback`,
      okUrl: `${SITE_URL}/ro/checkout/success`,
      failUrl: `${SITE_URL}/ro/checkout/failed`,
    });
    if (!pay.payUrl) throw new Error("maib returned no payUrl");
    // Persist the pay id (resilient — link still works if the migration isn't
    // applied yet, the state just won't stick across reloads).
    const upd = await supabase
      .from("invoices")
      .update({ maib_pay_id: pay.payId, payment_status: "pending" } as never)
      .eq("id", proformaId);
    if (upd.error && !/(maib_pay_id|payment_status|column)/i.test(upd.error.message)) {
      console.warn("[maib] proforma pay id persist failed:", upd.error.message);
    }
    return { ok: true, payUrl: pay.payUrl };
  } catch (e) {
    console.error("[maib] proforma pay-link failed:", e);
    return { ok: false, reason: "payment_error" };
  }
}

export type RefundResult = { ok: true } | { ok: false; reason: string };

/** Refund a paid card order (storefront). Requires the admin PIN. */
export async function refundOrderCard(
  orderId: string,
  pin: string,
): Promise<RefundResult> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  if (!maibConfigured()) return { ok: false, reason: "maib_not_configured" };

  const admin = getSupabaseAdmin() as unknown as SupabaseClient;
  const { data: order } = await admin
    .from("orders")
    .select("id, maib_pay_id, payment_status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, reason: "not_found" };
  const o = order as unknown as {
    maib_pay_id: string | null;
    payment_status: string | null;
  };
  if (!o.maib_pay_id || o.payment_status !== "paid") {
    return { ok: false, reason: "not_refundable" };
  }
  try {
    await maibRefund(o.maib_pay_id);
    await admin
      .from("orders")
      .update({ payment_status: "refunded" } as never)
      .eq("id", orderId);
    return { ok: true };
  } catch (e) {
    console.error("[maib] refund failed:", e);
    return { ok: false, reason: "refund_error" };
  }
}
