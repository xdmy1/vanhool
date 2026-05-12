"use server";

import { createClient } from "@/lib/supabase/server";
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

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; code: "validation" | "server" | "empty_cart"; message?: string };

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullPhone = `${data.phoneCountry}${data.phoneNumber.trim().replace(/[\s-]/g, "")}`;
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const fullAddress = data.postal
    ? `${data.address}, ${data.city} ${data.postal}`
    : `${data.address}, ${data.city}`;

  const { data: insertData, error: insertError } = await supabase
    .from("orders")
    .insert({
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
    })
    .select("id")
    .single();

  if (insertError || !insertData) {
    return {
      ok: false,
      code: "server",
      message: insertError?.message ?? "Insert failed",
    };
  }

  if (promoCodeApplied) {
    try {
      await supabase.rpc("increment_promo_usage_by_code", {
        promo_code: promoCodeApplied,
      });
    } catch {
      // ignore — order is already created
    }
  }

  // Best-effort push to Odoo. Failure here doesn't block checkout success —
  // the error is recorded on the order (odoo_sync_error) and the admin can
  // retry from /admin/odoo. Skipped silently when Odoo isn't configured.
  try {
    const { isOdooConfigured } = await import("@/lib/odoo/config");
    if (isOdooConfigured()) {
      const { pushOrderToOdoo } = await import("@/lib/odoo/sync");
      // Fire-and-forget — but await briefly so the request finishes the work
      // before the runtime potentially terminates the function context.
      await pushOrderToOdoo(insertData.id).catch(() => {});
    }
  } catch {
    // ignore
  }

  // Refrens generates the invoice PDF and emails it directly to the customer.
  // Fire-and-forget — failure is logged but does not affect checkout success.
  try {
    const { isRefrensConfigured, createInvoiceForOrder } = await import(
      "@/lib/refrens/invoice"
    );
    if (isRefrensConfigured()) {
      await createInvoiceForOrder(insertData.id).catch((e) => {
        console.error("[refrens] invoice creation failed:", e);
      });
    }
  } catch (e) {
    console.error("[refrens] import failed:", e);
  }

  // Resend notifications: confirmation to customer + alert to admin.
  // Fire-and-forget; never blocks checkout success.
  const emailData: OrderEmailData = {
    orderId: insertData.id,
    customerName: fullName,
    customerEmail: data.email,
    customerPhone: fullPhone,
    customerAddress: fullAddress,
    items: data.items.map((i) => ({
      name: i.name,
      partCode: i.partCode,
      brand: i.brand,
      price: i.price,
      quantity: i.quantity,
    })),
    subtotal,
    discountAmount: discount,
    shippingCost: shipping,
    total,
    paymentMethod: data.paymentMethod,
    notes: data.notes || null,
    promoCode: promoCodeApplied,
  };

  const customerMail = orderCustomerEmail(emailData);
  void sendResendEmail({
    to: { email: data.email, name: fullName },
    subject: customerMail.subject,
    html: customerMail.html,
    text: customerMail.text,
    replyTo: { email: getAdminEmail(), name: "Inter Bus" },
  }).catch((e) => console.error("[resend] customer email failed:", e));

  const adminMail = orderAdminEmail(emailData);
  void sendResendEmail({
    to: getAdminEmail(),
    subject: adminMail.subject,
    html: adminMail.html,
    text: adminMail.text,
    replyTo: { email: data.email, name: fullName },
  }).catch((e) => console.error("[resend] admin email failed:", e));

  return { ok: true, orderId: insertData.id };
}
