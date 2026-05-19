"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";

export async function markPrinted(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("delivery_notes")
    .update({ printed_at: new Date().toISOString(), status: "dispatched" })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  revalidatePath(`/[locale]/panel/fisa-de-livrare/${id}`, "page");
  return { ok: true };
}

export async function setDeliveryStatus(
  id: string,
  status: "draft" | "dispatched" | "delivered" | "returned",
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("delivery_notes")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  revalidatePath(`/[locale]/panel/fisa-de-livrare/${id}`, "page");
  return { ok: true };
}

/**
 * Delete a delivery note outright. The order that originated it (if any)
 * keeps existing — we just clear its `delivery_note_id` link first so the
 * FK doesn't block the delete.
 */
export async function deleteDeliveryNote(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ delivery_note_id: null })
    .eq("delivery_note_id", id);
  const { error } = await supabase.from("delivery_notes").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  return { ok: true };
}
