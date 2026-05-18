import type { Database } from "@/lib/supabase/database.types";

export type Locale = "ro" | "en" | "ru";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "on_order";

export type PartIllustration =
  | "brake" | "engine" | "chassis" | "electro" | "air" | "body"
  | "clutch" | "steering" | "cooling" | "interior" | "hoses"
  | "couplings" | "filter" | "sensor" | "pump";

/** Shape used by UI components (ProductCard, catalog grid, etc.) */
export type Product = {
  id: string;
  slug: string;
  partCode: string;
  brand: string;
  name: string;
  description?: string;
  /** Effective price shown to the user. Equal to promoPrice when promo is
   * active, else listPrice. */
  price: number;
  /** List/regular price. When promo is active, used as crossed-out reference. */
  listPrice: number;
  /** Active promo price (overrides listPrice for display). */
  promoPrice?: number | null;
  /** Whether the user is seeing a promo price (drives badges + strikethrough). */
  isPromo: boolean;
  oldPrice?: number;
  stock: StockStatus;
  stockQuantity: number;
  /** Number of days until shipment when stock is 0. `null` means the product
   * is NOT available on order — out-of-stock means unbuyable. */
  leadTimeDays?: number | null;
  categoryId: string | null;
  categorySlug: string;
  imageUrl: string | null;
  /** All gallery images (admin-uploaded). The primary one is `imageUrl`. */
  images: string[];
  illustration: PartIllustration;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
  ribCount?: number | null;
  /** Free-form spec rows: admin chooses label + value. Empty if none. */
  customSpecs?: { label: string; value: string }[];
  warrantyMonths?: number | null;
  isFeatured: boolean;
};

/** Shape used by UI category tiles / filter trees */
export type Category = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  productCount: number;
  /** Icon key that maps to a lucide-react icon in UI */
  iconKey: PartIllustration | "brakes" | "engine" | "chassis" | "electro" | "air" | "clutch" | "steering" | "cooling" | "body" | "interior" | "hoses" | "couplings";
  /** Optional banner image URL (set per root category from admin / seed). */
  imageUrl?: string | null;
};

/** Name aliases per locale — used to select the right DB column */
export function nameCol(locale: Locale) {
  return `name_${locale}` as const;
}
export function descCol(locale: Locale) {
  return `description_${locale}` as const;
}

/**
 * Derive UI stock status from the integer stock_quantity.
 *
 * When `leadTimeDays` is non-null, the product is sellable past stock=0:
 * "out_of_stock" is upgraded to "on_order" so the storefront shows the
 * lead-time badge and the cart accepts the add.
 */
export function deriveStock(
  qty: number | null | undefined,
  leadTimeDays?: number | null,
): StockStatus {
  const n = qty ?? 0;
  if (n <= 0) {
    return leadTimeDays != null ? "on_order" : "out_of_stock";
  }
  if (n < 5) return "low_stock";
  return "in_stock";
}

/** Heuristic: map category slug to an illustration / icon key */
export function illustrationFor(slug: string): PartIllustration {
  const s = slug.toLowerCase();
  if (s.includes("brake")) return "brake";
  if (s.includes("engine") || s.includes("motor")) return "engine";
  if (s.includes("chassis") || s.includes("suspen")) return "chassis";
  if (s.includes("electro") || s.includes("electric")) return "electro";
  if (s.includes("air") && s.includes("coupl")) return "couplings";
  if (s.includes("air") || s.includes("pneumatic") || s.includes("pressure")) return "air";
  if (s.includes("clutch") || s.includes("gearbox") || s.includes("transmis")) return "clutch";
  if (s.includes("steering") || s.includes("axle")) return "steering";
  if (s.includes("cooling") || s.includes("climate") || s.includes("heating")) return "cooling";
  if (s.includes("body")) return "body";
  if (s.includes("interior")) return "interior";
  if (s.includes("hose") || s.includes("silicon")) return "hoses";
  if (s.includes("filter")) return "filter";
  if (s.includes("sensor")) return "sensor";
  if (s.includes("pump")) return "pump";
  return "engine";
}
