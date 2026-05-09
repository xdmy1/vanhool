"use server";

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

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
});

export type CreateVehicleMakeResult =
  | { ok: true; id: string; name: string; slug: string }
  | { ok: false; code: "validation" | "forbidden" | "server"; message?: string };

export async function createVehicleMake(
  values: unknown,
): Promise<CreateVehicleMakeResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = createSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const name = parsed.data.name.trim();

  // Return existing if name matches case-insensitively.
  const { data: existing } = await auth.supabase
    .from("vehicle_makes")
    .select("id, name, slug")
    .ilike("name", name)
    .maybeSingle();
  if (existing) {
    return { ok: true, id: existing.id, name: existing.name, slug: existing.slug };
  }

  let slug = slugify(name) || `vm-${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    const { data: bySlug } = await auth.supabase
      .from("vehicle_makes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!bySlug) break;
    slug = `${slugify(name)}-${i + 2}`;
  }

  const { data, error } = await auth.supabase
    .from("vehicle_makes")
    .insert({ name, slug, is_active: true })
    .select("id, name, slug")
    .single();

  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
  return { ok: true, id: data.id, name: data.name, slug: data.slug };
}
