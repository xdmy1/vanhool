"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";

const supplierSchema = z.object({
  name: z.string().min(1),
  idno: z.string().nullable().optional(),
  vat_code: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export async function listSuppliers() {
  const user = await getPanelUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("id, name, idno, contact_phone, contact_email, is_active, created_at")
    .order("name");
  return data ?? [];
}

export async function searchSuppliers(q: string) {
  const user = await getPanelUser();
  if (!user) return [];
  const supabase = await createClient();
  const term = `%${q.replace(/[%_]/g, "")}%`;
  const { data } = await supabase
    .from("suppliers")
    .select("id, name, idno, contact_phone")
    .or(`name.ilike.${term},idno.ilike.${term}`)
    .eq("is_active", true)
    .limit(8);
  return data ?? [];
}

export async function createSupplier(
  raw: unknown,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/achizitii", "page");
  return { ok: true, id: data.id };
}
