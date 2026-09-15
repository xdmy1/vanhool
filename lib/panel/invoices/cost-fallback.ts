import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeCode } from "@/lib/utils/normalize-code";

import type { InvoiceItemSnapshot } from "./queries";

const FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };

/**
 * Documents issued on/after this date carry a snapshot `cost_price` that is
 * GROSS MDL, captured from the exact source the operator picked on the line
 * (a catalog product, or ONE specific purchase line from "Din achiziții"),
 * possibly hand-edited on the form. That stored cost is the truth for the
 * line and must never be replaced by a catalog lookup: the same code can be
 * bought at 252.30 on one purchase and 264.00 on another (or even sit on two
 * catalog products), and the operator chose which one they are selling.
 *
 * Before this date snapshots could still hold the legacy NET cost, so the
 * code-based lookup keeps overriding them there (the historical behaviour).
 */
const SNAPSHOT_COST_TRUSTED_SINCE = "2026-07-08";

/**
 * True when the stored snapshot cost on this line is authoritative and the
 * by-code lookup must leave it alone. `issuedDate` is the document's
 * issued_date (YYYY-MM-DD); undefined/null = unknown = treat as legacy.
 */
export function snapshotCostIsAuthoritative(
  item: Pick<InvoiceItemSnapshot, "cost_price">,
  issuedDate: string | null | undefined,
): boolean {
  if (!issuedDate) return false;
  if (String(issuedDate).slice(0, 10) < SNAPSHOT_COST_TRUSTED_SINCE) return false;
  const cost = Number(item.cost_price ?? 0);
  return Number.isFinite(cost) && cost > 0;
}

/**
 * Look up the REAL (gross, cash-out) cost per part_code so the admin-only
 * "Cost / Marjă" columns reflect what the operator actually paid — for the
 * lines that DON'T already carry a trusted cost on the snapshot (see
 * `snapshotCostIsAuthoritative`): legacy documents, and lines typed by hand
 * without any cost.
 *
 * ALWAYS returns GROSS **MDL** (the app's canonical cost currency). The detail
 * views convert MDL → the document's currency for display; returning MDL here
 * keeps the two sources below on the same axis. Historically this returned the
 * purchase's NATIVE currency, so an MDL purchase shown on an EUR proforma was
 * mislabelled 20x (a 1200-EUR "-10000" phantom margin).
 *
 * Two sources, product cost wins:
 *  1. products.cost_price — the authoritative GROSS MDL cost the operator
 *     maintains (matched by normalized code via products.search_codes).
 *  2. Historical purchase_items — GROSS = unit_cost × (1 + vat/100), converted
 *     to MDL via the purchase's OWN currency/fx (newest row wins).
 *
 * Lookup is normalized — "317 330" matches "317330" / "317-330".
 */
export async function buildCostFallbackByCode(
  items: InvoiceItemSnapshot[],
  issuedDate?: string | null,
): Promise<Map<string, number>> {
  const wantedRaw: string[] = [];
  for (const it of items) {
    // A trusted stored cost is never looked up — the lookup is by CODE and
    // would happily return another purchase's (or another product's) cost.
    if (snapshotCostIsAuthoritative(it, issuedDate)) continue;
    const norm = normalizeCode(it.partCode ?? "");
    if (norm) wantedRaw.push(norm);
  }
  const wanted = new Set(wantedRaw);
  if (wanted.size === 0) return new Map();

  const supabase = await createClient();
  const result = new Map<string, number>();

  // Source 1 (preferred): the catalog product's own cost_price — authoritative
  // GROSS MDL. Matched by normalized code via the search_codes array.
  const { data: prods } = await supabase
    .from("products")
    .select("cost_price, search_codes")
    .overlaps("search_codes", wantedRaw)
    .limit(500);
  for (const p of (prods ?? []) as Array<{
    cost_price: number | string | null;
    search_codes: string[] | null;
  }>) {
    const cost = Number(p.cost_price ?? 0);
    if (cost <= 0) continue;
    for (const c of p.search_codes ?? []) {
      if (wanted.has(c) && !result.has(c)) result.set(c, cost);
    }
  }

  // Source 2 (fallback for codes with no catalog product): historical
  // purchase_items, GROSS and converted to MDL via the purchase's currency/fx.
  if (result.size < wanted.size) {
    const { data } = await supabase
      .from("purchase_items")
      .select("internal_code, supplier_code, unit_cost, vat_rate, purchase_id")
      .order("created_at", { ascending: false })
      .limit(2000);
    const rows = (data ?? []) as Array<{
      internal_code: string | null;
      supplier_code: string | null;
      unit_cost: number | string | null;
      vat_rate: number | string | null;
      purchase_id: string;
    }>;
    // Resolve each purchase's currency/fx with a separate IN-lookup (embedded
    // joins have returned empty rows in the panel session before).
    const purchaseIds = Array.from(
      new Set(rows.map((r) => r.purchase_id).filter(Boolean)),
    );
    const toMdlByPurchase = new Map<string, number>();
    if (purchaseIds.length > 0) {
      const { data: purs } = await supabase
        .from("purchases")
        .select("id, currency, fx_rate")
        .in("id", purchaseIds);
      for (const pu of (purs ?? []) as Array<{
        id: string;
        currency: string | null;
        fx_rate: number | string | null;
      }>) {
        const cur = (pu.currency ?? "MDL").toUpperCase();
        toMdlByPurchase.set(
          pu.id,
          cur === "MDL" ? 1 : Number(pu.fx_rate) || FX_TO_MDL[cur] || 1,
        );
      }
    }
    for (const row of rows) {
      const candidates = [
        normalizeCode(row.internal_code),
        normalizeCode(row.supplier_code),
      ].filter(Boolean);
      const toMdl = toMdlByPurchase.get(row.purchase_id) ?? 1;
      for (const c of candidates) {
        if (!wanted.has(c) || result.has(c)) continue;
        const net = Number(row.unit_cost ?? 0);
        if (net <= 0) continue;
        const vat = Number(row.vat_rate ?? 0);
        const grossMdl = Number((net * (1 + vat / 100) * toMdl).toFixed(2));
        result.set(c, grossMdl);
      }
      if (result.size === wanted.size) break;
    }
  }

  return result;
}

/**
 * Apply the gross-cost fallback to a snapshot array.
 *
 * A line whose stored cost is trusted (`snapshotCostIsAuthoritative`) keeps
 * it untouched — that is the cost of the purchase / product the operator
 * actually picked. Every other line takes the by-code fallback when one was
 * found (legacy NET snapshots, lines without a cost); lines with no match
 * keep their snapshot value (could be 0 / null).
 */
export function applyCostFallback(
  items: InvoiceItemSnapshot[],
  fallback: Map<string, number>,
  issuedDate?: string | null,
): InvoiceItemSnapshot[] {
  if (fallback.size === 0) return items;
  return items.map((it) => {
    if (snapshotCostIsAuthoritative(it, issuedDate)) return it;
    const norm = normalizeCode(it.partCode ?? "");
    const found = fallback.get(norm);
    if (found == null) return it;
    return { ...it, cost_price: found };
  });
}
