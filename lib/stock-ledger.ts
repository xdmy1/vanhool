/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * STOCK LEDGER — the single doorway for every stock change in the app.
 *
 * Rules (enforced by sql/stock-accuracy.sql):
 *   1. Nothing writes products.stock_quantity directly. Every change is an
 *      `apply_stock_movement` RPC: an append-only `stock_movements` row plus an
 *      atomic `stock = stock + delta` update in one transaction.
 *   2. Every movement carries a deterministic, UNIQUE `ref`
 *      ("purchase_post:<line_id>", "sale:<order_id>:<product_id>", …).
 *      Retries, double-clicks and concurrent tabs collapse into no-ops.
 *   3. Reversals (anulare/void/ștergere) are computed FROM the ledger — they
 *      undo what actually happened, never what the caller guesses happened.
 *      An order whose goods never left stock reverses to nothing.
 *   4. No clamping. Stock is allowed to go negative because negative stock is
 *      a true "we oversold" signal; clamping at zero silently converts missing
 *      goods into phantom stock on the next reversal.
 *
 * Documents that predate the ledger have no movements; the reverse helpers
 * fall back to the old snapshot-based restore exactly once (idempotent refs),
 * and skip it when the money flow proves stock was never taken (unpaid card).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { roundStock } from "@/lib/stock";
import { normalizeCode } from "@/lib/utils/normalize-code";

/** Accepts both the RLS server client and the service-role admin client. */
export type StockDb = SupabaseClient<any, any, any>;

export type StockMovementInput = {
  productId: string;
  delta: number;
  reason: string;
  ref: string;
  orderId?: string | null;
  purchaseId?: string | null;
  invoiceId?: string | null;
  returnId?: string | null;
  note?: string | null;
  createdBy?: string | null;
};

export type StockMovementRow = {
  id: string;
  product_id: string;
  delta: number;
  reason: string;
  ref: string;
  order_id: string | null;
  purchase_id: string | null;
};

export type StockResult =
  | { ok: true; applied: boolean }
  | { ok: false; reason: string };

/**
 * Record one stock movement. `applied: false` means this exact ref already
 * moved stock before (benign — the operation is a retry/duplicate).
 * `ok: false` almost always means sql/stock-accuracy.sql hasn't been run.
 */
export async function applyStockMovement(
  db: StockDb,
  m: StockMovementInput,
): Promise<StockResult> {
  const { data, error } = await db.rpc("apply_stock_movement", {
    p_product_id: m.productId,
    p_delta: roundStock(m.delta),
    p_reason: m.reason,
    p_ref: m.ref,
    p_order_id: m.orderId ?? null,
    p_purchase_id: m.purchaseId ?? null,
    p_invoice_id: m.invoiceId ?? null,
    p_return_id: m.returnId ?? null,
    p_note: m.note ?? null,
    p_created_by: m.createdBy ?? null,
  });
  if (error) {
    console.error(
      `[stock-ledger] apply failed (${m.ref}): ${error.message} — rulează sql/stock-accuracy.sql`,
    );
    return { ok: false, reason: `stock_ledger: ${error.message}` };
  }
  return { ok: true, applied: data === true };
}

/**
 * Absolute set from the product form's stock field. Goes through the
 * `set_stock_absolute` RPC: row lock → delta into the ledger → set value.
 */
export async function setStockAbsolute(
  db: StockDb,
  productId: string,
  quantity: number,
  ref: string,
  createdBy?: string | null,
): Promise<StockResult> {
  const { data, error } = await db.rpc("set_stock_absolute", {
    p_product_id: productId,
    p_quantity: roundStock(quantity),
    p_reason: "manual_adjust",
    p_ref: ref,
    p_created_by: createdBy ?? null,
  });
  if (error) {
    console.error(
      `[stock-ledger] set_stock_absolute failed (${productId}): ${error.message} — rulează sql/stock-accuracy.sql`,
    );
    return { ok: false, reason: `stock_ledger: ${error.message}` };
  }
  return { ok: true, applied: data === true };
}

const MOVEMENT_COLS = "id, product_id, delta, reason, ref, order_id, purchase_id";

/**
 * A failed ledger READ must never be mistaken for "no movements" — that
 * confusion would flip a reversal onto the wrong branch (e.g. a transient
 * error making a post-ledger order look pre-ledger and restoring the full
 * snapshot). Every getter distinguishes the two.
 */
export type MovementsResult =
  | { ok: true; rows: StockMovementRow[] }
  | { ok: false; reason: string };

export async function getOrderMovements(
  db: StockDb,
  orderId: string,
): Promise<MovementsResult> {
  const { data, error } = await db
    .from("stock_movements")
    .select(MOVEMENT_COLS)
    .eq("order_id", orderId);
  if (error) return { ok: false, reason: `stock_ledger: ${error.message}` };
  return { ok: true, rows: (data ?? []) as StockMovementRow[] };
}

