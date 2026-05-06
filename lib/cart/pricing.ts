import type { CartItem, Promo, Totals } from "./types";
import { CART_CONFIG } from "./types";

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.price * i.quantity, 0);
}

export function calcItemCount(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function calcDiscount(subtotal: number, promo: Promo | null): number {
  if (!promo) return 0;
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) return 0;
  if (promo.type === "percentage") {
    return Math.min(subtotal, (subtotal * promo.value) / 100);
  }
  return Math.min(subtotal, promo.value);
}

export function calcShipping(subtotalAfterDiscount: number, hasItems: boolean): number {
  if (!hasItems) return 0;
  if (subtotalAfterDiscount >= CART_CONFIG.freeShippingThreshold) return 0;
  return CART_CONFIG.shippingFee;
}

export function calcTotals(items: CartItem[], promo: Promo | null): Totals {
  const subtotal = calcSubtotal(items);
  const itemCount = calcItemCount(items);
  const discount = calcDiscount(subtotal, promo);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = calcShipping(afterDiscount, items.length > 0);
  const total = afterDiscount + shipping;
  return { subtotal, discount, shipping, total, itemCount };
}

/** EUR formatter that keeps cents in a smaller font; for plain text use this. */
export function formatPrice(value: number, locale = "ro"): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale === "en" ? "en-EU" : "ro-RO", {
    style: "currency",
    currency: CART_CONFIG.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
