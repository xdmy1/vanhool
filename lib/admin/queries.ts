import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeCode } from "@/lib/utils/normalize-code";

export type AdminProductCrossRef = { brand: string; code: string };

export type AdminProductRow = {
  id: string;
  slug: string | null;
  part_code: string | null;
  brand: string | null;
  manufacturer_id: string | null;
  name_ro: string | null;
  name_en: string | null;
  name_ru: string | null;
  description_ro: string | null;
  description_en: string | null;
  description_ru: string | null;
  price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  storage_location: string | null;
  condition: "new" | "refurbished" | "used" | null;
  image_url: string | null;
  images: unknown;
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  rib_count: number | null;
  custom_specs: { label: string; value: string }[] | null;
  warranty_months: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  category_id: string | null;
  subcategory_id: string | null;
  oem_codes: string[] | null;
  cross_references: AdminProductCrossRef[] | null;
  is_promo: boolean | null;
  promo_price: number | null;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  created_at: string | null;
};

const PRODUCT_COLUMNS =
  "id, slug, part_code, brand, manufacturer_id, name_ro, name_en, name_ru, description_ro, description_en, description_ru, price, cost_price, stock_quantity, storage_location, condition, image_url, images, weight, width, height, length, rib_count, custom_specs, warranty_months, is_active, is_featured, category_id, subcategory_id, oem_codes, cross_references, is_promo, promo_price, promo_starts_at, promo_ends_at, created_at";

export type AdminProductFilter = {
  q?: string;
  status?: "all" | "active" | "inactive" | "featured" | "low_stock";
  page?: number;
  perPage?: number;
};

export async function adminListProducts(filter: AdminProductFilter = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS, { count: "exact" });

  switch (filter.status) {
    case "active":
      query = query.eq("is_active", true);
      break;
    case "inactive":
      query = query.eq("is_active", false);
      break;
    case "featured":
      query = query.eq("is_featured", true);
      break;
    case "low_stock":
      query = query.lte("stock_quantity", 5);
      break;
  }

  if (filter.q && filter.q.trim()) {
    const trimmed = filter.q.trim();
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
            `name_ru.ilike.${term}`,
            `slug.ilike.${term}`,
          ].join(","),
        )
        .limit(500),
    ]);
    const codeIds = ((codeRowsRes.data ?? []) as { id: string }[]).map((r) => r.id);
    const textIds = ((textRowsRes.data ?? []) as { id: string }[]).map((r) => r.id);
    const matchedIds = Array.from(new Set([...codeIds, ...textIds]));

    if (matchedIds.length === 0) {
      // Force no-match so the count is 0 and pagination works.
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", matchedIds);
    }
  }

  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? 25;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) {
    return { rows: [] as AdminProductRow[], total: 0, page, perPage };
  }
  return {
    rows: (data ?? []) as AdminProductRow[],
    total: count ?? 0,
    page,
    perPage,
  };
}

export async function adminGetProduct(id: string): Promise<AdminProductRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as AdminProductRow | null) ?? null;
}

export type AdminCategoryRow = {
  id: string;
  slug: string | null;
  name_ro: string | null;
  name_en: string | null;
  name_ru: string | null;
  parent_id: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export async function adminListCategories(): Promise<AdminCategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name_ro, name_en, name_ru, parent_id, sort_order, is_active")
    .order("sort_order", { ascending: true });
  return (data ?? []) as AdminCategoryRow[];
}

export async function adminGetCategory(
  id: string,
): Promise<AdminCategoryRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name_ro, name_en, name_ru, parent_id, sort_order, is_active")
    .eq("id", id)
    .maybeSingle();
  return (data as AdminCategoryRow | null) ?? null;
}

export async function adminCategoryProductCounts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("category_id");
  const out = new Map<string, number>();
  for (const row of (data ?? []) as { category_id: string | null }[]) {
    if (!row.category_id) continue;
    out.set(row.category_id, (out.get(row.category_id) ?? 0) + 1);
  }
  return out;
}

export type AdminOrderRow = {
  id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: unknown;
  subtotal: number | null;
  discount_amount: number | null;
  shipping_cost: number | null;
  total: number | null;
  status: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminOrderFilter = {
  q?: string;
  status?: "all" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  page?: number;
  perPage?: number;
};

const ORDER_COLUMNS =
  "id, user_id, customer_name, customer_email, customer_phone, customer_address, items, subtotal, discount_amount, shipping_cost, total, status, payment_method, notes, created_at, updated_at";

export async function adminListOrders(filter: AdminOrderFilter = {}) {
  const supabase = await createClient();
  let query = supabase.from("orders").select(ORDER_COLUMNS, { count: "exact" });

  if (filter.status && filter.status !== "all") {
    query = query.eq("status", filter.status);
  }
  if (filter.q && filter.q.trim()) {
    const term = `%${filter.q.trim()}%`;
    query = query.or(
      [
        `customer_name.ilike.${term}`,
        `customer_email.ilike.${term}`,
        `customer_phone.ilike.${term}`,
      ].join(","),
    );
  }

  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? 25;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count } = await query;
  return {
    rows: (data ?? []) as AdminOrderRow[],
    total: count ?? 0,
    page,
    perPage,
  };
}

