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
import { roundStock } from "@/lib/stock";
import { applyStockMovement, ledgerReady, type StockDb } from "@/lib/stock-ledger";
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

  // The stock ledger must exist before any order is taken — a checkout whose
  // finalize can't record its movements would sell without decrementing, and
  // a later cancel would then "restore" stock that was never taken.
  if (!(await ledgerReady(getSupabaseAdmin() as unknown as StockDb))) {
    console.error("[checkout] stock ledger missing — run sql/stock-accuracy.sql");
    return {
      ok: false,
      code: "server",
      message: "Comenzile sunt temporar indisponibile. Încercați mai târziu.",
    };
  }

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Store credit — the site is MDL, so ONLY MDL credit applies (never
  // converted). Draw down oldest-first up to the order total; the remainder is
  // what the customer actually pays. Consumption happens later in
  // finalizeOrder (idempotent), so a card order only spends credit once it's
  // paid. Guests / no-credit → creditApplied stays 0 and nothing changes.
  let creditApplied = 0;
  const creditBreakdown: Array<{ id: string; amount: number }> = [];
  if (user && data.applyCredit) {
    const { getClientCredits } = await import("@/lib/panel/credits/queries");
    const credits = (await getClientCredits(user.id))
      .filter(
        (c) =>
          c.status === "active" &&
          c.currency === "MDL" &&
          c.amount - c.used_amount > 0,
      )
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    let remaining = total;
    for (const c of credits) {
      if (remaining <= 0.01) break;
      const avail = Number((c.amount - c.used_amount).toFixed(2));
      const take = Number(Math.min(avail, remaining).toFixed(2));
      if (take > 0) {
        creditBreakdown.push({ id: c.id, amount: take });
        remaining = Number((remaining - take).toFixed(2));
      }
    }
    creditApplied = Number((total - remaining).toFixed(2));
  }
  // What the customer pays in money after credit. The order row stores this as
  // `total` (money owed); `credit_applied` records the non-cash settlement.
  const payable = Number(Math.max(0, total - creditApplied).toFixed(2));

  // Card payment must be configured to be offered; guard defensively. A card
  // order fully covered by credit needs no maib charge — finalize like cash.
  const isCard = data.paymentMethod === "card";
  const chargeByCard = isCard && payable > 0.01;
  if (isCard && payable > 0.01 && !maibConfigured()) {
    return { ok: false, code: "payment", message: "Card payments unavailable" };
  }

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
    total: payable,
    status: "pending",
    payment_method: data.paymentMethod,
    notes: data.notes || null,
    // Card orders stay unpaid until maib confirms on the callback; only then
    // do we decrement stock / send emails / bump promo usage. A card order
    // fully covered by credit isn't charged, so it isn't "pending payment".
    ...(chargeByCard ? { payment_status: "pending" } : {}),
    ...(promoCodeApplied ? { promo_code: promoCodeApplied } : {}),
    // Store-credit settlement (new columns; stripped below on legacy schemas).
    ...(creditApplied > 0
      ? { credit_applied: creditApplied, credit_ids: creditBreakdown as unknown as Json }
      : {}),
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
    /(promo_code|payment_status|credit_applied|credit_ids)/i.test(
      insertRes.error.message,
    )
  ) {
    const safeRow = { ...orderRow };
    delete safeRow.promo_code;
    delete safeRow.payment_status;
    delete safeRow.credit_applied;
    delete safeRow.credit_ids;
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
  if (chargeByCard) {
    const h = await headers();
    const clientIp =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "0.0.0.0";
    const locale = localeFromReferer(h.get("referer"));
    const shortId = insertData.id.slice(0, 8).toUpperCase();
    try {
      const pay = await createPayment({
        amount: payable,
        currency: "MDL",
        clientIp,
        language: locale === "en" || locale === "ru" ? locale : "ro",
        description: `Comanda #${shortId} — Inter Bus`,
        clientName: fullName,
        email: data.email,
        phone: fullPhone,
        orderId: insertData.id,
        delivery: shipping || undefined,
        // maib requires Σ(item price×qty) + delivery == amount. When store
        // credit lowers the charge, the itemized list no longer matches, so we
        // omit it (items are informational) and charge the reduced `payable`.
        ...(creditApplied > 0
          ? {}
          : {
              items: data.items.map((i) => ({
                id: i.productId ?? undefined,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
              })),
            }),
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
  await finalizeOrder(insertData.id, promoCodeApplied);
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
export async function finalizeOrder(
  orderId: string,
  promoCodeOverride?: string | null,
): Promise<void> {
  const admin = getSupabaseAdmin();
  const baseCols =
    "id, items, customer_name, customer_email, customer_phone, customer_address, subtotal, discount_amount, shipping_cost, total, currency, payment_method, notes";
  // Resilient to sql/maib-payments.sql not being applied yet: promo_code is a
  // new column, so fall back to the base select if it isn't there.
  let loaded = await admin
    .from("orders")
    .select(`${baseCols}, promo_code, credit_applied, credit_ids, credit_consumed_at`)
    .eq("id", orderId)
    .maybeSingle();
  if (
    loaded.error &&
    /(promo_code|credit_applied|credit_ids|credit_consumed_at)/i.test(
      loaded.error.message,
    )
  ) {
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
    credit_applied?: number | null;
    credit_ids?: Array<{ id?: string; amount?: number }> | null;
    credit_consumed_at?: string | null;
  };
  const items = Array.isArray(o.items) ? o.items : [];

  // Consume store credit exactly once (idempotent via credit_consumed_at). Runs
  // here — not at order creation — so a card order only spends credit after
  // it's actually paid (this fn runs on the paid callback for cards).
  const creditApplied = Number(o.credit_applied ?? 0);
  const creditIds = Array.isArray(o.credit_ids) ? o.credit_ids : [];
  if (creditApplied > 0 && !o.credit_consumed_at && creditIds.length > 0) {
    for (const alloc of creditIds) {
      const cid = alloc?.id;
      const amt = Number(alloc?.amount ?? 0);
      if (!cid || amt <= 0) continue;
      const { data: cr } = await admin
        .from("store_credits")
        .select("amount, used_amount, status")
        .eq("id", cid)
        .maybeSingle();
      if (!cr) continue;
      const c = cr as { amount: number | null; used_amount: number | null; status: string | null };
      // Cap at the credit's face value so concurrent orders can never drive
      // used_amount past amount (keeps the ledger sane on a rare double-spend).
      const used = Number(
        Math.min(Number(c.amount ?? 0), Number(c.used_amount ?? 0) + amt).toFixed(2),
      );
      const fully = used >= Number(c.amount ?? 0) - 0.01;
      await admin
        .from("store_credits")
        .update({
          used_amount: used,
          status: fully ? "used" : c.status ?? "active",
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", cid);
    }
    await admin
      .from("orders")
      .update({ credit_consumed_at: new Date().toISOString() } as never)
      .eq("id", orderId);
  }

  // Decrement stock through the LEDGER — aggregated per product, atomic
  // (`stock = stock + delta`), idempotent (ref `sale:<order_id>:<product_id>`):
  // a duplicated payment callback or a double finalize can never decrement
  // twice, and no clamp — overselling shows up as honest negative stock
  // instead of turning into phantom inventory on a later cancel.
  const take = new Map<string, number>();
  for (const it of items) {
    if (!it.productId || !it.quantity || it.quantity <= 0) continue;
    take.set(
      it.productId,
      roundStock((take.get(it.productId) ?? 0) + it.quantity),
    );
  }
  for (const [productId, qty] of take) {
    const moved = await applyStockMovement(admin as unknown as StockDb, {
      productId,
      delta: -qty,
      reason: "sale",
      ref: `sale:${orderId}:${productId}`,
      orderId,
    });
    if (!moved.ok) {
      // Money is already in (this runs post-payment) so we can't refuse —
      // but this must never pass silently on a money path.
      console.error(
        `[orders] CRITIC: comanda ${orderId} plătită dar stocul nu s-a mișcat pentru ${productId}: ${moved.reason}`,
      );
    }
  }

  // Inline (cash/transfer) callers pass the applied code directly so promo
  // usage is bumped exactly as before, independent of the new promo_code
  // column. The card callback has no in-scope code and reads it from the row.
  const promoCode = promoCodeOverride ?? o.promo_code ?? null;
  if (promoCode) {
    try {
      await admin.rpc("increment_promo_usage_by_code", { promo_code: promoCode });
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
    promoCode,
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
