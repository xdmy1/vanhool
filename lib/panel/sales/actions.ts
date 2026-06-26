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
  /**
   * Origin of this row. "catalog" = real `products` row that's already
   * been posted (i.e. has stock, can be sold). "draft_purchase" = a
   * line on a not-yet-posted purchase — handy for putting a proforma
   * together against parts that are physically in the shop but
   * haven't been fiscally posted yet. The wizard / form decides
   * whether to allow selection based on this field.
   */
  source: "catalog" | "draft_purchase";
  /**
   * When source === "draft_purchase": short context label like
   * "Doc AAY5397778 · ICS AD AUTO TOTAL" so the operator sees which
   * draft a match came from. Empty for catalog rows.
   */
  draft_purchase_label?: string;
};

/**
 * Diagnostic-friendly wrapper around the catalog + draft search.
 * Returns the same result list as `searchProducts` plus side-channel
 * metadata so the autocomplete can surface what actually happened
 * server-side (catalog count, draft count, errors). Keeps the
 * simpler `searchProducts` signature intact for callers that don't
 * need the diagnostic. */
export type ProductSearchMeta = {
  catalog_count: number;
  draft_count: number;
  draft_error: string | null;
  draft_purchase_total: number;
  /** count of purchase_items in any draft purchase the session can read */
  draft_items_total: number;
  /** count of purchase_items matching the term (no draft filter) */
  items_match_total: number;
  /** sample row from the first match to confirm columns flow through */
  sample: string | null;
  /** first 8 chars of each draft purchase id the session sees — to
   *  compare against the purchase_id of the global ilike match. */
  draft_ids_seen: string[];
  /** first 8 chars of every purchase_id that has a global ilike match. */
  match_purchase_ids: string[];
};

export async function searchProductsWithMeta(
  q: string,
): Promise<{ results: ProductSearchResult[]; meta: ProductSearchMeta }> {
  const results = await searchProducts(q);
  // Re-derive counts from the response — cheap, avoids restructuring
  // the underlying searchProducts contract.
  let catalog = 0;
  let draft = 0;
  for (const r of results) {
    if (r.source === "draft_purchase") draft++;
    else catalog++;
  }
  // Independent probes so we can tell precisely where the search is
  // failing: at the purchases RLS, the items RLS, or the ilike filter.
  const supabase = await createClient();
  const trimmed = q.trim();
  const term = `%${trimmed.replace(/[%_]/g, "")}%`;
  const [purchaseCount, draftIdsRes, allItemsInDraftsCount, matchAcrossAll] =
    await Promise.all([
      supabase
        .from("purchases")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("purchases").select("id").eq("status", "draft").limit(500),
      // Will rerun via JS to count items in those drafts
      Promise.resolve(null),
      supabase
        .from("purchase_items")
        .select("id, supplier_code, purchase_id", { count: "exact" })
        .ilike("supplier_code", term)
        .limit(50),
    ]);
  const ids = (draftIdsRes.data ?? []).map((d) => d.id as string);
  let itemsCount = 0;
  let sample: string | null = null;
  if (ids.length > 0) {
    const r = await supabase
      .from("purchase_items")
      .select("supplier_code", { count: "exact" })
      .in("purchase_id", ids)
      .limit(1);
    itemsCount = r.count ?? 0;
    sample = (r.data?.[0]?.supplier_code as string | null) ?? null;
  }

  const matchRows = ((matchAcrossAll.data ?? []) as Array<{
    purchase_id: string;
  }>).map((r) => r.purchase_id);

  return {
    results,
    meta: {
      catalog_count: catalog,
      draft_count: draft,
      draft_error: purchaseCount.error?.message ?? null,
      draft_purchase_total: purchaseCount.count ?? 0,
      draft_items_total: itemsCount,
      items_match_total: matchAcrossAll.count ?? 0,
      sample,
      draft_ids_seen: ids.map((s) => s.slice(0, 8)),
      match_purchase_ids: Array.from(new Set(matchRows)).map((s) =>
        s.slice(0, 8),
      ),
    },
  };
}

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
  const catalogResults: ProductSearchResult[] = (data ?? []).map((p) => ({
    id: p.id,
    part_code: p.part_code,
    name_ro: p.name_ro ?? p.name_en,
    brand: p.brand,
    price: Number(p.price ?? 0),
    cost_price: Number(p.cost_price ?? 0),
    stock_quantity: Number(p.stock_quantity ?? 0),
    storage_location: p.storage_location,
    is_active: Boolean(p.is_active),
    source: "catalog" as const,
  }));

  // Second pass: items on DRAFT purchases. Operator wants to put
  // these on proformas before the purchase is fiscally posted —
  // they're physically in the shop, just not in the catalog yet.
  // We surface them in the same dropdown with a "draft" badge.
  const draftResults = await searchDraftPurchaseItems(trimmed, term);

  // Catalog first (real stock), drafts after — order matters for the
  // dropdown so a matching catalog row always sits above a draft.
  return [...catalogResults, ...draftResults];
}