export async function adminGetOrder(id: string): Promise<AdminOrderRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as AdminOrderRow | null) ?? null;
}

export type AdminPromoRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number | null;
  is_active: boolean | null;
  updated_at: string | null;
};

export async function adminListPromos(): Promise<AdminPromoRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promocodes")
    .select(
      "id, code, discount_type, discount_value, min_order_amount, max_uses, current_uses, is_active, updated_at",
    )
    .order("updated_at", { ascending: false });
  return (data ?? []) as AdminPromoRow[];
}

export async function adminGetPromo(id: string): Promise<AdminPromoRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promocodes")
    .select(
      "id, code, discount_type, discount_value, min_order_amount, max_uses, current_uses, is_active, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as AdminPromoRow | null) ?? null;
}

export type AdminMessageRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  topic: string | null;
  status: string | null;
  created_at: string | null;
};

export async function adminListMessages(
  status?: "all" | "new" | "reading" | "replied" | "archived",
): Promise<AdminMessageRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("contact_messages")
    .select(
      "id, user_id, name, email, phone, subject, message, topic, status, created_at",
    );
  if (status && status !== "all") query = query.eq("status", status);
  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []) as AdminMessageRow[];
}

export type AdminCustomerRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean | null;
  discount_percent: number | null;
  created_at: string | null;
  orders_count: number;
  orders_total: number;
};

export async function adminListCustomers(q?: string): Promise<AdminCustomerRow[]> {
  const supabase = await createClient();
  let pq = supabase
    .from("profiles")
    .select("id, email, full_name, phone, is_admin, discount_percent, created_at");
  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    pq = pq.or(`email.ilike.${term},full_name.ilike.${term}`);
  }
  const { data: profiles } = await pq.order("created_at", { ascending: false });

  const profileRows = (profiles ?? []) as {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    is_admin: boolean | null;
    discount_percent: number | null;
    created_at: string | null;
  }[];

  // Aggregate per-user totals from orders
  const { data: orderData } = await supabase
    .from("orders")
    .select("user_id, total");
  const counts = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const row of (orderData ?? []) as { user_id: string | null; total: number | null }[]) {
    if (!row.user_id) continue;
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + Number(row.total ?? 0));
  }

  return profileRows.map((p) => ({
    ...p,
    orders_count: counts.get(p.id) ?? 0,
    orders_total: totals.get(p.id) ?? 0,
  }));
}

export type OverviewStats = {
  ordersTotal: number;
  ordersPending: number;
  revenueLast30: number;
  revenueTotal: number;
  lowStockCount: number;
  newMessages: number;
  productsActive: number;
  customersCount: number;
  recentOrders: AdminOrderRow[];
  recentMessages: AdminMessageRow[];
  lowStockProducts: AdminProductRow[];
};

export async function adminOverviewStats(): Promise<OverviewStats> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    ordersTotalRes,
    ordersPendingRes,
    productsActiveRes,
    newMessagesRes,
    lowStockCountRes,
    customersRes,
    revenueAllRes,
    revenue30Res,
    recentOrdersRes,
    recentMessagesRes,
    lowStockListRes,
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .lte("stock_quantity", 5)
      .eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total"),
    supabase.from("orders").select("total").gte("created_at", since),
    supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_messages")
      .select(
        "id, user_id, name, email, phone, subject, message, topic, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .lte("stock_quantity", 5)
      .eq("is_active", true)
      .order("stock_quantity", { ascending: true })
      .limit(5),
  ]);

  const sumTotals = (rows: { total: number | null }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + Number(r.total ?? 0), 0);

  return {
    ordersTotal: ordersTotalRes.count ?? 0,
    ordersPending: ordersPendingRes.count ?? 0,
    productsActive: productsActiveRes.count ?? 0,
    newMessages: newMessagesRes.count ?? 0,
    lowStockCount: lowStockCountRes.count ?? 0,
    customersCount: customersRes.count ?? 0,
    revenueTotal: sumTotals(revenueAllRes.data as { total: number | null }[] | null),
    revenueLast30: sumTotals(revenue30Res.data as { total: number | null }[] | null),
    recentOrders: (recentOrdersRes.data ?? []) as AdminOrderRow[],
    recentMessages: (recentMessagesRes.data ?? []) as AdminMessageRow[],
    lowStockProducts: (lowStockListRes.data ?? []) as AdminProductRow[],
  };
}
