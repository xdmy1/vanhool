"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPanelUser } from "@/lib/panel/auth";
import type { Json } from "@/lib/supabase/database.types";

const issueSchema = z.object({
  client_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["MDL", "EUR", "USD"]),
  reason: z.string().nullable().optional(),
  order_id: z.string().uuid().nullable().optional(),
});

/** Next "CR-000N" serial from a panel_settings counter. Best-effort. */
async function nextCreditSerial(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data } = await supabase
    .from("panel_settings")
    .select("key, value")
    .in("key", ["credit.series", "credit.next_number"]);
  let series = "CR";
  let counter = 1;
  for (const r of data ?? []) {
    const v = r.value;
    if (r.key === "credit.series")
      series = typeof v === "string" ? v : String(v ?? "").replace(/^"|"$/g, "");
    if (r.key === "credit.next_number") counter = typeof v === "number" ? v : Number(v);
  }
  await supabase.from("panel_settings").upsert(
    [
      {
        key: "credit.next_number",
        value: (counter + 1) as unknown as Json,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "key" },
  );
  return `${series}-${String(counter).padStart(4, "0")}`;
}

/**
 * Issue a store credit to a client (e.g. compensating a site order that can't
 * be refunded in cash). Returns the new credit id. The credit keeps its own
 * currency — balances are always shown per-currency, never summed.
 */
export async function issueStoreCredit(
  raw: unknown,
): Promise<{ ok: true; id: string; serial: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = issueSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid" };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const serial = await nextCreditSerial(supabase);

  const { data, error } = await getSupabaseAdmin()
    .from("store_credits")
    .insert({
      client_id: v.client_id,
      serial,
      amount: Number(v.amount.toFixed(2)),
      used_amount: 0,
      currency: v.currency,
      reason: v.reason?.trim() || null,
      order_id: v.order_id ?? null,
      status: "active",
      issued_by: user.id,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/clienti", "page");
  revalidatePath(`/[locale]/panel/clienti/${v.client_id}`, "page");
  return { ok: true, id: (data as { id: string }).id, serial };
}

/** Void a credit (customer no longer has it). Reversible only by re-issuing. */
export async function voidStoreCredit(
  creditId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const admin = getSupabaseAdmin();
  const { data: c } = await admin
    .from("store_credits")
    .select("id, client_id")
    .eq("id", creditId)
    .maybeSingle();
  if (!c) return { ok: false, reason: "not_found" };
  const { error } = await admin
    .from("store_credits")
    .update({ status: "void", updated_at: new Date().toISOString() } as never)
    .eq("id", creditId);
  if (error) return { ok: false, reason: error.message };

  revalidatePath(`/[locale]/panel/clienti/${(c as { client_id: string }).client_id}`, "page");
  return { ok: true };
}
