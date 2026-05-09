import { createClient } from "@/lib/supabase/server";

import type { Locale, Product, StockStatus } from "./types";
import { deriveStock, illustrationFor } from "./types";
import { demo } from "./demo-data";
import { USE_DEMO_DATA } from "./flags";
import { normalizeCode } from "@/lib/utils/normalize-code";
import { applyDiscount, getCurrentUserDiscount } from "./customer-discount";

type ProductRow = {
  id: string;
  slug: string | null;
  part_code: string | null;
  brand: string | null;
  price: number | null;
  stock_quantity: number | null;
  image_url: string | null;
  weight: number | null;
  width: number | null;
  height: number | null;
  warranty_months: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  category_id: string | null;
  name_ro: string | null;
  name_en: string | null;
  name_ru: string | null;
  description_ro: string | null;
  description_en: string | null;
  description_ru: string | null;
  is_promo: boolean | null;
  promo_price: number | null;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
};

export type ProductCrossRef = { brand: string; code: string };

export type ProductAlternativeCodes = {
  oemCodes: string[];
  crossReferences: ProductCrossRef[];
};

type CategorySlugRow = { id: string; slug: string | null };

const SELECT_COLUMNS = `
  id, slug, part_code, brand, price, stock_quantity, image_url,
  weight, width, height, warranty_months, is_featured, is_active, category_id,
  name_ro, name_en, name_ru, description_ro, description_en, description_ru,
  is_promo, promo_price, promo_starts_at, promo_ends_at
` as const;

function isPromoActive(row: ProductRow): boolean {
  if (!row.is_promo || row.promo_price == null) return false;
  const now = Date.now();
  const starts = row.promo_starts_at ? Date.parse(row.promo_starts_at) : null;
  const ends = row.promo_ends_at ? Date.parse(row.promo_ends_at) : null;
  if (starts != null && Number.isFinite(starts) && now < starts) return false;
  if (ends != null && Number.isFinite(ends) && now > ends) return false;
  return Number(row.promo_price) < Number(row.price ?? 0);
}

function pickLocalized(
  row: ProductRow,
  locale: Locale,
): { name: string; description: string | undefined } {
  const name =
    (locale === "ro" ? row.name_ro : locale === "en" ? row.name_en : row.name_ru) ??
    row.name_en ??
    row.name_ro ??
    row.slug ??
    row.id;
  const description =
    (locale === "ro"
      ? row.description_ro
      : locale === "en"
        ? row.description_en
        : row.description_ru) ??
    row.description_en ??
    row.description_ro ??
    undefined;
  return { name, description: description ?? undefined };
}

function toProduct(
  row: ProductRow,
  locale: Locale,
  categorySlugById: Map<string, string>,
  customerDiscount = 0,
): Product {
  const localized = pickLocalized(row, locale);
  const categorySlug = row.category_id ? categorySlugById.get(row.category_id) ?? "" : "";
  const rawListPrice = Number(row.price ?? 0);
  const promoActive = isPromoActive(row);
  const baseEffective = promoActive ? Number(row.promo_price ?? rawListPrice) : rawListPrice;
  // Per-customer discount is applied LAST, on top of the (already-promo'd) price.
  const finalPrice = applyDiscount(baseEffective, customerDiscount);
  const finalListPrice = applyDiscount(rawListPrice, customerDiscount);
  const finalPromoPrice = promoActive
    ? applyDiscount(Number(row.promo_price ?? 0), customerDiscount)
    : null;
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    partCode: row.part_code ?? "",
    brand: row.brand ?? "",
    name: localized.name,
    description: localized.description,
    price: finalPrice,
    listPrice: finalListPrice,
    promoPrice: finalPromoPrice,
    isPromo: promoActive,
    stock: deriveStock(row.stock_quantity),
    stockQuantity: row.stock_quantity ?? 0,
    categoryId: row.category_id,
    categorySlug,
    imageUrl: row.image_url,
    illustration: illustrationFor(categorySlug),
    weight: row.weight,
    width: row.width,
    height: row.height,
    warrantyMonths: row.warranty_months,
    isFeatured: !!row.is_featured,
  };
}

