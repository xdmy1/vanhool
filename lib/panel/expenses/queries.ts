import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/panel/scope";

export type ExpenseRow = {
  id: string;
  account_scope: AccountScope;
  category: string;
  description: string;
  amount: number;
  currency: string;
  paid_at: string;
  payment_method: "cash" | "transfer" | "card" | null;
  supplier_name: string | null;
};

export async function listExpenses(args: {
  scope: AccountScope;
  q?: string;
  category?: string;
  from?: string;
  to?: string;
}): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("expenses")
    .select(
      "id, account_scope, category, description, amount, currency, paid_at, payment_method, suppliers(name)",
    )
    .eq("account_scope", args.scope)
    .order("paid_at", { ascending: false })
    .limit(300);
  if (args.q) {
    const q = `%${args.q.replace(/[%_]/g, "")}%`;
    query = query.ilike("description", q);
  }
  if (args.category && args.category !== "all") {
    query = query.eq("category", args.category);
  }
  if (args.from) query = query.gte("paid_at", args.from);
  if (args.to) query = query.lte("paid_at", args.to);
  const { data } = await query;
  return (data ?? []).map((r) => {
    const supplier = (r as unknown as { suppliers: { name: string } | null }).suppliers;
    return {
      id: r.id,
      account_scope: r.account_scope,
      category: r.category,
      description: r.description,
      amount: Number(r.amount ?? 0),
      currency: r.currency ?? "MDL",
      paid_at: r.paid_at,
      payment_method: r.payment_method,
      supplier_name: supplier?.name ?? null,
    };
  });
}
