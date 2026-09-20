/** Display number of a factură de retur: 12 → "RET-0012". */
export function formatReturnNumber(n: number | string): string {
  return `RET-${String(n).padStart(4, "0")}`;
}
