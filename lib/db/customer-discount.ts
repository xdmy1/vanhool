import { createClient } from "@/lib/supabase/server";

/**
 * Returns the per-customer discount percent for the currently authenticated
 * user (0 for guests, or when no discount is set). Cached at the request
 * level via React's `cache()` if needed; for now we read once per call.
 */
export async function getCurrentUserDiscount(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { data } = await supabase
      .from("profiles")
      .select("discount_percent")
      .eq("id", user.id)
      .maybeSingle();
    const pct = Number(data?.discount_percent ?? 0);
    if (!Number.isFinite(pct)) return 0;
    return Math.min(100, Math.max(0, pct));
  } catch {
    return 0;
  }
}

/**
 * Apply the discount to a price. Rounds to 2 decimals.
 * Discount of 0 → returns the price unchanged.
 */
export function applyDiscount(price: number, discountPercent: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  const pct = Math.min(100, Math.max(0, discountPercent || 0));
  if (pct === 0) return price;
  return Math.round(price * (1 - pct / 100) * 100) / 100;
}
