"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import { sendResendEmail, type ResendAttachment } from "@/lib/email/resend";
import { accountantMarkEnteredUrl } from "@/lib/panel/accountant-entered";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { accountantMonthlyPurchasesEmail } from "@/lib/email/accountant-monthly-purchases";
import { getConta1PurchasesForRange } from "@/lib/panel/purchases/queries";
import { purchaseLine, purchaseTotals } from "@/lib/panel/purchases/line-math";

// Bookkeeper inbox — shared with lib/panel/invoices/actions.ts. Override via
// env (ACCOUNTANT_EMAIL) if it needs rotating without a redeploy.
const PURCHASE_DOCS_BUCKET = "purchase-docs";

/**
 * Fetch the operator's uploaded supplier invoice (PDF or image) out of
 * the private `purchase-docs` bucket via the service-role client and
 * return it as a Resend-ready base64 attachment. `null` / empty input
 * collapses to an empty array so callers can pass the result through
 * unconditionally.
 *
 * `file_url` may be:
 *   • a relative storage path ("abc/2026/invoice.pdf") — preferred
 *     shape persisted by the upload widget
 *   • a fully-qualified URL — we extract the path after the bucket
 *     name so legacy rows still resolve
 * Either way we always download via the admin client; signed URLs
 * expire and we don't want the bookkeeper to receive a dead link.
 */
async function loadPurchaseAttachment(
  file_url: string | null,
): Promise<ResendAttachment[]> {
  if (!file_url) return [];
  let storagePath = file_url;
  // Normalize "https://.../storage/v1/object/(public|sign)/purchase-docs/<path>"
  // — strip everything up to and including the bucket name.
  const marker = `/${PURCHASE_DOCS_BUCKET}/`;
  const idx = storagePath.indexOf(marker);
  if (idx !== -1) {
    storagePath = storagePath.slice(idx + marker.length);
    // Signed URLs trail with `?token=...` — drop the query string.
    storagePath = storagePath.split("?")[0];
  }
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.storage
      .from(PURCHASE_DOCS_BUCKET)
      .download(storagePath);
    if (error || !data) {
      console.warn(
        "[panel.purchases] couldn't fetch attachment:",
        error?.message ?? "no-blob",
      );
      return [];
    }
    const buf = Buffer.from(await data.arrayBuffer());
    const filename = storagePath.split("/").pop() || "factura.bin";
    return [
      {
        filename,
        content: buf.toString("base64"),
        contentType: data.type || undefined,
      },
    ];
  } catch (e) {
    console.warn("[panel.purchases] attachment fetch threw:", e);
    return [];
  }
}

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
  /** Unit of measure (buc / litru / metru / …). App vocabulary — see
   *  lib/stock.ts PRODUCT_UNITS. Flows to products.unit on postPurchase. */
  unit: z.string().default("buc"),
  /** Split trace shown to the bookkeeper (e.g. "1 buc → 200 litri"). */
  pack_note: z.string().nullable().optional(),
  vat_rate: z.number().nonnegative().default(20),
  /** Opt-in: when true, postPurchase creates / restocks a catalog product
   * for this line. When false (default), the line is purely an accounting
   * record — no product is created and no stock is tracked. */
  add_to_catalog: z.boolean().optional().default(false),
});

