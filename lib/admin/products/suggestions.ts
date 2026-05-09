import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Returns a deduplicated list of brand strings used in existing products'
 * cross_references — surfaced to admin as autocomplete suggestions when
 * adding new equivalents.
 */
export async function adminListBrandSuggestions(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("brand, cross_references")
    .limit(500);
  const set = new Set<string>();
  for (const row of (data ?? []) as { brand: string | null; cross_references: unknown }[]) {
    if (row.brand && row.brand.trim().length > 0) set.add(row.brand.trim());
    if (Array.isArray(row.cross_references)) {
      for (const cr of row.cross_references) {
        if (
          cr &&
          typeof cr === "object" &&
          "brand" in cr &&
          typeof (cr as { brand: unknown }).brand === "string"
        ) {
          const b = (cr as { brand: string }).brand.trim();
          if (b.length > 0) set.add(b);
        }
      }
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
