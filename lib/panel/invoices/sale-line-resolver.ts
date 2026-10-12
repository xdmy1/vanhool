/**
 * Sale-line → product resolution that looks at the LAST PURCHASE first.
 *
 * The operator's real flow: quote a part on a proforma while it is NOT in
 * stock, order it from the supplier (an achiziție that stays a DRAFT, often
 * for weeks), hand it over when it arrives, convert the proforma. The catalog
 * resolver alone knew nothing about that draft line, so the invoice took
 * nothing out of stock and the draft line kept advertising its full quantity
 * as "stock" in the search dropdown.
 *
 * Owner's rule (2026-10-12): at sale time the system MUST look at the last
 * purchase of that part code — matched normalized (dots, commas, spaces,
 * dashes, case ignored) — and take the goods out of stock from there:
 *
 *   1. frozen `productId` on the line → that product (the operator picked it;
 *      a still-unlinked draft purchase line for the code gets linked to it so
 *      the later post lands its stock on the SAME product);
 *   2. else the most recent purchase line for the code:
 *        • already linked to a product → that product;
 *        • an open (draft/ordered/received) line without one → link it to the
 *          catalog match if any, else MINT the internal product the posting
 *          would create and link the line. The decrement then lands NOW
 *          (stock −qty) and the post brings it back to its true level;
 *   3. else the catalog by code (same tiers as resolveLineProductId);
 *   4. else null — the caller keeps its draft-settle marker.
 *
 * Cancelled purchases are ignored. `costMdl` is the GROSS MDL unit cost of
 * that last purchase line, so a line quoted without a cost gets one.
 */
import { normalizeCode } from "@/lib/utils/normalize-code";
import { purchaseUnitCostMdl } from "@/lib/panel/purchases/line-math";
import {
  collectLineCodes,
  rankLineProductCandidates,
  type StockDb,
} from "@/lib/stock-ledger";

type PurchaseLineRow = {
  id: string;
  purchase_id: string;
  product_id: string | null;
  supplier_code: string | null;
  internal_code: string | null;
  description: string | null;
  quantity: number | string | null;
  unit_cost: number | string | null;
  vat_rate: number | string | null;
  created_at: string | null;
};

type PurchaseHeader = {
  id: string;
  status: string | null;
  supplier_id: string | null;
  currency: string | null;
  fx_rate: number | string | null;
  document_number: string | null;
  created_at: string | null;
};

const LINE_COLS =
  "id, purchase_id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, created_at";
const HEADER_COLS =
  "id, status, supplier_id, currency, fx_rate, document_number, created_at";
/** Purchases whose stock is still to come — their lines may be minted/linked. */
const OPEN_STATUSES = new Set(["draft", "ordered", "received"]);

/** Per-document memo so a 10-line conversion scans the purchase lines once. */
export type ResolverCache = {
  lines?: PurchaseLineRow[];
  headers: Map<string, PurchaseHeader>;
};

export function newResolverCache(): ResolverCache {
  return { headers: new Map() };
}

export type ResolvedSaleLine = {
  productId: string | null;
  via: "frozen" | "purchase" | "purchase_new_product" | "catalog" | "none";
  /** GROSS MDL unit cost of the last purchase line (null when none / zero). */
  costMdl: number | null;
  /** The last purchase line considered, for logging / dry runs. */
  purchase: {
    lineId: string;
    status: string | null;
    documentNumber: string | null;
    productId: string | null;
  } | null;
};

export type ResolveSaleLineOptions = {
  /**
   * true → allowed to WRITE: mint a product for an open purchase line without
   * one and link lines to their product. false → pure lookup (dry run).
   */
  createFromDraft: boolean;
  /** Price multiplier for a minted product (1 + markup%/100). Default 1.3. */
  markupFactor?: number;
  cache?: ResolverCache;
};