const purchaseSchema = z.object({
  supplier_id: z.string().uuid(),
  account_scope: z.enum(["conta1", "conta2"]),
  document_number: z.string().nullable().optional(),
  document_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().default("MDL"),
  fx_rate: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  /**
   * Storage path inside the `purchase-docs` bucket for the supplier's
   * original invoice (PDF or image). Persisted on purchases.file_url
   * — the bookkeeper email pulls this file and attaches it so they
   * see the actual document, not just our recap.
   */
  file_url: z.string().nullable().optional(),
  items: z.array(lineInputSchema).min(1),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

/**
 * Return the subset of line `product_id`s that actually exist in `products`.
 *
 * The purchase-line autocomplete shares `searchProducts` with the sale flow,
 * which surfaces draft-purchase lines whose `id` is a `purchase_items` id, not
 * a `products` id. If one of those slips into `product_id`, the whole
 * `purchase_items` insert fails on `purchase_items_product_id_fkey`. We drop
 * unknown ids to null instead: a null link is the correct fallback — the line
 * is just an accounting row until `postPurchase` re-creates / re-links the
 * product by code — so a single bad reference can never sink the save.
 */
async function knownProductIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: ReadonlyArray<{ product_id?: string | null }>,
): Promise<Set<string>> {
  const ids = Array.from(
    new Set(items.map((i) => i.product_id).filter((s): s is string => !!s)),
  );
  if (ids.length === 0) return new Set<string>();
  const { data } = await supabase.from("products").select("id").in("id", ids);
  return new Set((data ?? []).map((p) => p.id as string));
}

/**
 * Snapshot a purchase's current line items into `purchase_items_archive` before
 * they're replaced or deleted. This is the safety net behind reversible deletes
 * + the edit audit trail: whatever gets removed can be read back and restored,
 * and we always know who removed it and when.
 *
 * Writes with the service-role client so the archive works regardless of the
 * archive table's RLS (it's a server-only audit store). Best-effort: if the
 * migration (sql/purchase-items-safety.sql) hasn't run yet, we log and move on
 * — the atomic insert-then-delete ordering already prevents data loss without
 * it, so archiving must never block an edit.
 */
async function archivePurchaseItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  purchaseId: string,
  reason: "update_replace" | "purchase_delete",
  userId: string | null,
): Promise<void> {
  const cols =
    "id, purchase_id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, line_total, created_at";
  // add_to_catalog may be absent on very old schemas — mirror postPurchase's
  // fallback so a missing column never aborts the snapshot.
  let sel = await supabase
    .from("purchase_items")
    .select(`${cols}, add_to_catalog` as typeof cols)
    .eq("purchase_id", purchaseId);
  if (sel.error && /add_to_catalog/i.test(sel.error.message)) {
    sel = await supabase
      .from("purchase_items")
      .select(cols)
      .eq("purchase_id", purchaseId);
  }
  const rows = (sel.data ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) return;

  const snapshot = rows.map((r) => ({
    id: r.id ?? null,
    purchase_id: r.purchase_id ?? null,
    product_id: r.product_id ?? null,
    supplier_code: r.supplier_code ?? null,
    internal_code: r.internal_code ?? null,
    description: r.description ?? null,
    quantity: r.quantity ?? null,
    unit_cost: r.unit_cost ?? null,
    vat_rate: r.vat_rate ?? null,
    line_total: r.line_total ?? null,
    add_to_catalog: (r as { add_to_catalog?: boolean | null }).add_to_catalog ?? null,
    item_created_at: r.created_at ?? null,
    archived_by: userId,
    archive_reason: reason,
  }));

  const { error } = await getSupabaseAdmin()
    .from("purchase_items_archive")
    .insert(snapshot as never);
  if (error) {
    console.warn(
      "[panel.purchases] archive skipped (run sql/purchase-items-safety.sql):",
      error.message,
    );
  }
}

// GROSS-anchored totals (shared with the form) — the document total is the sum
// of qty × with-VAT unit price, so 30 × 175 = 5250 reconciles to the cent
// instead of collapsing to 5249.88 via a rounded net. See lib/.../line-math.ts.
function computeTotals(items: PurchaseInput["items"]) {
  return purchaseTotals(items);
}

/** One purchase line as read back from `purchase_items` for stock application. */
type PostedLine = {
  id: string;
  product_id: string | null;
  supplier_code: string | null;
  internal_code: string | null;
  description: string;
  quantity: number | string;
  unit_cost: number | string;
  vat_rate: number | string;
  unit?: string | null;
  add_to_catalog?: boolean;
};

/**
 * Apply a set of purchase lines to stock: for each line resolve (or create) the
 * catalog product, increment its stock by the line quantity, refresh cost_price
 * (GROSS MDL = net × (1+vat) × fx) and add the supplier cross-reference. Links
 * `product_id` back onto the line. This is the single source of truth shared by
 * postPurchase (first post) and updatePurchase (re-apply on edit of a posted
 * document). cost_price is GROSS per project convention — see the CORE math fix.
 */