export async function getPurchaseMovements(
  db: StockDb,
  purchaseId: string,
): Promise<MovementsResult> {
  const { data, error } = await db
    .from("stock_movements")
    .select(MOVEMENT_COLS)
    .eq("purchase_id", purchaseId);
  if (error) return { ok: false, reason: `stock_ledger: ${error.message}` };
  return { ok: true, rows: (data ?? []) as StockMovementRow[] };
}

export async function getMovementByRef(
  db: StockDb,
  ref: string,
): Promise<StockMovementRow | null> {
  const { data } = await db
    .from("stock_movements")
    .select(MOVEMENT_COLS)
    .eq("ref", ref)
    .maybeSingle();
  return (data as StockMovementRow) ?? null;
}

/**
 * True when the ledger (sql/stock-accuracy.sql) is installed and reachable.
 * Money paths call this FIRST and refuse to proceed without it — a sale that
 * cannot record its stock movement must not pretend it succeeded.
 */
export async function ledgerReady(db: StockDb): Promise<boolean> {
  const { error } = await db.from("stock_movements").select("id").limit(1);
  return !error;
}

/** Net stock effect per product across a set of movements. */
function netByProduct(rows: StockMovementRow[]): Map<string, number> {
  const net = new Map<string, number>();
  for (const r of rows) {
    net.set(r.product_id, roundStock((net.get(r.product_id) ?? 0) + Number(r.delta)));
  }
  return net;
}

/** Minimal order shape the reverse helpers need. */
export type OrderForStock = {
  id: string;
  items: unknown;
  payment_method?: string | null;
  payment_status?: string | null;
};

/**
 * Cancel-side restore: bring the order's stock effect back to zero.
 *
 * The branch test is "does the ledger hold this order's TAKE" (a movement
 * with reason `sale`), NOT "are there any movements" — a pre-ledger invoice
 * that picked up a post-deploy return movement must still be treated as
 * pre-ledger, with the return netted out of the snapshot restore:
 *   pre-deploy sale of 5 (off-ledger), post-deploy return of 2 (+2 on the
 *   ledger) → void restores 5 − 2 = 3, never −2 and never 5.
 * Unpaid card orders (whose finalize never ran) restore nothing. A failed
 * ledger READ aborts — guessing would restore the wrong amount.
 */
export async function reverseOrderStock(
  db: StockDb,
  order: OrderForStock,
  createdBy?: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await getOrderMovements(db, order.id);
  if (!res.ok) return res;
  const rows = res.rows;
  const net = netByProduct(rows);
  const hasLedgerTake = rows.some((r) => r.reason === "sale");

  if (hasLedgerTake) {
    // Fully ledger-tracked: compensate the net to zero (sales + settles +
    // edits − returns already credited − prior cancels).
    for (const [productId, n] of net) {
      if (n === 0) continue;
      const seq = rows.filter(
        (r) => r.product_id === productId && r.reason === "order_cancel",
      ).length;
      const moved = await applyStockMovement(db, {
        productId,
        delta: -n,
        reason: "order_cancel",
        ref: `order_cancel:${order.id}:${productId}:${seq}`,
        orderId: order.id,
        createdBy,
      });
      if (!moved.ok) return moved;
    }
    return { ok: true };
  }

  // Pre-ledger take. Unpaid/failed card orders never decremented stock —
  // restoring them would fabricate inventory out of an abandoned payment page.
  const pm = (order.payment_method ?? "").toLowerCase();
  const paid = order.payment_status ?? null;
  if ((pm === "card" || pm === "maib") && paid !== "paid") return { ok: true };

  const items = Array.isArray(order.items)
    ? (order.items as Array<Record<string, unknown>>)
    : [];
  const restore = new Map<string, number>();
  for (const it of items) {
    const qty = Number((it as { quantity?: number }).quantity ?? 0);
    if (qty <= 0) continue;
    // Draft-purchase lines never decremented at sale time (no catalog product
    // existed) — restoring them would add stock that was never taken.
    const hadProduct =
      ((it as { productId?: string | null }).productId ??
        (it as { product_id?: string | null }).product_id) != null;
    if (!hadProduct && (it as { from_draft_purchase?: boolean }).from_draft_purchase) {
      continue;
    }
    const productId = await resolveLineProductId(db, it);
    if (!productId) continue;
    restore.set(productId, roundStock((restore.get(productId) ?? 0) + qty));
  }
  for (const [productId, qty] of restore) {
    // Subtract whatever the ledger DID record (returns credited back, prior
    // legacy cancels, uncancels): restore = snapshot take − ledger net.
    const delta = roundStock(qty - (net.get(productId) ?? 0));
    if (delta <= 0) continue;
    const seq = rows.filter(
      (r) => r.product_id === productId && r.reason === "order_cancel",
    ).length;
    const moved = await applyStockMovement(db, {
      productId,
      delta,
      reason: "order_cancel",
      ref: `order_cancel_legacy:${order.id}:${productId}:${seq}`,
      orderId: order.id,
      note: "restaurare document pre-ledger",
      createdBy,
    });
    if (!moved.ok) return moved;
  }
  return { ok: true };
}

