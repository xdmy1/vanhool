"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";

const productSchema = z.object({
  part_code: z.string().min(1, "Cod obligatoriu"),
  name_ro: z.string().min(1, "Nume obligatoriu"),
  name_en: z.string().nullable().optional(),
  name_ru: z.string().nullable().optional(),
  description_ro: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  manufacturer_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  subcategory_id: z.string().uuid().nullable().optional(),
  price: z.number().nonnegative(),
  cost_price: z.number().nonnegative().nullable().optional(),
  // Stock is numeric(12,3) — divisible units (litru/metru/kg) keep decimals.
  stock_quantity: z.number().min(0).default(0),
  /** Unit of measure the product is stocked + sold in. Vocabulary lives in the
   *  app (PRODUCT_UNITS); DB accepts any text so a new unit never blocks a save. */
  unit: z.string().default("buc"),
  storage_location: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  supplier_id: z.string().uuid().nullable().optional(),
  supplier_code: z.string().nullable().optional(),
  condition: z.enum(["new", "refurbished", "used"]).nullable().optional(),
  warranty_months: z.number().int().min(0).nullable().optional(),
});

export type PanelProductInput = z.infer<typeof productSchema>;

export async function createPanelProduct(
  raw: unknown,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  // Extract optional `linkLineId` (a purchase_item id to link the new product
  // to). Not part of the product schema, so Zod silently drops it.
  const linkLineId =
    typeof raw === "object" && raw !== null && "linkLineId" in raw
      ? (raw as { linkLineId?: string }).linkLineId
      : undefined;

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  const supabase = await createClient();
  const slug = slugify(`${parsed.data.name_ro}-${parsed.data.part_code}`);
  // `unit` isn't in the generated types yet — add it via cast so the insert
  // still writes it (products.unit exists at runtime after the UoM migration).
  const { unit: newUnit, ...newRest } = parsed.data;
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...newRest,
      slug,
      ...({ unit: newUnit } as object),
    })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  if (linkLineId) {
    const { error: linkErr } = await supabase
      .from("purchase_items")
      .update({ product_id: data.id })
      .eq("id", linkLineId);
    if (linkErr) {
      console.error("[panel.produse] line link failed:", linkErr.message);
      // Non-fatal — product is created, owner can re-link manually if needed.
    } else {
      revalidatePath("/[locale]/panel/achizitii", "page");
    }
  }

  revalidatePath("/[locale]/panel/produse", "page");
  return { ok: true, id: data.id };
}

export async function updatePanelProduct(
  id: string,
  raw: unknown,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = productSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  const supabase = await createClient();
  const { unit: updUnit, ...updRest } = parsed.data;
  const { error } = await supabase
    .from("products")
    .update({
      ...updRest,
      ...(updUnit !== undefined ? ({ unit: updUnit } as object) : {}),
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  revalidatePath(`/[locale]/panel/produse/${id}`, "page");
  revalidatePath("/[locale]/panel/produse", "page");
  return { ok: true };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