async function applyPostedLines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  header: {
    supplier_id: string;
    currency: string | null;
    fx_rate: number | string | null;
  },
  lines: PostedLine[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const DEFAULT_FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };
  const currency = (header.currency ?? "MDL").toUpperCase();
  const toMdl =
    currency === "MDL"
      ? 1
      : Number(header.fx_rate) || DEFAULT_FX_TO_MDL[currency] || 1;
  const markupFactor = 1 + (await getDefaultMarkupPercent()) / 100;
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("name")
    .eq("id", header.supplier_id)
    .maybeSingle();
  const supplierName = supplier?.name ?? "Furnizor";

  for (const it of lines) {
    const wantsCatalog = it.add_to_catalog ?? false;
    let productId = it.product_id;

    // unit_cost is NET; the cash out is GROSS = net × (1 + vat/100), in MDL.
    const vatRate = Number(it.vat_rate ?? 20);
    const costMdl = Number(
      (Number(it.unit_cost) * (1 + vatRate / 100) * toMdl).toFixed(2),
    );

    if (!productId) {
      const code = it.internal_code ?? `IB-${it.id.slice(0, 8).toUpperCase()}`;
      const esc = (s: string) => s.replace(/[\\%_]/g, "\\$&");
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .ilike("part_code", esc(code))
        .limit(1);
      let matchId = existing?.[0]?.id ?? null;
      if (!matchId && it.supplier_code) {
        const { data: bySupplier } = await supabase
          .from("products")
          .select("id")
          .ilike("supplier_code", esc(it.supplier_code))
          .limit(2);
        if (bySupplier && bySupplier.length === 1) matchId = bySupplier[0].id;
      }
      if (matchId) {
        productId = matchId;
      } else {
        const slug = `${code.toLowerCase()}-${it.id.slice(0, 6)}`;
        const base = {
          part_code: code,
          name_ro: it.description.slice(0, 200),
          slug,
          price: Number((costMdl * markupFactor).toFixed(2)),
          cost_price: costMdl,
          stock_quantity: 0,
          unit: (it.unit ?? "buc") || "buc",
          is_active: false,
          supplier_id: header.supplier_id,
          supplier_code: it.supplier_code ?? null,
        };
        let { data: newP, error: newErr } = await supabase
          .from("products")
          .insert({ ...base, internal_only: !wantsCatalog } as never)
          .select("id")
          .single();
        if (newErr && /internal_only/i.test(newErr.message)) {
          const retry = await supabase.from("products").insert(base as never).select("id").single();
          newP = retry.data;
          newErr = retry.error;
        }
        if (newErr || !newP) {
          return { ok: false, reason: `product_create_failed: ${newErr?.message ?? "?"}` };
        }
        productId = newP.id;
      }
      await supabase.from("purchase_items").update({ product_id: productId }).eq("id", it.id);
    }

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
    // Also sync the unit (a split turns 1 barrel → 200 litri) and refresh
    // cost. Cast through never: `unit` is a manually-migrated column the
    // generated types don't know about yet.
    await supabase
      .from("products")
      .update({
        stock_quantity: newStock,
        cost_price: costMdl,
        unit: (it.unit ?? "buc") || "buc",
        cross_references: refs as unknown as Json,
      } as never)
      .eq("id", productId);
  }
  return { ok: true };
}

/**
 * Reverse the stock a set of lines previously added (used when re-applying a
 * posted purchase on edit). For each line with a product_id, stock -= quantity
 * (floored at 0). cost_price is left as-is — it's re-set by applyPostedLines.
 */