async function getCategorySlugMap(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug");
  const map = new Map<string, string>();
  for (const row of (data ?? []) as CategorySlugRow[]) {
    if (row.slug) map.set(row.id, row.slug);
  }
  return map;
}

async function getCategoryIdsBySlug(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();
  // Include descendants: fetch all active categories once, walk parent_id.
  const { data } = await supabase
    .from("categories")
    .select("id, slug, parent_id");
  const rows = data ?? [];
  const bySlug = new Map<string, { id: string; parent_id: string | null }>();
  const byParent = new Map<string | null, { id: string; slug: string | null }[]>();
  for (const r of rows) {
    if (r.slug) bySlug.set(r.slug, { id: r.id, parent_id: r.parent_id });
    const key = r.parent_id ?? null;
    const arr = byParent.get(key) ?? [];
    arr.push({ id: r.id, slug: r.slug });
    byParent.set(key, arr);
  }
  const result = new Set<string>();
  const stack: string[] = [];
  for (const s of slugs) {
    const root = bySlug.get(s);
    if (root) stack.push(root.id);
  }
  while (stack.length) {
    const id = stack.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    const children = byParent.get(id) ?? [];
    for (const c of children) stack.push(c.id);
  }
  return [...result];
}

export async function getFeaturedProducts(
  locale: Locale,
  limit = 8,
): Promise<Product[]> {
  if (USE_DEMO_DATA) return demo.products(locale, { featuredOnly: true, limit });
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as ProductRow[];
  if (rows.length === 0) return demo.products(locale, { featuredOnly: true, limit });

  const [slugMap, customerDiscount] = await Promise.all([
    getCategorySlugMap(),
    getCurrentUserDiscount(),
  ]);
  return rows.map((r) => toProduct(r, locale, slugMap, customerDiscount));
}

/**
 * Find ACTIVE products whose `search_codes` array overlaps with the target
 * product's — i.e. they share at least one normalized code (part_code, OEM,
 * cross-reference). The current product is excluded.
 *
 * Example: product X has cross-references [y, z]. Product Y has part_code = y.
 * X.search_codes ∩ Y.search_codes = {y} → Y appears on X's page, and X
 * appears on Y's page (it works in both directions, by design).
 */
/**
 * All products that are currently on promo (is_promo = true AND inside the
 * scheduled window if dates are set). Used by /promotions storefront page.
 */
