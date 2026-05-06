import "server-only";

import { createClient } from "@/lib/supabase/server";

export type OdooSyncLogRow = {
  id: string;
  direction: "pull" | "push" | "webhook";
  operation: string;
  entity_type: string | null;
  entity_id: string | null;
  odoo_model: string | null;
  odoo_id: number | null;
  success: boolean;
  detail: unknown;
  duration_ms: number | null;
  created_at: string;
};

export async function adminListSyncLog(limit = 50): Promise<OdooSyncLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("odoo_sync_log")
    .select(
      "id, direction, operation, entity_type, entity_id, odoo_model, odoo_id, success, detail, duration_ms, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as OdooSyncLogRow[];
}

export type FailedOrderRow = {
  id: string;
  short_id: string;
  customer_name: string | null;
  customer_email: string | null;
  total: number | null;
  odoo_sync_error: string | null;
  created_at: string | null;
};

export async function adminListFailedOrderPushes(): Promise<FailedOrderRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, total, odoo_sync_error, created_at")
    .not("odoo_sync_error", "is", null)
    .is("odoo_order_id", null)
    .order("created_at", { ascending: false })
    .limit(50);
  return ((data ?? []) as Omit<FailedOrderRow, "short_id">[]).map((r) => ({
    ...r,
    short_id: r.id.slice(0, 8).toUpperCase(),
  }));
}

export type OdooStats = {
  productsLinked: number;
  productsTotal: number;
  ordersLinked: number;
  ordersTotal: number;
  ordersFailed: number;
  invoicesIssued: number;
};

export async function adminOdooStats(): Promise<OdooStats> {
  const supabase = await createClient();
  const [pTotal, pLinked, oTotal, oLinked, oFailed, invIssued] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .not("odoo_id", "is", null),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("odoo_order_id", "is", null),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("odoo_sync_error", "is", null)
      .is("odoo_order_id", null),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("odoo_invoice_id", "is", null),
  ]);
  return {
    productsTotal: pTotal.count ?? 0,
    productsLinked: pLinked.count ?? 0,
    ordersTotal: oTotal.count ?? 0,
    ordersLinked: oLinked.count ?? 0,
    ordersFailed: oFailed.count ?? 0,
    invoicesIssued: invIssued.count ?? 0,
  };
}
