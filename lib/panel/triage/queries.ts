import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/panel/scope";

export type TriageOrderRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total: number;
  status: string | null;
  payment_method: string | null;
  account_scope: AccountScope;
  triaged_at: string | null;
  created_at: string | null;
  invoice_url: string | null;
  has_internal_invoice: boolean;
};

export async function listStorefrontOrders(args: {
  /** When true, also include already triaged orders. */
  showTriaged?: boolean;
}): Promise<TriageOrderRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, total, status, payment_method, account_scope, triaged_at, created_at, invoice_url",
    )
    .eq("source", "storefront")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!args.showTriaged) {
    query = query.is("triaged_at", null);
  }
  const { data } = await query;
  const rows = data ?? [];

  // Check which ones already have an internal invoice row mirrored
  const ids = rows.map((r) => r.id);
  const linked = new Set<string>();
  if (ids.length > 0) {
    const { data: invs } = await supabase
      .from("invoices")
      .select("order_id")
      .in("order_id", ids);
    for (const i of invs ?? []) {
      if (i.order_id) linked.add(i.order_id);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    customer_name: r.customer_name,
    customer_email: r.customer_email,
    customer_phone: r.customer_phone,
    total: Number(r.total ?? 0),
    status: r.status,
    payment_method: r.payment_method,
    account_scope: r.account_scope,
    triaged_at: r.triaged_at,
    created_at: r.created_at,
    invoice_url: r.invoice_url,
    has_internal_invoice: linked.has(r.id),
  }));
}
