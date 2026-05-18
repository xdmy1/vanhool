"use server";

import { getPanelUser } from "@/lib/panel/auth";
import { toCsv } from "@/lib/panel/reports/csv";
import {
  listInvoicesForExport,
  reportMargin,
  reportSalesByDay,
  reportTopClients,
  reportTopProducts,
} from "@/lib/panel/reports/queries";
import type { AccountScope } from "@/lib/panel/scope";

export type ReportKind =
  | "sales_by_day"
  | "top_products"
  | "top_clients"
  | "margin"
  | "invoices";

export async function downloadReportCsv(args: {
  kind: ReportKind;
  from: string;
  to: string;
  scope?: AccountScope;
}): Promise<{ ok: true; filename: string; csv: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const range = { from: args.from, to: args.to };

  let rows: Array<Record<string, unknown>> = [];
  let filename = `${args.kind}_${args.from}_${args.to}.csv`;

  switch (args.kind) {
    case "sales_by_day":
      rows = (await reportSalesByDay(range)).map((r) => ({
        day: r.day,
        comenzi: r.orders,
        gross: r.gross.toFixed(2),
        conta1: r.conta1.toFixed(2),
        conta2: r.conta2.toFixed(2),
      }));
      break;
    case "top_products":
      rows = (await reportTopProducts(range, args.scope)).map((r) => ({
        cod_intern: r.partCode ?? "",
        nume: r.name ?? "",
        cantitate: r.qty,
        gross: r.gross.toFixed(2),
      }));
      break;
    case "top_clients":
      rows = (await reportTopClients(range, args.scope)).map((r) => ({
        nume: r.name ?? "",
        email: r.email ?? "",
        comenzi: r.orders,
        gross: r.gross.toFixed(2),
      }));
      break;
    case "margin":
      rows = (await reportMargin(range, args.scope)).map((r) => ({
        cod_intern: r.partCode ?? "",
        nume: r.name ?? "",
        cantitate: r.qty,
        venit: r.revenue.toFixed(2),
        cost: r.cost.toFixed(2),
        marja: r.margin.toFixed(2),
        marja_pct: r.margin_pct.toFixed(2),
      }));
      break;
    case "invoices":
      rows = (await listInvoicesForExport(range)).map((r) => ({
        numar: `${r.series ?? ""}-${r.number ?? ""}`,
        data: r.issued_date,
        client: r.customer_name ?? "",
        idno: r.customer_idno ?? "",
        total: r.total.toFixed(2),
        refrens_url: r.refrens_url ?? "",
      }));
      filename = `facturi_${args.from}_${args.to}.csv`;
      break;
  }

  return { ok: true, filename, csv: toCsv(rows) };
}
