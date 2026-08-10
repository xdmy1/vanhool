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
import { normalizeCode } from "@/lib/utils/normalize-code";
import { roundStock } from "@/lib/stock";
import {
  applyStockMovement,
  getOrderMovements,
  getPurchaseMovements,
  ledgerReady,
  reversePurchaseLines,
  settlePurchaseCancelNet,
  type StockDb,
} from "@/lib/stock-ledger";

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
  // add_to_catalog / unit / pack_note may be absent on very old schemas —
  // mirror postPurchase's fallback so a missing column never aborts the
  // snapshot.
  let sel = await supabase
    .from("purchase_items")
    .select(`${cols}, add_to_catalog, unit, pack_note` as typeof cols)
    .eq("purchase_id", purchaseId);
  if (sel.error && /(add_to_catalog|\bunit\b|pack_note)/i.test(sel.error.message)) {
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
    unit: (r as { unit?: string | null }).unit ?? null,
    pack_note: (r as { pack_note?: string | null }).pack_note ?? null,
    item_created_at: r.created_at ?? null,
    archived_by: userId,
    archive_reason: reason,
  }));

  let { error } = await getSupabaseAdmin()
    .from("purchase_items_archive")
    .insert(snapshot as never);
  // Archive table pre-dates the unit/pack_note columns (sql/stock-accuracy.sql)
  // — strip them rather than losing the whole snapshot.
  if (error && /(\bunit\b|pack_note)/i.test(error.message)) {
    const stripped = snapshot.map(({ unit: _u, pack_note: _p, ...rest }) => rest);
    error = (
      await getSupabaseAdmin()
        .from("purchase_items_archive")
        .insert(stripped as never)
    ).error;
  }
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
 * Resolve a purchase line to an EXISTING product by NORMALISED code, so codes
 * that differ only by spaces / dashes / case ("C 4312/1" vs "C4312/1") collapse
 * to the same catalog product instead of spawning a duplicate (which is how the
 * stock silently landed on a phantom product). Mirrors the invoice resolver:
 * tier 1 exact part_code, tier 2 exact supplier_code, tier 3 normalised
 * search_codes. Ties prefer a REAL catalog product (active, not internal-only),
 * then the most recent. Returns null when nothing matches → caller creates one.
 */
async function resolvePurchaseProductId(
  client: Awaited<ReturnType<typeof createClient>>,
  line: { internal_code?: string | null; supplier_code?: string | null },
): Promise<string | null> {
  const codes = Array.from(
    new Set(
      [line.internal_code, line.supplier_code]
        .map((c) => (c ?? "").toString().trim())
        .filter((c) => c.length > 0),
    ),
  );
  if (codes.length === 0) return null;

  type Cand = { tier: number; real: boolean; created: string };
  const best = new Map<string, Cand>();
  const consider = (
    rows: Array<{ id: string; created_at?: string | null; is_active?: boolean | null; internal_only?: boolean | null }> | null,
    tier: number,
  ) => {
    for (const r of rows ?? []) {
      const real = !!r.is_active && !r.internal_only;
      const prev = best.get(r.id);
      if (!prev || tier < prev.tier) {
        best.set(r.id, { tier, real, created: r.created_at ?? "" });
      }
    }
  };

  const cols = "id, created_at, is_active, internal_only";
  for (const code of codes) {
    const escaped = code.replace(/[\\%_]/g, "\\$&");
    const norm = normalizeCode(code);
    const [byPart, bySupplier, byCodes] = await Promise.all([
      client.from("products").select(cols).ilike("part_code", escaped).limit(5),
      client.from("products").select(cols).ilike("supplier_code", escaped).limit(5),
      norm.length > 0
        ? client.from("products").select(cols).contains("search_codes", [norm]).limit(5)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    ]);
    consider(byPart.data as never, 1);
    consider(bySupplier.data as never, 2);
    consider(byCodes.data as never, 3);
  }
  if (best.size === 0) return null;
  const ranked = Array.from(best.entries()).sort((a, b) => {
    if (a[1].tier !== b[1].tier) return a[1].tier - b[1].tier;
    if (a[1].real !== b[1].real) return a[1].real ? -1 : 1; // real catalog product wins
    return b[1].created.localeCompare(a[1].created); // else most recent
  });
  return ranked[0][0];
}

