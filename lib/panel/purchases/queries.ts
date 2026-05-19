import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/panel/scope";

export type PurchaseListRow = {
  id: string;
  document_number: string | null;
  document_date: string;
  supplier_name: string;
  account_scope: AccountScope;
  status: "draft" | "ordered" | "received" | "posted" | "cancelled";
  total: number;
  currency: string;
  created_at: string;
};

export async function listPurchases(args: {
  scope: AccountScope;
  q?: string;
}): Promise<PurchaseListRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("purchases")
    .select(
      "id, document_number, document_date, account_scope, status, total, currency, created_at, suppliers(name)",
    )
    .eq("account_scope", args.scope)
    .order("document_date", { ascending: false })
    .limit(100);
  if (args.q) {
    const q = `%${args.q.replace(/[%_]/g, "")}%`;
    query = query.ilike("document_number", q);
  }
  const { data } = await query;
  return (data ?? []).map((r) => {
    const supplier = (r as unknown as { suppliers: { name: string } | null }).suppliers;
    return {
      id: r.id,
      document_number: r.document_number,
      document_date: r.document_date,
      supplier_name: supplier?.name ?? "—",
      account_scope: r.account_scope,
      status: r.status,
      total: Number(r.total ?? 0),
      currency: r.currency ?? "MDL",
      created_at: r.created_at,
    };
  });
}

export type PurchaseDetail = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  account_scope: AccountScope;
  document_number: string | null;
  document_date: string;
  currency: string;
  fx_rate: number | null;
  subtotal: number;
  vat_amount: number;
  total: number;
  status: "draft" | "ordered" | "received" | "posted" | "cancelled";
  po_number: string | null;
  po_issued_at: string | null;
  expected_delivery_date: string | null;
  notes: string | null;
  items: Array<{
    id: string;
    product_id: string | null;
    supplier_code: string | null;
    internal_code: string | null;
    description: string;
    quantity: number;
    unit_cost: number;
    vat_rate: number;
    line_total: number;
  }>;
};

export type PurchaseLinePrefill = {
  lineId: string;
  purchaseId: string;
  document_number: string | null;
  supplier_id: string | null;
  supplier_name: string;
  supplier_code: string | null;
  internal_code: string | null;
  description: string;
  unit_cost: number;
  quantity: number;
  product_id: string | null;
  currency: string;
  fx_rate: number | null;
};

export async function getPurchaseItemPrefill(
  lineId: string,
): Promise<PurchaseLinePrefill | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("purchase_items")
    .select(
      "id, purchase_id, supplier_code, internal_code, description, quantity, unit_cost, product_id, purchases(supplier_id, document_number, currency, fx_rate, suppliers(name))",
    )
    .eq("id", lineId)
    .maybeSingle();
  if (!data) return null;
  const purchase = (data as unknown as {
    purchases: {
      supplier_id: string | null;
      document_number: string | null;
      currency: string | null;
      fx_rate: number | null;
      suppliers: { name: string } | null;
    } | null;
  }).purchases;
  return {
    lineId: data.id,
    purchaseId: data.purchase_id,
    document_number: purchase?.document_number ?? null,
    supplier_id: purchase?.supplier_id ?? null,
    supplier_name: purchase?.suppliers?.name ?? "—",
    supplier_code: data.supplier_code,
    internal_code: data.internal_code,
    description: data.description,
    unit_cost: Number(data.unit_cost),
    quantity: Number(data.quantity),
    product_id: data.product_id,
    currency: purchase?.currency ?? "MDL",
    fx_rate: purchase?.fx_rate ?? null,
  };
}

export async function getPurchase(id: string): Promise<PurchaseDetail | null> {
  const supabase = await createClient();
  const { data: header } = await supabase
    .from("purchases")
    .select(
      "id, supplier_id, account_scope, document_number, document_date, currency, fx_rate, subtotal, vat_amount, total, status, notes, po_number, po_issued_at, expected_delivery_date, suppliers(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!header) return null;
  const { data: items } = await supabase
    .from("purchase_items")
    .select(
      "id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate, line_total",
    )
    .eq("purchase_id", id)
    .order("created_at");
  const supplier = (header as unknown as { suppliers: { name: string } | null }).suppliers;
  return {
    id: header.id,
    supplier_id: header.supplier_id,
    supplier_name: supplier?.name ?? "—",
    account_scope: header.account_scope,
    document_number: header.document_number,
    document_date: header.document_date,
    currency: header.currency,
    fx_rate: header.fx_rate,
    subtotal: Number(header.subtotal ?? 0),
    vat_amount: Number(header.vat_amount ?? 0),
    total: Number(header.total ?? 0),
    status: header.status,
    po_number: header.po_number,
    po_issued_at: header.po_issued_at,
    expected_delivery_date: header.expected_delivery_date,
    notes: header.notes,
    items: (items ?? []).map((it) => ({
      id: it.id,
      product_id: it.product_id,
      supplier_code: it.supplier_code,
      internal_code: it.internal_code,
      description: it.description,
      quantity: Number(it.quantity),
      unit_cost: Number(it.unit_cost),
      vat_rate: Number(it.vat_rate),
      line_total: Number(it.line_total ?? it.quantity * it.unit_cost),
    })),
  };
}
