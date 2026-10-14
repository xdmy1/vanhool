/**
 * Mirror of public.normalize_code(text) in sql/supabase-product-codes-migration.sql.
 * Uppercase + strip non-alphanumeric. Used at search-time so the term matches
 * against products.search_codes (which the trigger rebuilds on every write).
 */
export function normalizeCode(input: string | null | undefined): string {
  if (!input) return "";
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Some suppliers prefix a maker's numeric code with their own short tag
 * ("AS 0723003108" at Olmosdon for the STOCKER filter 0723003108). Normalized
 * as a whole the two never meet, so the post minted a twin product and the
 * stock was counted twice. When a code is a 1–3 letter tag followed by at
 * least 6 digits, return the digits — the resolvers try them as a last tier.
 */
export function supplierPrefixDigits(input: string | null | undefined): string | null {
  const m = /^[A-Za-z]{1,3}[\s.\-/]+(\d{6,})$/.exec((input ?? "").trim());
  return m ? m[1] : null;
}
