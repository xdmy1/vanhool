import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeCode } from "@/lib/utils/normalize-code";

import type { InvoiceItemSnapshot } from "./queries";

/**
 * Look up the REAL (gross, cash-out) cost per part_code from
 * historical purchase_items so the admin-only "Cost / Marjă" columns
 * always reflect what the operator actually paid.
 *
 * IMPORTANT: returns GROSS = unit_cost × (1 + vat_rate / 100).
 * Operator's rule: "piesa cu TVA ne-a costat 1200 nu 1000". The
 * purchase line stores unit_cost as NET; we apply VAT here so margin
 * calculations downstream see the real cash figure.
 *
 * Lookup is normalized — "317 330" on the snapshot matches "317330"
 * / "317 330" / "317-330" in any purchase_item field. Uses the MOST
 * RECENT row (by created_at) when the same code appears on multiple
 * purchases.
 *
 * Always runs against EVERY snapshot item, not just the ones with a
 * null cost_price. Stored snapshot cost_price predates the gross
 * convention and would otherwise leak the old NET number into the
 * digital admin view; the fallback overrides it whenever a matching
 * purchase row exists.
 */
export async function buildCostFallbackByCode(
  items: InvoiceItemSnapshot[],
): Promise<Map<string, number>> {
  // Every item with a part_code is in scope — we want the fallback
  // to win over the (potentially stale / NET) snapshot value.
  const wantedRaw: string[] = [];
  for (const it of items) {
    const code = it.partCode ?? "";
    const norm = normalizeCode(code);
    if (norm) wantedRaw.push(norm);
  }
  const wanted = new Set(wantedRaw);
  if (wanted.size === 0) return new Map();

  const supabase = await createClient();
  // Pull the latest 2000 purchase_items. Filtering by normalized
  // equality has to happen client-side because Postgres ilike can't
  // strip non-alphanumeric on a stored column without an index /
  // function we don't expose to PostgREST. 2000 rows is safe at this
  // shop's scale.
  const { data } = await supabase
    .from("purchase_items")
    .select("internal_code, supplier_code, unit_cost, vat_rate")
    .order("created_at", { ascending: false })
    .limit(2000);

  // "Newest first" map — first match wins because rows are ordered
  // by created_at desc.
  const result = new Map<string, number>();
  for (const row of (data ?? []) as Array<{
    internal_code: string | null;
    supplier_code: string | null;
    unit_cost: number | string | null;
    vat_rate: number | string | null;
  }>) {
    const candidates = [
      normalizeCode(row.internal_code),
      normalizeCode(row.supplier_code),
    ].filter(Boolean);
    for (const c of candidates) {
      if (!wanted.has(c) || result.has(c)) continue;
      const net = Number(row.unit_cost ?? 0);
      if (net <= 0) continue;
      const vat = Number(row.vat_rate ?? 0);
      const gross = Number((net * (1 + vat / 100)).toFixed(2));
      result.set(c, gross);
    }
    if (result.size === wanted.size) break;
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
