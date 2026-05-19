import { createClient } from "@/lib/supabase/server";

export type InvoiceListType = "invoice" | "proforma";

export type InvoiceRow = {
  id: string;
  order_id: string | null;
  type: InvoiceListType;
  series: string | null;
  number: string | null;
  issued_date: string;
  due_date: string | null;
  paid_at: string | null;
  currency: string;
  total: number;
  status: "draft" | "issued" | "sent" | "paid" | "void" | "converted";
  refrens_invoice_id: string | null;
  refrens_url: string | null;
  proforma_id: string | null;
  converted_to_invoice_id: string | null;
  customer_snapshot: {
    name?: string;
    idno?: string | null;
    email?: string | null;
    vat_number?: string | null;
  } | null;
};

export async function listInvoices(args: {
  type?: InvoiceListType;
  scope?: "conta1" | "conta2";
  q?: string;
}): Promise<InvoiceRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
    .select(
      "id, order_id, type, series, number, issued_date, due_date, paid_at, currency, total, status, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id, customer_snapshot, account_scope",
    )
    .order("issued_date", { ascending: false })
    .limit(300);
  if (args.type) query = query.eq("type", args.type);
  if (args.scope) query = query.eq("account_scope", args.scope);
  if (args.q) {
    const q = `%${args.q.replace(/[%_]/g, "")}%`;
    query = query.or(`number.ilike.${q},refrens_invoice_id.ilike.${q}`);
  }
  const { data } = await query;
  return (data ?? []).map((r) => ({
    id: r.id,
    order_id: r.order_id,
    type: r.type,
    series: r.series,
    number: r.number,
    issued_date: r.issued_date,
    due_date: r.due_date,
    paid_at: r.paid_at,
    currency: r.currency ?? "MDL",
    total: Number(r.total ?? 0),
    status: r.status,
    refrens_invoice_id: r.refrens_invoice_id,
    refrens_url: r.refrens_url,
    proforma_id: r.proforma_id,
    converted_to_invoice_id: r.converted_to_invoice_id,
    customer_snapshot: r.customer_snapshot as InvoiceRow["customer_snapshot"],
  }));
}

export type InvoiceItemSnapshot = {
  productId?: string | null;
  partCode?: string | null;
  name?: string;
  description?: string | null;
  quantity?: number;
  unit_price?: number;
  vat_rate?: number;
  total?: number;
};

export type CustomerSnapshot = {
  user_id?: string | null;
  name?: string;
  email?: string | null;
  phone?: string | null;
  idno?: string | null;
  vat_number?: string | null;
  address?: string | null;
};

export type InvoiceDetail = {
  id: string;
  type: InvoiceListType;
  order_id: string | null;
  account_scope: "conta1" | "conta2";
  series: string | null;
  number: string | null;
  issued_date: string;
  due_date: string | null;
  paid_at: string | null;
  currency: string;
  /** Language used to render the printable view ('ro' | 'en' | 'ru'). */
  output_locale: "ro" | "en" | "ru";
  status: "draft" | "issued" | "sent" | "paid" | "void" | "converted";
  customer_snapshot: CustomerSnapshot;
  items_snapshot: InvoiceItemSnapshot[];
  subtotal: number;
  vat_amount: number;
  total: number;
  notes: string | null;
  refrens_invoice_id: string | null;
  refrens_url: string | null;
  proforma_id: string | null;
  converted_to_invoice_id: string | null;
  /** Linked proforma fixed metadata (for invoices coming FROM a proforma). */
  linked_proforma?: { id: string; series: string | null; number: string | null } | null;
  /** Linked invoice fixed metadata (for proformas converted INTO an invoice). */
  linked_invoice?: { id: string; series: string | null; number: string | null } | null;
};

export async function getInvoice(id: string): Promise<InvoiceDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      // Includes `output_locale` at runtime — the generated TS types are
      // stale until the SQL migration is applied.
      "id, order_id, account_scope, type, series, number, issued_date, due_date, paid_at, currency, customer_snapshot, items_snapshot, subtotal, vat_amount, total, status, notes, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id, output_locale" as
        "id, order_id, account_scope, type, series, number, issued_date, due_date, paid_at, currency, customer_snapshot, items_snapshot, subtotal, vat_amount, total, status, notes, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  let linked_proforma: InvoiceDetail["linked_proforma"] = null;
  let linked_invoice: InvoiceDetail["linked_invoice"] = null;
  if (data.proforma_id) {
    const { data: pf } = await supabase
      .from("invoices")
      .select("id, series, number")
      .eq("id", data.proforma_id)
      .maybeSingle();
    if (pf) linked_proforma = pf;
  }
  if (data.converted_to_invoice_id) {
    const { data: inv } = await supabase
      .from("invoices")
      .select("id, series, number")
      .eq("id", data.converted_to_invoice_id)
      .maybeSingle();
    if (inv) linked_invoice = inv;
  }

  const items = Array.isArray(data.items_snapshot)
    ? (data.items_snapshot as InvoiceItemSnapshot[])
    : [];

  return {
    id: data.id,
    type: data.type,
    order_id: data.order_id,
    account_scope: data.account_scope,
    series: data.series,
    number: data.number,
    issued_date: data.issued_date,
    due_date: data.due_date,
    paid_at: data.paid_at,
    currency: data.currency ?? "MDL",
    output_locale: ((data as { output_locale?: string }).output_locale ?? "ro") as "ro" | "en" | "ru",
    status: data.status,
    customer_snapshot: (data.customer_snapshot ?? {}) as CustomerSnapshot,
    items_snapshot: items,
    subtotal: Number(data.subtotal ?? 0),
    vat_amount: Number(data.vat_amount ?? 0),
    total: Number(data.total ?? 0),
    notes: data.notes,
    refrens_invoice_id: data.refrens_invoice_id,
    refrens_url: data.refrens_url,
    proforma_id: data.proforma_id,
    converted_to_invoice_id: data.converted_to_invoice_id,
    linked_proforma,
    linked_invoice,
  };
}
