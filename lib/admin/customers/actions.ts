"use server";

import { revalidatePath } from "next/cache";

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

export type CustomerActionResult =
  | { ok: true }
  | { ok: false; code: "forbidden" | "server"; message?: string };

// Admin role granting/revoking is intentionally NOT exposed in the UI.
// Toggle `profiles.is_admin` directly in Supabase Studio when you need to add
// or remove an administrator.

export async function setCustomerDiscount(
  userId: string,
  discountPercent: number,
): Promise<CustomerActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const pct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const { error } = await auth.supabase
    .from("profiles")
    .update({ discount_percent: pct })
    .eq("id", userId);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true };
}
