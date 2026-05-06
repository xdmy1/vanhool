"use server";

import { createClient } from "@/lib/supabase/server";
import type { Promo } from "./types";

type PromoCheckResult =
  | { ok: true; promo: Promo }
  | { ok: false; reason: "invalid" | "min_order" | "expired" };

/**
 * Validate a promo code against the `promocodes` table without incrementing
 * usage. Usage is incremented only on successful order finalization.
 */
export async function applyPromoCode(
  code: string,
  subtotal: number,
): Promise<PromoCheckResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promocodes")
    .select("code, discount_type, discount_value, min_order_amount, max_uses, current_uses, is_active")
    .eq("code", code.toUpperCase().trim())
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "invalid" };
  if (!data.is_active) return { ok: false, reason: "invalid" };
  if (
    typeof data.max_uses === "number" &&
    typeof data.current_uses === "number" &&
    data.current_uses >= data.max_uses
  ) {
    return { ok: false, reason: "expired" };
  }
  if (
    typeof data.min_order_amount === "number" &&
    subtotal < data.min_order_amount
  ) {
    return { ok: false, reason: "min_order" };
  }

  return {
    ok: true,
    promo: {
      code: data.code,
      type: (data.discount_type as Promo["type"]) ?? "fixed",
      value: Number(data.discount_value ?? 0),
      minOrderAmount: data.min_order_amount ?? undefined,
    },
  };
}
