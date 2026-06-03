"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage } from "@/lib/admin/db-errors";
import { verifyAdminPin } from "@/lib/panel/admin-pin";

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

const customSpecSchema = z.object({
  labelRo: z.string().min(1).max(80),
  labelEn: z.string().max(80).optional().or(z.literal("")),
  labelRu: z.string().max(80).optional().or(z.literal("")),
  valueRo: z.string().min(1).max(200),
  valueEn: z.string().max(200).optional().or(z.literal("")),
  valueRu: z.string().max(200).optional().or(z.literal("")),
});

export type CustomSpec = z.infer<typeof customSpecSchema>;

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
  /** Available-on-order lead time in days. Null = sell only from stock.
   * Stored values in the UI are 0/2/5/7 (the four standard options). */
  leadTimeDays: z.number().int().nonnegative().nullable().optional(),
  weight: z.number().nonnegative().nullable().optional(),
  width: z.number().nonnegative().nullable().optional(),
  height: z.number().nonnegative().nullable().optional(),
  length: z.number().nonnegative().nullable().optional(),
  ribCount: z.number().int().nonnegative().nullable().optional(),
  customSpecs: z.array(customSpecSchema).max(30).optional(),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  images: z.array(z.string().url().max(500)).max(8).optional(),
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
  // Always pass user-supplied slugs through slugify so diacritics, spaces and
  // case don't slip through — Next's dynamic route matching gets confused by
  // raw UTF-8 in the URL path and falls through to 404.
  const userSlug = slugify((values.slug ?? "").trim());
  const slug =
    userSlug ||
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
    warranty_months: values.warrantyMonths ?? null,
    lead_time_days: values.leadTimeDays ?? null,
    weight: values.weight ?? null,
    width: values.width ?? null,
    height: values.height ?? null,
    length: values.length ?? null,
    rib_count: values.ribCount ?? null,
    custom_specs: ((values.customSpecs ?? [])
      .map((s) => {
        const labelRo = s.labelRo.trim();
        const valueRo = s.valueRo.trim();
        return {
          label_ro: labelRo,
          label_en: s.labelEn?.trim() || labelRo,
          label_ru: s.labelRu?.trim() || labelRo,
          value_ro: valueRo,
          value_en: s.valueEn?.trim() || valueRo,
          value_ru: s.valueRu?.trim() || valueRo,
        };
      })
      .filter((s) => s.label_ro.length > 0 && s.value_ro.length > 0)) as never,
    image_url:
      // Primary image: first of the gallery if set, else legacy single field.
      (values.images && values.images.length > 0 ? values.images[0] : null) ??
      (values.imageUrl?.trim() || null),
    images: (values.images ?? []) as never,
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

type AdminClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Reject part_code values that already belong to another product. Match is
 * case-insensitive against the literal stored value. `excludeId` lets
 * updateProduct keep its own row out of the search.
 */
async function findPartCodeOwner(
  supabase: AdminClient,
  partCode: string,
  excludeId?: string,
): Promise<{ id: string; part_code: string | null } | null> {
  const code = partCode.trim();
  if (!code) return null;
  // Escape ilike metachars — codes shouldn't contain %/_ but defend anyway.
  const escaped = code.replace(/[\\%_]/g, "\\$&");
  let q = supabase
    .from("products")
    .select("id, part_code")
    .ilike("part_code", escaped)
    .limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  return data?.[0] ?? null;
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
  if (parsed.data.partCode?.trim()) {
    const dup = await findPartCodeOwner(auth.supabase, parsed.data.partCode);
    if (dup) {
      return {
        ok: false,
        code: "validation",
        message: `Codul "${dup.part_code}" este deja folosit de un alt produs.`,
      };
    }
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
  if (parsed.data.partCode?.trim()) {
    const dup = await findPartCodeOwner(auth.supabase, parsed.data.partCode, id);
    if (dup) {
      return {
        ok: false,
        code: "validation",
        message: `Codul "${dup.part_code}" este deja folosit de un alt produs.`,
      };
    }
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

export async function deleteProduct(id: string, pin?: string): Promise<ProductActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!verifyAdminPin(pin)) return { ok: false, code: "validation", message: "bad_pin" };
  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

/** Wrapper with the same shape as PinDeleteButton expects. */
export async function deleteProductWithPin(
  id: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await deleteProduct(id, pin);
  if (res.ok) return { ok: true };
  if (res.message === "bad_pin") return { ok: false, reason: "bad_pin" };
  return { ok: false, reason: res.message ?? res.code };
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
