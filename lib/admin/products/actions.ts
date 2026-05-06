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

const productSchema = z.object({
  partCode: z.string().max(120).optional().or(z.literal("")),
  brand: z.string().max(120).optional().or(z.literal("")),
  slug: z.string().max(160).optional().or(z.literal("")),
  price: z.number().nonnegative().max(1_000_000),
  stockQuantity: z.number().int().nonnegative(),
  categoryId: z.string().uuid().nullable().optional(),
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

function buildPayload(values: ProductFormValues) {
  const slugFromName = slugify(
    values.nameEn || values.nameRo || values.nameRu || values.partCode || "",
  );
  const slug =
    (values.slug || "").trim() ||
    slugFromName ||
    slugify(`product-${Date.now()}`);
  return {
    part_code: values.partCode?.trim() || null,
    brand: values.brand?.trim() || null,
    slug,
    price: values.price,
    stock_quantity: values.stockQuantity,
    category_id: values.categoryId ?? null,
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
  };
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
  const payload = buildPayload(parsed.data);
  const { data, error } = await auth.supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
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
  const payload = buildPayload(parsed.data);
  const { error } = await auth.supabase
    .from("products")
    .update(payload)
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
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
