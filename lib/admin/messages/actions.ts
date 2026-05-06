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

export const MESSAGE_STATUSES = ["new", "reading", "replied", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

const statusSchema = z.enum(MESSAGE_STATUSES);

export type MessageActionResult =
  | { ok: true }
  | { ok: false; code: "validation" | "server" | "forbidden"; message?: string };

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<MessageActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, code: "validation" };
  const { error } = await auth.supabase
    .from("contact_messages")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, code: "server", message: dbErrorMessage(error) };
  revalidatePath("/", "layout");
  return { ok: true };
}