export async function resolveSaleLine(
  db: StockDb,
  line: Record<string, unknown>,
  opts: ResolveSaleLineOptions,
): Promise<ResolvedSaleLine> {
  const cache = opts.cache ?? newResolverCache();
  const frozen =
    ((line as { productId?: string | null }).productId ??
      (line as { product_id?: string | null }).product_id) ||
    null;
  const codes = collectLineCodes(line);
  const norms = new Set(codes.map(normalizeCode).filter((n) => n.length > 0));

  const candidates =
    codes.length > 0 ? await rankLineProductCandidates(db, codes) : [];
  const candidateIds = candidates.map((c) => c.id);

  // Every purchase line that could be "the last purchase" of this part:
  // exact code (case-insensitive), lines of a matching product, and recent
  // lines whose code matches once normalized ("0.986.435.123" ~ "0 986 435
  // 123"). The normalized scan reads the purchase lines THEMSELVES, so it
  // does not depend on the product's search_codes being in sync.
  const pool = new Map<string, PurchaseLineRow>();
  const add = (rows: PurchaseLineRow[]) => {
    for (const r of rows) if (r && !pool.has(r.id)) pool.set(r.id, r);
  };
  if (norms.size > 0) {
    add(
      (await recentLines(db, cache)).filter(
        (r) =>
          norms.has(normalizeCode(r.supplier_code)) ||
          norms.has(normalizeCode(r.internal_code)),
      ),
    );
  }
  for (const code of codes) add(await linesByExactCode(db, code));
  add(
    await linesByProducts(
      db,
      Array.from(new Set([...(frozen ? [frozen] : []), ...candidateIds])),
    ),
  );

  const headers = await headersFor(
    db,
    cache,
    Array.from(new Set(Array.from(pool.values()).map((r) => r.purchase_id))),
  );
  const ranked = Array.from(pool.values())
    .map((row) => ({ row, head: headers.get(row.purchase_id) ?? null }))
    .filter(
      (x): x is { row: PurchaseLineRow; head: PurchaseHeader } =>
        !!x.head && x.head.status !== "cancelled",
    )
    .sort((a, b) => {
      // Most recently ENTERED purchase first, then its most recent line.
      const ha = a.head.created_at ?? "";
      const hb = b.head.created_at ?? "";
      if (ha !== hb) return hb.localeCompare(ha);
      return (b.row.created_at ?? "").localeCompare(a.row.created_at ?? "");
    });
  const last = ranked[0] ?? null;

  const rawCost = last
    ? purchaseUnitCostMdl(
        Number(last.row.unit_cost ?? 0),
        Number(last.row.vat_rate ?? 0),
        last.head.currency,
        last.head.fx_rate == null ? null : Number(last.head.fx_rate),
      )
    : 0;
  const costMdl = rawCost > 0 ? rawCost : null;
  const purchase = last
    ? {
        lineId: last.row.id,
        status: last.head.status,
        documentNumber: last.head.document_number,
        productId: last.row.product_id,
      }
    : null;
  const lastIsOpenUnlinked =
    !!last && !last.row.product_id && OPEN_STATUSES.has(last.head.status ?? "");

  if (frozen) {
    if (lastIsOpenUnlinked && opts.createFromDraft) {
      await linkLine(db, cache, last.row, frozen);
    }
    return { productId: frozen, via: "frozen", costMdl, purchase };
  }

  if (last?.row.product_id) {
    return { productId: last.row.product_id, via: "purchase", costMdl, purchase };
  }

  if (lastIsOpenUnlinked) {
    if (candidateIds.length > 0) {
      if (opts.createFromDraft) await linkLine(db, cache, last.row, candidateIds[0]);
      return { productId: candidateIds[0], via: "catalog", costMdl, purchase };
    }
    if (opts.createFromDraft) {
      const minted = await mintProduct(
        db,
        last.row,
        last.head,
        rawCost,
        opts.markupFactor ?? 1.3,
        line,
      );
      if (minted) {
        await linkLine(db, cache, last.row, minted);
        return {
          productId: minted,
          via: "purchase_new_product",
          costMdl,
          purchase,
        };
      }
    }
    return { productId: null, via: "none", costMdl, purchase };
  }

  if (candidateIds.length > 0) {
    return { productId: candidateIds[0], via: "catalog", costMdl, purchase };
  }
  return { productId: null, via: "none", costMdl, purchase };
}

// ---- lookups ---------------------------------------------------------------

async function linesByExactCode(
  db: StockDb,
  code: string,
): Promise<PurchaseLineRow[]> {
  // No wildcards → ilike is a case-insensitive equality. Two queries instead
  // of one `.or()` so a code with commas/parentheses can't break the filter.
  const escaped = code.replace(/[\\%_]/g, "\\$&");
  const [bySupplier, byInternal] = await Promise.all([
    db.from("purchase_items").select(LINE_COLS).ilike("supplier_code", escaped).limit(20),
    db.from("purchase_items").select(LINE_COLS).ilike("internal_code", escaped).limit(20),
  ]);
  return [
    ...((bySupplier.data ?? []) as PurchaseLineRow[]),
    ...((byInternal.data ?? []) as PurchaseLineRow[]),
  ];
}

