import { createClient } from "@/lib/supabase/server";

import type { Locale, Product, StockStatus } from "./types";
import { deriveStock, illustrationFor } from "./types";
import { demo } from "./demo-data";
import { USE_DEMO_DATA } from "./flags";

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
};

type CategorySlugRow = { id: string; slug: string | null };

const SELECT_COLUMNS = `
  id, slug, part_code, brand, price, stock_quantity, image_url,
  weight, width, height, warranty_months, is_featured, is_active, category_id,
  name_ro, name_en, name_ru, description_ro, description_en, description_ru
` as const;

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
): Product {
  const localized = pickLocalized(row, locale);
  const categorySlug = row.category_id ? categorySlugById.get(row.category_id) ?? "" : "";
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    partCode: row.part_code ?? "",
    brand: row.brand ?? "",
    name: localized.name,
    description: localized.description,
    price: Number(row.price ?? 0),
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

  const slugMap = await getCategorySlugMap();
  return rows.map((r) => toProduct(r, locale, slugMap));
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
  const slugMap = await getCategorySlugMap();
  return toProduct(row, locale, slugMap);
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
  const slugMap = await getCategorySlugMap();
  return rows.map((r) => toProduct(r, locale, slugMap));
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
    const term = `%${q.trim()}%`;
    query = query.or(
      [
        `part_code.ilike.${term}`,
        `brand.ilike.${term}`,
        `name_ro.ilike.${term}`,
        `name_en.ilike.${term}`,
        `name_ru.ilike.${term}`,
      ].join(","),
    );
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
  if (rows.length === 0 && (count ?? 0) === 0) {
    return fallbackCatalog(locale, filters);
  }

  const slugMap = await getCategorySlugMap();
  const products = rows.map((r) => toProduct(r, locale, slugMap));
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
