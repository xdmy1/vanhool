"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ApifyError } from "@/lib/apify/client";
import { isApifyConfigured } from "@/lib/apify/config";
import { lookupByPartCode, type TecdocPart } from "@/lib/apify/tecdoc";
import type { Json } from "@/lib/supabase/database.types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, code: "forbidden" as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const, code: "forbidden" as const };
  return { ok: true as const, supabase };
}

export type TecdocLookupActionResult =
  | {
      ok: true;
      source: "apify" | "cache";
      fetchedAt: string;
      parts: TecdocPart[];
      meta: { runId: string | null; computeUnits: number | null; actorId: string };
    }
  | {
      ok: false;
      code: "not_configured" | "forbidden" | "no_results" | "remote_error" | "validation";
      message?: string;
    };

export async function lookupTecdocByPartCode(
  partCode: string,
  options: { fresh?: boolean } = {},
): Promise<TecdocLookupActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!isApifyConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message:
        "APIFY_TOKEN sau APIFY_TECDOC_ACTOR_ID nu sunt setate în .env.local",
    };
  }
  const code = (partCode ?? "").trim();
  if (!code || code.length < 2) {
    return { ok: false, code: "validation", message: "Cod prea scurt" };
  }
  try {
    const res = await lookupByPartCode(code, { fresh: options.fresh });
    if (res.parts.length === 0) {
      return { ok: false, code: "no_results", message: `Niciun rezultat pentru ${code}` };
    }
    return {
      ok: true,
      source: res.source,
      fetchedAt: res.fetchedAt,
      parts: res.parts,
      meta: res.meta,
    };
  } catch (e) {
    if (e instanceof ApifyError) {
      return {
        ok: false,
        code: "remote_error",
        message: `Apify ${e.status}: ${e.message}`,
      };
    }
    return {
      ok: false,
      code: "remote_error",
      message: e instanceof Error ? e.message : "remote error",
    };
  }
}

export type ImportFromTecdocPayload = {
  partCode: string;
  brand?: string | null;
  nameRo?: string | null;
  nameEn?: string | null;
  nameRu?: string | null;
  descriptionRo?: string | null;
  descriptionEn?: string | null;
  descriptionRu?: string | null;
  price?: number;
  stockQuantity?: number;
  categoryId?: string | null;
  imageUrl?: string | null;
  images?: string[];
  oemCodes?: string[];
  vehicles?: TecdocPart["vehicles"];
  tecdocId?: string | null;
  weightKg?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  warrantyMonths?: number;
};

export type ImportResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; code: "forbidden" | "validation" | "server"; message?: string };

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function importProductFromTecdoc(
  payload: ImportFromTecdocPayload,
): Promise<ImportResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };

  const partCode = (payload.partCode ?? "").trim();
  if (!partCode) return { ok: false, code: "validation", message: "part_code required" };

  const baseName =
    payload.nameRo?.trim() ||
    payload.nameEn?.trim() ||
    payload.nameRu?.trim() ||
    `${payload.brand ?? ""} ${partCode}`.trim();

  const slugSource = `${payload.brand ?? ""}-${partCode}-${baseName}`.trim();
  const slug = slugify(slugSource) || slugify(partCode) || partCode.toLowerCase();

  const insert = {
    part_code: partCode,
    brand: (payload.brand ?? "").trim() || null,
    slug,
    price: typeof payload.price === "number" ? payload.price : 0,
    stock_quantity:
      typeof payload.stockQuantity === "number" ? payload.stockQuantity : 0,
    category_id: payload.categoryId ?? null,
    warranty_months:
      typeof payload.warrantyMonths === "number" ? payload.warrantyMonths : null,
    weight: payload.weightKg ?? null,
    width: payload.widthMm ?? null,
    height: payload.heightMm ?? null,
    image_url: payload.imageUrl ?? payload.images?.[0] ?? null,
    images: (payload.images ?? []) as unknown as Json,
    is_active: payload.isActive ?? true,
    is_featured: payload.isFeatured ?? false,
    name_ro: payload.nameRo?.trim() || null,
    name_en: payload.nameEn?.trim() || null,
    name_ru: payload.nameRu?.trim() || null,
    description_ro: payload.descriptionRo?.trim() || null,
    description_en: payload.descriptionEn?.trim() || null,
    description_ru: payload.descriptionRu?.trim() || null,
    tecdoc_id: payload.tecdocId ?? null,
    oem_codes: payload.oemCodes ?? [],
    vehicle_compatibility: (payload.vehicles ?? []) as unknown as Json,
    tecdoc_synced_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("products")
    .insert(insert)
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, code: "server", message: error?.message ?? "insert failed" };
  }

  revalidatePath("/", "layout");
  return { ok: true, id: data.id, slug: data.slug ?? slug };
}
