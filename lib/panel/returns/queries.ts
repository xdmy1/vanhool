import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatReturnNumber } from "@/lib/panel/returns/format";
import type { DocumentReturn } from "@/lib/panel/returns/actions";
import type { AccountScope } from "@/lib/panel/scope";

const r2 = (n: number) => Number(n.toFixed(2));

/** document_returns columns incl. the sql/return-invoices.sql additions. */
export const RETURN_COLS_BASE =
  "id, parent_type, parent_id, line_ref, product_id, part_code, name, quantity, unit_amount, vat_rate, net_amount, vat_amount, total, currency, account_scope, reason, created_at";
export const RETURN_COLS = `${RETURN_COLS_BASE}, return_number, accountant_sent_at, accountant_entered_at`;

/**
 * A factură de retur: every annex line sharing one return_number. Always
 * belongs to exactly one parent document (a line only joins a number already
 * open on ITS parent), so partner / scope / currency come from that parent.
 */
export type ReturnInvoice = {
  number: number;
  label: string;
  kind: "invoice" | "purchase";
  parent_id: string;
  /** Invoice series+number, or the supplier's document number. */
  parent_label: string;
  parent_date: string | null;
  parent_total: number;
  party: {
    name: string;
    idno: string | null;
    vat_code: string | null;
    address: string | null;
  };
  account_scope: string;
  currency: string;
  /** created_at of the first returned line. */
  date: string;
  lines: DocumentReturn[];
  net: number;
  vat: number;
  total: number;
  /** Set only when EVERY line was sent / entered. */
  accountant_sent_at: string | null;
  accountant_entered_at: string | null;
};

type ParentInfo = Pick<
  ReturnInvoice,
  "parent_label" | "parent_date" | "parent_total" | "party"
>;

const UNKNOWN_PARENT: ParentInfo = {
  parent_label: "—",
  parent_date: null,
  parent_total: 0,
  party: { name: "—", idno: null, vat_code: null, address: null },
};

async function loadParents(
  rows: DocumentReturn[],
): Promise<Map<string, ParentInfo>> {
  const out = new Map<string, ParentInfo>();
  const ids = (kind: "invoice" | "purchase") => [
    ...new Set(rows.filter((r) => r.parent_type === kind).map((r) => r.parent_id)),
  ];
  const invoiceIds = ids("invoice");
  const purchaseIds = ids("purchase");
  const supabase = await createClient();

  if (invoiceIds.length) {
    const { data } = await supabase
      .from("invoices")
      .select("id, series, number, issued_date, total, customer_snapshot")
      .in("id", invoiceIds);
    for (const inv of (data ?? []) as unknown as Array<{
      id: string;
      series: string | null;
      number: string | number | null;
      issued_date: string | null;
      total: number | string | null;
      customer_snapshot: {
        name?: string | null;
        idno?: string | null;
        vat_number?: string | null;
        address?: string | null;
      } | null;
    }>) {
      out.set(`invoice:${inv.id}`, {
        parent_label: `${inv.series ?? ""}${inv.number ?? ""}` || inv.id.slice(0, 8).toUpperCase(),
        parent_date: inv.issued_date,
        parent_total: Number(inv.total ?? 0),
        party: {
          name: inv.customer_snapshot?.name ?? "—",
          idno: inv.customer_snapshot?.idno ?? null,
          vat_code: inv.customer_snapshot?.vat_number ?? null,
          address: inv.customer_snapshot?.address ?? null,
        },
      });
    }
  }

  if (purchaseIds.length) {
    const { data } = await supabase
      .from("purchases")
      .select("id, document_number, document_date, total, suppliers(name, idno, vat_code, address)")
      .in("id", purchaseIds);
    for (const pur of (data ?? []) as unknown as Array<{
      id: string;
      document_number: string | null;
      document_date: string | null;
      total: number | string | null;
      suppliers: {
        name: string | null;
        idno: string | null;
        vat_code: string | null;
        address: string | null;
      } | null;
    }>) {
      out.set(`purchase:${pur.id}`, {
        parent_label: pur.document_number ?? pur.id.slice(0, 8).toUpperCase(),
        parent_date: pur.document_date,
        parent_total: Number(pur.total ?? 0),
        party: {
          name: pur.suppliers?.name ?? "—",
          idno: pur.suppliers?.idno ?? null,
          vat_code: pur.suppliers?.vat_code ?? null,
          address: pur.suppliers?.address ?? null,
        },
      });
    }
  }
  return out;
}

