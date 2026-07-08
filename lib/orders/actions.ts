"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calcDiscount, calcShipping, calcSubtotal } from "@/lib/cart/pricing";
import { applyPromoCode } from "@/lib/cart/actions";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation/checkout";
import type { CartItem } from "@/lib/cart/types";
import type { Json } from "@/lib/supabase/database.types";
import { sendResendEmail, getAdminEmail } from "@/lib/email/resend";
import {
  orderAdminEmail,
  orderCustomerEmail,
  type OrderEmailData,
} from "@/lib/email/templates";
import { createPayment, maibConfigured } from "@/lib/payments/maib/client";

export type CreateOrderResult =
  | { ok: true; orderId: string; redirectUrl?: string }
  | {
      ok: false;
      code: "validation" | "server" | "empty_cart" | "payment";
      message?: string;
    };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://inter-bus.md";

/** Locale from the checkout page's Referer, so maib redirects back in-language. */
function localeFromReferer(referer: string | null): string {
  const m = referer?.match(/\/(ro|en|ru)(\/|$)/);
  return m?.[1] ?? "ro";
}

export async function createOrder(values: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const data: CheckoutValues = parsed.data;
  if (data.items.length === 0) return { ok: false, code: "empty_cart" };

  const cartItems: CartItem[] = data.items.map((i) => ({
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    brand: i.brand,
    partCode: i.partCode,
    price: i.price,
    illustration: "engine",
    imageUrl: null,
    quantity: i.quantity,
    maxStock: i.quantity,
  }));

  const subtotal = calcSubtotal(cartItems);

  let discount = 0;
  let promoCodeApplied: string | null = null;
  if (data.promoCode) {
    const promoCheck = await applyPromoCode(data.promoCode, subtotal);
    if (promoCheck.ok) {
      discount = calcDiscount(subtotal, promoCheck.promo);
      promoCodeApplied = promoCheck.promo.code;
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = calcShipping(afterDiscount, cartItems.length > 0);
  const total = afterDiscount + shipping;

  // Card payment must be configured to be offered; guard defensively.
  const isCard = data.paymentMethod === "card";
  if (isCard && !maibConfigured()) {
    return { ok: false, code: "payment", message: "Card payments unavailable" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullPhone = `${data.phoneCountry}${data.phoneNumber.trim().replace(/[\s-]/g, "")}`;
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const fullAddress = data.postal
    ? `${data.address}, ${data.city} ${data.postal}`
    : `${data.address}, ${data.city}`;

  const orderRow: Record<string, unknown> = {
    user_id: user?.id ?? null,
    customer_name: fullName,
    customer_email: data.email,
    customer_phone: fullPhone,
    customer_address: fullAddress,
    items: data.items as unknown as Json,
    subtotal,
    discount_amount: discount,
    shipping_cost: shipping,
    total,
    status: "pending",
    payment_method: data.paymentMethod,
    notes: data.notes || null,
    // Card orders stay unpaid until maib confirms on the callback; only then
    // do we decrement stock / send emails / bump promo usage.
    ...(isCard ? { payment_status: "pending" } : {}),
    ...(promoCodeApplied ? { promo_code: promoCodeApplied } : {}),
  };

  let insertRes = await supabase
    .from("orders")
    .insert(orderRow as never)
    .select("id")
    .single();
  // Resilient to sql/maib-payments.sql not being applied yet: retry without the
  // new columns so cash/transfer + promo orders keep working pre-migration.
  if (
    insertRes.error &&
    /(promo_code|payment_status)/i.test(insertRes.error.message)
  ) {
    const safeRow = { ...orderRow };
    delete safeRow.promo_code;
    delete safeRow.payment_status;
    insertRes = await supabase
      .from("orders")
      .insert(safeRow as never)
      .select("id")
      .single();
  }
  const insertData = insertRes.data;
  const insertError = insertRes.error;

  if (insertError || !insertData) {
    return {
      ok: false,
      code: "server",
      message: insertError?.message ?? "Insert failed",
    };
  }

  // ---- Card: hand off to maib, do NOT finalize yet ----
  if (isCard) {
    const h = await headers();
    const clientIp =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "0.0.0.0";
    const locale = localeFromReferer(h.get("referer"));
    const shortId = insertData.id.slice(0, 8).toUpperCase();
    try {
      const pay = await createPayment({
        amount: total,
        currency: "MDL",
        clientIp,
        language: locale === "en" || locale === "ru" ? locale : "ro",
        description: `Comanda #${shortId} — Inter Bus`,
        clientName: fullName,
        email: data.email,
        phone: fullPhone,
        orderId: insertData.id,
        delivery: shipping || undefined,
        items: data.items.map((i) => ({
          id: i.productId ?? undefined,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        callbackUrl: `${SITE_URL}/api/payments/maib/callback`,
        okUrl: `${SITE_URL}/${locale}/checkout/success`,
        failUrl: `${SITE_URL}/${locale}/checkout/failed`,
      });
      if (!pay.payUrl) throw new Error("maib returned no payUrl");
      await supabase
        .from("orders")
        .update({ maib_pay_id: pay.payId } as never)
        .eq("id", insertData.id);
      return { ok: true, orderId: insertData.id, redirectUrl: pay.payUrl };
    } catch (e) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" } as never)
        .eq("id", insertData.id);
      console.error("[maib] createPayment failed:", e);
      return { ok: false, code: "payment", message: "Payment could not start" };
    }
  }

  // ---- Cash / transfer: finalize immediately (unchanged behaviour) ----
  await finalizeOrder(insertData.id);
  return { ok: true, orderId: insertData.id };
}

type StoredItem = {
  productId?: string;
  name?: string;
  brand?: string | null;
  partCode?: string | null;
  price?: number;
  quantity?: number;
};

/**
 * Fulfil a placed order: decrement stock, bump promo usage, create the Refrens
 * invoice, and send the confirmation + admin emails. Runs inline for
 * cash/transfer orders, and from the maib callback once a card order is paid.
 * Loads everything from the stored order row so it works without a user
 * session (uses the service-role client). Idempotency is the caller's job
 * (cash/transfer call it once; the callback guards on payment_status).
 */
export async function finalizeOrder(orderId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const baseCols =
    "id, items, customer_name, customer_email, customer_phone, customer_address, subtotal, discount_amount, shipping_cost, total, currency, payment_method, notes";
  // Resilient to sql/maib-payments.sql not being applied yet: promo_code is a
  // new column, so fall back to the base select if it isn't there.
  let loaded = await admin
    .from("orders")
    .select(`${baseCols}, promo_code`)
    .eq("id", orderId)
    .maybeSingle();
  if (loaded.error && /promo_code/i.test(loaded.error.message)) {
    loaded = await admin
      .from("orders")
      .select(baseCols)
      .eq("id", orderId)
      .maybeSingle();
  }
  const order = loaded.data;
  if (!order) return;

  const o = order as unknown as {
    items: StoredItem[] | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    subtotal: number | null;
    discount_amount: number | null;
    shipping_cost: number | null;
    total: number | null;
    currency: string | null;
    payment_method: string | null;
    notes: string | null;
    promo_code: string | null;
  };
  const items = Array.isArray(o.items) ? o.items : [];

  // Decrement stock for each catalog-linked line (read-modify-write).
  for (const it of items) {
    if (!it.productId || !it.quantity || it.quantity <= 0) continue;
    const { data: prod } = await admin
      .from("products")
      .select("stock_quantity")
      .eq("id", it.productId)
      .maybeSingle();
    if (!prod) continue;
    const next = Math.max(
      0,
      Number((prod as { stock_quantity: number | null }).stock_quantity ?? 0) -
        it.quantity,
    );
    await admin
      .from("products")
      .update({ stock_quantity: next } as never)
      .eq("id", it.productId);
  }

  if (o.promo_code) {
    try {
      await admin.rpc("increment_promo_usage_by_code", {
        promo_code: o.promo_code,
      });
    } catch {
      // ignore — order is already placed
    }
  }

  // Refrens invoice — fire-and-forget.
  try {
    const { isRefrensConfigured, createInvoiceForOrder } = await import(
      "@/lib/refrens/invoice"
    );
    if (isRefrensConfigured()) {
      await createInvoiceForOrder(orderId).catch((e) => {
        console.error("[refrens] invoice creation failed:", e);
      });
    }
  } catch (e) {
    console.error("[refrens] import failed:", e);
  }

  const emailData: OrderEmailData = {
    orderId,
    customerName: o.customer_name ?? "",
    customerEmail: o.customer_email ?? "",
    customerPhone: o.customer_phone ?? "",
    customerAddress: o.customer_address ?? "",
    items: items.map((i) => ({
      name: i.name ?? "",
      partCode: i.partCode ?? null,
      brand: i.brand ?? null,
      price: Number(i.price ?? 0),
      quantity: Number(i.quantity ?? 0),
    })),
    subtotal: Number(o.subtotal ?? 0),
    discountAmount: Number(o.discount_amount ?? 0),
    shippingCost: Number(o.shipping_cost ?? 0),
    total: Number(o.total ?? 0),
    paymentMethod: (o.payment_method ?? "cash") as OrderEmailData["paymentMethod"],
    notes: o.notes ?? null,
    promoCode: o.promo_code ?? null,
  };

  if (emailData.customerEmail) {
    const customerMail = orderCustomerEmail(emailData);
    void sendResendEmail({
      to: { email: emailData.customerEmail, name: emailData.customerName },
      subject: customerMail.subject,
      html: customerMail.html,
      text: customerMail.text,
      replyTo: { email: getAdminEmail(), name: "Inter Bus" },
    }).catch((e) => console.error("[resend] customer email failed:", e));
  }

  const adminMail = orderAdminEmail(emailData);
  void sendResendEmail({
    to: getAdminEmail(),
    subject: adminMail.subject,
    html: adminMail.html,
    text: adminMail.text,
    replyTo: emailData.customerEmail
      ? { email: emailData.customerEmail, name: emailData.customerName }
      : undefined,
  }).catch((e) => console.error("[resend] admin email failed:", e));
}
