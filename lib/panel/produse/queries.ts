import { createClient } from "@/lib/supabase/server";
import { normalizeCode } from "@/lib/utils/normalize-code";

export type PanelProductRow = {
  id: string;
  part_code: string | null;
  name_ro: string | null;
  name_en: string | null;
  brand: string | null;
  category_id: string | null;
  price: number | null;
  cost_price: number | null;
  margin_pct: number | null;
  stock_quantity: number | null;
  storage_location: string | null;
  is_active: boolean | null;
  supplier_code: string | null;
  supplier_id: string | null;
  created_at: string | null;
};

const PAGE_SIZE = 50;

export type ListPanelProductsArgs = {
  q?: string;
  status?: "all" | "active" | "inactive" | "low_stock";
  page?: number;
};

export async function listPanelProducts(args: ListPanelProductsArgs): Promise<{
  rows: PanelProductRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, args.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select(
      "id, part_code, name_ro, name_en, brand, category_id, price, cost_price, stock_quantity, storage_location, is_active, supplier_code, supplier_id, created_at, oem_codes, cross_references",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (args.q && args.q.trim()) {
    // Match the storefront / admin search: union of two passes so codes with
    // embedded spaces, dashes, or slashes ("HU 7010 Z") still match the
    // operator's normalized input ("HU7010Z") via products.search_codes — the
    // trigger keeps that array stripped of separators and uppercased.
    const trimmed = args.q.trim().replace(/[%_]/g, "");
    const term = `%${trimmed}%`;
    const normalized = normalizeCode(trimmed);

    const [codeRowsRes, textRowsRes] = await Promise.all([
      normalized.length > 0
        ? supabase
            .from("products")
            .select("id")
            .contains("search_codes", [normalized])
            .limit(500)
        : Promise.resolve({ data: [] as { id: string }[] }),
      supabase
        .from("products")
        .select("id")
        .or(
          [
            `part_code.ilike.${term}`,
            `brand.ilike.${term}`,
            `name_ro.ilike.${term}`,
            `name_en.ilike.${term}`,
            `supplier_code.ilike.${term}`,
          ].join(","),
        )
        .limit(500),
    ]);
    const codeIds = ((codeRowsRes.data ?? []) as { id: string }[]).map((r) => r.id);
    const textIds = ((textRowsRes.data ?? []) as { id: string }[]).map((r) => r.id);
    const matchedIds = Array.from(new Set([...codeIds, ...textIds]));

    if (matchedIds.length === 0) {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", matchedIds);
    }
  }

  switch (args.status) {
    case "active":
      query = query.eq("is_active", true);
      break;
    case "inactive":
      query = query.eq("is_active", false);
      break;
    case "low_stock":
      query = query.lte("stock_quantity", 5);
      break;
    default:
      break;
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows: PanelProductRow[] = (data ?? []).map((p) => {
    const cost = p.cost_price !== null ? Number(p.cost_price) : null;
    const price = p.price !== null ? Number(p.price) : null;
    const margin_pct =
      price !== null && cost !== null && price > 0
        ? Math.round(((price - cost) / price) * 1000) / 10
        : null;
    return {
      id: p.id,
      part_code: p.part_code,
      name_ro: p.name_ro,
      name_en: p.name_en,
      brand: p.brand,
      category_id: p.category_id,
      price,
      cost_price: cost,
      margin_pct,
      stock_quantity: p.stock_quantity,
      storage_location: p.storage_location,
      is_active: p.is_active,
      supplier_code: p.supplier_code,
      supplier_id: p.supplier_id,
      created_at: p.created_at,
    };
  });

  return { rows, total: count ?? rows.length, page, pageSize: PAGE_SIZE };
}

export type PanelProductDetail = {
  id: string;
  part_code: string | null;
  name_ro: string | null;
  name_en: string | null;
  name_ru: string | null;
  description_ro: string | null;
  brand: string | null;
  manufacturer_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  storage_location: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  supplier_code: string | null;
  supplier_id: string | null;
  oem_codes: string[] | null;
  cross_references: unknown;
  condition: "new" | "refurbished" | "used" | null;
  warranty_months: number | null;
};

export async function getPanelProduct(id: string): Promise<PanelProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, part_code, name_ro, name_en, name_ru, description_ro, brand, manufacturer_id, category_id, subcategory_id, price, cost_price, stock_quantity, storage_location, is_active, is_featured, supplier_code, supplier_id, oem_codes, cross_references, condition, warranty_months",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PanelProductDetail | null) ?? null;
}

export async function listSuppliersOptions(): Promise<
  Array<{ id: string; name: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return (data ?? []).map((s) => ({ id: s.id, name: s.name }));
}

export async function listCategoriesOptions(): Promise<
  Array<{ id: string; name: string; parent_id: string | null }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name_ro, name_en, parent_id, is_active")
    .order("sort_order");
  return (data ?? [])
    .filter((c) => c.is_active !== false)
    .map((c) => ({
      id: c.id,
      name: c.name_ro ?? c.name_en ?? c.id.slice(0, 6),
      parent_id: c.parent_id,
    }));
}

export async function listManufacturersOptions(): Promise<
  Array<{ id: string; name: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("manufacturers")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return (data ?? []).map((m) => ({ id: m.id, name: m.name }));
}
