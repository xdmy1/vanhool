"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { pingIndexNow } from "@/lib/indexnow";
import { setStockAbsolute, type StockDb } from "@/lib/stock-ledger";

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

  // Duplicate-code guard (mirrors the admin form): a re-submit after a
  // partial failure must find the existing product, not mint a twin.
  const dupCode = parsed.data.part_code.trim();
  if (dupCode) {
    const escaped = dupCode.replace(/[\\%_]/g, "\\$&");
    const { data: dup } = await supabase
      .from("products")
      .select("id, part_code")
      .ilike("part_code", escaped)
      .limit(1);
    if (dup && dup.length > 0) {
      return {
        ok: false,
        reason: `Codul "${dup[0].part_code}" este deja folosit de un alt produs.`,
      };
    }
  }

  const slug = slugify(`${parsed.data.name_ro}-${parsed.data.part_code}`);
  // `unit` isn't in the generated types yet — add it via cast so the insert
  // still writes it (products.unit exists at runtime after the UoM migration).
  // Initial stock goes through the LEDGER (insert at 0, then set) so opening
  // balances are auditable movements like everything else.
  const { unit: newUnit, stock_quantity: initialStock, ...newRest } = parsed.data;
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...newRest,
      stock_quantity: 0,
      slug,
      ...({ unit: newUnit } as object),
    })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  if (initialStock > 0) {
    const set = await setStockAbsolute(
      supabase as unknown as StockDb,
      data.id,
      initialStock,
      `initial:${data.id}`,
      user.id,
    );
    if (!set.ok) {
      return {
        ok: false,
        reason: `${set.reason} — produsul a fost creat FĂRĂ stoc; setează stocul din editare`,
      };
    }
  }

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
  if (parsed.data.is_active) await pingIndexNow([`/product/${slug}`]);
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
  const { unit: updUnit, stock_quantity: updStock, ...updRest } = parsed.data;

  // The stock field is an ABSOLUTE set from a form loaded minutes ago — write
  // it through the ledger (row lock → delta recorded → value set) so it can't
  // silently revert a sale/purchase that landed in between, and the change
  // shows up in stock_movements like every other move.
  if (updStock !== undefined) {
    const set = await setStockAbsolute(
      supabase as unknown as StockDb,
      id,
      updStock,
      `manual:${id}:${crypto.randomUUID()}`,
      user.id,
    );
    if (!set.ok) {
      // No silent fallback to a raw write — that path is exactly the "absolute
      // overwrite loses concurrent movements" bug this overhaul removes.
      return { ok: false, reason: `${set.reason} — rulează sql/stock-accuracy.sql` };
    }
  }

  const { data: updated, error } = await supabase
    .from("products")
    .update({
      ...updRest,
      ...(updUnit !== undefined ? ({ unit: updUnit } as object) : {}),
    })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) return { ok: false, reason: error.message };

  revalidatePath(`/[locale]/panel/produse/${id}`, "page");
  revalidatePath("/[locale]/panel/produse", "page");
  if (updated?.slug) await pingIndexNow([`/product/${updated.slug}`]);
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
