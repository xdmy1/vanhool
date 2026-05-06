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
  return { ok: true as const, supabase, currentUserId: user.id };
}

export type CustomerActionResult =
  | { ok: true }
  | { ok: false; code: "forbidden" | "self" | "server"; message?: string };

export async function setCustomerAdmin(
  userId: string,
  isAdmin: boolean,
): Promise<CustomerActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (userId === auth.currentUserId && !isAdmin) {
    return { ok: false, code: "self", message: "Cannot revoke your own admin role." };
  }
  const { error } = await auth.supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true };
}