/**
 * Look up line items on draft purchases by supplier_code OR
 * internal_code (ilike). Two-step query instead of a `!inner` join:
 *
 *   1. fetch the IDs of every draft purchase
 *   2. fetch purchase_items where purchase_id IN those IDs AND any
 *      code/description field matches
 *
 * The `!inner` + `.eq("purchases.status","draft")` chain has bitten
 * us with embedded RLS edge cases — the embedded read sometimes
 * comes back empty even when the operator IS an admin. Splitting
 * the call sidesteps that entirely and makes the query trivially
 * debuggable.
 *
 * Returned shape mirrors a catalog row so the existing dropdown UI
 * keeps working unchanged — only `source` flips and prices come
 * from the unit_cost on the purchase line.
 */
async function searchDraftPurchaseItems(
  trimmed: string,
  term: string,
): Promise<ProductSearchResult[]> {
  const supabase = await createClient();

  // Step 1: which purchases are currently in draft? Two-pass —
  // first pull the draft ids + document_number with NO embedded
  // join (embedded `suppliers(name)` was returning empty drafts in
  // the panel session even though the parent rows are visible),
  // then resolve supplier names with a separate IN-lookup.
  const { data: drafts, error: dErr } = await supabase
    .from("purchases")
    .select("id, document_number, supplier_id")
    .eq("status", "draft")
    .limit(500);
  if (dErr) {
    console.warn("[searchDraftPurchaseItems] draft fetch failed:", dErr.message);
    return [];
  }
  const draftIds = (drafts ?? []).map((d) => d.id as string);
  if (draftIds.length === 0) return [];
  const supplierIds = Array.from(
    new Set(
      (drafts ?? [])
        .map((d) => (d as { supplier_id: string | null }).supplier_id)
        .filter((s): s is string => !!s),
    ),
  );
  const supplierNames = new Map<string, string>();
  if (supplierIds.length > 0) {
    const { data: sups } = await supabase
      .from("suppliers")
      .select("id, name")
      .in("id", supplierIds);
    for (const s of (sups ?? []) as Array<{ id: string; name: string }>) {
      supplierNames.set(s.id, s.name);
    }
  }
  const draftMeta = new Map<
    string,
    { docNumber: string | null; supplierName: string }
  >();
  for (const d of (drafts ?? []) as Array<{
    id: string;
    document_number: string | null;
    supplier_id: string | null;
  }>) {
    draftMeta.set(d.id, {
      docNumber: d.document_number,
      supplierName:
        (d.supplier_id ? supplierNames.get(d.supplier_id) : null) ?? "—",
    });
  }

  // Step 2: items inside those drafts that match the term. Originally
  // a single `.or(supplier_code.ilike.X,internal_code.ilike.X,
  // description.ilike.X)` call — that combination silently returned
  // empty for the panel's authenticated session even though the raw
  // SQL works (verified via service-role probes). Bug seems to be in
  // how Supabase JS encodes a multi-field OR clause with ilike
  // wildcards under PostgREST + RLS.
  //
  // Workaround: three independent .ilike queries in parallel, then
  // de-dup by id. Each query is a plain RLS-safe filter — works
  // reliably across both contexts.
  const baseSelect =
    "id, supplier_code, internal_code, description, quantity, unit_cost, purchase_id";
  const [bySupplier, byInternal, byDescription] = await Promise.all([
    supabase
      .from("purchase_items")
      .select(baseSelect)
      .in("purchase_id", draftIds)
      .ilike("supplier_code", term)
      .limit(20),
    supabase
      .from("purchase_items")
      .select(baseSelect)
      .in("purchase_id", draftIds)
      .ilike("internal_code", term)
      .limit(20),
    supabase
      .from("purchase_items")
      .select(baseSelect)
      .in("purchase_id", draftIds)
      .ilike("description", term)
      .limit(20),
  ]);
  if (bySupplier.error) {
    console.warn("[searchDraftPurchaseItems] supplier_code lookup failed:", bySupplier.error.message);
  }
  if (byInternal.error) {
    console.warn("[searchDraftPurchaseItems] internal_code lookup failed:", byInternal.error.message);
  }
  if (byDescription.error) {
    console.warn("[searchDraftPurchaseItems] description lookup failed:", byDescription.error.message);
  }

  type Row = {
    id: string;
    supplier_code: string | null;
    internal_code: string | null;
    description: string | null;
    quantity: number | string | null;
    unit_cost: number | string | null;
    purchase_id: string;
  };
  const dedup = new Map<string, Row>();
  for (const r of [
    ...((bySupplier.data ?? []) as Row[]),
    ...((byInternal.data ?? []) as Row[]),
    ...((byDescription.data ?? []) as Row[]),
  ]) {
    if (!dedup.has(r.id)) dedup.set(r.id, r);
  }
  let rows = Array.from(dedup.values());

  // Normalized-code fallback: pulls a wider batch and filters in JS
  // when raw ilike yields zero — covers "317330" typed vs "317 330"
  // stored. Caps at 20 returned rows to keep the dropdown sane.
  if (rows.length === 0) {
    const normalizedTerm = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalizedTerm.length >= 2) {
      const wide = await supabase
        .from("purchase_items")
        .select(baseSelect)
        .in("purchase_id", draftIds)
        .limit(500);
      const wideRows = (wide.data ?? []) as Row[];
      rows = wideRows
        .filter((it) => {
          const codes = [it.supplier_code, it.internal_code, it.description]
            .filter(Boolean)
            .map((c) =>
              String(c ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
            );
          return codes.some((c) => c.includes(normalizedTerm));
        })
        .slice(0, 20);
    }
  }

  return rows.map((it) => {
    const meta = draftMeta.get(it.purchase_id);
    const label = meta?.docNumber
      ? `Doc ${meta.docNumber} · ${meta.supplierName}`
      : `Achiziție draft · ${meta?.supplierName ?? "—"}`;
    return {
      id: it.id,
      part_code: it.internal_code ?? it.supplier_code,
      name_ro: it.description ?? null,
      brand: null,
      price: Number(it.unit_cost ?? 0),
      cost_price: Number(it.unit_cost ?? 0),
      stock_quantity: Number(it.quantity ?? 0),
      storage_location: null,
      is_active: false,
      source: "draft_purchase" as const,
      draft_purchase_label: label,
    };
  });
}

