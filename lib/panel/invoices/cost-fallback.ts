import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeCode } from "@/lib/utils/normalize-code";

import type { InvoiceItemSnapshot } from "./queries";

const FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };

/**
 * Look up the REAL (gross, cash-out) cost per part_code so the admin-only
 * "Cost / Marjă" columns reflect what the operator actually paid.
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
 * Runs against EVERY snapshot item so the digital admin view never leaks a
 * stale NET / wrong-currency number.
 */
export async function buildCostFallbackByCode(
  items: InvoiceItemSnapshot[],
): Promise<Map<string, number>> {
  const wantedRaw: string[] = [];
  for (const it of items) {
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
 * Apply the gross-cost fallback to a snapshot array. Fallback ALWAYS
 * wins when a matching part_code is found, because the snapshot's
 * stored cost_price may be from the older NET convention. Items
 * without a part_code or without a purchase match keep their
 * snapshot value (could be 0 / null).
 */
export function applyCostFallback(
  items: InvoiceItemSnapshot[],
  fallback: Map<string, number>,
): InvoiceItemSnapshot[] {
  if (fallback.size === 0) return items;
  return items.map((it) => {
    const norm = normalizeCode(it.partCode ?? "");
    const found = fallback.get(norm);
    if (found == null) return it;
    return { ...it, cost_price: found };
  });
}
