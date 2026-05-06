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

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const { error } = await auth.supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}
