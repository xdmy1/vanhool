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
  if (!user) return { ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const };
  return { ok: true as const, supabase };
}

const promoSchema = z.object({
  code: z.string().min(2).max(40),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().nonnegative(),
  minOrderAmount: z.number().nonnegative().nullable().optional(),
  maxUses: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type PromoFormValues = z.infer<typeof promoSchema>;

export type PromoActionResult =
  | { ok: true; id: string }
  | { ok: false; code: "validation" | "server" | "forbidden"; message?: string };

function buildPayload(values: PromoFormValues) {
  return {
    code: values.code.trim().toUpperCase(),
    discount_type: values.discountType,
    discount_value: values.discountValue,
    min_order_amount: values.minOrderAmount ?? null,
    max_uses: values.maxUses ?? null,
    is_active: values.isActive ?? true,
  };
}

export async function createPromo(values: unknown): Promise<PromoActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = promoSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const { data, error } = await auth.supabase
    .from("promocodes")
    .insert(buildPayload(parsed.data))
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, code: "server", message: dbErrorMessage(error) };
  }
  revalidatePath("/", "layout");
  return { ok: true, id: data.id };
}

export async function updatePromo(
  id: string,
  values: unknown,
): Promise<PromoActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = promoSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const { error } = await auth.supabase
    .from("promocodes")
    .update(buildPayload(parsed.data))
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deletePromo(id: string, pin?: string): Promise<PromoActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!verifyAdminPin(pin)) return { ok: false, code: "validation", message: "bad_pin" };
  const { error } = await auth.supabase.from("promocodes").delete().eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deletePromoWithPin(
  id: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await deletePromo(id, pin);
  if (res.ok) return { ok: true };
  if (res.message === "bad_pin") return { ok: false, reason: "bad_pin" };
  return { ok: false, reason: res.message ?? res.code };
}
