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
