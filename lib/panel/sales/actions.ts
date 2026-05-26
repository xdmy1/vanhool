"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { createInvoiceForOrder } from "@/lib/refrens/invoice";
import type { AccountScope } from "@/lib/panel/scope";
import type { Json } from "@/lib/supabase/database.types";
import { normalizeCode } from "@/lib/utils/normalize-code";

// -----------------------------------------------------------------------------
// Search helpers (used by the wizard's autocompletes)

export type ClientSearchResult = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  idno: string | null;
  account_type: "individual" | "business" | null;
  discount_percent: number | null;
  billing_address: string | null;
};

function mapClientRow(p: {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  idno: string | null;
  account_type: "individual" | "business" | null;
  discount_percent: number | null;
  billing_street: string | null;
  billing_city: string | null;
}): ClientSearchResult {
  return {
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    phone: p.phone,
    company_name: p.company_name,
    idno: p.idno,
    account_type: p.account_type,
    discount_percent: p.discount_percent,
    billing_address: [p.billing_street, p.billing_city].filter(Boolean).join(", ") || null,
  };
}

export async function searchClients(q: string): Promise<ClientSearchResult[]> {
  const user = await getPanelUser();
  if (!user) return [];
  if (!q.trim()) return [];
  const supabase = await createClient();
  const term = `%${q.replace(/[%_]/g, "")}%`;
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, company_name, idno, account_type, discount_percent, billing_street, billing_city",
    )
    .or(
      `email.ilike.${term},full_name.ilike.${term},company_name.ilike.${term},idno.ilike.${term},phone.ilike.${term}`,
    )
    .limit(8);
  return (data ?? []).map(mapClientRow);
}

/**
 * Returns every client visible to the panel. Cheap to fetch (low row count
 * by design) — the panel UX is a pickable list rather than autocomplete.
 */
export async function listAllPanelClients(): Promise<ClientSearchResult[]> {
  const user = await getPanelUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, company_name, idno, account_type, discount_percent, billing_street, billing_city",
    )
    .order("company_name", { nullsFirst: false })
    .order("full_name", { nullsFirst: false })
    .limit(500);
  return (data ?? []).map(mapClientRow);
}

export type ProductSearchResult = {
  id: string;
  part_code: string | null;
  name_ro: string | null;
  brand: string | null;
  price: number;
  cost_price: number;
  stock_quantity: number;
  storage_location: string | null;
  is_active: boolean;
};

export async function searchProducts(q: string): Promise<ProductSearchResult[]> {
  const user = await getPanelUser();
  if (!user) return [];
  if (!q.trim()) return [];
  const supabase = await createClient();
  const trimmed = q.trim();
  const term = `%${trimmed.replace(/[%_]/g, "")}%`;
  // Two parallel passes:
  //   • normalize the query (uppercase + strip non-alphanumeric) and look it
  //     up against products.search_codes, so "0 124 655 405" and "0124655405"
  //     find the same row.
  //   • ilike on the typed strings so partial name/brand matches still work.
  // Union the ids, then re-fetch the full rows in one query. No is_active
  // filter — panel must see drafts auto-created by postPurchase.
  const normalized = normalizeCode(trimmed);
  const [codeRowsRes, textRowsRes] = await Promise.all([
    normalized.length > 0
      ? supabase
          .from("products")
          .select("id")
          .contains("search_codes", [normalized])
          .limit(50)
      : Promise.resolve({ data: [] as { id: string }[] }),
    supabase
      .from("products")
      .select("id")
      .or(`part_code.ilike.${term},name_ro.ilike.${term},name_en.ilike.${term},brand.ilike.${term}`)
      .limit(50),
  ]);
  const ids = new Set<string>();
  for (const r of (codeRowsRes.data ?? []) as { id: string }[]) ids.add(r.id);
  for (const r of (textRowsRes.data ?? []) as { id: string }[]) ids.add(r.id);
  if (ids.size === 0) return [];
  const { data } = await supabase
    .from("products")
    .select(
      "id, part_code, name_ro, name_en, brand, price, cost_price, stock_quantity, storage_location, is_active",
    )
    .in("id", Array.from(ids))
    .order("name_ro")
    .limit(15);
  return (data ?? []).map((p) => ({
    id: p.id,
    part_code: p.part_code,
    name_ro: p.name_ro ?? p.name_en,
    brand: p.brand,
    price: Number(p.price ?? 0),
    cost_price: Number(p.cost_price ?? 0),
    stock_quantity: Number(p.stock_quantity ?? 0),
    storage_location: p.storage_location,
    is_active: Boolean(p.is_active),
  }));
}

// -----------------------------------------------------------------------------
// createManualSale — the main action

const lineSchema = z.object({
  product_id: z.string().uuid(),
  qty: z.number().positive(),
  unit_price: z.number().nonnegative(),
});

const walkinSchema = z.object({
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  idno: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
});

