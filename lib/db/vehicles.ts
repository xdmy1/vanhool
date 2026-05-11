import { createClient } from "@/lib/supabase/server";

import type { Locale, Product } from "./types";
import { deriveStock, illustrationFor } from "./types";

export type VehicleMake = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  isPopular: boolean;
  modelCount?: number;
};

export type VehicleModel = {
  id: string;
  makeId: string;
  slug: string;
  name: string;
  yearFrom: number | null;
  yearTo: number | null;
  bodyType: string | null;
  imageUrl: string | null;
  typeCount?: number;
};

export type VehicleType = {
  id: string;
  modelId: string;
  slug: string;
  name: string;
  powerKw: number | null;
  powerHp: number | null;
  capacityCc: number | null;
  fuel: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  engineCode: string | null;
  drive: string | null;
};

export type VehicleBreadcrumb = {
  make: { slug: string; name: string };
  model: { slug: string; name: string };
  type?: { slug: string; name: string };
};

// =============================================================================
// MAKES
// =============================================================================

export type VehicleMakeForFilter = {
  slug: string;
  name: string;
  productCount: number;
};

/**
 * Vehicle makes for the catalog sidebar filter: only those that have at least
 * one active product linked via `product_vehicle_makes`. Sorted by name.
 */
export async function listVehicleMakesForFilter(): Promise<VehicleMakeForFilter[]> {
  const supabase = await createClient();

  const { data: makes } = await supabase
    .from("vehicle_makes")
    .select("id, slug, name")
    .eq("is_active", true);
  if (!makes || makes.length === 0) return [];

  // Count distinct active products per make. We fetch the link rows and the
  // set of active product ids, then intersect — keeps the query simple and
  // avoids needing a SQL view.
  const { data: links } = await supabase
    .from("product_vehicle_makes")
    .select("product_id, vehicle_make_id");
  if (!links || links.length === 0) return [];

  const productIds = Array.from(new Set(links.map((l) => l.product_id)));
  const activeIds = new Set<string>();
  for (let i = 0; i < productIds.length; i += 500) {
    const chunk = productIds.slice(i, i + 500);
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .in("id", chunk);
    for (const r of data ?? []) activeIds.add(r.id);
  }

  const counts = new Map<string, number>();
  const seen = new Set<string>(); // dedupe (product, make) just in case
  for (const l of links) {
    if (!activeIds.has(l.product_id)) continue;
    const key = `${l.product_id}|${l.vehicle_make_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(l.vehicle_make_id, (counts.get(l.vehicle_make_id) ?? 0) + 1);
  }

  return makes
    .map((m) => ({
      slug: m.slug,
      name: m.name,
      productCount: counts.get(m.id) ?? 0,
    }))
    .filter((m) => m.productCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Resolve a list of vehicle_make slugs to the product ids linked to ANY of
 * them. Used by the catalog filter. Returns an empty array if no slug
 * matches an active make, or no products are linked.
 */
export async function getProductIdsByVehicleMakeSlugs(
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();

  const { data: makes } = await supabase
    .from("vehicle_makes")
    .select("id")
    .in("slug", slugs)
    .eq("is_active", true);
  const makeIds = (makes ?? []).map((m) => m.id);
  if (makeIds.length === 0) return [];

  const { data: links } = await supabase
    .from("product_vehicle_makes")
    .select("product_id")
    .in("vehicle_make_id", makeIds);
  return Array.from(new Set((links ?? []).map((l) => l.product_id)));
}

export async function listMakes(): Promise<VehicleMake[]> {
  const supabase = await createClient();
  const { data: makes } = await supabase
    .from("vehicle_makes")
    .select("id, slug, name, logo_url, is_popular, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!makes || makes.length === 0) return [];

  const { data: modelRows } = await supabase
    .from("vehicle_models")
    .select("make_id")
    .eq("is_active", true);

  const counts = new Map<string, number>();
  for (const r of modelRows ?? []) {
    counts.set(r.make_id, (counts.get(r.make_id) ?? 0) + 1);
  }

  return makes.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    logoUrl: m.logo_url,
    isPopular: m.is_popular,
    modelCount: counts.get(m.id) ?? 0,
  }));
}

export async function getMakeBySlug(slug: string): Promise<VehicleMake | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_makes")
    .select("id, slug, name, logo_url, is_popular")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logoUrl: data.logo_url,
    isPopular: data.is_popular,
  };
}

// =============================================================================
// MODELS
// =============================================================================

export async function listModelsByMake(makeSlug: string): Promise<{
  make: VehicleMake;
  models: VehicleModel[];
} | null> {
  try {
    const make = await getMakeBySlug(makeSlug);
    if (!make) return null;

    const supabase = await createClient();
    const { data: models, error: modelsErr } = await supabase
      .from("vehicle_models")
      .select("id, make_id, slug, name, year_from, year_to, body_type, image_url")
      .eq("make_id", make.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (modelsErr) {
      console.error("[listModelsByMake] models query error:", modelsErr);
      return { make, models: [] };
    }
    if (!models || models.length === 0) {
      return { make, models: [] };
    }

    // Chunk IN() into batches of 100 so URL stays small.
    const counts = new Map<string, number>();
    const ids = models.map((m) => m.id);
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      const { data: typeRows, error: typesErr } = await supabase
        .from("vehicle_types")
        .select("model_id")
        .eq("is_active", true)
        .in("model_id", chunk);
      if (typesErr) {
        console.error("[listModelsByMake] types query error:", typesErr);
        continue;
      }
      for (const r of typeRows ?? []) {
        counts.set(r.model_id, (counts.get(r.model_id) ?? 0) + 1);
      }
    }

    return {
      make,
      models: models.map((m) => ({
        id: m.id,
        makeId: m.make_id,
        slug: m.slug,
        name: m.name,
        yearFrom: m.year_from,
        yearTo: m.year_to,
        bodyType: m.body_type,
        imageUrl: m.image_url,
        typeCount: counts.get(m.id) ?? 0,
      })),
    };
  } catch (e) {
    console.error("[listModelsByMake] unexpected error for slug=" + makeSlug, e);
    throw e;
  }
}

export async function getModelBySlug(
  makeSlug: string,
  modelSlug: string,
): Promise<{ make: VehicleMake; model: VehicleModel } | null> {
  const make = await getMakeBySlug(makeSlug);
  if (!make) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_models")
    .select("id, make_id, slug, name, year_from, year_to, body_type, image_url")
    .eq("make_id", make.id)
    .eq("slug", modelSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;
  return {
    make,
    model: {
      id: data.id,
      makeId: data.make_id,
      slug: data.slug,
      name: data.name,
      yearFrom: data.year_from,
      yearTo: data.year_to,
      bodyType: data.body_type,
      imageUrl: data.image_url,
    },
  };
}

// =============================================================================
// ENGINE TYPES
// =============================================================================

export async function listTypesByModel(
  makeSlug: string,
  modelSlug: string,
): Promise<{
  make: VehicleMake;
  model: VehicleModel;
  types: VehicleType[];
} | null> {
  const ctx = await getModelBySlug(makeSlug, modelSlug);
  if (!ctx) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_types")
    .select(
      "id, model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive",
    )
    .eq("model_id", ctx.model.id)
    .eq("is_active", true)
    .order("year_from", { ascending: true })
    .order("power_kw", { ascending: true });

  return {
    make: ctx.make,
    model: ctx.model,
    types: (data ?? []).map((t) => ({
      id: t.id,
      modelId: t.model_id,
      slug: t.slug,
      name: t.name,
      powerKw: t.power_kw,
      powerHp: t.power_hp,
      capacityCc: t.capacity_cc,
      fuel: t.fuel,
      yearFrom: t.year_from,
      yearTo: t.year_to,
      engineCode: t.engine_code,
      drive: t.drive,
    })),
  };
}

export async function getTypeBySlug(
  makeSlug: string,
  modelSlug: string,
  typeSlug: string,
): Promise<{
  make: VehicleMake;
  model: VehicleModel;
  type: VehicleType;
} | null> {
  const ctx = await getModelBySlug(makeSlug, modelSlug);
  if (!ctx) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_types")
    .select(
      "id, model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive",
    )
    .eq("model_id", ctx.model.id)
    .eq("slug", typeSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;
  return {
    make: ctx.make,
    model: ctx.model,
    type: {
      id: data.id,
      modelId: data.model_id,
      slug: data.slug,
      name: data.name,
      powerKw: data.power_kw,
      powerHp: data.power_hp,
      capacityCc: data.capacity_cc,
      fuel: data.fuel,
      yearFrom: data.year_from,
      yearTo: data.year_to,
      engineCode: data.engine_code,
      drive: data.drive,
    },
  };
}

// =============================================================================
// CATEGORIES & PARTS for a given engine type
// =============================================================================

export type CategoryForType = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
};

/**
 * Categories that have at least one product linked to the given engine type.
 * Names are localized via name_<locale>.
 */
export async function listCategoriesForType(
  typeId: string,
  locale: Locale,
): Promise<CategoryForType[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("vehicle_part_link")
    .select("product_id")
    .eq("vehicle_type_id", typeId);

  const productIds = (links ?? []).map((l) => l.product_id);
  if (productIds.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("id, category_id")
    .in("id", productIds)
    .eq("is_active", true);

  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    if (!p.category_id) continue;
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug, name_ro, name_en, name_ru, sort_order")
    .in("id", [...counts.keys()])
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (cats ?? []).map((c) => ({
    id: c.id,
    slug: c.slug ?? c.id,
    name:
      (locale === "ro"
        ? c.name_ro
        : locale === "en"
          ? c.name_en
          : c.name_ru) ??
      c.name_en ??
      c.name_ro ??
      c.slug ??
      "",
    productCount: counts.get(c.id) ?? 0,
  }));
}

/**
 * Products linked to the given engine type, optionally filtered by category slug.
 */
export async function listPartsForTypeAndCategory(
  typeId: string,
  categorySlug: string | null,
  locale: Locale,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("vehicle_part_link")
    .select("product_id")
    .eq("vehicle_type_id", typeId);

  const productIds = (links ?? []).map((l) => l.product_id);
  if (productIds.length === 0) return [];

  let query = supabase
    .from("products")
    .select(
      `
        id, slug, part_code, brand, price, stock_quantity, image_url,
        weight, width, height, warranty_months, is_featured, is_active, category_id,
        name_ro, name_en, name_ru, description_ro, description_en, description_ru
      `,
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();
    if (cat?.id) {
      query = query.eq("category_id", cat.id);
    } else {
      return [];
    }
  }

  const { data } = await query.order("is_featured", { ascending: false });
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: catRows } = await supabase.from("categories").select("id, slug");
  const slugById = new Map<string, string>();
  for (const c of catRows ?? []) {
    if (c.slug) slugById.set(c.id, c.slug);
  }

  return rows.map((r): Product => {
    const name =
      (locale === "ro"
        ? r.name_ro
        : locale === "en"
          ? r.name_en
          : r.name_ru) ??
      r.name_en ??
      r.name_ro ??
      r.slug ??
      r.id;
    const description =
      (locale === "ro"
        ? r.description_ro
        : locale === "en"
          ? r.description_en
          : r.description_ru) ??
      r.description_en ??
      r.description_ro ??
      undefined;
    const categorySlugLocal = r.category_id ? slugById.get(r.category_id) ?? "" : "";
    return {
      id: r.id,
      slug: r.slug ?? r.id,
      partCode: r.part_code ?? "",
      brand: r.brand ?? "",
      name,
      description: description ?? undefined,
      price: Number(r.price ?? 0),
      listPrice: Number(r.price ?? 0),
      promoPrice: null,
      isPromo: false,
      stock: deriveStock(r.stock_quantity),
      stockQuantity: r.stock_quantity ?? 0,
      categoryId: r.category_id,
      categorySlug: categorySlugLocal,
      imageUrl: r.image_url,
      images: r.image_url ? [r.image_url] : [],
      illustration: illustrationFor(categorySlugLocal),
      weight: r.weight,
      width: r.width,
      height: r.height,
      length: null,
      ribCount: null,
      warrantyMonths: r.warranty_months,
      isFeatured: !!r.is_featured,
    };
  });
}
