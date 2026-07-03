import "server-only";

import { verifyAdminPin } from "./admin-pin";

/**
 * Below-cost sell guard. A line that sells AT or BELOW its known cost
 * (sinecost) is a zero- or negative-margin sale and must be blocked unless the
 * operator supplies the admin PIN ("FORCE SELL"). Cost and sell are compared
 * GROSS (both are cash amounts in the sale currency) — same money model as the
 * rest of the app (products.cost_price is GROSS).
 *
 * Cost 0 / unknown => not blocked (we can't prove a loss on an unknown cost).
 */
export type BelowCostLine = { label: string; sell: number; cost: number };

/** True when this line sells at or under a *known* (>0) cost. */
export function isBelowCost(
  sellGross: number,
  costGross: number | null | undefined,
): boolean {
  return costGross != null && costGross > 0 && sellGross <= costGross;
}

/**
 * Given the below-cost lines a writer collected + the supplied force-sell PIN,
 * return the lines that STILL block. Empty array => allowed to proceed (either
 * nothing is below cost, or a valid PIN authorised the force-sell).
 */
export function blockedBelowCost(
  below: BelowCostLine[],
  forceSellPin: unknown,
): BelowCostLine[] {
  if (below.length === 0) return [];
  if (verifyAdminPin(forceSellPin)) return [];
  return below;
}
