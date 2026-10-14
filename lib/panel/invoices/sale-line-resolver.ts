/**
 * Sale-line → product resolution that looks at the LAST PURCHASE first.
 *
 * The operator's real flow: quote a part on a proforma while it is NOT in
 * stock, order it from the supplier (an achiziție that stays a DRAFT until the
 * supplier's invoice arrives, often for weeks), hand it over when it arrives,
 * convert the proforma. The catalog resolver alone knew nothing about that
 * draft line, so the invoice took nothing out of stock and the draft line
 * kept advertising its full quantity as "stock" in the search dropdown.
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
 *          would create and link the line;
 *   3. else the catalog by code (same tiers as resolveLineProductId);
 *   4. else null — the caller keeps its draft-settle marker.
 *
 * Owner's rule (2026-10-13, IB0293 "am vândut 2, stocul e −2"): the goods of a
 * not-yet-posted purchase are physically in the shop the moment they're sold,
 * so when the last purchase is OPEN and the product can't cover the sale, the
 * open line's quantity ENTERS stock first (`receiveFromOpenPurchase`, ledger
 * ref `draft_receive:…`) and the sale then takes from it: bought 2, sold 2 →
 * 0, not −2. The later post withdraws that provisional receipt
 * (netDraftReceives) and carries the stock itself, so nothing doubles.
 *
 * Cancelled purchases are ignored. `costMdl` is the GROSS MDL unit cost of
 * that last purchase line, so a line quoted without a cost gets one.
 */
import { normalizeCode } from "@/lib/utils/normalize-code";
import { purchaseUnitCostMdl } from "@/lib/panel/purchases/line-math";
import { insertMintedProduct } from "@/lib/panel/purchases/mint-product";
import { roundStock } from "@/lib/stock";
import {
  applyStockMovement,
  collectLineCodes,
  getPurchaseMovements,
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

/** The last purchase line of the part when its purchase is still OPEN and the
 *  line is linked to the resolved product — the goods the sale may draw on. */
export type OpenPurchaseLine = {
  lineId: string;
  purchaseId: string;
  productId: string;
  quantity: number;
};

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
  /** Set when that last purchase is open and carries THIS product. */
  openLine: OpenPurchaseLine | null;
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
  const lastIsOpen = !!last && OPEN_STATUSES.has(last.head.status ?? "");
  const lastIsOpenUnlinked = lastIsOpen && !last!.row.product_id;
  // Evaluated AFTER any linking below, so a line linked right now counts.
  const done = (
    productId: string | null,
    via: ResolvedSaleLine["via"],
  ): ResolvedSaleLine => ({
    productId,
    via,
    costMdl,
    purchase,
    openLine:
      productId && last && lastIsOpen && last.row.product_id === productId
        ? {
            lineId: last.row.id,
            purchaseId: last.row.purchase_id,
            productId,
            quantity: roundStock(Number(last.row.quantity ?? 0)),
          }
        : null,
  });

  if (frozen) {
    if (lastIsOpenUnlinked && opts.createFromDraft) {
      await linkLine(db, cache, last!.row, frozen);
    }
    return done(frozen, "frozen");
  }

  if (last?.row.product_id) {
    return done(last.row.product_id, "purchase");
  }

  if (lastIsOpenUnlinked) {
    if (candidateIds.length > 0) {
      if (opts.createFromDraft) await linkLine(db, cache, last!.row, candidateIds[0]);
      return done(candidateIds[0], "catalog");
    }
    if (opts.createFromDraft) {
      const minted = await mintProduct(
        db,
        last!.row,
        last!.head,
        rawCost,
        opts.markupFactor ?? 1.3,
        line,
      );
      if (minted) {
        await linkLine(db, cache, last!.row, minted);
        return done(minted, "purchase_new_product");
      }
    }
    return done(null, "none");
  }

  if (candidateIds.length > 0) {
    return done(candidateIds[0], "catalog");
  }
  return done(null, "none");
}

/**
 * The goods of an OPEN (not yet posted) purchase line enter stock the moment
 * they are sold and the product cannot cover the sale on its own: the
 * operator is handing over what arrived with that achiziție, posted or not.
 * Receives the line's quantity (minus what was already received for this
 * purchase+product — a draft edited from 2 to 5 tops up by 3) under
 * `draft_receive:<purchase>:<product>:<seq>`; netDraftReceives withdraws it
 * when the purchase is posted / cancelled / deleted.
 *
 * A product that already covers the sale receives NOTHING — a pending order
 * of 10 must not show as stock while the 5 on the shelf serve the sale.
 *
 * `stockOffset` is for replaying a sale that already landed (backfill): the
 * stock read now already has the sale subtracted, so the caller adds it back.
 */
export async function receiveFromOpenPurchase(
  db: StockDb,
  openLine: OpenPurchaseLine | null,
  needQty: number,
  createdBy?: string | null,
  stockOffset = 0,
): Promise<{ ok: true; received: number } | { ok: false; reason: string }> {
  if (!openLine || needQty <= 0 || openLine.quantity <= 0) {
    return { ok: true, received: 0 };
  }
  const { data: prod, error: pErr } = await db
    .from("products")
    .select("stock_quantity")
    .eq("id", openLine.productId)
    .maybeSingle();
  if (pErr) return { ok: false, reason: `stock_read: ${pErr.message}` };
  const stock = roundStock(
    Number((prod as { stock_quantity?: number | string | null } | null)?.stock_quantity ?? 0) +
      stockOffset,
  );
  if (stock >= needQty) return { ok: true, received: 0 };

  const mv = await getPurchaseMovements(db, openLine.purchaseId);
  if (!mv.ok) return mv;
  let already = 0;
  let seq = 0;
  for (const r of mv.rows) {
    if (r.product_id !== openLine.productId) continue;
    if (r.reason === "draft_receive" || r.reason === "draft_receive_net") {
      already = roundStock(already + Number(r.delta));
    }
    if (r.ref.startsWith(`draft_receive:${openLine.purchaseId}:${openLine.productId}:`)) seq++;
  }
  const toReceive = roundStock(openLine.quantity - already);
  if (toReceive <= 0) return { ok: true, received: 0 };

  const moved = await applyStockMovement(db, {
    productId: openLine.productId,
    delta: toReceive,
    reason: "draft_receive",
    ref: `draft_receive:${openLine.purchaseId}:${openLine.productId}:${seq}`,
    purchaseId: openLine.purchaseId,
    note: "marfă din achiziția nepostată, intrată în stoc la vânzare",
    createdBy,
  });
  if (!moved.ok) return moved;
  return { ok: true, received: moved.applied ? toReceive : 0 };
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
 * Same product the posting would create for a line without one (shared
 * insertMintedProduct): internal-only, inactive, stock 0, part_code = the
 * line's code (falling back to the supplier code when the internal code is
 * already taken), cost = GROSS MDL. The posting later sees `product_id` set
 * on the line and applies +qty.
 */
async function mintProduct(
  db: StockDb,
  row: PurchaseLineRow,
  head: PurchaseHeader,
  costMdl: number,
  markupFactor: number,
  line: Record<string, unknown>,
): Promise<string | null> {
  const res = await insertMintedProduct(db, {
    line: row,
    name:
      (row.description ?? "").trim() ||
      String((line as { name?: string | null }).name ?? "").trim() ||
      null,
    costMdl,
    markupFactor,
    supplierId: head.supplier_id,
    internalOnly: true,
  });
  if (!res.ok) {
    console.error("[sale-line-resolver] product mint failed:", res.reason);
    return null;
  }
  return res.id;
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