export async function getActivePromotions(
  locale: Locale,
  limit = 60,
): Promise<Product[]> {
  if (USE_DEMO_DATA) return [];
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  // We pre-filter by is_promo=true on the DB, then re-check the date window in
  // toProduct() / isPromoActive() so any rendered card always shows a real
  // active promo.
  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("is_active", true)
    .eq("is_promo", true)
    .or(`promo_starts_at.is.null,promo_starts_at.lte.${nowIso}`)
    .or(`promo_ends_at.is.null,promo_ends_at.gte.${nowIso}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as ProductRow[];
  if (rows.length === 0) return [];
  const [slugMap, customerDiscount] = await Promise.all([
    getCategorySlugMap(),
    getCurrentUserDiscount(),
  ]);
  return rows
    .map((r) => toProduct(r, locale, slugMap, customerDiscount))
    .filter((p) => p.isPromo);
}

export async function getCrossCompatibleProducts(
  productId: string,
  locale: Locale,
  limit = 12,
): Promise<Product[]> {
  if (USE_DEMO_DATA) return [];
  const supabase = await createClient();

  const { data: own } = await supabase
    .from("products")
    .select("search_codes")
    .eq("id", productId)
    .maybeSingle();

  const codes = Array.isArray(own?.search_codes)
    ? (own.search_codes as string[]).filter((c) => c && c.length > 0)
    : [];
  if (codes.length === 0) return [];

  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("is_active", true)
    .neq("id", productId)
    .overlaps("search_codes", codes)
    .limit(limit);

  const rows = (data ?? []) as ProductRow[];
  if (rows.length === 0) return [];
  const [slugMap, customerDiscount] = await Promise.all([
    getCategorySlugMap(),
    getCurrentUserDiscount(),
  ]);
  return rows.map((r) => toProduct(r, locale, slugMap, customerDiscount));
}

export async function getProductAlternativeCodes(
  productId: string,
): Promise<ProductAlternativeCodes> {
  if (USE_DEMO_DATA) return { oemCodes: [], crossReferences: [] };
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("oem_codes, cross_references")
    .eq("id", productId)
    .maybeSingle();
  if (!data) return { oemCodes: [], crossReferences: [] };
  const rawCross = data.cross_references;
  const crossReferences = Array.isArray(rawCross)
    ? (rawCross as unknown[]).flatMap((r) => {
        if (!r || typeof r !== "object") return [];
        const o = r as { brand?: unknown; code?: unknown };
        if (typeof o.brand !== "string" || typeof o.code !== "string") return [];
        if (o.brand.trim().length === 0 || o.code.trim().length === 0) return [];
        return [{ brand: o.brand.trim(), code: o.code.trim() }];
      })
    : [];
  return {
    oemCodes: Array.isArray(data.oem_codes) ? data.oem_codes : [],
    crossReferences,
  };
}

export async function getProductBySlug(
  slug: string,
  locale: Locale,
): Promise<Product | null> {
  if (USE_DEMO_DATA) return demo.productBySlug(slug, locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  const row = data as ProductRow | null;
  if (!row) return demo.productBySlug(slug, locale);
  const [slugMap, customerDiscount] = await Promise.all([
    getCategorySlugMap(),
    getCurrentUserDiscount(),
  ]);
  return toProduct(row, locale, slugMap, customerDiscount);
}

export async function getRelatedProducts(
  product: Product,
  locale: Locale,
  limit = 4,
): Promise<Product[]> {
  if (USE_DEMO_DATA) {
    return demo
      .products(locale)
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, limit);
  }
  if (!product.categoryId) {
    // Demo/missing: return featured minus self
    const list = demo.products(locale).filter((p) => p.id !== product.id);
    return list.slice(0, limit);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("is_active", true)
    .eq("category_id", product.categoryId)
    .neq("id", product.id)
    .limit(limit);

  const rows = (data ?? []) as ProductRow[];
  if (rows.length === 0) {
    return demo
      .products(locale)
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, limit);
  }
  const [slugMap, customerDiscount] = await Promise.all([
    getCategorySlugMap(),
    getCurrentUserDiscount(),
  ]);
  return rows.map((r) => toProduct(r, locale, slugMap, customerDiscount));
}

export type CatalogFilters = {
  q?: string;
  categorySlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: "featured" | "name-asc" | "price-asc" | "price-desc" | "newest";
  page?: number;
  perPage?: number;
};

export type CatalogResult = {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function getCatalog(
  locale: Locale,
  filters: CatalogFilters = {},
): Promise<CatalogResult> {
  if (USE_DEMO_DATA) return fallbackCatalog(locale, filters);
  const {
    q,
    categorySlugs,
    minPrice,
    maxPrice,
    inStock,
    featured,
    sort = "featured",
    page = 1,
    perPage = 12,
  } = filters;

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(SELECT_COLUMNS, { count: "exact" })
    .eq("is_active", true);

  if (typeof minPrice === "number") query = query.gte("price", minPrice);
  if (typeof maxPrice === "number") query = query.lte("price", maxPrice);
  if (inStock) query = query.gt("stock_quantity", 0);
  if (featured) query = query.eq("is_featured", true);

  if (q && q.trim()) {
    const trimmed = q.trim();
    const term = `%${trimmed}%`;
    const normalized = normalizeCode(trimmed);

    // Run both lookups in parallel and union the IDs in TS. We avoid mixing
    // `.or(...)` with `id.in.(uuid)` because PostgREST chokes on nested parens
    // inside `or` — that combination quietly returns 0 rows.
    const [codeRowsRes, textRowsRes] = await Promise.all([
      normalized.length > 0
        ? supabase
            .from("products")
            .select("id")
            .eq("is_active", true)
            .contains("search_codes", [normalized])
            .limit(500)
        : Promise.resolve({ data: [] as { id: string }[] }),
      supabase
        .from("products")
        .select("id")
        .eq("is_active", true)
        .or(
          [
            `part_code.ilike.${term}`,
            `brand.ilike.${term}`,
            `name_ro.ilike.${term}`,
            `name_en.ilike.${term}`,
            `name_ru.ilike.${term}`,
          ].join(","),
        )
        .limit(500),
    ]);
    const codeIds = ((codeRowsRes.data ?? []) as { id: string }[]).map((r) => r.id);
    const textIds = ((textRowsRes.data ?? []) as { id: string }[]).map((r) => r.id);
    const matchedIds = Array.from(new Set([...codeIds, ...textIds]));

    if (matchedIds.length === 0) {
      // Nothing matched — short-circuit so we don't hit the demo fallback.
      return {
        products: [],
        total: 0,
        page,
        perPage,
        totalPages: 1,
      };
    }
    query = query.in("id", matchedIds);
  }

  if (categorySlugs && categorySlugs.length > 0) {
    const ids = await getCategoryIdsBySlug(categorySlugs);
    if (ids.length > 0) query = query.in("category_id", ids);
    else query = query.eq("category_id", "00000000-0000-0000-0000-000000000000"); // no-match
  }

  switch (sort) {
    case "name-asc":
      query = query.order(`name_${locale}` as "name_ro", { ascending: true });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "featured":
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    return fallbackCatalog(locale, filters);
  }

  const rows = (data ?? []) as ProductRow[];
  // Only fall back to demo data when the user has NO active filters AND the DB
  // is genuinely empty — never mask a legitimate "no results" answer.
  const hasFilters = !!(
    q ||
    (categorySlugs && categorySlugs.length > 0) ||
    minPrice != null ||
    maxPrice != null ||
    inStock ||
    featured
  );
  if (rows.length === 0 && (count ?? 0) === 0 && !hasFilters) {
    return fallbackCatalog(locale, filters);
  }

  const [slugMap, customerDiscount] = await Promise.all([
    getCategorySlugMap(),
    getCurrentUserDiscount(),
  ]);
  const products = rows.map((r) => toProduct(r, locale, slugMap, customerDiscount));
  const total = count ?? products.length;
  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

function fallbackCatalog(locale: Locale, filters: CatalogFilters): CatalogResult {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  let list = demo.products(locale);

  if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    list = list.filter((p) =>
      filters.categorySlugs!.includes(p.categorySlug),
    );
  }
  if (typeof filters.minPrice === "number")
    list = list.filter((p) => p.price >= filters.minPrice!);
  if (typeof filters.maxPrice === "number")
    list = list.filter((p) => p.price <= filters.maxPrice!);
  if (filters.inStock)
    list = list.filter((p) => p.stock !== "out_of_stock");
  if (filters.featured) list = list.filter((p) => p.isFeatured);
  if (filters.q && filters.q.trim()) {
    const term = normalize(filters.q);
    list = list.filter(
      (p) =>
        normalize(p.name).includes(term) ||
        normalize(p.partCode).includes(term) ||
        normalize(p.brand).includes(term),
    );
  }

  switch (filters.sort) {
    case "name-asc":
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "newest":
    case "featured":
    default:
      list = [...list].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
      );
  }

  const total = list.length;
  const from = (page - 1) * perPage;
  const products = list.slice(from, from + perPage);
  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)) ,
  };
}

function toStockStatus(n: number | null | undefined): StockStatus {
  return deriveStock(n);
}

export { toStockStatus };

/** Diacritic- and case-insensitive normalization for search matching. */
function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\s-]+/g, " ")
    .trim()
    .toLowerCase();
}