/**
 * Apply a set of purchase lines to stock: for each line resolve (or create) the
 * catalog product, move stock through the LEDGER (ref `purchase_post:<line_id>`
 * — idempotent, so a retried or double-clicked post is a no-op), refresh
 * cost_price (GROSS MDL = net × (1+vat) × fx) and add the supplier
 * cross-reference. Links `product_id` back onto the line. This is the single
 * source of truth shared by postPurchase (first post) and updatePurchase
 * (re-apply on edit of a posted document). cost_price is GROSS per project
 * convention — see the CORE math fix.
 */
async function applyPostedLines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  purchaseId: string,
  header: {
    supplier_id: string;
    currency: string | null;
    fx_rate: number | string | null;
  },
  lines: PostedLine[],
  userId: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = supabase as unknown as StockDb;
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
  // Collected per line for the draft-sale settlement pass below.
  const resolvedLines: Array<{ productId: string; codes: string[] }> = [];

  for (const it of lines) {
    const wantsCatalog = it.add_to_catalog ?? false;
    let productId = it.product_id;

    // unit_cost is NET; the cash out is GROSS = net × (1 + vat/100), in MDL.
    const vatRate = Number(it.vat_rate ?? 20);
    const costMdl = Number(
      (Number(it.unit_cost) * (1 + vatRate / 100) * toMdl).toFixed(2),
    );

    if (!productId) {
      // Normalised match first — "C 4312/1" and "C4312/1" resolve to the SAME
      // existing product instead of creating a duplicate that silently steals
      // the stock. Only mint a new product when nothing matches.
      const matchId = await resolvePurchaseProductId(supabase, it);
      const code = it.internal_code ?? `IB-${it.id.slice(0, 8).toUpperCase()}`;
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

    // Stock through the ledger — one movement per purchase line, keyed by the
    // line's id. A re-run (healing retry, edit re-apply of an unchanged line
    // id) is a no-op; a genuinely new line id applies exactly once.
    const applied = await applyStockMovement(db, {
      productId,
      delta: Number(it.quantity),
      reason: "purchase_post",
      ref: `purchase_post:${it.id}`,
      purchaseId,
      createdBy: userId,
    });
    if (!applied.ok) return { ok: false, reason: applied.reason };

    const { data: cur } = await supabase
      .from("products")
      .select("cross_references")
      .eq("id", productId)
      .maybeSingle();
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
    // cost. A zero-cost restock line must NOT wipe cost_price to 0 — that
    // would disarm the below-cost guard for the product. Cast through never:
    // `unit` is a manually-migrated column the generated types don't know yet.
    await supabase
      .from("products")
      .update({
        ...(costMdl > 0 ? { cost_price: costMdl } : {}),
        unit: (it.unit ?? "buc") || "buc",
        cross_references: refs as unknown as Json,
      } as never)
      .eq("id", productId);

    resolvedLines.push({
      productId,
      codes: [it.internal_code, it.supplier_code].filter(
        (c): c is string => !!c && c.trim().length > 0,
      ),
    });
  }

  // Goods sold from this purchase while it was still a DRAFT never moved stock
  // (no catalog product existed). Now that the products exist and the full
  // purchased quantity is in, take those already-sold units back out and link
  // the order lines — otherwise stock overstates by everything sold pre-post.
  await settleDraftPurchaseSales(supabase, purchaseId, resolvedLines, userId);

  return { ok: true };
}

/**
 * Find panel sales whose lines were sold "from draft purchase" (no catalog
 * product at sale time) matching the freshly-posted products by NORMALIZED
 * code, decrement their sold quantity through the ledger (once — ref
 * `draft_settle:<order_id>:<product_id>`), and link the order lines to the
 * product so future reversals see them like any other catalog line.
 */