function groupRows(
  rows: DocumentReturn[],
  parents: Map<string, ParentInfo>,
): ReturnInvoice[] {
  const byNumber = new Map<number, DocumentReturn[]>();
  for (const r of rows) {
    if (r.return_number == null) continue;
    const n = Number(r.return_number);
    byNumber.set(n, [...(byNumber.get(n) ?? []), r]);
  }
  const out: ReturnInvoice[] = [];
  for (const [number, group] of byNumber) {
    const lines = [...group].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const first = lines[0];
    const parent = parents.get(`${first.parent_type}:${first.parent_id}`) ?? UNKNOWN_PARENT;
    const allStamped = (key: "accountant_sent_at" | "accountant_entered_at") =>
      lines.every((l) => l[key])
        ? lines.reduce<string | null>(
            (latest, l) => (!latest || (l[key] as string) > latest ? (l[key] as string) : latest),
            null,
          )
        : null;
    out.push({
      number,
      label: formatReturnNumber(number),
      kind: first.parent_type,
      parent_id: first.parent_id,
      ...parent,
      account_scope: first.account_scope ?? "conta1",
      currency: first.currency ?? "MDL",
      date: first.created_at,
      lines,
      net: r2(lines.reduce((s, l) => s + Number(l.net_amount ?? 0), 0)),
      vat: r2(lines.reduce((s, l) => s + Number(l.vat_amount ?? 0), 0)),
      total: r2(lines.reduce((s, l) => s + Number(l.total ?? 0), 0)),
      accountant_sent_at: allStamped("accountant_sent_at"),
      accountant_entered_at: allStamped("accountant_entered_at"),
    });
  }
  return out.sort((a, b) => b.number - a.number);
}

/**
 * All return invoices of one book, newest first. `migrated: false` means
 * sql/return-invoices.sql hasn't been applied yet (no return_number column) —
 * the page shows a notice instead of an empty list.
 */
export async function listReturnInvoices(opts: {
  scope: AccountScope;
  kind?: "invoice" | "purchase";
  q?: string;
}): Promise<{ migrated: boolean; rows: ReturnInvoice[] }> {
  let query = getSupabaseAdmin()
    .from("document_returns")
    .select(RETURN_COLS)
    .not("return_number", "is", null)
    .eq("account_scope", opts.scope)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (opts.kind) query = query.eq("parent_type", opts.kind);
  const { data, error } = await query;
  if (error) return { migrated: false, rows: [] };

  const rows = (data ?? []) as unknown as DocumentReturn[];
  let invoices = groupRows(rows, await loadParents(rows));

  const q = opts.q?.trim().toLowerCase();
  if (q) {
    invoices = invoices.filter((ri) =>
      [
        ri.label,
        String(ri.number),
        ri.parent_label,
        ri.party.name,
        ri.party.idno ?? "",
        ...ri.lines.flatMap((l) => [l.part_code ?? "", l.name ?? ""]),
      ].some((v) => v.toLowerCase().includes(q)),
    );
  }
  return { migrated: true, rows: invoices };
}

/** One return invoice by its number, or null. */
export async function getReturnInvoice(number: number): Promise<ReturnInvoice | null> {
  if (!Number.isInteger(number) || number <= 0) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("document_returns")
    .select(RETURN_COLS)
    .eq("return_number", number);
  if (error || !data?.length) return null;
  const rows = data as unknown as DocumentReturn[];
  return groupRows(rows, await loadParents(rows))[0] ?? null;
}
