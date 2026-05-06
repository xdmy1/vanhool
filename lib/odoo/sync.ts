import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOdooClient, OdooError } from "./client";
import { isOdooConfigured } from "./config";
import {
  listStorableProducts,
  listStockLevels,
  type OdooProduct,
} from "./products";
import { upsertPartner } from "./partners";
import { createSaleOrder, type OdooOrderLineInput } from "./orders";
import {
  createInvoiceFromSaleOrder,
  getInvoicePdfUrl,
} from "./invoices";

type SyncLogInput = {
  direction: "pull" | "push" | "webhook";
  operation: string;
  entityType?: string | null;
  entityId?: string | null;
  odooModel?: string | null;
  odooId?: number | null;
  success: boolean;
  detail?: unknown;
  durationMs?: number;
};

export async function logSync(args: SyncLogInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("odoo_sync_log").insert({
      direction: args.direction,
      operation: args.operation,
      entity_type: args.entityType ?? null,
      entity_id: args.entityId ?? null,
      odoo_model: args.odooModel ?? null,
      odoo_id: args.odooId ?? null,
      success: args.success,
      detail: (args.detail ?? null) as never,
      duration_ms: args.durationMs ?? null,
    });
  } catch {
    // logging failure shouldn't break the actual operation
  }
}

// ---------------------------------------------------------------------------
// PULL — Odoo → Supabase
// ---------------------------------------------------------------------------

export type PullProductsResult = {
  ok: boolean;
  fetched: number;
  upserted: number;
  errors: string[];
  message?: string;
};

/**
 * Fetch all storable+sellable products from Odoo and upsert them into
 * Supabase. Match by `odoo_id`; if a product already exists with the same
 * `barcode` or `part_code` and no odoo_id yet, link it.
 */
export async function pullProducts(): Promise<PullProductsResult> {
  if (!isOdooConfigured()) {
    return { ok: false, fetched: 0, upserted: 0, errors: [], message: "not_configured" };
  }
  const start = Date.now();
  const errors: string[] = [];
  let fetched = 0;
  let upserted = 0;
  let offset = 0;
  const pageSize = 100;
  const supabase = getSupabaseAdmin();

  try {
    while (true) {
      const batch = await listStorableProducts({ limit: pageSize, offset });
      if (batch.length === 0) break;
      fetched += batch.length;

      for (const odoo of batch) {
        const result = await upsertProductFromOdoo(odoo);
        if (result.ok) upserted += 1;
        else errors.push(`#${odoo.id} ${odoo.name}: ${result.error}`);
      }

      if (batch.length < pageSize) break;
      offset += pageSize;
    }
    await logSync({
      direction: "pull",
      operation: "products.pull",
      entityType: "product",
      success: errors.length === 0,
      detail: { fetched, upserted, errors: errors.slice(0, 10) },
      durationMs: Date.now() - start,
    });
    return { ok: errors.length === 0, fetched, upserted, errors };
  } catch (e) {
    const message = e instanceof OdooError ? e.message : String(e);
    await logSync({
      direction: "pull",
      operation: "products.pull",
      entityType: "product",
      success: false,
      detail: { error: message, fetched, upserted },
      durationMs: Date.now() - start,
    });
    return {
      ok: false,
      fetched,
      upserted,
      errors: [message],
      message,
    };
  }
}