// -----------------------------------------------------------------------------
// createManualSale — the main action

const lineSchema = z.object({
  product_id: z.string().uuid(),
  qty: z.number().positive(),
  /** Normal "list" price per unit — what the line would cost without a discount. */
  unit_price: z.number().nonnegative(),
  /**
   * Optional discounted price per unit. When omitted / null / >= unit_price,
   * the line is sold at unit_price (no per-line discount).
   */
  discounted_unit_price: z.number().nonnegative().nullable().optional(),
  /**
   * Unit of measure. Default "buc" (pieces — integer qty). Lines tagged
   * "l" or "m" allow decimal qty (e.g. 1.5 litri AdBlue, 2.3 m furtun).
   * Stored on the items snapshot so the bookkeeper / driver / invoice
   * print all show the same unit the operator picked.
   */
  unit: z.enum(["buc", "l", "m"]).default("buc"),
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
    /** Optional commercial discount in percent (0..100). Default 0. */
    discount_percent: z.number().min(0).max(100).optional(),
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
  let subtotalBeforeDiscount = 0;
  for (const line of v.items) {
    const p = byId.get(line.product_id);
    if (!p) return { ok: false, reason: `product_missing:${line.product_id}` };
    if ((p.stock_quantity ?? 0) < line.qty) {
      return {
        ok: false,
        reason: `stock_insufficient:${p.part_code ?? p.id.slice(0, 8)} (disponibil ${p.stock_quantity ?? 0})`,
      };
    }
    // Effective price = discounted_unit_price if set and lower than the list
    // price; else the list price. Anything >= list price collapses to list
    // (no negative or zero-saving discounts).
    const dp = line.discounted_unit_price;
    const effective =
      dp != null && dp >= 0 && dp < line.unit_price ? dp : line.unit_price;
    const lineTotalEff = Number((line.qty * effective).toFixed(2));
    const lineTotalGross = Number((line.qty * line.unit_price).toFixed(2));
    subtotal += lineTotalEff;
    subtotalBeforeDiscount += lineTotalGross;
    items.push({
      productId: p.id,
      partCode: p.part_code,
      name: p.name_ro,
      brand: p.brand,
      storage_location: p.storage_location,
      quantity: line.qty,
      // Unit of measure picked at sale time. Defaults to "buc" so
      // legacy callers (Refrens conversion, delivery-note printer)
      // that don't read this field still behave as before.
      unit: line.unit,
      // `price` keeps backwards-compat with anything that read the old shape;
      // it now reflects the EFFECTIVE per-unit price (what the customer pays).
      price: effective,
      // Pre-discount per-unit price — only meaningful when > price. Older
      // snapshots without this field render as no-discount.
      original_unit_price: line.unit_price,
      unit_discount: Number((line.unit_price - effective).toFixed(2)),
      cost_price: Number(p.cost_price ?? 0),
      total: lineTotalEff,
    });
  }
  subtotal = Number(subtotal.toFixed(2));
  subtotalBeforeDiscount = Number(subtotalBeforeDiscount.toFixed(2));

  const vatAmount = Number(((v.vat_amount ?? 0)).toFixed(2));
  // Document-level discount = sum of per-line reductions. We keep
  // `discount_percent` derived from that so historical reports continue to
  // group invoices by discount magnitude. The client-side passes the same
  // number, but we recompute defensively from the items in case of drift.
  const discountAmount = Number(
    (subtotalBeforeDiscount - subtotal).toFixed(2),
  );
  const discountPercent =
    subtotalBeforeDiscount > 0
      ? Math.min(
          100,
          Number(((discountAmount / subtotalBeforeDiscount) * 100).toFixed(2)),
        )
      : 0;
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
      discount_amount: discountAmount,
      shipping_cost: 0,
      total,
      // discount_percent is a panel-only column added by a later migration —
      // skip the key when 0 so legacy schemas (pre-migration) keep working
      // for non-discounted sales.
      ...(discountPercent > 0
        ? ({ discount_percent: discountPercent } as object)
        : {}),
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

  // Always mirror the sale into the invoices table — both books need a
  // record so the operator can find it in /panel/facturi later. Refrens
  // fires only for conta1 (fiscal); conta2 invoices are panel-only.
  let invoiceId: string | null = null;
  let invoiceUrl: string | null = null;
  {
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

    const isPaidNow = v.payment_method === "already_paid";
    // Once cash is in and a fiscal invoice gets stamped, the document
    // belongs in conta1 even if the SALE itself was tagged conta2. The
    // order row stays in v.account_scope (the cash drawer / informal
    // sale stays where the operator put it) — only the invoice flips.
    // Matches /panel/facturi's "paid = official book" rule.
    const invoiceAccountScope =
      isPaidNow && v.account_scope === "conta2" ? "conta1" : v.account_scope;

    // Items snapshot in INVOICE shape — InvoicePrintContent expects
    // `unit_price` (list) + `discounted_unit_price` (effective). Without
    // this the printable factură rendered an empty table because
    // items_snapshot stayed null.
    const invoiceItemsSnapshot = v.items.map((line) => {
      const p = byId.get(line.product_id)!;
      const dp = line.discounted_unit_price;
      const eff =
        dp != null && dp >= 0 && dp < line.unit_price ? dp : line.unit_price;
      return {
        productId: p.id,
        partCode: p.part_code,
        name: p.name_ro,
        description: null,
        quantity: line.qty,
        unit: line.unit,
        unit_price: line.unit_price,
        discounted_unit_price: eff < line.unit_price ? eff : null,
        vat_rate: 0,
        total: Number((line.qty * eff).toFixed(2)),
      };
    });

    const { data: invRow, error: invErr } = await supabase
      .from("invoices")
      .insert({
        order_id: orderId,
        account_scope: invoiceAccountScope,
        series,
        number: numberStr,
        issued_date: new Date().toISOString().slice(0, 10),
        paid_at: isPaidNow ? new Date().toISOString() : null,
        currency: v.currency,
        customer_snapshot: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone,
          idno: customer_idno,
          address: customer_address,
        } as unknown as Json,
        items_snapshot: invoiceItemsSnapshot as unknown as Json,
        subtotal,
        vat_amount: vatAmount,
        // Mirror of an over-the-counter sale (vs. a directly-issued invoice
        // or a proforma conversion). Lets the facturi list filter / badge
        // these so the operator can still find them by origin.
        ...({
          source: "sale",
          ...(discountPercent > 0 ? { discount_percent: discountPercent } : {}),
        } as object),
        total,
        status: isPaidNow ? "paid" : "issued",
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

    // Refrens runs only for the official book + when there's a real email.
    if (v.account_scope === "conta1" && customer_email) {
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

  // Cash movement (conta2 + cash) — currency-aware. Store both the native
  // amount (so the audit log shows what the customer actually paid) AND
  // the MDL-equivalent (so the till balance still reconciles in lei).
  if (v.account_scope === "conta2" && v.payment_method === "cash") {
    const fxRate = v.currency === "EUR" ? 20 : v.currency === "USD" ? 17 : 1;
    await supabase.from("cash_register_movements").insert({
      direction: "in",
      amount: total,
      reason: "sale",
      order_id: orderId,
      created_by: user.id,
      notes: `Vânzare panel #${orderId.slice(0, 8)}`,
      ...({
        currency: v.currency,
        fx_rate: fxRate,
        amount_mdl: Number((total * fxRate).toFixed(2)),
      } as object),
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
  const baseNote: Record<string, unknown> = {
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
  };
  // First attempt: include currency. If the migration hasn't been applied
  // yet (column missing → PGRST204), retry without it so the sale still
  // produces a delivery note in MDL.
  let { data: noteRow, error: nErr } = await supabase
    .from("delivery_notes")
    .insert({ ...baseNote, currency: v.currency } as never)
    .select("id")
    .single();
  if (nErr && /currency/i.test(nErr.message ?? "")) {
    const retry = await supabase
      .from("delivery_notes")
      .insert(baseNote as never)
      .select("id")
      .single();
    noteRow = retry.data;
    nErr = retry.error;
  }
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
