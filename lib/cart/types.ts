import type { Product } from "@/lib/db/types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  partCode: string;
  price: number;
  oldPrice?: number;
  illustration: Product["illustration"];
  imageUrl: string | null;
  quantity: number;
  /** Stock cap snapshotted at add time so the UI can warn if it changes */
  maxStock: number;
};

export type Promo = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
};

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
};

export const CART_CONFIG = {
  shippingFee: 500,
  freeShippingThreshold: 4000,
  currency: "MDL" as const,
};
