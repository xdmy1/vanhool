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
 * just a name (+ optional parent), generates a slug, returns the row.
 * Returns existing id if the same slug already exists (idempotent).
 */
const quickSchema = z.object({
  name: z.string().min(1).max(200),
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
  const name = parsed.data.name.trim();
  const parentId = parsed.data.parentId ?? null;

  // If a row with this name already exists under the same parent, return it.
  let dupQuery = auth.supabase
    .from("categories")
    .select("id, slug, name_ro, parent_id")
    .ilike("name_ro", name);
  dupQuery = parentId ? dupQuery.eq("parent_id", parentId) : dupQuery.is("parent_id", null);
  const { data: existing } = await dupQuery.maybeSingle();
  if (existing) {
    return {
      ok: true,
      id: existing.id,
      name: existing.name_ro ?? name,
      slug: existing.slug ?? "",
      parentId: existing.parent_id,
    };
  }

  // Build a unique slug. Prefix with parent slug to avoid collisions.
  let parentSlug: string | null = null;
  if (parentId) {
    const { data: parent } = await auth.supabase
      .from("categories")
      .select("slug")
      .eq("id", parentId)
      .maybeSingle();
    parentSlug = parent?.slug ?? null;
  }
  let slug = (parentSlug ? `${parentSlug}-` : "") + (slugify(name) || `cat-${Date.now()}`);
  for (let i = 0; i < 5; i++) {
    const { data: bySlug } = await auth.supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!bySlug) break;
    slug = `${(parentSlug ? `${parentSlug}-` : "") + slugify(name)}-${i + 2}`;
  }

  const { data, error } = await auth.supabase
    .from("categories")
    .insert({
      slug,
      name_ro: name,
      name_en: name,
      name_ru: name,
      parent_id: parentId,
      is_active: true,
      sort_order: 999,
    })
    .select("id, slug, name_ro, parent_id")
    .single();

  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
  revalidatePath("/", "layout");
  return {
    ok: true,
    id: data.id,
    name: data.name_ro ?? name,
    slug: data.slug ?? slug,
    parentId: data.parent_id,
  };
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const { error } = await auth.supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}
