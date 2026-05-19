/**
 * Refrens invoicing integration.
 *
 * On checkout completion we POST an invoice to Refrens; Refrens stores it and
 * emails the customer the PDF directly. Failure here is logged but never
 * blocks the order — the admin can still see the order in Supabase
 * and (re)generate the invoice manually if needed.
 *
 * Auth: self-signed ES256 JWT (EC P-256 private key issued by Refrens),
 * per https://www.refrens.com/api/docs/authentication. Token TTL = 5 min.
 */

import crypto from "node:crypto";

import { createClient } from "@/lib/supabase/server";

export type RefrensConfig = {
  appId: string;
  privateKey: string;
  businessSlug: string;
};

function loadPrivateKey(): string | null {
  const raw = process.env.REFRENS_PRIVATE_KEY;
  if (!raw) return null;
  // Vercel stores newlines as literal "\n" in env values; restore them so the
  // PEM parser can read the BEGIN/END markers on their own lines.
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function getConfig(): RefrensConfig | null {
  const appId = process.env.REFRENS_APP_ID;
  const businessSlug = process.env.REFRENS_BUSINESS_SLUG;
  const privateKey = loadPrivateKey();
  if (!appId || !businessSlug || !privateKey) return null;
  return { appId, privateKey, businessSlug };
}

export function isRefrensConfigured(): boolean {
  return getConfig() !== null;
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Self-sign an ES256 JWT per Refrens auth spec.
 * iss = sub = appId, aud = "serana", auth = {entity:app, strategy:app-iss-app-token}
 * Short TTL (5 min) — we generate one per API call.
 */
function signJwt(cfg: RefrensConfig): string {
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: cfg.appId,
    sub: cfg.appId,
    aud: "serana",
    auth: { entity: "app", strategy: "app-iss-app-token" },
    iat: now,
    exp: now + 300,
  };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const keyObj = crypto.createPrivateKey({
    key: cfg.privateKey,
    format: "pem",
  });
  // ES256 expects the raw IEEE P1363 r||s signature, not the DER-encoded
  // output Node returns by default.
  const sig = crypto.sign("SHA256", Buffer.from(signingInput), {
    key: keyObj,
    dsaEncoding: "ieee-p1363",
  });

  return `${signingInput}.${base64url(sig)}`;
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
): Promise<
  | { ok: true; invoiceId: string; invoiceUrl: string | null }
  | { ok: false; reason: string }
> {
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

  if (o.invoice_id) {
    return { ok: true, invoiceId: o.invoice_id, invoiceUrl: null };
  }
  if (!o.customer_email) return { ok: false, reason: "no_customer_email" };

  const rawItems = (Array.isArray(o.items) ? o.items : []) as OrderItemRow[];
  if (rawItems.length === 0) return { ok: false, reason: "no_items" };

  // VAT handling — prices stored on the cart / order are gross (TVA already
  // included, as displayed on the site). Refrens needs the net rate + a tax
  // entry so the printed invoice breaks out the TVA line and the total
  // reconciles back to the gross amount the customer actually paid.
  //
  //   gross = net * (1 + vatRate/100)   →   net = gross / (1 + vatRate/100)
  //
  // Standard MD rate is 20% (TVA), override via REFRENS_VAT_RATE if needed
  // (e.g. 8% reduced rate for select categories, or 0 for export).
  const vatRate = Number(process.env.REFRENS_VAT_RATE ?? 20);
  const vatDivisor = 1 + vatRate / 100;

  const lineItems = rawItems.map((i) => {
    const qty = Number(i.quantity ?? 1);
    const grossRate = Number(i.price ?? 0);
    // 4 decimals keep qty × netRate × (1 + vat) reconciling to the gross
    // total even on awkward prices like 121 / 1.2 = 100.8333…
    const netRate = vatRate > 0
      ? Number((grossRate / vatDivisor).toFixed(4))
      : grossRate;
    const namePieces = [i.brand?.trim(), i.name?.trim()].filter(Boolean).join(" — ");
    const fullName = i.partCode
      ? `${namePieces || i.name} [${i.partCode}]`
      : namePieces || i.name;
    return {
      name: fullName,
      quantity: qty,
      rate: netRate,
      amount: Number((qty * netRate).toFixed(2)),
      ...(vatRate > 0
        ? { itemTaxes: [{ taxName: "TVA", taxRate: vatRate }] }
        : {}),
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const customerName = o.customer_name ?? o.customer_email;

  const payload = {
    invoiceTitle: `Comandă #${o.id.slice(0, 8).toUpperCase()}`,
    invoiceDate: today,
    dueDate: due,
    currency: "MDL",
    billedTo: {
      name: customerName,
      email: o.customer_email,
      phone: o.customer_phone ?? undefined,
      street: o.customer_address ?? undefined,
      country: "MD",
    },
    items: lineItems,
    // Refrens emails the invoice + PDF when `email.to` is set.
    // Per their docs the field is a SINGLE object, not an array.
    email: {
      to: { name: customerName, email: o.customer_email },
    },
  };

  let jwt: string;
  try {
    jwt = signJwt(cfg);
  } catch (e) {
    console.error("[refrens] JWT signing failed:", e);
    return { ok: false, reason: "jwt_sign_error" };
  }

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
          Authorization: `Bearer ${jwt}`,
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

