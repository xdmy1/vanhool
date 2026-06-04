"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import { sendResendEmail } from "@/lib/email/resend";
import { accountantMonthlyPurchasesEmail } from "@/lib/email/accountant-monthly-purchases";
import { getConta1PurchasesForRange } from "@/lib/panel/purchases/queries";

// Bookkeeper inbox — shared with lib/panel/invoices/actions.ts. Override via
// env (ACCOUNTANT_EMAIL) if it needs rotating without a redeploy.
const ACCOUNTANT_EMAIL =
  process.env.ACCOUNTANT_EMAIL || "Accounting-em@mail.ru";
import type { AccountScope } from "@/lib/panel/scope";
import type { Json } from "@/lib/supabase/database.types";
import { getDefaultMarkupPercent } from "@/lib/panel/settings/actions";

const lineInputSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  product_id: z.string().uuid().nullable().optional(),
  supplier_code: z.string().nullable().optional(),
  internal_code: z.string().nullable().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_cost: z.number().nonnegative(),
  vat_rate: z.number().nonnegative().default(20),
});

const purchaseSchema = z.object({
  supplier_id: z.string().uuid(),
  account_scope: z.enum(["conta1", "conta2"]),
  document_number: z.string().nullable().optional(),
  document_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().default("MDL"),
  fx_rate: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(lineInputSchema).min(1),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

function computeTotals(items: PurchaseInput["items"]) {
  let subtotal = 0;
  let vat_amount = 0;
  for (const i of items) {
    const lineNet = i.quantity * i.unit_cost;
    subtotal += lineNet;
    vat_amount += lineNet * ((i.vat_rate ?? 20) / 100);
  }
  subtotal = Number(subtotal.toFixed(2));
  vat_amount = Number(vat_amount.toFixed(2));
  return { subtotal, vat_amount, total: Number((subtotal + vat_amount).toFixed(2)) };
}

export async function createPurchase(
  raw: unknown,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = purchaseSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid" };
  const v = parsed.data;
  const { subtotal, vat_amount, total } = computeTotals(v.items);

  const supabase = await createClient();
  const { data: header, error: hErr } = await supabase
    .from("purchases")
    .insert({
      supplier_id: v.supplier_id,
      account_scope: v.account_scope,
      document_number: v.document_number ?? null,
      document_date: v.document_date,
      currency: v.currency,
      fx_rate: v.fx_rate ?? null,
      subtotal,
      vat_amount,
      total,
      status: "draft",
      notes: v.notes ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (hErr || !header) return { ok: false, reason: hErr?.message ?? "insert_failed" };

  const lines = v.items.map((i) => ({
    purchase_id: header.id,
    product_id: i.product_id ?? null,
    supplier_code: i.supplier_code ?? null,
    internal_code: i.internal_code ?? null,
    description: i.description,
    quantity: i.quantity,
    unit_cost: i.unit_cost,
    vat_rate: i.vat_rate ?? 20,
    line_total: Number((i.quantity * i.unit_cost).toFixed(2)),
  }));
  const { error: lErr } = await supabase.from("purchase_items").insert(lines);
  if (lErr) {
    await supabase.from("purchases").delete().eq("id", header.id);
    return { ok: false, reason: `items: ${lErr.message}` };
  }

  revalidatePath("/[locale]/panel/achizitii", "page");
  return { ok: true, id: header.id };
}

/**
 * Post a purchase: status draft → posted, stock += qty per line, cost_price
 * = last unit_cost. For lines without product_id, auto-creates a minimal
 * product using internal_code (or generates) and description.
 * Appends supplier_code to the product's cross_references jsonb for future
 * matching on next invoice from the same supplier.
 */
export async function postPurchase(
  purchaseId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const supabase = await createClient();
  const { data: header } = await supabase
    .from("purchases")
    .select("id, status, supplier_id, currency, fx_rate")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!header) return { ok: false, reason: "purchase_not_found" };
  if (header.status === "posted") return { ok: true };
  if (header.status === "cancelled") return { ok: false, reason: "purchase_cancelled" };

  // Products are stored in MDL. Convert line costs using the purchase's
  // explicit fx_rate, else fall back to the fixed reference table
  // (EUR=20, USD=17). No live FX lookups.
  const DEFAULT_FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };
  const currency = (header.currency ?? "MDL").toUpperCase();
  const toMdl =
    currency === "MDL"
      ? 1
      : (Number(header.fx_rate) || DEFAULT_FX_TO_MDL[currency] || 1);
  // Markup is configurable from /panel/setari — falls back to 30% if unset.
  const markupFactor = 1 + (await getDefaultMarkupPercent()) / 100;

  const { data: items } = await supabase
    .from("purchase_items")
    .select("id, product_id, supplier_code, internal_code, description, quantity, unit_cost")
    .eq("purchase_id", purchaseId);
  if (!items || items.length === 0) return { ok: false, reason: "no_items" };

  // Fetch supplier name for cross_reference entries
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("name")
    .eq("id", header.supplier_id)
    .maybeSingle();
  const supplierName = supplier?.name ?? "Furnizor";

  for (const it of items) {
    let productId = it.product_id;

    const costMdl = Number((Number(it.unit_cost) * toMdl).toFixed(2));

    if (!productId) {
      const code = it.internal_code ?? `IB-${it.id.slice(0, 8).toUpperCase()}`;

      // Re-stocking an existing part is the common case once part_code is
      // unique — look the product up first and link instead of creating a
      // duplicate. Match is case-insensitive to mirror the unique index.
      const escapedCode = code.replace(/[\\%_]/g, "\\$&");
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .ilike("part_code", escapedCode)
        .limit(1);
      if (existing && existing.length > 0) {
        productId = existing[0].id;
      } else {
        const slug = `${code.toLowerCase()}-${it.id.slice(0, 6)}`;
        const { data: newP, error: newErr } = await supabase
          .from("products")
          .insert({
            part_code: code,
            name_ro: it.description.slice(0, 200),
            slug,
            price: Number((costMdl * markupFactor).toFixed(2)),
            cost_price: costMdl,
            stock_quantity: 0,
            is_active: false, // owner reviews before publishing
            supplier_id: header.supplier_id,
            supplier_code: it.supplier_code ?? null,
          })
          .select("id")
          .single();
        if (newErr || !newP) {
          return { ok: false, reason: `product_create_failed: ${newErr?.message ?? "?"}` };
        }
        productId = newP.id;
      }
      // Link back to purchase line so future operations know the product.
      await supabase
        .from("purchase_items")
        .update({ product_id: productId })
        .eq("id", it.id);
    }

    // Increment stock and refresh cost_price + cross_references entry
    const { data: cur } = await supabase
      .from("products")
      .select("stock_quantity, cross_references")
      .eq("id", productId)
      .maybeSingle();
    const newStock = Number(cur?.stock_quantity ?? 0) + Number(it.quantity);
    const refs = Array.isArray(cur?.cross_references) ? [...cur!.cross_references] : [];
    if (it.supplier_code) {
      const has = refs.some(
        (r) =>
          r &&
          typeof r === "object" &&
          !Array.isArray(r) &&
          (r as Record<string, unknown>).code === it.supplier_code,
      );
      if (!has) refs.push({ brand: supplierName, code: it.supplier_code } as Json);
    }
    await supabase
      .from("products")
      .update({
        stock_quantity: newStock,
        cost_price: costMdl,
        cross_references: refs as unknown as Json,
      })
      .eq("id", productId);
  }

  await supabase
    .from("purchases")
    .update({
      status: "posted",
      received_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchaseId);

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  revalidatePath("/[locale]/panel/stock", "page");
  return { ok: true };
}

/**
 * Issue a purchase order to the supplier. Moves status draft → ordered and
 * assigns a PO number from panel_settings.po.*. Idempotent: re-issuing
 * keeps the same po_number.
 */
export async function issuePurchaseOrder(
  purchaseId: string,
  expectedDelivery?: string | null,
): Promise<{ ok: true; po_number: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();

  const { data: header } = await supabase
    .from("purchases")
    .select("id, status, po_number")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!header) return { ok: false, reason: "purchase_not_found" };
  if (header.status === "cancelled" || header.status === "posted") {
    return { ok: false, reason: `purchase_${header.status}` };
  }

  let poNumber = header.po_number;
  if (!poNumber) {
    const { data: settings } = await supabase
      .from("panel_settings")
      .select("key, value")
      .in("key", ["po.series", "po.next_number"]);
    let series = "PO";
    let counter = 1;
    for (const r of settings ?? []) {
      const v = r.value;
      if (r.key === "po.series") series = typeof v === "string" ? v : String(v ?? "").replace(/^"|"$/g, "");
      if (r.key === "po.next_number") counter = typeof v === "number" ? v : Number(v);
    }
    poNumber = `${series}-${String(counter).padStart(5, "0")}`;
    await supabase
      .from("panel_settings")
      .upsert(
        [{ key: "po.next_number", value: (counter + 1) as unknown as Json, updated_at: new Date().toISOString() }],
        { onConflict: "key" },
      );
  }

  const { error } = await supabase
    .from("purchases")
    .update({
      status: "ordered",
      po_number: poNumber,
      po_issued_at: new Date().toISOString(),
      expected_delivery_date: expectedDelivery ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchaseId);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  return { ok: true, po_number: poNumber };
}

/**
 * Link a purchase line to a freshly-created product so the next `postPurchase`
 * call increments the right product's stock instead of auto-creating a new
 * one. Called from the admin product form after a successful `createProduct`
 * when the user landed there via `?from_line=`.
 */
export async function linkPurchaseLineToProduct(
  lineId: string,
  productId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_items")
    .update({ product_id: productId })
    .eq("id", lineId);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/achizitii", "page");
  return { ok: true };
}

export async function cancelPurchase(
  purchaseId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("purchases")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", purchaseId);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/achizitii", "page");
  return { ok: true };
}

/**
 * Forward every conta1 purchase whose `document_date` lands inside
 * `[from, to]` to the bookkeeper's inbox. PIN-gated. Conta2 purchases
 * (cash / non-fiscal) are deliberately excluded — the accountant only
 * cares about the fiscal book.
 */
export async function sendConta1PurchasesMonthly(
  from: string,
  to: string,
  pin: string,
): Promise<
  | { ok: true; count: number; sentAt: string }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { ok: false, reason: "bad_range" };
  }

  const data = await getConta1PurchasesForRange(from, to);
  if (data.count === 0) return { ok: false, reason: "empty_range" };

  const { subject, html, text } = accountantMonthlyPurchasesEmail(data);
  const result = await sendResendEmail({
    to: ACCOUNTANT_EMAIL,
    subject,
    html,
    text,
    replyTo: user.email ? { email: user.email } : undefined,
  });
  if (!result.ok) return { ok: false, reason: result.reason };

  return { ok: true, count: data.count, sentAt: new Date().toISOString() };
}

/**
 * Hard-delete a purchase + its line items. PIN-gated. Stock isn't
 * rolled back automatically — admin should already have cancelled
 * the purchase first if it was posted.
 */
export async function deletePurchaseWithPin(
  purchaseId: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  const supabase = await createClient();
  // purchase_items cascade via FK normally; do it explicitly in case the
  // constraint isn't set to ON DELETE CASCADE in the deployed schema.
  await supabase.from("purchase_items").delete().eq("purchase_id", purchaseId);
  const { error } = await supabase.from("purchases").delete().eq("id", purchaseId);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/achizitii", "page");
  return { ok: true };
}