async function reversePostedLines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lines: Array<{ product_id: string | null; quantity: number | string | null }>,
): Promise<void> {
  for (const it of lines) {
    if (!it.product_id) continue;
    const qty = Number(it.quantity ?? 0);
    if (qty <= 0) continue;
    const { data: p } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", it.product_id)
      .maybeSingle();
    if (!p) continue;
    await supabase
      .from("products")
      .update({ stock_quantity: Math.max(0, Number(p.stock_quantity ?? 0) - qty) })
      .eq("id", it.product_id);
  }
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
      file_url: v.file_url ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (hErr || !header) return { ok: false, reason: hErr?.message ?? "insert_failed" };

  // Guard against stale / mistyped product links (see knownProductIds).
  const known = await knownProductIds(supabase, v.items);
  const lines = v.items.map((i) => ({
    purchase_id: header.id,
    product_id: i.product_id && known.has(i.product_id) ? i.product_id : null,
    supplier_code: i.supplier_code ?? null,
    internal_code: i.internal_code ?? null,
    description: i.description,
    quantity: i.quantity,
    unit_cost: i.unit_cost,
    unit: i.unit ?? "buc",
    pack_note: i.pack_note ?? null,
    vat_rate: i.vat_rate ?? 20,
    // NET line, gross-anchored (= gross / (1+vat)), so line_total × (1+vat)
    // reproduces exactly the with-VAT total the operator saw (e.g. 4375 → 5250).
    line_total: purchaseLine(i.quantity, i.unit_cost, Number(i.vat_rate ?? 20)).net,
    add_to_catalog: !!i.add_to_catalog,
  }));
  // Insert; if the catalog / unit / pack_note columns haven't been migrated yet,
  // retry without them so existing schemas keep working.
  // Cast through never to satisfy stale generated types.
  let lErr = (
    await supabase.from("purchase_items").insert(lines as never)
  ).error;
  if (lErr && /(add_to_catalog|\bunit\b|pack_note)/i.test(lErr.message)) {
    const stripped = lines.map(
      ({ add_to_catalog: _a, unit: _u, pack_note: _p, ...rest }) => rest,
    );
    lErr = (
      await supabase.from("purchase_items").insert(stripped as never)
    ).error;
  }
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

  // Try with the opt-in catalog flag; fall back if the migration hasn't
  // been applied yet (every line is then treated as add_to_catalog=true,
  // matching the old auto-create behaviour).
  type ItemRow = {
    id: string;
    product_id: string | null;
    supplier_code: string | null;
    internal_code: string | null;
    description: string;
    quantity: number;
    unit_cost: number;
    vat_rate: number;
    unit?: string | null;
    add_to_catalog?: boolean;
  };
  let itemsRes = await supabase
    .from("purchase_items")
    .select(
      "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, unit, add_to_catalog" as
        "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate",
    )
    .eq("purchase_id", purchaseId);
  if (itemsRes.error && /(add_to_catalog|\bunit\b)/i.test(itemsRes.error.message)) {
    itemsRes = await supabase
      .from("purchase_items")
      .select(
        "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate",
      )
      .eq("purchase_id", purchaseId);
  }
  const items = (itemsRes.data ?? []) as unknown as ItemRow[];
  if (items.length === 0) return { ok: false, reason: "no_items" };

  // Fetch supplier name for cross_reference entries
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("name")
    .eq("id", header.supplier_id)
    .maybeSingle();
  const supplierName = supplier?.name ?? "Furnizor";

  for (const it of items) {
    // `add_to_catalog` gates the SITE listing only — never internal stock.
    // Every posted line gets a product row and moves stock, because the
    // warehouse holds the part whether or not we ever publish it. Unticked
    // simply means the product stays `is_active: false`: invisible on the
    // storefront, fully usable in the panel (sale, proforma, invoice).
    //
    // This is what closes the hole where a purchase entered without the tick
    // brought goods in that stock never knew about, so the invoice had
    // nothing to take back out.
    //
    // New products stay `is_active: false` regardless of the tick — the owner
    // reviews the auto-markup price before anything reaches the storefront.
    // Unticked lines additionally get `internal_only`, which keeps them out of
    // the admin product catalog while staying fully stock-tracked and sellable.
    const wantsCatalog =
      (it as { add_to_catalog?: boolean }).add_to_catalog ?? false;

    let productId = it.product_id;

    // CORE math fix (operator complaint: "piesa cu TVA ne-a costat 1200
    // nu 1000"). unit_cost on purchase_items is NET (before TVA). The
    // amount that actually came out of the bank account is GROSS:
    //   gross_per_unit = unit_cost × (1 + vat_rate / 100)
    // That's the cost margin calculations must work against — otherwise
    // a 20%-TVA part bought at 1000 net (1200 paid) gets sold at 1200
    // and the system reports a +20% margin when reality is 0.
    const vatRate = Number((it as { vat_rate?: number | string }).vat_rate ?? 20);
    const grossPerUnitMdl = Number(
      (Number(it.unit_cost) * (1 + vatRate / 100) * toMdl).toFixed(2),
    );
    const costMdl = grossPerUnitMdl;

    if (!productId) {
      const code = it.internal_code ?? `IB-${it.id.slice(0, 8).toUpperCase()}`;

      // Re-stocking an existing part is the common case once part_code is
      // unique — look the product up first and link instead of creating a
      // duplicate. Match is case-insensitive to mirror the unique index.
      //
      // Also match on supplier_code: now that EVERY line creates a product,
      // a part re-bought from the same supplier under the same supplier code
      // must land on the existing product instead of flooding the catalog
      // with a near-duplicate on each purchase.
      const esc = (s: string) => s.replace(/[\\%_]/g, "\\$&");
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .ilike("part_code", esc(code))
        .limit(1);
      let matchId = existing?.[0]?.id ?? null;
      if (!matchId && it.supplier_code) {
        const { data: bySupplier } = await supabase
          .from("products")
          .select("id")
          .ilike("supplier_code", esc(it.supplier_code))
          .limit(2);
        // Ambiguous supplier code → create a fresh product rather than
        // silently stocking the wrong one.
        if (bySupplier && bySupplier.length === 1) matchId = bySupplier[0].id;
      }
      if (matchId) {
        productId = matchId;
      } else {
        const slug = `${code.toLowerCase()}-${it.id.slice(0, 6)}`;
        const base = {
          part_code: code,
          name_ro: it.description.slice(0, 200),
          slug,
          price: Number((costMdl * markupFactor).toFixed(2)),
          cost_price: costMdl,
          stock_quantity: 0,
          // Carry the purchase line's unit onto the new product so the same
          // unit shows in the admin catalog and on the public storefront.
          unit: (it.unit ?? "buc") || "buc",
          is_active: false, // owner reviews before publishing
          supplier_id: header.supplier_id,
          supplier_code: it.supplier_code ?? null,
        };
        // Cast through never: generated types are stale for `unit` /
        // `internal_only` (added by migrations) until regenerated.
        let { data: newP, error: newErr } = await supabase
          .from("products")
          .insert({ ...base, internal_only: !wantsCatalog } as never)
          .select("id")
          .single();
        // sql/products-internal-only.sql not applied yet — keep posting rather
        // than blocking the warehouse on a migration.
        if (newErr && /internal_only/i.test(newErr.message)) {
          const retry = await supabase.from("products").insert(base as never).select("id").single();
          newP = retry.data;
          newErr = retry.error;
        }
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

  // Read the current state — if the purchase was already POSTED, its
  // items have been added to stock. Cancelling must roll that back or
  // the catalog stays permanently inflated by the cancelled receipt.
  const { data: cur } = await supabase
    .from("purchases")
    .select("status")
    .eq("id", purchaseId)
    .maybeSingle();
  const wasPosted = cur?.status === "posted";

  if (wasPosted) {
    // Pull every line that pushed stock and reverse it. Mirrors the
    // increment loop in postPurchase. Idempotency safe: status flips
    // to "cancelled" below and a re-call short-circuits because we
    // only restore when wasPosted=true on the FIRST cancel.
    const { data: items } = await supabase
      .from("purchase_items")
      .select("product_id, quantity")
      .eq("purchase_id", purchaseId);
    for (const it of (items ?? []) as Array<{
      product_id: string | null;
      quantity: number | string | null;
    }>) {
      if (!it.product_id) continue;
      const qty = Number(it.quantity ?? 0);
      if (qty <= 0) continue;
      const { data: prod } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", it.product_id)
        .maybeSingle();
      if (!prod) continue;
      const next = Math.max(0, Number(prod.stock_quantity ?? 0) - qty);
      await supabase
        .from("products")
        .update({ stock_quantity: next })
        .eq("id", it.product_id);
    }
  }

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
 * Forward an entire purchase document (header + every line) to the
 * bookkeeper. Triggered from the "Contabilului" button on each row of
 * /panel/achizitii. Conta1 only — same reasoning as the monthly export.
 */
export async function sendPurchaseToAccountant(
  purchaseId: string,
  pin: string,
): Promise<
  | { ok: true; sentAt: string }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };

  const supabase = await createClient();
  const purSelect = (withUnit: boolean) =>
    `id, account_scope, document_number, document_date, status, currency, subtotal, vat_amount, total, file_url, suppliers(name, idno, vat_code, contact_email, contact_phone, address), purchase_items(id, supplier_code, internal_code, description, quantity, unit_cost, ${withUnit ? "unit, pack_note, " : ""}vat_rate, line_total)`;
  let hr = await supabase
    .from("purchases")
    .select(purSelect(true))
    .eq("id", purchaseId)
    .maybeSingle();
  // Retry without `unit` if the column isn't migrated yet.
  if (hr.error && /\bunit\b/i.test(hr.error.message)) {
    hr = await supabase
      .from("purchases")
      .select(purSelect(false))
      .eq("id", purchaseId)
      .maybeSingle();
  }
  const header = hr.data;
  if (!header) return { ok: false, reason: "purchase_not_found" };
  if ((header as unknown as { account_scope: string }).account_scope !== "conta1") {
    return { ok: false, reason: "conta1_only" };
  }
  const h = header as unknown as {
    id: string;
    document_number: string | null;
    document_date: string;
    status: string;
    currency: string | null;
    subtotal: number | string | null;
    vat_amount: number | string | null;
    total: number | string | null;
    file_url: string | null;
    suppliers: {
      name: string;
      idno: string | null;
      vat_code: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      address: string | null;
    } | null;
    purchase_items: Array<{
      id: string;
      supplier_code: string | null;
      internal_code: string | null;
      description: string;
      quantity: number | string;
      unit_cost: number | string;
      unit?: string | null;
      pack_note?: string | null;
      vat_rate: number | string;
      line_total: number | string;
    }> | null;
  };
  // Supplier-return annexes for this purchase, so the accountant gets the
  // purchase + return net together.
  const { getReturnsFor } = await import("@/lib/panel/returns/actions");
  const purchaseReturns = await getReturnsFor("purchase", purchaseId);

  const currency = (h.currency ?? "MDL").toUpperCase();
  const purchase = {
    id: h.id,
    document_number: h.document_number,
    document_date: h.document_date,
    supplier_name: h.suppliers?.name ?? "—",
    supplier_idno: h.suppliers?.idno ?? null,
    supplier_vat_code: h.suppliers?.vat_code ?? null,
    supplier_email: h.suppliers?.contact_email ?? null,
    supplier_phone: h.suppliers?.contact_phone ?? null,
    supplier_address: h.suppliers?.address ?? null,
    status: h.status,
    currency,
    subtotal: Number(h.subtotal ?? 0),
    vat_amount: Number(h.vat_amount ?? 0),
    total: Number(h.total ?? 0),
    items: (h.purchase_items ?? []).map((it) => ({
      supplier_code: it.supplier_code,
      internal_code: it.internal_code,
      description: it.description,
      quantity: Number(it.quantity ?? 0),
      unit_cost: Number(it.unit_cost ?? 0),
      unit: (it.unit ?? "buc") || "buc",
      pack_note: it.pack_note ?? null,
      vat_rate: Number(it.vat_rate ?? 0),
      line_total: Number(it.line_total ?? 0),
    })),
    returns: purchaseReturns,
  };
  const { subject, html, text } = accountantMonthlyPurchasesEmail(
    {
      from: purchase.document_date,
      to: purchase.document_date,
      count: 1,
      totalsByCurrency: [
        {
          currency,
          total: purchase.total,
          vat_amount: purchase.vat_amount,
        },
      ],
      purchases: [purchase],
    },
    {
      mode: "single",
      markEnteredUrl: accountantMarkEnteredUrl("purchase", purchaseId),
    },
  );

  // If the operator attached the supplier's original document on the
  // purchase form, pull it out of the `purchase-docs` bucket via the
  // service-role client (the bucket is private — admin only) and
  // base64-encode it for Resend. Failure to fetch is logged but
  // doesn't block the email — the recap is still useful on its own.
  const attachments = await loadPurchaseAttachment(h.file_url);

  const result = await sendResendEmail({
    to: ACCOUNTANT_EMAIL,
    subject,
    html,
    text,
    replyTo: user.email ? { email: user.email } : undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
  if (!result.ok) return { ok: false, reason: result.reason };

  // Stamp the send time so the UI can flip the button from green
  // ("Contabilului") to yellow ("Trimis · re-trimite"). Defensive: if the
  // accountant_sent_at migration isn't applied yet, the email already
  // went out — just log + skip the persist so the action still succeeds.
  const sentAt = new Date().toISOString();
  const { error: stampErr } = await supabase
    .from("purchases")
    .update({ accountant_sent_at: sentAt } as never)
    .eq("id", purchaseId);
  if (stampErr && /accountant_sent_at/i.test(stampErr.message)) {
    console.warn(
      "[panel.purchases] accountant_sent_at column missing — apply sql/purchases-accountant-sent.sql",
    );
  }

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  return { ok: true, sentAt };
}

/**
 * Update an existing purchase — header fields + replace all line items with the
 * new set. For POSTED purchases the stock is re-adjusted automatically: every
 * old line's stock is reversed and every new line re-applied (create/link
 * product, stock += qty, refresh cost_price), so the net change per product is
 * exactly the edit. Draft purchases haven't touched stock, so nothing moves.
 */
export async function updatePurchase(
  id: string,
  raw: unknown,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = purchaseSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid" };
  const v = parsed.data;
  const { subtotal, vat_amount, total } = computeTotals(v.items);

  const supabase = await createClient();

  // --- Items first, header last, and DELETE only AFTER a successful insert ---
  // The data-loss incident came from the old order: delete every line, THEN try
  // to insert the new set — a rejected insert (e.g. a stale product_id) left the
  // document permanently empty. New order, safe even without a DB transaction:
  //   1. archive the current lines (reversible + audit trail),
  //   2. insert the NEW lines while the old ones are still present,
  //   3. only once that succeeds, delete the OLD lines by id,
  //   4. update the header.
  // A failure at step 2 returns early with the old lines untouched — nothing is
  // ever lost.
  const { data: oldRows } = await supabase
    .from("purchase_items")
    .select("id, product_id, quantity")
    .eq("purchase_id", id);
  const oldIds = (oldRows ?? []).map((r) => r.id as string);
  // Captured for the stock re-apply below (posted purchases only).
  const oldLines = (oldRows ?? []).map((r) => ({
    product_id: (r as { product_id: string | null }).product_id ?? null,
    quantity: (r as { quantity: number | string | null }).quantity ?? 0,
  }));

  // Is this a POSTED purchase? If so, editing must roll the old stock back and
  // re-apply the new lines so stock + cost stay correct (operator complaint:
  // "editez achiziția, editează-mi și stocul"). Draft purchases haven't touched
  // stock, so they need no adjustment.
  const { data: hdrStatus } = await supabase
    .from("purchases")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  const wasPosted = hdrStatus?.status === "posted";

  await archivePurchaseItems(supabase, id, "update_replace", user.id);

  // Guard against stale / mistyped product links (see knownProductIds).
  const known = await knownProductIds(supabase, v.items);
  const lines = v.items.map((i) => ({
    purchase_id: id,
    product_id: i.product_id && known.has(i.product_id) ? i.product_id : null,
    supplier_code: i.supplier_code ?? null,
    internal_code: i.internal_code ?? null,
    description: i.description,
    quantity: i.quantity,
    unit_cost: i.unit_cost,
    unit: i.unit ?? "buc",
    pack_note: i.pack_note ?? null,
    vat_rate: i.vat_rate ?? 20,
    // NET line, gross-anchored (= gross / (1+vat)), so line_total × (1+vat)
    // reproduces exactly the with-VAT total the operator saw (e.g. 4375 → 5250).
    line_total: purchaseLine(i.quantity, i.unit_cost, Number(i.vat_rate ?? 20)).net,
    add_to_catalog: !!i.add_to_catalog,
  }));
  let lErr = (
    await supabase.from("purchase_items").insert(lines as never)
  ).error;
  if (lErr && /(add_to_catalog|\bunit\b|pack_note)/i.test(lErr.message)) {
    const stripped = lines.map(
      ({ add_to_catalog: _a, unit: _u, pack_note: _p, ...rest }) => rest,
    );
    lErr = (
      await supabase.from("purchase_items").insert(stripped as never)
    ).error;
  }
  // Old lines are still intact here — the edit simply doesn't apply, no loss.
  if (lErr) return { ok: false, reason: `items: ${lErr.message}` };

  // New lines are in — now remove ONLY the previously-existing ones by id.
  if (oldIds.length > 0) {
    await supabase.from("purchase_items").delete().in("id", oldIds);
  }

  // Posted purchase: re-adjust stock. Reverse every OLD line's contribution,
  // then apply every NEW line — the net effect per product is exactly the edit
  // delta (works for changed qty, split lines, added and removed lines).
  if (wasPosted) {
    await reversePostedLines(supabase, oldLines);
    let newRes = await supabase
      .from("purchase_items")
      .select(
        "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, unit, add_to_catalog" as
          "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate",
      )
      .eq("purchase_id", id);
    if (newRes.error && /(add_to_catalog|\bunit\b)/i.test(newRes.error.message)) {
      newRes = await supabase
        .from("purchase_items")
        .select(
          "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate",
        )
        .eq("purchase_id", id);
    }
    const newLines = (newRes.data ?? []) as unknown as PostedLine[];
    // Best-effort: the edit is already saved; a stock-apply hiccup is logged,
    // not fatal, so the operator never loses the document.
    const applied = await applyPostedLines(
      supabase,
      { supplier_id: v.supplier_id, currency: v.currency, fx_rate: v.fx_rate ?? null },
      newLines,
    );
    if (!applied.ok) {
      console.warn("[panel.purchases] stock re-apply on edit:", applied.reason);
    }
  }

  // Header last. `updated_by` records who edited; it degrades gracefully if the
  // column isn't migrated yet (sql/purchase-items-safety.sql).
  const headerPatch = {
    supplier_id: v.supplier_id,
    account_scope: v.account_scope,
    document_number: v.document_number ?? null,
    document_date: v.document_date,
    currency: v.currency,
    fx_rate: v.fx_rate ?? null,
    subtotal,
    vat_amount,
    total,
    notes: v.notes ?? null,
    file_url: v.file_url ?? null,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };
  let hErr = (
    await supabase.from("purchases").update(headerPatch as never).eq("id", id)
  ).error;
  if (hErr && /updated_by/i.test(hErr.message)) {
    const { updated_by: _omitUpdatedBy, ...withoutUpdatedBy } = headerPatch;
    hErr = (
      await supabase.from("purchases").update(withoutUpdatedBy).eq("id", id)
    ).error;
  }
  if (hErr) return { ok: false, reason: hErr.message };

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${id}`, "page");
  return { ok: true };
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
  // Snapshot the lines before they're gone so a delete stays recoverable and
  // leaves an audit trail of who removed the document.
  await archivePurchaseItems(supabase, purchaseId, "purchase_delete", user.id);
  // purchase_items cascade via FK normally; do it explicitly in case the
  // constraint isn't set to ON DELETE CASCADE in the deployed schema.
  await supabase.from("purchase_items").delete().eq("purchase_id", purchaseId);
  const { error } = await supabase.from("purchases").delete().eq("id", purchaseId);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/achizitii", "page");
  return { ok: true };
}

/**
 * Undo a wipe: restore a purchase's most-recent archived line snapshot back
 * into `purchase_items`. Refuses when the purchase still has live lines, so a
 * restore can only rescue an emptied document and can never duplicate a good
 * one. PIN-gated, same as delete. Product links are re-sanitised on the way in.
 */
export async function restorePurchaseItemsFromArchive(
  purchaseId: string,
  pin: string,
): Promise<{ ok: true; restored: number } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  const supabase = await createClient();

  // Never clobber a document that already has lines.
  const { data: live } = await supabase
    .from("purchase_items")
    .select("id")
    .eq("purchase_id", purchaseId)
    .limit(1);
  if (live && live.length > 0) return { ok: false, reason: "has_items" };

  // Read the archive with the service-role client (server-only audit store).
  const admin = getSupabaseAdmin();
  const { data: arch, error: archErr } = await admin
    .from("purchase_items_archive")
    .select(
      "product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, line_total, add_to_catalog, archived_at",
    )
    .eq("purchase_id", purchaseId)
    .order("archived_at", { ascending: false });
  if (archErr) {
    return {
      ok: false,
      reason: `archive_unavailable: ${archErr.message}`,
    };
  }
  const batch = (arch ?? []) as Array<Record<string, unknown>>;
  if (batch.length === 0) return { ok: false, reason: "no_archive" };
  // Restore only the latest batch (one edit/delete event).
  const latest = batch[0].archived_at;
  const toRestore = batch.filter((a) => a.archived_at === latest);

  const known = await knownProductIds(
    supabase,
    toRestore.map((a) => ({ product_id: (a.product_id as string | null) ?? null })),
  );
  const lines = toRestore.map((a) => {
    const pid = (a.product_id as string | null) ?? null;
    return {
      purchase_id: purchaseId,
      product_id: pid && known.has(pid) ? pid : null,
      supplier_code: (a.supplier_code as string | null) ?? null,
      internal_code: (a.internal_code as string | null) ?? null,
      description: (a.description as string | null) ?? "—",
      quantity: Number(a.quantity ?? 0),
      unit_cost: Number(a.unit_cost ?? 0),
      vat_rate: Number(a.vat_rate ?? 20),
      line_total: Number(a.line_total ?? 0),
      add_to_catalog: Boolean(a.add_to_catalog ?? false),
    };
  });
  let lErr = (
    await supabase.from("purchase_items").insert(lines as never)
  ).error;
  if (lErr && /add_to_catalog/i.test(lErr.message)) {
    const stripped = lines.map(({ add_to_catalog: _ignore, ...rest }) => rest);
    lErr = (
      await supabase.from("purchase_items").insert(stripped as never)
    ).error;
  }
  if (lErr) return { ok: false, reason: lErr.message };

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  return { ok: true, restored: lines.length };
}
