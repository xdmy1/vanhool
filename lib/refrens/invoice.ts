/**
 * Refrens invoicing integration.
 *
 * On checkout completion we POST an invoice to Refrens; Refrens stores it and
 * emails the customer the PDF directly. Failure here is logged but never
 * blocks the order — the admin can still see the order in Supabase / Odoo
 * and (re)generate the invoice manually if needed.
 */

import { createClient } from "@/lib/supabase/server";

export type RefrensConfig = {
  apiKey: string;
  businessSlug: string;
};

function getConfig(): RefrensConfig | null {
  const apiKey = process.env.REFRENS_API_KEY;
  const businessSlug = process.env.REFRENS_BUSINESS_SLUG;
  if (!apiKey || !businessSlug) return null;
  return { apiKey, businessSlug };
}

export function isRefrensConfigured(): boolean {
  return getConfig() !== null;
}

type OrderItemRow = {
  productId?: string;
  name: string;
  partCode?: string | null;
  brand?: string | null;
  price: number;
  quantity: number;
};

type OrderRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: unknown;
  subtotal: number | string | null;
  discount_amount: number | string | null;
  shipping_cost: number | string | null;
  total: number | string | null;
  notes: string | null;
  invoice_id: string | null;
};

function n(v: number | string | null | undefined): number {
  const x = typeof v === "string" ? Number(v) : v;
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

/**
 * Create a Refrens invoice for an order id and email it to the customer.
 * Idempotent: if `orders.invoice_id` is already set, returns early.
 */
export async function createInvoiceForOrder(
  orderId: string,
): Promise<{ ok: true; invoiceId: string; invoiceUrl: string | null } | { ok: false; reason: string }> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, reason: "not_configured" };

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, customer_address, items, subtotal, discount_amount, shipping_cost, total, notes, invoice_id",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return { ok: false, reason: "order_not_found" };
  const o = order as unknown as OrderRow;

  // Idempotency — don't re-bill if we already have a Refrens invoice id.
  if (o.invoice_id) {
    return { ok: true, invoiceId: o.invoice_id, invoiceUrl: null };
  }

  if (!o.customer_email) return { ok: false, reason: "no_customer_email" };

  const rawItems = (Array.isArray(o.items) ? o.items : []) as OrderItemRow[];
  if (rawItems.length === 0) return { ok: false, reason: "no_items" };

  const lineItems = rawItems.map((i) => {
    const qty = Number(i.quantity ?? 1);
    const rate = Number(i.price ?? 0);
    const namePieces = [i.brand?.trim(), i.name?.trim()].filter(Boolean).join(" — ");
    const fullName = i.partCode
      ? `${namePieces || i.name} [${i.partCode}]`
      : namePieces || i.name;
    return {
      name: fullName,
      quantity: qty,
      rate,
      amount: Number((qty * rate).toFixed(2)),
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const customerName = o.customer_name ?? o.customer_email;

  const payload = {
    billedTo: {
      name: customerName,
      email: o.customer_email,
      phone: o.customer_phone ?? undefined,
      address: o.customer_address ?? undefined,
      country: "MD",
    },
    items: lineItems,
    currency: "MDL",
    documentDate: today,
    dueDate: due,
    notes: o.notes ?? `Comandă #${o.id.slice(0, 8).toUpperCase()}`,
    shippingCharges: n(o.shipping_cost) > 0 ? n(o.shipping_cost) : undefined,
    discount: n(o.discount_amount) > 0 ? n(o.discount_amount) : undefined,
    paidStatus: "UNPAID",
    // Refrens sends the email itself when `email.to` is present.
    email: {
      to: [{ name: customerName, email: o.customer_email }],
    },
  };

  let res: Response;
  try {
    res = await fetch(
      `https://api.refrens.com/businesses/${encodeURIComponent(
        cfg.businessSlug,
      )}/invoices`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(payload),
      },
    );
  } catch (e) {
    console.error("[refrens] network error:", e);
    return { ok: false, reason: "network_error" };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[refrens] API rejected:", res.status, text.slice(0, 500));
    return { ok: false, reason: `http_${res.status}` };
  }

  const json = (await res.json().catch(() => null)) as
    | {
        id?: string;
        _id?: string;
        invoiceId?: string;
        invoiceUrl?: string;
        publicUrl?: string;
        documentUrl?: string;
      }
    | null;

  const invoiceId =
    json?.id ?? json?._id ?? json?.invoiceId ?? `refrens-${Date.now()}`;
  const invoiceUrl =
    json?.invoiceUrl ?? json?.publicUrl ?? json?.documentUrl ?? null;

  await supabase
    .from("orders")
    .update({
      invoice_id: invoiceId,
      invoice_url: invoiceUrl,
    })
    .eq("id", orderId);

  return { ok: true, invoiceId, invoiceUrl };
}
