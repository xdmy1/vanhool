"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";

const movementSchema = z.object({
  direction: z.enum(["in", "out"]),
  amount: z.number().positive(),
  reason: z.enum(["top_up", "withdrawal", "adjustment"]),
  notes: z.string().nullable().optional(),
  drawer: z.string().default("main"),
  // Manual cash movements are almost always MDL (the physical till is in
  // lei), but we accept EUR / USD for completeness — converted to MDL via
  // the fixed reference table so the balance stays in one unit.
  currency: z.enum(["MDL", "EUR", "USD"]).default("MDL"),
});

export type CashMovementInput = z.infer<typeof movementSchema>;

export async function recordCashMovement(
  raw: unknown,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = movementSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid" };
  const v = parsed.data;
  const supabase = await createClient();
  const fxRate = v.currency === "EUR" ? 20 : v.currency === "USD" ? 17 : 1;
  const { data, error } = await supabase
    .from("cash_register_movements")
    .insert({
      direction: v.direction,
      amount: v.amount,
      reason: v.reason,
      notes: v.notes ?? null,
      drawer: v.drawer ?? "main",
      created_by: user.id,
      ...({
        currency: v.currency,
        fx_rate: fxRate,
        amount_mdl: Number((v.amount * fxRate).toFixed(2)),
      } as object),
    })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/cheltuieli-cash", "page");
  return { ok: true, id: data.id };
}

export async function getCashBalance(
  drawer: string = "main",
): Promise<{ balance: number; movements_count: number }> {
  const supabase = await createClient();
  // Sum amount_mdl when present (post-migration rows + backfill) so EUR/USD
  // movements don't inflate the till balance by ~20x. Older rows that
  // somehow miss amount_mdl fall back to amount — only happens before the
  // migration ran. The currency column lets us double-check.
  const { data } = await supabase
    .from("cash_register_movements")
    .select("direction, amount, amount_mdl, currency")
    .eq("drawer", drawer);
  let balance = 0;
  for (const m of (data ?? []) as Array<{
    direction: string;
    amount: number | null;
    amount_mdl?: number | null;
    currency?: string | null;
  }>) {
    const v = m.amount_mdl != null ? Number(m.amount_mdl) : Number(m.amount ?? 0);
    balance += m.direction === "in" ? v : -v;
  }
  return { balance: Number(balance.toFixed(2)), movements_count: (data ?? []).length };
}

export type CashMovementRow = {
  id: string;
  occurred_at: string;
  direction: "in" | "out";
  amount: number;
  reason: string;
  notes: string | null;
};

export async function listCashMovements(
  limit = 100,
  drawer: string = "main",
): Promise<CashMovementRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cash_register_movements")
    .select("id, occurred_at, direction, amount, reason, notes")
    .eq("drawer", drawer)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id,
    occurred_at: r.occurred_at,
    direction: r.direction,
    amount: Number(r.amount ?? 0),
    reason: r.reason,
    notes: r.notes,
  }));
}