/**
 * Un-cancel: reverse whatever the cancel put back (and nothing more), so
 * cancel → un-cancel → cancel cycles stay exact instead of double-restoring.
 */
export async function unreverseOrderStock(
  db: StockDb,
  orderId: string,
  createdBy?: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await getOrderMovements(db, orderId);
  if (!res.ok) return res;
  const rows = res.rows;
  const outstanding = new Map<string, number>();
  for (const r of rows) {
    if (r.reason !== "order_cancel" && r.reason !== "order_uncancel") continue;
    outstanding.set(
      r.product_id,
      roundStock((outstanding.get(r.product_id) ?? 0) + Number(r.delta)),
    );
  }
  for (const [productId, n] of outstanding) {
    if (n === 0) continue;
    const seq = rows.filter(
      (r) => r.product_id === productId && r.reason === "order_uncancel",
    ).length;
    const moved = await applyStockMovement(db, {
      productId,
      delta: -n,
      reason: "order_uncancel",
      ref: `order_uncancel:${orderId}:${productId}:${seq}`,
      orderId,
      createdBy,
    });
    if (!moved.ok) return moved;
  }
  return { ok: true };
}

/**
 * Reverse the stock a purchase's lines actually added. Ledger-first: each
 * line's `purchase_post:<line_id>` movement is negated under a unique
 * `reverse:` ref (cancel → delete can never double-reverse). Purchases whose
 * POST predates the ledger (no `purchase_post` movements — later returns
 * don't count) fall back to product_id × quantity, once, under
 * `purchase_unpost:<line_id>`. A failed ledger read aborts.
 */
export async function reversePurchaseLines(
  db: StockDb,
  purchaseId: string,
  lines: Array<{ id: string; product_id: string | null; quantity: number | string | null }>,
  createdBy?: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await getPurchaseMovements(db, purchaseId);
  if (!res.ok) return res;
  const rows = res.rows;
  const byRef = new Map(rows.map((r) => [r.ref, r]));
  const postedPreLedger = !rows.some((r) => r.reason === "purchase_post");
  for (const it of lines) {
    const mv = byRef.get(`purchase_post:${it.id}`);
    if (mv) {
      const moved = await applyStockMovement(db, {
        productId: mv.product_id,
        delta: -Number(mv.delta),
        reason: "purchase_reverse",
        ref: `reverse:purchase_post:${it.id}`,
        purchaseId,
        createdBy,
      });
      if (!moved.ok) return moved;
    } else if (postedPreLedger && it.product_id && Number(it.quantity ?? 0) > 0) {
      const moved = await applyStockMovement(db, {
        productId: it.product_id,
        delta: -Number(it.quantity),
        reason: "purchase_reverse",
        ref: `purchase_unpost:${it.id}`,
        purchaseId,
        note: "reversare document pre-ledger",
        createdBy,
      });
      if (!moved.ok) return moved;
    }
    // Post-ledger line with no purchase_post movement = its apply never ran
    // (mid-post failure) → it added nothing → correctly reverses to nothing.
  }
  return { ok: true };
}

/**
 * Final step of cancelling/deleting a POSTED purchase, after its lines were
 * reversed: settle what the line reversal alone cannot see.
 *   • Ledger-tracked purchase: bring the purchase's total net to zero — e.g.
 *     buy 10 (+10), supplier-return 2 (−2), cancel (−10) leaves net −2, but
 *     the shelf only held 8 of ours, so +2 compensates.
 *   • Pre-ledger purchase: only the recorded returns need netting (the take
 *     itself was off-ledger and was already reversed from the snapshot).
 */