const saleSchema = z
  .object({
    account_scope: z.enum(["conta1", "conta2"]),
    /** Currency the sale settles in (defaults to MDL). Conta 2 in particular
     * may run in EUR/USD when selling to external customers. */
    currency: z.enum(["MDL", "EUR", "USD"]).default("MDL"),
    client_id: z.string().uuid().nullable().optional(),
    walkin: walkinSchema.nullable().optional(),
    items: z.array(lineSchema).min(1, "Cel puțin un produs"),
    payment_method: z.enum(["cash", "transfer", "already_paid"]),
    delivery_address: z.string().min(1, "Adresa de livrare obligatorie"),
    driver_name: z.string().nullable().optional(),
    vehicle_plate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    /** Optional VAT amount the owner types in manually. Default 0. */
    vat_amount: z.number().nonnegative().optional(),
  })
  .refine(
    (d) => (d.client_id && !d.walkin) || (!d.client_id && d.walkin),
    "Trebuie să alegi un client existent SAU să introduci un walk-in",
  );

export type ManualSaleInput = z.infer<typeof saleSchema>;

export type ManualSaleResult =
  | {
      ok: true;
      orderId: string;
      deliveryNoteId: string;
      invoiceId: string | null;
      invoiceUrl: string | null;
      total: number;
    }
  | { ok: false; reason: string };

