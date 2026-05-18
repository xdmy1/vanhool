"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { EXPENSE_CATEGORIES } from "@/lib/panel/expenses/categories";

const expenseSchema = z.object({
  account_scope: z.enum(["conta1", "conta2"]),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  paid_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payment_method: z.enum(["cash", "transfer", "card"]).nullable().optional(),
  supplier_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export async function createExpense(
  raw: unknown,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid" };
  const v = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({ ...v, created_by: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  // Conta 2 cash expense → mirror into cash_register_movements
  if (v.account_scope === "conta2" && v.payment_method === "cash" && v.amount > 0) {
    await supabase.from("cash_register_movements").insert({
      direction: "out",
      amount: v.amount,
      reason: "expense",
      expense_id: data.id,
      created_by: user.id,
      notes: v.description.slice(0, 200),
    });
  }

  revalidatePath("/[locale]/panel/cheltuieli", "page");
  revalidatePath("/[locale]/panel/cheltuieli-cash", "page");
  return { ok: true, id: data.id };
}

export async function deleteExpense(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/cheltuieli", "page");
  revalidatePath("/[locale]/panel/cheltuieli-cash", "page");
  return { ok: true };
}
