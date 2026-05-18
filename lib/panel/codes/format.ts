/**
 * Apply the configured template, substituting:
 *   {seq:N}    → seq zero-padded to N digits (N defaults to 7 if omitted)
 *   {letter}   → current letter (A/B/C/...)
 *   {category} → first 2 chars of categorySlug (uppercase), or 'XX' if missing
 *
 * Plain function (no `use server`) so the settings page can show a live
 * preview as the admin types without a round-trip.
 */
export function formatInternalCode(
  template: string,
  seq: number,
  letter: string,
  categorySlug?: string,
): string {
  const cat = (categorySlug ?? "").slice(0, 2).toUpperCase().padEnd(2, "X");
  return template
    .replace(/\{seq(?::(\d+))?\}/g, (_, w?: string) => {
      const width = w ? Math.max(1, parseInt(w, 10)) : 7;
      return String(seq).padStart(width, "0");
    })
    .replace(/\{letter\}/g, letter || "A")
    .replace(/\{category\}/g, cat);
}
