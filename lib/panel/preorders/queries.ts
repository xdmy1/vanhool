import { createClient } from "@/lib/supabase/server";

export type PreorderStatus =
  | "pending"
  | "confirmed"
  | "ordered"
  | "arrived"
  | "delivered"
  | "cancelled";

export type PreorderRow = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  product_id: string | null;
  part_code: string | null;
  description: string;
  quantity: number;
  supplier_id: string | null;
  supplier_name: string | null;
  supplier_unit_cost: number;
  unit_price: number;
  currency: string;
  expected_delivery_date: string | null;
  status: PreorderStatus;
  confirmed_at: string | null;
  confirmation_sent_at: string | null;
  arrived_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  /** Derived per-row: unit_price × quantity. */
  total: number;
  /** Derived: % margin over supplier_unit_cost (0 if cost is 0). */
  margin_percent: number;
};

export async function listPreorders(args?: {
  status?: PreorderStatus | "all";
}): Promise<PreorderRow[]> {
  const supabase = await createClient();
  // Preorders is a new table; generated TS types are stale until
  // regenerated, hence the casts.
  let q = supabase
    .from("preorders" as never)
    .select(
      "id, customer_id, customer_name, customer_phone, customer_email, product_id, part_code, description, quantity, supplier_id, supplier_unit_cost, unit_price, currency, expected_delivery_date, status, confirmed_at, confirmation_sent_at, arrived_at, delivered_at, notes, created_at, suppliers(name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (args?.status && args.status !== "all") q = q.eq("status", args.status);
  const { data } = await q;
  return (((data ?? []) as unknown) as Array<Record<string, unknown>>).map((r) => {
    const supplier = r.suppliers as { name: string } | null;
    const quantity = Number(r.quantity ?? 0);
    const unitPrice = Number(r.unit_price ?? 0);
    const cost = Number(r.supplier_unit_cost ?? 0);
    return {
      id: r.id as string,
      customer_id: r.customer_id as string | null,
      customer_name: r.customer_name as string,
      customer_phone: (r.customer_phone as string | null) ?? null,
      customer_email: (r.customer_email as string | null) ?? null,
      product_id: r.product_id as string | null,
      part_code: (r.part_code as string | null) ?? null,
      description: r.description as string,
      quantity,
      supplier_id: r.supplier_id as string | null,
      supplier_name: supplier?.name ?? null,
      supplier_unit_cost: cost,
      unit_price: unitPrice,
      currency: (r.currency as string | null) ?? "MDL",
      expected_delivery_date: r.expected_delivery_date as string | null,
      status: r.status as PreorderStatus,
      confirmed_at: r.confirmed_at as string | null,
      confirmation_sent_at: r.confirmation_sent_at as string | null,
      arrived_at: r.arrived_at as string | null,
      delivered_at: r.delivered_at as string | null,
      notes: r.notes as string | null,
      created_at: r.created_at as string,
      total: Number((quantity * unitPrice).toFixed(2)),
      margin_percent:
        cost > 0 ? Math.round(((unitPrice - cost) / cost) * 100) : 0,
    };
  });
}

export async function getPreorder(id: string): Promise<PreorderRow | null> {
  const rows = await listPreorders({ status: "all" });
  return rows.find((r) => r.id === id) ?? null;
}
