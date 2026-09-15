/**
 * Purchase line money math — GROSS-anchored.
 *
 * Purchases store `unit_cost` as NET (2 dp) and derive the with-VAT figures as
 * `net × (1 + vat)`. The old code computed the line total as
 * `qty × unit_cost × (1 + vat)`, i.e. it re-derived the gross from a *rounded*
 * net, so a clean gross the operator typed was lost: entering "Cost cu TVA" 175
 * stored net 145.83, and 30 × 145.83 × 1.2 = 5249.88 instead of 30 × 175 = 5250.
 *
 * The line must instead be anchored on the gross UNIT the operator actually sees
 * and pays (the "Cost cu TVA" field = round(unit_cost × factor) = 175.00):
 *
 *   grossUnit = round(unit_cost × factor, 2)      // 145.83 → 175.00
 *   gross     = round(qty × grossUnit, 2)         // 30 × 175 = 5250.00
 *   net       = round(gross / factor, 2)          // 5250 / 1.2 = 4375.00
 *   vat       = gross − net                        // 875.00
 *
 * `net` is what we persist as `line_total` (everything downstream — the detail
 * page, PO, accountant email — treats line_total as NET and multiplies back by
 * (1 + vat) for the gross, which now yields exactly the gross the operator saw).
 * Subtotal / VAT / total are the per-line sums, so they reconcile to the cent.
 *
 * Pure module (no "use client"/"use server") so the form and the server action
 * share ONE definition and can never drift apart.
 */
export function purchaseLine(
  quantity: number,
  unitCostNet: number,
  vatRate: number,
): { grossUnit: number; gross: number; net: number; vat: number } {
  const factor = 1 + (vatRate || 0) / 100;
  const grossUnit = Number((unitCostNet * factor).toFixed(2));
  const gross = Number((quantity * grossUnit).toFixed(2));
  const net = Number((gross / factor).toFixed(2));
  const vat = Number((gross - net).toFixed(2));
  return { grossUnit, gross, net, vat };
}

/** Document totals from a set of purchase lines — reconciles to the cent. */
export function purchaseTotals(
  items: Array<{ quantity: number; unit_cost: number; vat_rate?: number | null }>,
): { subtotal: number; vat_amount: number; total: number } {
  let subtotal = 0;
  let vat_amount = 0;
  for (const i of items) {
    const a = purchaseLine(i.quantity, i.unit_cost, Number(i.vat_rate ?? 20));
    subtotal += a.net;
    vat_amount += a.vat;
  }
  subtotal = Number(subtotal.toFixed(2));
  vat_amount = Number(vat_amount.toFixed(2));
  return { subtotal, vat_amount, total: Number((subtotal + vat_amount).toFixed(2)) };
}

/**
 * Wrong-currency guard for purchase costs.
 *
 * The recurring mistake: a supplier invoice in EUR entered as MDL (or the
 * reverse), so a part the catalog knows at 6 100 MDL (305 EUR) comes in at
 * 305 MDL (≈15 EUR). Nothing else in the flow notices — the cost gets
 * overwritten, every later sale reads as 96% margin and the below-cost guard
 * lets anything through. A real cost never moves 4× between two purchases;
 * EUR↔MDL is 20×, USD↔MDL 17×, so the band catches every currency slip and
 * lets ordinary price changes pass. Shared by the form (inline warning) and
 * the server action (hard stop until confirmed) so both agree.
 */
export const COST_MISMATCH_FACTOR = 4;

export const DEFAULT_FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };

/** MDL per 1 unit of `currency`, honouring an explicit document fx_rate. */
export function purchaseFxToMdl(currency: string | null | undefined, fxRate: number | null | undefined): number {
  const cur = (currency ?? "MDL").toUpperCase();
  if (cur === "MDL") return 1;
  const explicit = Number(fxRate);
  return explicit > 0 ? explicit : DEFAULT_FX_TO_MDL[cur] ?? 1;
}

/**
 * GROSS MDL cost of one unit as typed on a purchase line — the same figure
 * postPurchase writes into products.cost_price.
 */
export function purchaseUnitCostMdl(
  unitCostNet: number,
  vatRate: number | null | undefined,
  currency: string | null | undefined,
  fxRate: number | null | undefined,
): number {
  return Number(
    (Number(unitCostNet) * (1 + Number(vatRate ?? 0) / 100) * purchaseFxToMdl(currency, fxRate)).toFixed(2),
  );
}

/**
 * How many times the new cost is off from the known one when it falls outside
 * the accepted band; null when the pair is fine (or either side is unknown).
 * Always ≥ COST_MISMATCH_FACTOR when returned, regardless of direction.
 */
export function costMismatchFactor(
  newCostMdl: number,
  knownCostMdl: number | null | undefined,
): number | null {
  const known = Number(knownCostMdl ?? 0);
  const next = Number(newCostMdl);
  if (!(known > 0) || !(next > 0)) return null;
  const factor = next >= known ? next / known : known / next;
  return factor >= COST_MISMATCH_FACTOR ? Number(factor.toFixed(1)) : null;
}