export async function settlePurchaseCancelNet(
  db: StockDb,
  purchaseId: string,
  createdBy?: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await getPurchaseMovements(db, purchaseId);
  if (!res.ok) return res;
  const rows = res.rows;
  const hasLedgerPost = rows.some((r) => r.reason === "purchase_post");
  const target = new Map<string, number>();
  for (const r of rows) {
    // Pre-ledger purchases: net only the returns + our own prior netting rows
    // (including the latter keeps a repeated cancel a no-op).
    if (
      !hasLedgerPost &&
      r.reason !== "return" &&
      !r.ref.startsWith("purchase_cancel_net:")
    ) {
      continue;
    }
    target.set(
      r.product_id,
      roundStock((target.get(r.product_id) ?? 0) + Number(r.delta)),
    );
  }
  for (const [productId, n] of target) {
    if (n === 0) continue;
    const seq = rows.filter((r) =>
      r.ref.startsWith(`purchase_cancel_net:${purchaseId}:${productId}:`),
    ).length;
    const moved = await applyStockMovement(db, {
      productId,
      delta: -n,
      reason: "purchase_reverse",
      ref: `purchase_cancel_net:${purchaseId}:${productId}:${seq}`,
      purchaseId,
      note: "netare la anularea achiziției",
      createdBy,
    });
    if (!moved.ok) return moved;
  }
  return { ok: true };
}

/**
 * Resolve the catalog product behind a document line.
 *
 * A proforma/order freezes `productId` at issue time, but in the normal flow
 * the part isn't in the catalog yet — the operator quotes it off a supplier
 * list, and only once the client accepts does the purchase get entered under
 * the SAME code, creating the product. So a line that quoted an uncatalogued
 * part carries `productId: null` forever, and matching on it alone would
 * silently skip the stock move. Fall back to the part code.
 *
 * Used by the stock decrement (conversion), the returns flow, and the legacy
 * restore — they MUST resolve lines identically, or a reversal could credit
 * back stock that was never taken.
 */
export async function resolveLineProductId(
  db: StockDb,
  line: Record<string, unknown>,
): Promise<string | null> {
  const direct =
    ((line as { productId?: string | null }).productId ??
      (line as { product_id?: string | null }).product_id) ||
    null;
  if (direct) return direct;

  // Collect every code the line carries. A proforma for an uncatalogued part
  // freezes the SUPPLIER code as `partCode`; once the purchase is posted the
  // new product's `part_code` becomes the auto-generated INTERNAL code and the
  // quoted code lives on `supplier_code` + the normalized `search_codes` index.
  // So we must RE-RESOLVE at move time across all of these.
  const codes = Array.from(
    new Set(
      [
        (line as { partCode?: string | null }).partCode,
        (line as { part_code?: string | null }).part_code,
        (line as { supplierCode?: string | null }).supplierCode,
        (line as { supplier_code?: string | null }).supplier_code,
      ]
        .map((c) => (c ?? "").toString().trim())
        .filter((c) => c.length > 0),
    ),
  );
  if (codes.length === 0) return null;

  // Tiered candidate pool. Tier 1 exact part_code, tier 2 exact supplier_code,
  // tier 3 normalized search_codes (survives space/dash/case differences AND
  // matches a product that was cataloged AFTER the document was raised — the
  // whole point). Lower tier wins; ties broken by most-recent product (the one
  // the just-entered purchase created). Ranking is stock-INDEPENDENT so the
  // decrement and the later restore resolve to the SAME product.
  const best = new Map<string, { tier: number; created: string }>();
  const consider = (
    rows: Array<{ id: string; created_at?: string | null }> | null,
    tier: number,
  ) => {
    for (const r of rows ?? []) {
      const prev = best.get(r.id);
      if (!prev || tier < prev.tier) {
        best.set(r.id, { tier, created: r.created_at ?? "" });
      }
    }
  };

  for (const code of codes) {
    const escaped = code.replace(/[\\%_]/g, "\\$&");
    const norm = normalizeCode(code);
    const [byPart, bySupplier, byCodes] = await Promise.all([
      db.from("products").select("id, created_at").ilike("part_code", escaped).limit(5),
      db.from("products").select("id, created_at").ilike("supplier_code", escaped).limit(5),
      norm.length > 0
        ? db
            .from("products")
            .select("id, created_at")
            .contains("search_codes", [norm])
            .limit(5)
        : Promise.resolve({ data: [] as Array<{ id: string; created_at?: string | null }> }),
    ]);
    consider(byPart.data as Array<{ id: string; created_at?: string | null }>, 1);
    consider(bySupplier.data as Array<{ id: string; created_at?: string | null }>, 2);
    consider(byCodes.data as Array<{ id: string; created_at?: string | null }>, 3);
  }

  if (best.size === 0) return null;
  const ranked = Array.from(best.entries()).sort((a, b) => {
    if (a[1].tier !== b[1].tier) return a[1].tier - b[1].tier;
    return b[1].created.localeCompare(a[1].created); // most recent first
  });
  if (best.size > 1) {
    // Deterministic PICK, not skip: goods physically left the shelf, so under-
    // decrementing (oversell) is the worse failure. Log for review.
    console.warn(
      `[stock-ledger] resolveLineProductId ambiguous for code(s) ${codes.join("/")}: ${best.size} products, picked ${ranked[0][0].slice(0, 8)}`,
    );
  }
  return ranked[0][0];
}
