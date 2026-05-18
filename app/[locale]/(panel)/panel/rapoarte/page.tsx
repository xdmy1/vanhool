import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReportControls } from "@/components/panel/reports/ReportControls";
import {
  reportSalesByDay,
  reportTopProducts,
  reportTopClients,
  reportMargin,
  reportStockTurnover,
} from "@/lib/panel/reports/queries";

export default async function PanelRapoartePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  // eslint-disable-next-line react-hooks/purity
  const today = new Date().toISOString().slice(0, 10);
  // eslint-disable-next-line react-hooks/purity
  const thirtyAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const from = typeof sp.from === "string" ? sp.from : thirtyAgo;
  const to = typeof sp.to === "string" ? sp.to : today;

  const [salesByDay, topProducts, topClients, margin, turnover] = await Promise.all([
    reportSalesByDay({ from, to }),
    reportTopProducts({ from, to }, undefined, 15),
    reportTopClients({ from, to }, undefined, 15),
    reportMargin({ from, to }, undefined, 20),
    reportStockTurnover(20),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("reports_title")}
        subtitle={t("reports_subtitle", { from: thirtyAgo, to: today })}
      />

      <section className="mt-6 space-y-4">
        <h2 className="text-base font-semibold">{t("reports_section_sales")}</h2>
        <ReportControls kind="sales_by_day" defaultFrom={from} defaultTo={to} />
        <Table
          headers={[
            t("reports_col_day"),
            t("reports_col_orders"),
            t("reports_col_total"),
            t("reports_col_conta1"),
            t("reports_col_conta2"),
          ]}
          rows={salesByDay.map((r) => [
            r.day,
            String(r.orders),
            r.gross.toFixed(2),
            r.conta1.toFixed(2),
            r.conta2.toFixed(2),
          ])}
          emptyLabel={t("reports_empty")}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-semibold">{t("reports_section_top_products")}</h2>
        <ReportControls kind="top_products" defaultFrom={from} defaultTo={to} />
        <Table
          headers={[
            t("reports_col_code"),
            t("reports_col_name"),
            t("reports_col_qty"),
            t("reports_col_gross"),
          ]}
          rows={topProducts.map((r) => [
            r.partCode ?? "—",
            r.name ?? "—",
            String(r.qty),
            r.gross.toFixed(2),
          ])}
          emptyLabel={t("reports_empty")}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-semibold">{t("reports_section_top_clients")}</h2>
        <ReportControls kind="top_clients" defaultFrom={from} defaultTo={to} />
        <Table
          headers={[
            t("reports_col_client"),
            t("reports_col_email"),
            t("reports_col_orders"),
            t("reports_col_gross"),
          ]}
          rows={topClients.map((r) => [
            r.name ?? "—",
            r.email ?? "—",
            String(r.orders),
            r.gross.toFixed(2),
          ])}
          emptyLabel={t("reports_empty")}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-semibold">{t("reports_section_margin")}</h2>
        <p className="text-xs text-muted">{t("reports_section_margin_help")}</p>
        <ReportControls kind="margin" defaultFrom={from} defaultTo={to} />
        <Table
          headers={[
            t("reports_col_code"),
            t("reports_col_name"),
            t("reports_col_qty"),
            t("reports_col_revenue"),
            t("reports_col_cost"),
            t("reports_col_margin"),
            t("reports_col_margin_pct"),
          ]}
          rows={margin.map((r) => [
            r.partCode ?? "—",
            r.name ?? "—",
            String(r.qty),
            r.revenue.toFixed(2),
            r.cost.toFixed(2),
            r.margin.toFixed(2),
            `${r.margin_pct.toFixed(1)}%`,
          ])}
          emptyLabel={t("reports_empty")}
        />
      </section>

      <section className="mt-10 space-y-2">
        <h2 className="text-base font-semibold">{t("reports_section_turnover")}</h2>
        <p className="text-xs text-muted">{t("reports_section_turnover_help")}</p>
        <Table
          headers={[
            t("reports_col_code"),
            t("reports_col_name"),
            t("reports_col_sold_30"),
            t("reports_col_current_stock"),
            t("reports_col_turnover"),
          ]}
          rows={turnover.map((r) => [
            r.partCode ?? "—",
            r.name ?? "—",
            String(r.sold_30d),
            String(r.current_stock),
            r.turnover === null ? t("reports_turnover_zero") : r.turnover.toFixed(2),
          ])}
          emptyLabel={t("reports_empty")}
        />
      </section>
    </div>
  );
}

function Table({
  headers,
  rows,
  emptyLabel,
}: {
  headers: string[];
  rows: string[][];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-6 text-center text-xs text-muted">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-2 ${i >= 2 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-4 py-2 ${j >= 2 ? "text-right tabular-nums" : ""}`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
