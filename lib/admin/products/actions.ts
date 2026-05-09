"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage } from "@/lib/admin/db-errors";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "not_authenticated" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const, error: "forbidden" };
  return { ok: true as const, supabase };
}

const crossRefSchema = z.object({
  brand: z.string().min(1).max(120),
  code: z.string().min(1).max(120),
});

export type CrossReference = z.infer<typeof crossRefSchema>;

const productSchema = z.object({
  partCode: z.string().max(120).optional().or(z.literal("")),
  brand: z.string().max(120).optional().or(z.literal("")),
  manufacturerId: z.string().uuid().nullable().optional(),
  slug: z.string().max(160).optional().or(z.literal("")),
  price: z.number().nonnegative().max(1_000_000),
  costPrice: z.number().nonnegative().max(1_000_000).nullable().optional(),
  stockQuantity: z.number().int().nonnegative(),
  storageLocation: z.string().max(120).optional().or(z.literal("")),
  condition: z.enum(["new", "refurbished", "used"]).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  subcategoryId: z.string().uuid().nullable().optional(),
  warrantyMonths: z.number().int().nonnegative().nullable().optional(),
  weight: z.number().nonnegative().nullable().optional(),
  width: z.number().nonnegative().nullable().optional(),
  height: z.number().nonnegative().nullable().optional(),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  nameRo: z.string().max(200).optional().or(z.literal("")),
  nameEn: z.string().max(200).optional().or(z.literal("")),
  nameRu: z.string().max(200).optional().or(z.literal("")),
  descriptionRo: z.string().max(4000).optional().or(z.literal("")),
  descriptionEn: z.string().max(4000).optional().or(z.literal("")),
  descriptionRu: z.string().max(4000).optional().or(z.literal("")),
  oemCodes: z.array(z.string().max(120)).max(100).optional(),
  crossReferences: z.array(crossRefSchema).max(100).optional(),
  vehicleMakeIds: z.array(z.string().uuid()).max(100).optional(),
  isPromo: z.boolean().optional(),
  promoPrice: z.number().nonnegative().max(1_000_000).nullable().optional(),
  promoStartsAt: z.string().nullable().optional(),
  promoEndsAt: z.string().nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; code: "validation" | "server" | "forbidden"; message?: string };

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function dedupCodes(arr: string[] | undefined): string[] {
  if (!arr) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of arr) {
    const v = raw.trim();
    if (!v) continue;
    const key = v.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function dedupCrossRefs(arr: CrossReference[] | undefined): CrossReference[] {
  if (!arr) return [];
  const seen = new Set<string>();
  const out: CrossReference[] = [];
  for (const item of arr) {
    const brand = item.brand.trim();
    const code = item.code.trim();
    if (!brand || !code) continue;
    const key = `${brand.toUpperCase()}::${code.toUpperCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ brand, code });
  }
  return out;
}

function buildPayload(values: ProductFormValues, manufacturerName: string | null) {
  const slugFromName = slugify(
    values.nameEn || values.nameRo || values.nameRu || values.partCode || "",
  );
  const slug =
    (values.slug || "").trim() ||
    slugFromName ||
    slugify(`product-${Date.now()}`);

  // Brand text mirrors manufacturer name when one is selected, so existing
  // search/display code keeps working without changes.
  const brand =
    manufacturerName?.trim() || values.brand?.trim() || null;

  return {
    part_code: values.partCode?.trim() || null,
    brand,
    manufacturer_id: values.manufacturerId ?? null,
    slug,
    price: values.price,
    cost_price: values.costPrice ?? null,
    stock_quantity: values.stockQuantity,
    storage_location: values.storageLocation?.trim() || null,
    condition: values.condition ?? "new",
    category_id: values.categoryId ?? null,
    subcategory_id: values.subcategoryId ?? null,
    warranty_months: values.warrantyMonths ?? 12,
    weight: values.weight ?? null,
    width: values.width ?? null,
    height: values.height ?? null,
    image_url: values.imageUrl?.trim() || null,
    is_active: values.isActive ?? true,
    is_featured: values.isFeatured ?? false,
    name_ro: values.nameRo?.trim() || null,
    name_en: values.nameEn?.trim() || null,
    name_ru: values.nameRu?.trim() || null,
    description_ro: values.descriptionRo?.trim() || null,
    description_en: values.descriptionEn?.trim() || null,
    description_ru: values.descriptionRu?.trim() || null,
    oem_codes: dedupCodes(values.oemCodes),
    cross_references: dedupCrossRefs(values.crossReferences) as never,
    is_promo: values.isPromo ?? false,
    promo_price:
      values.isPromo && values.promoPrice != null && values.promoPrice >= 0
        ? values.promoPrice
        : null,
    promo_starts_at: values.isPromo ? values.promoStartsAt ?? null : null,
    promo_ends_at: values.isPromo ? values.promoEndsAt ?? null : null,
  };
}

async function fetchManufacturerName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  manufacturerId: string | null | undefined,
): Promise<string | null> {
  if (!manufacturerId) return null;
  const { data } = await supabase
    .from("manufacturers")
    .select("name")
    .eq("id", manufacturerId)
    .maybeSingle();
  return data?.name ?? null;
}

async function syncVehicleMakes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  vehicleMakeIds: string[],
) {
  // Replace strategy: clear then insert. Simpler than diff for the volumes
  // we're dealing with (≤100 makes per product).
  await supabase.from("product_vehicle_makes").delete().eq("product_id", productId);
  if (vehicleMakeIds.length === 0) return;
  const dedup = Array.from(new Set(vehicleMakeIds));
  await supabase.from("product_vehicle_makes").insert(
    dedup.map((vehicle_make_id) => ({ product_id: productId, vehicle_make_id })),
  );
}

export async function createProduct(values: unknown): Promise<ProductActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const manufacturerName = await fetchManufacturerName(
    auth.supabase,
    parsed.data.manufacturerId,
  );
  const payload = buildPayload(parsed.data, manufacturerName);
  const { data, error } = await auth.supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
  await syncVehicleMakes(auth.supabase, data.id, parsed.data.vehicleMakeIds ?? []);
  revalidatePath("/", "layout");
  return { ok: true, id: data.id };
}

export async function updateProduct(
  id: string,
  values: unknown,
): Promise<ProductActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const manufacturerName = await fetchManufacturerName(
    auth.supabase,
    parsed.data.manufacturerId,
  );
  const payload = buildPayload(parsed.data, manufacturerName);
  const { error } = await auth.supabase
    .from("products")
    .update(payload)
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  await syncVehicleMakes(auth.supabase, id, parsed.data.vehicleMakeIds ?? []);
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean,
): Promise<ProductActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const { error } = await auth.supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function toggleProductFeatured(
  id: string,
  isFeatured: boolean,
): Promise<ProductActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const { error } = await auth.supabase
    .from("products")
    .update({ is_featured: isFeatured })
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}
