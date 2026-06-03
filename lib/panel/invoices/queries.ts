import { createClient } from "@/lib/supabase/server";

export type InvoiceListType = "invoice" | "proforma";

export type InvoiceRow = {
  id: string;
  order_id: string | null;
  type: InvoiceListType;
  account_scope: "conta1" | "conta2";
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
  /** Inclusive lower bound on issued_date (YYYY-MM-DD). */
  from?: string;
  /** Inclusive upper bound on issued_date (YYYY-MM-DD). */
  to?: string;
  /** When true, restrict to invoices past their due_date and still 'issued'. */
  overdueOnly?: boolean;
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
  if (args.from) query = query.gte("issued_date", args.from);
  if (args.to) query = query.lte("issued_date", args.to);
  if (args.overdueOnly) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.eq("status", "issued").lt("due_date", today);
  }
  if (args.q) {
    const q = `%${args.q.replace(/[%_]/g, "")}%`;
    query = query.or(`number.ilike.${q},refrens_invoice_id.ilike.${q}`);
  }
  const { data } = await query;
  return (data ?? []).map((r) => ({
    id: r.id,
    order_id: r.order_id,
    type: r.type,
    account_scope: r.account_scope,
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
  /** List price per unit (pre-discount). */
  unit_price?: number;
  /** Effective price per unit when a per-line discount was applied. */
  discounted_unit_price?: number | null;
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
  /** Filled in when the invoice is marked paid — may differ from currency/total
   * if the customer settled slightly above or below the issued amount. */
  paid_amount: number | null;
  paid_currency: string | null;
  paid_method: "cash" | "transfer" | "card" | "other" | null;
  customer_snapshot: CustomerSnapshot;
  items_snapshot: InvoiceItemSnapshot[];
  subtotal: number;
  vat_amount: number;
  total: number;
  /** Commercial discount % applied on the gross. 0 = no discount. */
  discount_percent: number;
  /** ISO timestamp set the first time this document was emailed to the
   * accountant. Null while it's still pending. */
  accountant_sent_at: string | null;
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
  // Try the full select first (incl. discount_percent, accountant_sent_at).
  // Fall back to a column list without the optional new fields if the SQL
  // migration hasn't run yet — so the panel keeps loading either way.
  let { data, error } = await supabase
    .from("invoices")
    .select(
      "id, order_id, account_scope, type, series, number, issued_date, due_date, paid_at, currency, customer_snapshot, items_snapshot, subtotal, vat_amount, total, discount_percent, accountant_sent_at, status, notes, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id, output_locale, paid_amount, paid_currency, paid_method" as
        "id, order_id, account_scope, type, series, number, issued_date, due_date, paid_at, currency, customer_snapshot, items_snapshot, subtotal, vat_amount, total, status, notes, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error && /(discount_percent|accountant_sent_at)/i.test(error.message)) {
    const retry = await supabase
      .from("invoices")
      .select(
        "id, order_id, account_scope, type, series, number, issued_date, due_date, paid_at, currency, customer_snapshot, items_snapshot, subtotal, vat_amount, total, status, notes, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id, output_locale, paid_amount, paid_currency, paid_method" as
          "id, order_id, account_scope, type, series, number, issued_date, due_date, paid_at, currency, customer_snapshot, items_snapshot, subtotal, vat_amount, total, status, notes, refrens_invoice_id, refrens_url, proforma_id, converted_to_invoice_id",
      )
      .eq("id", id)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }
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

  let items = Array.isArray(data.items_snapshot)
    ? (data.items_snapshot as InvoiceItemSnapshot[])
    : [];

  // Backfill items from the originating order when the invoice was created
  // before createManualSale started persisting items_snapshot. Without this
  // the printed invoice would render an empty line table for every legacy
  // sale. We translate the order-shape (`price` = effective, `original_unit_price`
  // = list) into the invoice shape the print template expects.
  if (items.length === 0 && data.order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("items")
      .eq("id", data.order_id)
      .maybeSingle();
    const rawItems = Array.isArray(order?.items) ? (order!.items as Array<Record<string, unknown>>) : [];
    if (rawItems.length > 0) {
      items = rawItems.map((it) => {
        const price = Number((it.price as number) ?? 0);
        const orig =
          it.original_unit_price != null
            ? Number(it.original_unit_price as number)
            : price;
        const qty = Number((it.quantity as number) ?? 0);
        const hasDiscount = orig > 0 && orig > price;
        return {
          productId: it.productId as string | undefined,
          partCode: (it.partCode as string | null) ?? null,
          name: (it.name as string | null) ?? null,
          description: null,
          quantity: qty,
          unit_price: orig,
          discounted_unit_price: hasDiscount ? price : null,
          vat_rate: Number((it.vat_rate as number) ?? 0),
          total: Number((it.total as number) ?? qty * price),
        } as InvoiceItemSnapshot;
      });
    }
  }

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
    paid_amount: (() => {
      const raw = (data as { paid_amount?: number | string | null }).paid_amount;
      return raw == null ? null : Number(raw);
    })(),
    paid_currency: (data as { paid_currency?: string | null }).paid_currency ?? null,
    paid_method:
      ((data as { paid_method?: string | null }).paid_method as
        | "cash"
        | "transfer"
        | "card"
        | "other"
        | null) ?? null,
    customer_snapshot: (data.customer_snapshot ?? {}) as CustomerSnapshot,
    items_snapshot: items,
    subtotal: Number(data.subtotal ?? 0),
    vat_amount: Number(data.vat_amount ?? 0),
    total: Number(data.total ?? 0),
    discount_percent: Number(
      (data as { discount_percent?: number | string | null }).discount_percent ?? 0,
    ),
    accountant_sent_at:
      (data as { accountant_sent_at?: string | null }).accountant_sent_at ?? null,
    notes: data.notes,
    refrens_invoice_id: data.refrens_invoice_id,
    refrens_url: data.refrens_url,
    proforma_id: data.proforma_id,
    converted_to_invoice_id: data.converted_to_invoice_id,
    linked_proforma,
    linked_invoice,
  };
}