export async function createManualSale(raw: unknown): Promise<ManualSaleResult> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = saleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  const supabase = await createClient();

  // Resolve customer fields
  let customer_name = v.walkin?.name ?? "";
  let customer_email: string | null = v.walkin?.email ?? null;
  let customer_phone: string | null = v.walkin?.phone ?? null;
  let customer_idno: string | null = v.walkin?.idno ?? null;
  const customer_address: string | null = v.delivery_address;
  let user_id: string | null = null;

  if (v.client_id) {
    const { data: c } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, phone, company_name, idno, account_type, billing_street, billing_city",
      )
      .eq("id", v.client_id)
      .maybeSingle();
    if (!c) return { ok: false, reason: "client_not_found" };
    user_id = c.id;
    // Don't fall back to the synthetic panel-{uuid}@inter-bus.md email as
    // a display name — that placeholder isn't the customer's real address.
    const cleanEmail =
      c.email && /^panel-[a-f0-9-]+@inter-bus\.md$/i.test(c.email) ? null : c.email;
    customer_name =
      c.account_type === "business"
        ? c.company_name ?? c.full_name ?? cleanEmail ?? "Client"
        : c.full_name ?? cleanEmail ?? "Client";
    // Strip the synthetic panel-{uuid}@inter-bus.md placeholder so it doesn't
    // surface on invoices or trigger Refrens email delivery.
    customer_email = c.email && /^panel-[a-f0-9-]+@inter-bus\.md$/i.test(c.email)
      ? null
      : c.email;
    customer_phone = c.phone;
    customer_idno = c.idno;
  }

  // Pull current product data: prices, cost_price snapshot, stock, name
  const productIds = v.items.map((i) => i.product_id);
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, part_code, name_ro, brand, price, cost_price, stock_quantity, storage_location")
    .in("id", productIds);
  if (pErr || !products) return { ok: false, reason: "product_fetch_failed" };
  const byId = new Map(products.map((p) => [p.id, p]));

  // Validate stock + build items snapshot
  const items: Array<Record<string, unknown>> = [];
  let subtotal = 0;
  for (const line of v.items) {
    const p = byId.get(line.product_id);
    if (!p) return { ok: false, reason: `product_missing:${line.product_id}` };
    if ((p.stock_quantity ?? 0) < line.qty) {
      return {
        ok: false,
        reason: `stock_insufficient:${p.part_code ?? p.id.slice(0, 8)} (disponibil ${p.stock_quantity ?? 0})`,
      };
    }
    const lineTotal = Number((line.qty * line.unit_price).toFixed(2));
    subtotal += lineTotal;
    items.push({
      productId: p.id,
      partCode: p.part_code,
      name: p.name_ro,
      brand: p.brand,
      storage_location: p.storage_location,
      quantity: line.qty,
      price: line.unit_price,
      cost_price: Number(p.cost_price ?? 0),
      total: lineTotal,
    });
  }
  subtotal = Number(subtotal.toFixed(2));

  const vatAmount = Number(((v.vat_amount ?? 0)).toFixed(2));
  const total = Number((subtotal + vatAmount).toFixed(2));

  // Insert order
  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items: items as unknown as Json,
      subtotal,
      discount_amount: 0,
      shipping_cost: 0,
      total,
      status:
        v.payment_method === "already_paid" ? "confirmed" : "pending",
      payment_method: v.payment_method,
      notes: v.notes ?? null,
      account_scope: v.account_scope,
      source: "panel",
      // `currency` lives on the table at runtime (sql migration). The
      // generated TS types are stale until they're regenerated, hence the
      // cast.
      ...({ currency: v.currency } as object),
    })
    .select("id")
    .single();
  if (oErr || !order) return { ok: false, reason: oErr?.message ?? "order_insert_failed" };
  const orderId = order.id;

  // Decrement stock — sequential. Race-safe enough for admin-only usage; can
  // be tightened with a Postgres function later if we get concurrent salespeople.
  for (const line of v.items) {
    const p = byId.get(line.product_id)!;
    const newQty = Math.max(0, (p.stock_quantity ?? 0) - line.qty);
    await supabase.from("products").update({ stock_quantity: newQty }).eq("id", p.id);
  }

  // Invoice (conta1 only). Refrens fires email + we mirror the metadata.
  let invoiceId: string | null = null;
  let invoiceUrl: string | null = null;
  if (v.account_scope === "conta1") {
    // Read next number from panel_settings
    const { data: settingsRows } = await supabase
      .from("panel_settings")
      .select("key, value")
      .in("key", ["invoice.series", "invoice.next_number"]);
    let series = "IB";
    let nextNumber = 1;
    for (const r of settingsRows ?? []) {
      if (r.key === "invoice.series") series = String(r.value ?? "IB").replace(/"/g, "");
      if (r.key === "invoice.next_number") nextNumber = Number(r.value ?? 1);
    }
    const numberStr = String(nextNumber).padStart(5, "0");

    const { data: invRow, error: invErr } = await supabase
      .from("invoices")
      .insert({
        order_id: orderId,
        account_scope: "conta1",
        series,
        number: numberStr,
        issued_date: new Date().toISOString().slice(0, 10),
        currency: v.currency,
        customer_snapshot: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone,
          idno: customer_idno,
          address: customer_address,
        } as unknown as Json,
        subtotal,
        vat_amount: vatAmount,
        total,
        status: "issued",
      })
      .select("id")
      .single();
    if (invErr) {
      // Idempotency: unique on order_id can collide if a retry happens; ignore.
      // Other errors are non-fatal — we still ship the sale.
      console.error("[panel.sales] invoice insert failed:", invErr.message);
    } else if (invRow) {
      invoiceId = invRow.id;
      // Bump invoice number
      await supabase
        .from("panel_settings")
        .upsert(
          [
            {
              key: "invoice.next_number",
              value: (nextNumber + 1) as unknown as Json,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "key" },
        );
    }

    // Fire Refrens in the background (don't block on failure)
    if (customer_email) {
      const refrensRes = await createInvoiceForOrder(orderId);
      if (refrensRes.ok && invoiceId) {
        await supabase
          .from("invoices")
          .update({
            refrens_invoice_id: refrensRes.invoiceId,
            refrens_url: refrensRes.invoiceUrl,
          })
          .eq("id", invoiceId);
        invoiceUrl = refrensRes.invoiceUrl;
      }
    }
  }

  // Cash movement (conta2 + cash)
  if (v.account_scope === "conta2" && v.payment_method === "cash") {
    await supabase.from("cash_register_movements").insert({
      direction: "in",
      amount: total,
      reason: "sale",
      order_id: orderId,
      created_by: user.id,
      notes: `Vânzare panel #${orderId.slice(0, 8)}`,
    });
  }

  // Delivery note draft — series + number from panel_settings
  const { data: noteSettings } = await supabase
    .from("panel_settings")
    .select("key, value")
    .in("key", ["delivery_note.series", "delivery_note.next_number"]);
  let dnSeries = "FL";
  let dnNext = 1;
  for (const r of noteSettings ?? []) {
    if (r.key === "delivery_note.series") dnSeries = String(r.value ?? "FL").replace(/"/g, "");
    if (r.key === "delivery_note.next_number") dnNext = Number(r.value ?? 1);
  }
  const dnNumber = String(dnNext).padStart(5, "0");
  const { data: noteRow, error: nErr } = await supabase
    .from("delivery_notes")
    .insert({
      order_id: orderId,
      account_scope: v.account_scope,
      series: dnSeries,
      number: dnNumber,
      driver_name: v.driver_name,
      vehicle_plate: v.vehicle_plate,
      customer_name,
      customer_idno,
      customer_phone,
      delivery_address: v.delivery_address,
      payment_method: v.payment_method,
      items_snapshot: items as unknown as Json,
      status: "draft",
      created_by: user.id,
      // Currency lives on the table at runtime (sql migration). Generated
      // TS types are stale until they're regenerated — hence the cast.
      ...({ currency: v.currency } as object),
    })
    .select("id")
    .single();
  if (nErr || !noteRow) {
    console.error("[panel.sales] delivery_note insert failed:", nErr?.message);
    return {
      ok: true,
      orderId,
      deliveryNoteId: "",
      invoiceId,
      invoiceUrl,
      total,
    };
  }
  await supabase
    .from("panel_settings")
    .upsert(
      [
        {
          key: "delivery_note.next_number",
          value: (dnNext + 1) as unknown as Json,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "key" },
    );
  await supabase
    .from("orders")
    .update({ delivery_note_id: noteRow.id })
    .eq("id", orderId);

  revalidatePath("/[locale]/panel", "layout");
  return {
    ok: true,
    orderId,
    deliveryNoteId: noteRow.id,
    invoiceId,
    invoiceUrl,
    total,
  };
}
