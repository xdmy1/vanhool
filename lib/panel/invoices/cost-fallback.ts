import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeCode } from "@/lib/utils/normalize-code";

import type { InvoiceItemSnapshot } from "./queries";

/**
 * Look up cost per part_code from historical purchase_items so the
 * admin-only "Cost / Marjă" columns on /panel/proforme/[id] +
 * /panel/facturi/[id] still show a number for snapshots that pre-date
 * the cost_price field on items_snapshot.
 *
 * Lookup is normalized — "317 330" on the snapshot matches
 * "317330" / "317 330" / "317-330" in any purchase_item field.
 * Uses the MOST RECENT (by purchase document_date) unit_cost when the
 * same code appears on multiple purchases.
 *
 * Returns a Map keyed by the normalized code. The page applies it
 * on render — items that already had cost_price on the snapshot are
 * untouched and keep their authoritative value.
 */
export async function buildCostFallbackByCode(
  items: InvoiceItemSnapshot[],
): Promise<Map<string, number>> {
  // Collect the codes we don't yet know the cost for.
  const wantedRaw: string[] = [];
  for (const it of items) {
    if (it.cost_price != null) continue;
    const code = it.partCode ?? "";
    const norm = normalizeCode(code);
    if (norm) wantedRaw.push(norm);
  }
  const wanted = new Set(wantedRaw);
  if (wanted.size === 0) return new Map();

  const supabase = await createClient();
  // Pull the latest 2000 purchase_items joined with their purchase date.
  // Filtering by normalized equality has to happen client-side because
  // Postgres ilike can't strip non-alphanumeric on a stored column without
  // an index/function we don't expose to PostgREST. 2000 rows is safe at
  // this shop's scale and one round trip serving the whole detail page.
  const { data } = await supabase
    .from("purchase_items")
    .select(
      "internal_code, supplier_code, unit_cost, purchases!inner(document_date)",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  // Build "newest first" map: first match wins because rows are ordered
  // by created_at desc. Even though created_at and document_date can drift,
  // the operator generally posts the purchase soon after entering it, so
  // created_at is a good-enough recency proxy here.
  const result = new Map<string, number>();
  for (const row of (data ?? []) as Array<{
    internal_code: string | null;
    supplier_code: string | null;
    unit_cost: number | string | null;
    purchases: { document_date: string | null } | null;
  }>) {
    const candidates = [
      normalizeCode(row.internal_code),
      normalizeCode(row.supplier_code),
    ].filter(Boolean);
    for (const c of candidates) {
      if (!wanted.has(c) || result.has(c)) continue;
      const cost = Number(row.unit_cost ?? 0);
      if (cost > 0) result.set(c, cost);
    }
    if (result.size === wanted.size) break;
  }
  return result;
}

/**
 * Convenience: apply the fallback map to a snapshot array, returning
 * a NEW array where missing cost_price values are filled in. The
 * original snapshot is left untouched so legacy data on disk doesn't
 * silently change shape.
 */
export function applyCostFallback(
  items: InvoiceItemSnapshot[],
  fallback: Map<string, number>,
): InvoiceItemSnapshot[] {
  if (fallback.size === 0) return items;
  return items.map((it) => {
    if (it.cost_price != null) return it;
    const norm = normalizeCode(it.partCode ?? "");
    const found = fallback.get(norm);
    if (found == null) return it;
    return { ...it, cost_price: found };
  });
}
