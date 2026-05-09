/**
 * Mirror of public.normalize_code(text) in supabase-product-codes-migration.sql.
 * Uppercase + strip non-alphanumeric. Used at search-time so the term matches
 * against products.search_codes (which the trigger rebuilds on every write).
 */
export function normalizeCode(input: string | null | undefined): string {
  if (!input) return "";
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