async function settleDraftPurchaseSales(
  supabase: Awaited<ReturnType<typeof createClient>>,
  purchaseId: string,
  targets: Array<{ productId: string; codes: string[] }>,
  userId: string | null,
): Promise<void> {
  const db = supabase as unknown as StockDb;
  const codeMap = new Map<string, string>();
  for (const t of targets) {
    for (const c of t.codes) {
      const n = normalizeCode(c);
      if (n) codeMap.set(n, t.productId);
    }
  }
  if (codeMap.size === 0) return;

  // Draft-line sales only exist in the panel flow, and are recent by nature
  // (the part was quoted, sold, then the purchase got posted).
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, items")
    .eq("source", "panel")
    .neq("status", "cancelled")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  for (const ord of orders ?? []) {
    const items = Array.isArray(ord.items)
      ? [...(ord.items as Array<Record<string, unknown>>)]
      : [];
    const matches: Array<{ idx: number; productId: string; qty: number }> = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!(it as { from_draft_purchase?: boolean }).from_draft_purchase) continue;
      if ((it as { productId?: string | null }).productId) continue;
      const code = normalizeCode(
        String((it as { partCode?: string | null }).partCode ?? ""),
      );
      const productId = code ? codeMap.get(code) : undefined;
      if (!productId) continue;
      const qty = Number((it as { quantity?: number }).quantity ?? 0);
      if (qty <= 0) continue;
      matches.push({ idx: i, productId, qty });
    }
    if (matches.length === 0) continue;

    const takeByProduct = new Map<string, number>();
    for (const m of matches) {
      takeByProduct.set(
        m.productId,
        roundStock((takeByProduct.get(m.productId) ?? 0) + m.qty),
      );
    }

    // Movements FIRST, marking second — and marking only for products whose
    // movement actually landed. A failed RPC leaves the line unmarked, so the
    // next post/edit retries it instead of stranding the sold quantity.
    // seq-suffixed refs allow a legitimate SECOND settle of the same
    // order+product (two purchases cataloguing different codes of one part).
    const ordMvRes = await getOrderMovements(db, ord.id as string);
    if (!ordMvRes.ok) continue; // can't read → don't move, don't mark
    const settled = new Set<string>();
    const appliedMoves: Array<{ productId: string; qty: number; ref: string }> = [];
    for (const [productId, qty] of takeByProduct) {
      const seq = ordMvRes.rows.filter((r) =>
        r.ref.startsWith(`draft_settle:${ord.id}:${productId}:`),
      ).length;
      const ref = `draft_settle:${ord.id}:${productId}:${seq}`;
      const moved = await applyStockMovement(db, {
        productId,
        delta: -qty,
        reason: "sale",
        ref,
        orderId: ord.id as string,
        purchaseId,
        note: "vânzare din achiziție-draft, decontată la postare",
        createdBy: userId,
      });
      if (moved.ok) {
        settled.add(productId);
        if (moved.applied) appliedMoves.push({ productId, qty, ref });
      } else {
        console.error("[panel.purchases] draft settle failed:", moved.reason);
      }
    }
    if (settled.size === 0) continue;
    for (const m of matches) {
      if (!settled.has(m.productId)) continue;
      items[m.idx] = {
        ...items[m.idx],
        productId: m.productId,
        from_draft_purchase: false,
      };
    }
    const { error: markErr } = await supabase
      .from("orders")
      .update({ items: items as unknown as Json })
      .eq("id", ord.id as string);
    if (markErr) {
      // The seq-suffixed refs allow a future re-settle, so an unmarked line
      // with a landed movement WOULD double-decrement on the next post/edit.
      // Take our movements back — the next run redoes both halves together.
      for (const a of appliedMoves) {
        await applyStockMovement(db, {
          productId: a.productId,
          delta: a.qty,
          reason: "sale",
          ref: `reverse:${a.ref}`,
          orderId: ord.id as string,
          purchaseId,
          note: "settle anulat: marcarea liniilor a eșuat",
          createdBy: userId,
        });
      }
      console.error("[panel.purchases] draft settle mark failed:", markErr.message);
    }
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
  if (header.status === "cancelled") return { ok: false, reason: "purchase_cancelled" };

  // The ledger is mandatory on this path — posting without it would flip the
  // document to `posted` while moving no stock.
  if (!(await ledgerReady(supabase as unknown as StockDb))) {
    return { ok: false, reason: "stock_ledger_missing — rulează sql/stock-accuracy.sql" };
  }

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

  // Atomic claim AFTER validation: only one caller flips the row to `posted`
  // — a double-click / second tab loses the conditional update and takes the
  // heal branch instead. Stock is applied after the claim through idempotent
  // ledger refs (`purchase_post:<line_id>`), so posting can never double-add
  // and a mid-apply failure heals via the idempotent re-apply (also run by
  // Editare → Salvează on a posted document).
  const { data: claimed } = await supabase
    .from("purchases")
    .update({
      status: "posted",
      received_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchaseId)
    .neq("status", "posted")
    .neq("status", "cancelled")
    .select("id");
  if (!claimed || claimed.length === 0) {
    const { data: cur } = await supabase
      .from("purchases")
      .select("status")
      .eq("id", purchaseId)
      .maybeSingle();
    if (cur?.status !== "posted") {
      return { ok: false, reason: "purchase_cancelled" };
    }
    // Already posted → fall through and re-run the idempotent apply (heal).
  }

  // One shared implementation with the edit-repost path: normalized product
  // resolution (never raw ilike — "C 4312/1" and "C4312/1" are the same
  // part), product creation, ledger stock, GROSS-MDL cost, cross-references,
  // draft-sale settlement.
  const applied = await applyPostedLines(
    supabase,
    purchaseId,
    {
      supplier_id: header.supplier_id,
      currency: header.currency,
      fx_rate: header.fx_rate,
    },
    items as unknown as PostedLine[],
    user.id,
  );
  if (!applied.ok) {
    // Status is already `posted` (claimed above) but some lines may not have
    // applied. The ledger makes the retry safe AND reachable: opening the
    // document and saving it (Editare → Salvează) re-runs the idempotent
    // apply, so only the missing lines move stock.
    return {
      ok: false,
      reason: `${applied.reason} — deschide achiziția și apasă Salvează pentru a relua postarea`,
    };
  }

  // A cancel can land between our claim and the line application (it reverses
  // only the movements that existed at that moment). If it did, reverse what
  // we just applied so cancel + post never leave residue.
  const { data: after } = await supabase
    .from("purchases")
    .select("status")
    .eq("id", purchaseId)
    .maybeSingle();
  if (after?.status === "cancelled") {
    await reversePurchaseLines(
      supabase as unknown as StockDb,
      purchaseId,
      items.map((it) => ({
        id: it.id,
        product_id: it.product_id,
        quantity: it.quantity,
      })),
      user.id,
    );
    // Net out anything the racing cancel couldn't see (its line reversal ran
    // against a partial ledger) — idempotent, converges the race to zero.
    await settlePurchaseCancelNet(
      supabase as unknown as StockDb,
      purchaseId,
      user.id,
    );
    return { ok: false, reason: "purchase_cancelled" };
  }

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
  if (cur?.status === "cancelled") return { ok: true };
  const wasPosted = cur?.status === "posted";

  if (wasPosted) {
    // Reverse through the ledger: each line's actual `purchase_post`
    // movement is negated under a unique `reverse:` ref, so a double-click,
    // a concurrent cancel or a later delete can never reverse twice. Then
    // net out what line reversal can't see (supplier returns).
    const { data: items } = await supabase
      .from("purchase_items")
      .select("id, product_id, quantity")
      .eq("purchase_id", purchaseId);
    const reversed = await reversePurchaseLines(
      supabase as unknown as StockDb,
      purchaseId,
      (items ?? []) as Array<{
        id: string;
        product_id: string | null;
        quantity: number | string | null;
      }>,
      user.id,
    );
    if (!reversed.ok) return reversed;
    const netted = await settlePurchaseCancelNet(
      supabase as unknown as StockDb,
      purchaseId,
      user.id,
    );
    if (!netted.ok) return netted;
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
  // Captured for the stock re-apply below (posted purchases only). Line ids
  // included — the ledger reverses each line's recorded movement by ref.
  const oldLines = (oldRows ?? []).map((r) => ({
    id: r.id as string,
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
  // A stock hiccup here never loses the document (it's already saved), but it
  // MUST surface to the operator — re-saving the edit re-runs the idempotent
  // apply and heals.
  let stockIssue: string | null = null;
  if (wasPosted) {
    const reversed = await reversePurchaseLines(
      supabase as unknown as StockDb,
      id,
      oldLines,
      user.id,
    );
    if (!reversed.ok) stockIssue = reversed.reason;
    let newRes = !reversed.ok
      ? { data: [] as never[], error: null }
      : await supabase
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
    const applied = await applyPostedLines(
      supabase,
      id,
      { supplier_id: v.supplier_id, currency: v.currency, fx_rate: v.fx_rate ?? null },
      newLines,
      user.id,
    );
    if (!applied.ok) stockIssue = stockIssue ?? applied.reason;
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

  // Document saved either way; a stock hiccup surfaces as an error the
  // operator can act on (re-save = idempotent heal), never a silent warn.
  if (stockIssue) {
    return {
      ok: false,
      reason: `${stockIssue} — documentul e salvat; apasă din nou Salvează pentru a corecta stocul`,
    };
  }
  return { ok: true };
}

/**
 * Hard-delete a purchase + its line items. PIN-gated. A POSTED purchase gets
 * its stock reversed through the ledger FIRST (same refs as cancelPurchase,
 * so cancel-then-delete can never reverse twice) — deleting the document that
 * brought goods in must also take those goods back out.
 */
export async function deletePurchaseWithPin(
  purchaseId: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  const supabase = await createClient();

  const { data: hdr } = await supabase
    .from("purchases")
    .select("status")
    .eq("id", purchaseId)
    .maybeSingle();
  if (hdr?.status === "posted") {
    const { data: items } = await supabase
      .from("purchase_items")
      .select("id, product_id, quantity")
      .eq("purchase_id", purchaseId);
    const reversed = await reversePurchaseLines(
      supabase as unknown as StockDb,
      purchaseId,
      (items ?? []) as Array<{
        id: string;
        product_id: string | null;
        quantity: number | string | null;
      }>,
      user.id,
    );
    // A delete that cannot reverse its stock must NOT proceed — the document
    // would vanish while the phantom quantity stays forever.
    if (!reversed.ok) return reversed;
    const netted = await settlePurchaseCancelNet(
      supabase as unknown as StockDb,
      purchaseId,
      user.id,
    );
    if (!netted.ok) return netted;
  }

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
  const archCols =
    "product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, line_total, add_to_catalog, archived_at";
  let archRes = await admin
    .from("purchase_items_archive")
    .select(`${archCols}, unit, pack_note` as typeof archCols)
    .eq("purchase_id", purchaseId)
    .order("archived_at", { ascending: false });
  if (archRes.error && /(\bunit\b|pack_note)/i.test(archRes.error.message)) {
    archRes = await admin
      .from("purchase_items_archive")
      .select(archCols)
      .eq("purchase_id", purchaseId)
      .order("archived_at", { ascending: false });
  }
  const { data: arch, error: archErr } = archRes;
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
      // Restored split lines keep their unit + trace ("1 buc → 200 litri")
      // instead of silently reverting to "buc".
      unit: ((a as { unit?: string | null }).unit ?? "buc") || "buc",
      pack_note: (a as { pack_note?: string | null }).pack_note ?? null,
    };
  });
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
  if (lErr) return { ok: false, reason: lErr.message };

  // If the purchase is POSTED and the ledger shows its stock effect was fully
  // reversed (e.g. deleted-then-recovered, or an edit whose reverse ran but
  // whose re-apply died), re-apply the restored lines so document and stock
  // agree again. When the ledger shows stock still in — or the purchase
  // predates the ledger and we can't know — leave stock alone and say so.
  const { data: hdr } = await supabase
    .from("purchases")
    .select("status, supplier_id, currency, fx_rate")
    .eq("id", purchaseId)
    .maybeSingle();
  if (hdr?.status === "posted") {
    const movementsRes = await getPurchaseMovements(
      supabase as unknown as StockDb,
      purchaseId,
    );
    // Only the post/reverse pair decides whether the purchase's own stock is
    // currently OUT — draft-settles and supplier returns share the purchase_id
    // but belong to other documents' stories and must not poison this check.
    const movements = movementsRes.ok
      ? movementsRes.rows.filter(
          (m) => m.reason === "purchase_post" || m.reason === "purchase_reverse",
        )
      : [];
    const net = movements.reduce((s, m) => roundStock(s + Number(m.delta)), 0);
    if (movementsRes.ok && movements.length > 0 && net === 0) {
      const { data: restored } = await supabase
        .from("purchase_items")
        .select(
          "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, unit, add_to_catalog" as
            "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate",
        )
        .eq("purchase_id", purchaseId);
      const applied = await applyPostedLines(
        supabase,
        purchaseId,
        {
          supplier_id: hdr.supplier_id,
          currency: hdr.currency,
          fx_rate: hdr.fx_rate,
        },
        (restored ?? []) as unknown as PostedLine[],
        user.id,
      );
      if (!applied.ok) {
        // Lines are restored (that part succeeded) but stock didn't follow —
        // surface it; Editare → Salvează re-runs the idempotent apply.
        return {
          ok: false,
          reason: `linii restaurate, dar stocul nu s-a re-aplicat: ${applied.reason} — deschide Editare și apasă Salvează`,
        };
      }
    } else {
      console.warn(
        `[panel.purchases] restore ${purchaseId}: stock NOT re-applied (ledger net=${net}, movements=${movements.length}) — verifică manual stocul`,
      );
    }
  }

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  return { ok: true, restored: lines.length };
}