async function linesByProducts(
  db: StockDb,
  productIds: string[],
): Promise<PurchaseLineRow[]> {
  if (productIds.length === 0) return [];
  const { data } = await db
    .from("purchase_items")
    .select(LINE_COLS)
    .in("product_id", productIds)
    .limit(50);
  return (data ?? []) as PurchaseLineRow[];
}

/** The most recent purchase lines (any status), read once per document. */
async function recentLines(
  db: StockDb,
  cache: ResolverCache,
): Promise<PurchaseLineRow[]> {
  if (cache.lines) return cache.lines;
  const { data } = await db
    .from("purchase_items")
    .select(LINE_COLS)
    .order("created_at", { ascending: false })
    .limit(2000);
  cache.lines = (data ?? []) as PurchaseLineRow[];
  return cache.lines;
}

async function headersFor(
  db: StockDb,
  cache: ResolverCache,
  purchaseIds: string[],
): Promise<Map<string, PurchaseHeader>> {
  const missing = purchaseIds.filter((id) => !cache.headers.has(id));
  if (missing.length > 0) {
    const { data } = await db.from("purchases").select(HEADER_COLS).in("id", missing);
    for (const h of (data ?? []) as PurchaseHeader[]) cache.headers.set(h.id, h);
  }
  return cache.headers;
}

// ---- writes ----------------------------------------------------------------

/**
 * Mirror of what applyPostedLines creates for a line without a product:
 * internal-only, inactive, stock 0, part_code = the line's code, cost = GROSS
 * MDL. The posting later sees `product_id` set on the line and applies +qty.
 */
async function mintProduct(
  db: StockDb,
  row: PurchaseLineRow,
  head: PurchaseHeader,
  costMdl: number,
  markupFactor: number,
  line: Record<string, unknown>,
): Promise<string | null> {
  const internalCode = (row.internal_code ?? "").trim();
  const supplierCode = (row.supplier_code ?? "").trim();
  const code =
    internalCode || supplierCode || `IB-${row.id.slice(0, 8).toUpperCase()}`;
  const slug = `${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${row.id.slice(0, 6)}`;
  const name = (
    (row.description ?? "").trim() ||
    String((line as { name?: string | null }).name ?? "").trim() ||
    code
  ).slice(0, 200);
  const unit = String((line as { unit?: string | null }).unit ?? "").trim() || "buc";
  const base = {
    part_code: code,
    name_ro: name,
    slug,
    price: Number((costMdl * markupFactor).toFixed(2)),
    cost_price: costMdl,
    stock_quantity: 0,
    unit,
    is_active: false,
    supplier_id: head.supplier_id,
    supplier_code: supplierCode || null,
  };
  let res = await db
    .from("products")
    .insert({ ...base, internal_only: true })
    .select("id")
    .single();
  // sql/products-internal-only.sql not applied yet — create it anyway.
  if (res.error && /internal_only/i.test(res.error.message)) {
    res = await db.from("products").insert(base).select("id").single();
  }
  if (res.error || !res.data) {
    console.error(
      "[sale-line-resolver] product mint failed:",
      res.error?.message ?? "no row",
    );
    return null;
  }
  return (res.data as { id: string }).id;
}

async function linkLine(
  db: StockDb,
  cache: ResolverCache,
  row: PurchaseLineRow,
  productId: string,
): Promise<void> {
  const hasCode =
    (row.internal_code ?? "").trim().length > 0 ||
    (row.supplier_code ?? "").trim().length > 0;
  const { error } = await db
    .from("purchase_items")
    .update({
      product_id: productId,
      // Same stamp rule as the posting: only a code-less line gets its IB-
      // fallback written back so a later unlink re-binds the same product.
      ...(hasCode ? {} : { internal_code: `IB-${row.id.slice(0, 8).toUpperCase()}` }),
    })
    .eq("id", row.id);
  if (error) {
    console.error("[sale-line-resolver] purchase line link failed:", error.message);
    return;
  }
  row.product_id = productId;
  for (const r of cache.lines ?? []) if (r.id === row.id) r.product_id = productId;
}
