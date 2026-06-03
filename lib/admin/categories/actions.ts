"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage } from "@/lib/admin/db-errors";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import { translateToAll, type TranslateLocale } from "@/lib/translation/translate";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const };
  return { ok: true as const, supabase };
}

const categorySchema = z.object({
  slug: z.string().min(1).max(120),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
  nameRo: z.string().max(200).optional().or(z.literal("")),
  nameEn: z.string().max(200).optional().or(z.literal("")),
  nameRu: z.string().max(200).optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export type CategoryActionResult =
  | { ok: true; id: string }
  | { ok: false; code: "validation" | "server" | "forbidden"; message?: string };

function buildPayload(values: CategoryFormValues) {
  return {
    slug: values.slug.trim().toLowerCase(),
    parent_id: values.parentId ?? null,
    sort_order: values.sortOrder ?? 0,
    is_active: values.isActive ?? true,
    name_ro: values.nameRo?.trim() || null,
    name_en: values.nameEn?.trim() || null,
    name_ru: values.nameRu?.trim() || null,
  };
}

export async function createCategory(values: unknown): Promise<CategoryActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const { data, error } = await auth.supabase
    .from("categories")
    .insert(buildPayload(parsed.data))
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
  revalidatePath("/", "layout");
  return { ok: true, id: data.id };
}

export async function updateCategory(
  id: string,
  values: unknown,
): Promise<CategoryActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const { error } = await auth.supabase
    .from("categories")
    .update(buildPayload(parsed.data))
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

/**
 * Quick-create used by the inline "+ add" button on the ProductForm. Takes
 * the name in ONE language (whatever the admin is currently on) + optional
 * parent. The server auto-translates into the other 2 locales so a single
 * row holds name_ro / name_en / name_ru — there's never more than 1 row per
 * category, the storefront just picks the locale-specific column.
 *
 * Idempotent: returns existing id if a row with the same source-locale name
 * already exists under the same parent.
 */
const quickSchema = z.object({
  name: z.string().min(1).max(200),
  sourceLocale: z.enum(["ro", "en", "ru"]),
  parentId: z.string().uuid().nullable().optional(),
});

export type QuickCreateCategoryResult =
  | { ok: true; id: string; name: string; slug: string; parentId: string | null }
  | {
      ok: false;
      code: "validation" | "forbidden" | "server";
      message?: string;
    };

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function quickCreateCategory(
  values: unknown,
): Promise<QuickCreateCategoryResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = quickSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const source = parsed.data.sourceLocale as TranslateLocale;
  const sourceName = parsed.data.name.trim();
  const parentId = parsed.data.parentId ?? null;

  // Auto-translate to the other 2 locales. If translation fails (network /
  // quota), fall back to the source name in every column so the row is still
  // usable — admin can edit later.
  const translated = await translateToAll(sourceName, source).catch(
    () => ({}) as Awaited<ReturnType<typeof translateToAll>>,
  );
  const names: Record<TranslateLocale, string> = {
    ro: source === "ro" ? sourceName : (translated.ro?.trim() || sourceName),
    en: source === "en" ? sourceName : (translated.en?.trim() || sourceName),
    ru: source === "ru" ? sourceName : (translated.ru?.trim() || sourceName),
  };

  // Idempotency check: if a row with the same name in the source column
  // already exists under the same parent, return it (no duplicate insert).
  const sourceColumn = `name_${source}` as const;
  let dupQuery = auth.supabase
    .from("categories")
    .select("id, slug, name_ro, name_en, name_ru, parent_id")
    .ilike(sourceColumn, sourceName);
  dupQuery = parentId
    ? dupQuery.eq("parent_id", parentId)
    : dupQuery.is("parent_id", null);
  const { data: existing } = await dupQuery.maybeSingle();
  if (existing) {
    return {
      ok: true,
      id: existing.id,
      name:
        existing[`name_${source}` as const] ??
        existing.name_ro ??
        sourceName,
      slug: existing.slug ?? "",
      parentId: existing.parent_id,
    };
  }

  // Slug is always derived from the source name. Prefix with parent slug
  // to avoid collisions between similarly-named subcategories.
  let parentSlug: string | null = null;
  if (parentId) {
    const { data: parent } = await auth.supabase
      .from("categories")
      .select("slug")
      .eq("id", parentId)
      .maybeSingle();
    parentSlug = parent?.slug ?? null;
  }
  let slug =
    (parentSlug ? `${parentSlug}-` : "") +
    (slugify(sourceName) || `cat-${Date.now()}`);
  for (let i = 0; i < 5; i++) {
    const { data: bySlug } = await auth.supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!bySlug) break;
    slug = `${(parentSlug ? `${parentSlug}-` : "") + slugify(sourceName)}-${i + 2}`;
  }

  const { data, error } = await auth.supabase
    .from("categories")
    .insert({
      slug,
      name_ro: names.ro,
      name_en: names.en,
      name_ru: names.ru,
      parent_id: parentId,
      is_active: true,
      sort_order: 999,
    })
    .select("id, slug, name_ro, name_en, name_ru, parent_id")
    .single();

  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
  revalidatePath("/", "layout");
  return {
    ok: true,
    id: data.id,
    name:
      data[`name_${source}` as const] ?? data.name_ro ?? sourceName,
    slug: data.slug ?? slug,
    parentId: data.parent_id,
  };
}

export async function deleteCategory(id: string, pin?: string): Promise<CategoryActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!verifyAdminPin(pin)) return { ok: false, code: "validation", message: "bad_pin" };
  const { error } = await auth.supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteCategoryWithPin(
  id: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await deleteCategory(id, pin);
  if (res.ok) return { ok: true };
  if (res.message === "bad_pin") return { ok: false, reason: "bad_pin" };
  return { ok: false, reason: res.message ?? res.code };
}