async function upsertProductFromOdoo(
  odoo: OdooProduct,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();

  // 1. Try to find an existing row by odoo_id, barcode, or part_code.
  const orFilters: string[] = [];
  if (odoo.id) orFilters.push(`odoo_id.eq.${odoo.id}`);
  if (odoo.barcode) orFilters.push(`barcode.eq.${odoo.barcode}`);
  if (odoo.default_code) orFilters.push(`part_code.eq.${odoo.default_code}`);

  let existingId: string | null = null;
  if (orFilters.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, odoo_id")
      .or(orFilters.join(","))
      .limit(1);
    existingId = data?.[0]?.id ?? null;
  }

  const slug =
    odoo.default_code?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ??
    `odoo-${odoo.id}`;

  const payload = {
    odoo_id: odoo.id,
    odoo_synced_at: new Date().toISOString(),
    odoo_qty_available: odoo.qty_available ?? 0,
    barcode: odoo.barcode || null,
    part_code: odoo.default_code || null,
    name_ro: odoo.name,
    name_en: odoo.name,
    name_ru: odoo.name,
    description_ro: odoo.description_sale,
    description_en: odoo.description_sale,
    description_ru: odoo.description_sale,
    price: Number(odoo.list_price ?? 0),
    stock_quantity: Math.max(0, Math.floor(Number(odoo.qty_available ?? 0))),
    weight: odoo.weight ?? null,
    is_active: !!odoo.active,
    slug,
  };

  if (existingId) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", existingId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await supabase.from("products").insert(payload);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Cheap stock-only refresh: pulls qty_available for every product that has an
 * odoo_id and updates Supabase. Run this on a frequent cron (e.g. every 5 min)
 * if you don't have webhooks wired up.
 */
export async function refreshStockLevels(): Promise<{
  ok: boolean;
  updated: number;
  message?: string;
}> {
  if (!isOdooConfigured()) {
    return { ok: false, updated: 0, message: "not_configured" };
  }
  const start = Date.now();
  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("products")
    .select("id, odoo_id")
    .not("odoo_id", "is", null);
  const odooIds = (rows ?? [])
    .map((r) => r.odoo_id as number | null)
    .filter((id): id is number => typeof id === "number");

  try {
    const stock = await listStockLevels(odooIds);
    let updated = 0;
    for (const [odooId, qty] of stock) {
      const { error } = await supabase
        .from("products")
        .update({
          stock_quantity: Math.max(0, Math.floor(qty)),
          odoo_qty_available: qty,
          odoo_synced_at: new Date().toISOString(),
        })
        .eq("odoo_id", odooId);
      if (!error) updated += 1;
    }
    await logSync({
      direction: "pull",
      operation: "stock.refresh",
      success: true,
      detail: { updated, requested: odooIds.length },
      durationMs: Date.now() - start,
    });
    return { ok: true, updated };
  } catch (e) {
    const message = e instanceof OdooError ? e.message : String(e);
    await logSync({
      direction: "pull",
      operation: "stock.refresh",
      success: false,
      detail: { error: message },
      durationMs: Date.now() - start,
    });
    return { ok: false, updated: 0, message };
  }
}

// ---------------------------------------------------------------------------
// PUSH — web order → Odoo
// ---------------------------------------------------------------------------

export type PushOrderResult =
  | {
      ok: true;
      odooOrderId: number;
      odooReference: string;
      odooPartnerId: number;
    }
  | { ok: false; reason: "not_configured" | "remote_error"; message?: string };

/**
 * Push a Supabase order (already inserted) to Odoo as a sale.order.
 * Best-effort: failures are logged on the order via odoo_sync_error so the
 * admin can retry later from /admin/odoo.
 */
export async function pushOrderToOdoo(orderId: string): Promise<PushOrderResult> {
  if (!isOdooConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const start = Date.now();
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, customer_address, items, notes, user_id, odoo_order_id",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false, reason: "remote_error", message: "order_not_found" };
  }
  if (order.odoo_order_id) {
    // Already synced — return current ids without re-pushing.
    return {
      ok: true,
      odooOrderId: order.odoo_order_id,
      odooReference: `S${order.odoo_order_id}`,
      odooPartnerId: 0,
    };
  }

  let partnerId: number | null = null;
  try {
    partnerId = await upsertPartner({
      email: order.customer_email ?? `order-${orderId}@interbus.local`,
      name: order.customer_name ?? "Web customer",
      phone: order.customer_phone,
      street: order.customer_address,
      countryCode: "MD",
    });

    if (order.user_id) {
      await supabase
        .from("profiles")
        .update({ odoo_partner_id: partnerId })
        .eq("id", order.user_id);
    }
  } catch (e) {
    const message = e instanceof OdooError ? e.message : String(e);
    await markOrderSyncError(orderId, message);
    await logSync({
      direction: "push",
      operation: "partner.upsert",
      entityType: "order",
      entityId: orderId,
      success: false,
      detail: { error: message },
      durationMs: Date.now() - start,
    });
    return { ok: false, reason: "remote_error", message };
  }

  const lines: OdooOrderLineInput[] = parseOrderItems(order.items).map((it) => ({
    partCode: it.partCode,
    name: it.name,
    quantity: it.quantity,
    unitPrice: it.price,
  }));

  try {
    const created = await createSaleOrder({
      partnerId,
      clientReference: order.id.slice(0, 8).toUpperCase(),
      notes: order.notes ?? undefined,
      lines,
      confirm: false, // arrives as quotation; admin/staff confirm in Odoo
    });

    await supabase
      .from("orders")
      .update({
        odoo_order_id: created.orderId,
        odoo_synced_at: new Date().toISOString(),
        odoo_sync_error: null,
      })
      .eq("id", orderId);

    await logSync({
      direction: "push",
      operation: "order.push",
      entityType: "order",
      entityId: orderId,
      odooModel: "sale.order",
      odooId: created.orderId,
      success: true,
      detail: { reference: created.reference, lines: lines.length },
      durationMs: Date.now() - start,
    });

    return {
      ok: true,
      odooOrderId: created.orderId,
      odooReference: created.reference,
      odooPartnerId: partnerId,
    };
  } catch (e) {
    const message = e instanceof OdooError ? e.message : String(e);
    await markOrderSyncError(orderId, message);
    await logSync({
      direction: "push",
      operation: "order.push",
      entityType: "order",
      entityId: orderId,
      success: false,
      detail: { error: message },
      durationMs: Date.now() - start,
    });
    return { ok: false, reason: "remote_error", message };
  }
}

async function markOrderSyncError(orderId: string, message: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("orders")
    .update({ odoo_sync_error: message.slice(0, 500) })
    .eq("id", orderId);
}

type OrderItemRow = {
  productId: string;
  slug: string;
  name: string;
  partCode: string;
  brand: string;
  price: number;
  quantity: number;
};

function parseOrderItems(raw: unknown): OrderItemRow[] {
  if (!Array.isArray(raw)) return [];
  const out: OrderItemRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    out.push({
      productId: String(r.productId ?? r.product_id ?? r.id ?? ""),
      slug: String(r.slug ?? ""),
      name: String(r.name ?? ""),
      partCode: String(r.partCode ?? r.part_code ?? ""),
      brand: String(r.brand ?? ""),
      price: Number(r.price ?? 0),
      quantity: Number(r.quantity ?? 1),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// PUSH — invoice from sale order
// ---------------------------------------------------------------------------

export async function generateInvoiceForOrder(orderId: string): Promise<
  | { ok: true; odooInvoiceId: number; pdfUrl: string }
  | { ok: false; reason: "not_configured" | "no_odoo_order" | "remote_error"; message?: string }
> {
  if (!isOdooConfigured()) return { ok: false, reason: "not_configured" };
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("odoo_order_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order?.odoo_order_id) return { ok: false, reason: "no_odoo_order" };

  try {
    const ids = await createInvoiceFromSaleOrder(order.odoo_order_id, {
      post: true,
    });
    const invoiceId = ids[0];
    const pdfUrl = await getInvoicePdfUrl(invoiceId);

    await supabase
      .from("orders")
      .update({
        odoo_invoice_id: invoiceId,
        invoice_id: String(invoiceId),
        invoice_url: pdfUrl,
        odoo_synced_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await logSync({
      direction: "push",
      operation: "invoice.create",
      entityType: "order",
      entityId: orderId,
      odooModel: "account.move",
      odooId: invoiceId,
      success: true,
      detail: { pdfUrl },
    });

    return { ok: true, odooInvoiceId: invoiceId, pdfUrl };
  } catch (e) {
    const message = e instanceof OdooError ? e.message : String(e);
    await logSync({
      direction: "push",
      operation: "invoice.create",
      entityType: "order",
      entityId: orderId,
      success: false,
      detail: { error: message },
    });
    return { ok: false, reason: "remote_error", message };
  }
}

// ---------------------------------------------------------------------------
// WEBHOOK helpers
// ---------------------------------------------------------------------------

/** Apply a "product updated" event from Odoo. */
export async function applyProductUpdate(payload: {
  id: number;
  qty_available?: number;
  list_price?: number;
  barcode?: string | null;
  active?: boolean;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = {
    odoo_synced_at: new Date().toISOString(),
  };
  if (typeof payload.qty_available === "number") {
    update.stock_quantity = Math.max(0, Math.floor(payload.qty_available));
    update.odoo_qty_available = payload.qty_available;
  }
  if (typeof payload.list_price === "number") update.price = payload.list_price;
  if (payload.barcode !== undefined) update.barcode = payload.barcode || null;
  if (typeof payload.active === "boolean") update.is_active = payload.active;

  const { error, count } = await supabase
    .from("products")
    .update(update, { count: "exact" })
    .eq("odoo_id", payload.id);

  await logSync({
    direction: "webhook",
    operation: "product.updated",
    entityType: "product",
    odooModel: "product.product",
    odooId: payload.id,
    success: !error,
    detail: { matched: count ?? 0, error: error?.message },
  });
  return !error && (count ?? 0) > 0;
}
