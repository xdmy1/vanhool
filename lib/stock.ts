/**
 * Stock is stored as numeric(12,3) so divisible products (oil by the litre,
 * cable by the metre) keep 3 decimals. Read-modify-write stock updates in JS
 * accumulate float drift (199.5 - 0.1 = 199.39999999999998), so every stock
 * write goes through `roundStock` to snap back to 3 decimals before it hits
 * the DB. Keep this the single rounding rule for stock quantities.
 */
export function roundStock(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

/** Canonical units of measure a product can be stocked / sold in. */
export const PRODUCT_UNITS = [
  "buc",
  "litru",
  "ml",
  "kg",
  "gram",
  "metru",
  "set",
  "pereche",
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

/** Whole-number units (only "buc" today) force integer quantities; the rest
 *  allow fractional amounts down to the 0.001 step. */
export function isDivisibleUnit(unit: string | null | undefined): boolean {
  return (unit ?? "buc") !== "buc";
}

/** Minimum sellable step + input step for a unit. */
export function unitStep(unit: string | null | undefined): number {
  return isDivisibleUnit(unit) ? 0.001 : 1;
}
