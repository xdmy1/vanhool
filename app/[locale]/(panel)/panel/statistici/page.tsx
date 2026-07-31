import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  FileSignature,
  Minus,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { dateISO, todayISO } from "@/lib/datetime";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  CashTrendChart,
  CategoryMixChart,
  SalesBarChart,
  Sparkline,
} from "@/components/panel/statistici/StatsCharts";
import { Link } from "@/lib/i18n/routing";
import { getCashBalance } from "@/lib/panel/cash/actions";
import {
  reportCashTrend,
  reportConversion,
  reportOpenProformaValue,
  reportPeriodTotals,
  reportProfitSummary,
  reportReceivablesAging,
  reportSalesByDay,
  reportTopClients,
  reportTopProducts,
  type SalesByDayRow,
} from "@/lib/panel/reports/queries";
import { cn } from "@/lib/utils/cn";

const RANGE_DAYS: Record<string, number> = { "7": 7, "30": 30, "90": 90 };

// Aggregate daily rows into Monday-anchored weeks so a 90-day chart stays
// readable (≈13 bars instead of 90).
function toWeekly(rows: SalesByDayRow[]): SalesByDayRow[] {
  const map = new Map<string, SalesByDayRow>();
  for (const r of rows) {
    const d = new Date(`${r.day}T00:00:00Z`);
    const dow = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
    const key = d.toISOString().slice(0, 10);
    const cur = map.get(key) ?? { day: key, orders: 0, gross: 0, conta1: 0, conta2: 0 };
    cur.orders += r.orders;
    cur.gross += r.gross;
    cur.conta1 += r.conta1;
    cur.conta2 += r.conta2;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
}

function deltaPct(cur: number, prev: number): number | null {
  if (prev <= 0) return null;
  return ((cur - prev) / prev) * 100;
}

export default async function PanelStatisticiPage({
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

  const rangeKey =
    typeof sp.range === "string" && RANGE_DAYS[sp.range] ? sp.range : "30";
  const days = RANGE_DAYS[rangeKey];

  const today = todayISO();
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const from = dateISO(new Date(now - (days - 1) * 86_400_000));
  const prevTo = dateISO(new Date(now - days * 86_400_000));
  const prevFrom = dateISO(new Date(now - (2 * days - 1) * 86_400_000));

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
    });

  const [
    salesByDay,
    prevTotals,
    profit,
    prevProfit,
    topProducts,
    topClients,
    cashTrend,
    aging,
    conversion,
    openProformaValue,
    cash,
  ] = await Promise.all([
    reportSalesByDay({ from, to: today }),
    reportPeriodTotals({ from: prevFrom, to: prevTo }),
    reportProfitSummary({ from, to: today }, undefined, 8),
    reportProfitSummary({ from: prevFrom, to: prevTo }, undefined, 1),
    reportTopProducts({ from, to: today }, undefined, 8),
    reportTopClients({ from, to: today }, undefined, 6),
    reportCashTrend({ from, to: today }),
    reportReceivablesAging(),
    reportConversion({ from, to: today }),
    reportOpenProformaValue(),
    getCashBalance("main"),
  ]);

  const revenue = salesByDay.reduce((s, r) => s + r.gross, 0);
  const orders = salesByDay.reduce((s, r) => s + r.orders, 0);
  const aov = orders > 0 ? revenue / orders : 0;
  const prevAov = prevTotals.orders > 0 ? prevTotals.revenue / prevTotals.orders : 0;

  const chartData = days > 45 ? toWeekly(salesByDay) : salesByDay;
  const revSpark = salesByDay.map((r) => ({ v: r.gross }));
  const ordSpark = salesByDay.map((r) => ({ v: r.orders }));

  const productSlice = topProducts.map((p) => ({
    name: p.name?.slice(0, 24) ?? p.partCode ?? "—",
    value: Number(p.gross.toFixed(2)),
  }));

  const fmtMoney = (n: number, cur = "MDL") =>
    `${new Intl.NumberFormat("ro-MD", { maximumFractionDigits: 0 }).format(Math.round(n))} ${cur}`;
  const fmtByCurrency = (m: Record<string, number>) => {
    const e = Object.entries(m).filter(([, n]) => Math.abs(n) > 0.005);
    return e.length ? e.map(([c, n]) => fmtMoney(n, c)).join(" · ") : "0 MDL";
  };

  const rangeChips = [
    { id: "7", label: t("stats_range_7") },
    { id: "30", label: t("stats_range_30") },
    { id: "90", label: t("stats_range_90") },
  ];

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("stats_eyebrow")}
        title={t("stats_title")}
        subtitle={t("stats_subtitle_range", { from: fmtDate(from), to: fmtDate(today) })}
        actions={
          <div className="flex items-center gap-1.5">
            {rangeChips.map((c) => (
              <a
                key={c.id}
                href={`?range=${c.id}`}
                className={cn(
                  "inline-flex h-9 items-center rounded-md border px-3 text-xs font-medium transition-colors",
                  rangeKey === c.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-primary/40 hover:text-primary",
                )}
              >
                {c.label}
              </a>
            ))}
          </div>
        }
      />

      {/* Hero KPIs — with period-over-period deltas + sparklines */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label={t("stats_kpi_revenue")}
          value={fmtMoney(revenue)}
          delta={deltaPct(revenue, prevTotals.revenue)}
          spark={revSpark}
          accent
        />
        <KpiCard
          icon={Banknote}
          label={t("stats_kpi_profit")}
          value={fmtMoney(profit.profit)}
          delta={deltaPct(profit.profit, prevProfit.profit)}
          sub={t("stats_kpi_margin", { pct: profit.marginPct })}
          note={t("stats_kpi_profit_coverage", { pct: profit.coveragePct })}
          tone="success"
        />
        <KpiCard
          icon={ShoppingCart}
          label={t("stats_kpi_orders")}
          value={String(orders)}
          delta={deltaPct(orders, prevTotals.orders)}
          spark={ordSpark}
        />
        <KpiCard
          icon={Receipt}
          label={t("stats_kpi_aov")}
          value={fmtMoney(aov)}
          delta={deltaPct(aov, prevAov)}
        />
      </section>

      {/* Secondary strip — receivables / proformas / cash / conversion */}
      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard
          href="/panel/facturi?unpaid=1"
          locale={locale}
          icon={Receipt}
          label={t("stats_kpi_receivable")}
          value={fmtByCurrency(aging.totalByCurrency)}
          tone="warning"
        />
        <MiniCard
          href="/panel/proforme?status=sent"
          locale={locale}
          icon={FileSignature}
          label={t("stats_kpi_open_proformas")}
          value={fmtByCurrency(openProformaValue)}
        />
        <MiniCard
          href="/panel/cheltuieli-cash"
          locale={locale}
          icon={Wallet}
          label={t("stats_kpi_cash")}
          value={fmtMoney(cash.balance)}
        />
        <MiniCard
          icon={TrendingUp}
          label={t("stats_kpi_conversion")}
          value={`${conversion.proformaRate}% · ${conversion.paidRate}%`}
          note={t("stats_conversion_legend")}
        />
      </section>

      {/* Revenue over time + best sellers */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title={t("stats_section_revenue")}>
            {chartData.length === 0 ? (
              <EmptyChart label={t("stats_chart_empty")} />
            ) : (
              <SalesBarChart data={chartData} />
            )}
          </Panel>
        </div>
        <Panel title={t("stats_section_bestsellers")}>
          {productSlice.length === 0 ? (
            <EmptyChart label={t("stats_chart_empty")} />
          ) : (
            <CategoryMixChart data={productSlice} />
          )}
        </Panel>
      </section>

      {/* Receivables aging + cash flow */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={t("stats_section_aging")}>
          <AgingWidget
            buckets={aging.buckets}
            totalByCurrency={aging.totalByCurrency}
            labels={{
              b0: t("stats_aging_0_30"),
              b1: t("stats_aging_31_60"),
              b2: t("stats_aging_61_90"),
              b3: t("stats_aging_90"),
              invoices: t("stats_aging_invoices"),
              total: t("stats_aging_total"),
              empty: t("stats_aging_empty"),
            }}
            fmtMoney={fmtMoney}
          />
        </Panel>
        <Panel title={t("stats_section_cash")}>
          {cashTrend.length === 0 ? (
            <EmptyChart label={t("stats_chart_empty")} />
          ) : (
            <CashTrendChart data={cashTrend} />
          )}
        </Panel>
      </section>

      {/* Profit leaders + top clients */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title={t("stats_section_profit_leaders")}
          hint={t("stats_kpi_profit_coverage", { pct: profit.coveragePct })}
        >
          {profit.leaders.length === 0 ? (
            <EmptyChart label={t("stats_chart_empty")} />
          ) : (
            <ProfitTable
              rows={profit.leaders}
              fmtMoney={fmtMoney}
              cols={{
                product: t("stats_col_product"),
                qty: t("stats_col_qty"),
                revenue: t("stats_col_revenue"),
                profit: t("stats_col_profit"),
                margin: t("stats_col_margin"),
              }}
            />
          )}
        </Panel>
        <Panel title={t("stats_section_clients")}>
          {topClients.length === 0 ? (
            <EmptyChart label={t("stats_chart_empty")} />
          ) : (
            <ClientBars
              rows={topClients.map((c) => ({
                name: c.name ?? c.email ?? "—",
                orders: c.orders,
                gross: c.gross,
              }))}
              fmtMoney={fmtMoney}
              ordersLabel={t("stats_col_orders")}
            />
          )}
        </Panel>
      </section>
    </div>
  );
}

// =============================================================================
// KPI card with delta badge + optional sparkline
// =============================================================================

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  note,
  spark,
  accent,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  delta?: number | null;
  sub?: string;
  note?: string;
  spark?: { v: number }[];
  accent?: boolean;
  tone?: "success" | "warning";
}) {
  const iconTone =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "warning"
        ? "bg-warning/15 text-warning"
        : accent
          ? "bg-primary/15 text-primary"
          : "bg-background text-muted";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface p-4",
        accent ? "border-primary/40" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("grid size-8 place-items-center rounded", iconTone)}>
          <Icon className="size-4" />
        </div>
        {delta !== undefined ? <DeltaBadge delta={delta} /> : null}
      </div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-0.5 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {sub ? (
          <div className="pb-1 text-xs font-semibold text-success">{sub}</div>
        ) : null}
      </div>
      {spark && spark.length > 1 ? (
        <div className="mt-2 -mb-1 opacity-80">
          <Sparkline data={spark} />
        </div>
      ) : null}
      {note ? <div className="mt-1.5 text-[10px] text-muted">{note}</div> : null}
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-muted/15 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
        <Minus className="size-3" />
      </span>
    );
  }
  const up = delta >= 0;
  const flat = Math.abs(delta) < 0.5;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
        flat
          ? "bg-muted/15 text-muted-strong"
          : up
            ? "bg-success/12 text-success"
            : "bg-destructive/12 text-destructive",
      )}
    >
      {flat ? (
        <Minus className="size-3" />
      ) : up ? (
        <ArrowUpRight className="size-3" />
      ) : (
        <ArrowDownRight className="size-3" />
      )}
      {Math.abs(delta) >= 1000
        ? `${(Math.abs(delta) / 1000).toFixed(1)}k`
        : `${Math.abs(delta).toFixed(0)}`}
      %
    </span>
  );
}

function MiniCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
  href,
  locale,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  note?: string;
  tone?: "warning";
  href?: string;
  locale?: string;
}) {
  const body = (
    <div
      className={cn(
        "h-full rounded-xl border bg-surface p-4 transition-colors",
        tone === "warning" ? "border-warning/40" : "border-border",
        href ? "hover:border-primary/60" : "",
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        <Icon
          className={cn("size-3.5", tone === "warning" ? "text-warning" : "text-muted")}
        />
        {label}
      </div>
      <div className="mt-1.5 text-lg font-bold tabular-nums">{value}</div>
      {note ? <div className="mt-1 text-[10px] text-muted">{note}</div> : null}
    </div>
  );
  if (!href || !locale) return body;
  return (
    <Link href={href as "/panel"} locale={locale} className="block h-full">
      {body}
    </Link>
  );
}

// =============================================================================
// Receivables aging — colour-coded by age, one bar per bucket (MDL scale)
// =============================================================================

const AGING_TONE = [
  { bar: "bg-success", text: "text-success", dot: "bg-success" },
  { bar: "bg-warning", text: "text-warning", dot: "bg-warning" },
  { bar: "bg-orange-500", text: "text-orange-500", dot: "bg-orange-500" },
  { bar: "bg-destructive", text: "text-destructive", dot: "bg-destructive" },
];

function AgingWidget({
  buckets,
  totalByCurrency,
  labels,
  fmtMoney,
}: {
  buckets: Array<{ key: string; byCurrency: Record<string, number>; count: number }>;
  totalByCurrency: Record<string, number>;
  labels: Record<string, string>;
  fmtMoney: (n: number, cur?: string) => string;
}) {
  const bucketLabels = [labels.b0, labels.b1, labels.b2, labels.b3];
  const maxMdl = Math.max(1, ...buckets.map((b) => b.byCurrency.MDL ?? 0));
  const totalCount = buckets.reduce((s, b) => s + b.count, 0);
  const totalEntries = Object.entries(totalByCurrency).filter(([, n]) => n > 0.005);

  if (totalCount === 0) {
    return (
      <div className="grid h-[220px] place-items-center text-center text-sm text-muted">
        {labels.empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[11px] uppercase tracking-wide text-muted">
          {labels.total}
        </span>
        {totalEntries.map(([cur, n]) => (
          <span key={cur} className="text-lg font-bold tabular-nums">
            {fmtMoney(n, cur)}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {buckets.map((b, i) => {
          const mdl = b.byCurrency.MDL ?? 0;
          const eur = b.byCurrency.EUR ?? 0;
          const width = Math.max(mdl > 0 ? 4 : 0, (mdl / maxMdl) * 100);
          const tone = AGING_TONE[i];
          return (
            <div key={b.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className={cn("inline-block size-2 rounded-full", tone.dot)} />
                  <span className="text-muted-strong">{bucketLabels[i]}</span>
                  {b.count > 0 ? (
                    <span className="text-[10px] text-muted">
                      · {b.count} {labels.invoices}
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums font-semibold">
                  {mdl > 0 ? fmtMoney(mdl) : "—"}
                  {eur > 0 ? (
                    <span className="ml-1.5 text-muted-strong">+ {fmtMoney(eur, "EUR")}</span>
                  ) : null}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className={cn("h-full rounded-full", tone.bar)}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Profit leaders table
// =============================================================================

function ProfitTable({
  rows,
  fmtMoney,
  cols,
}: {
  rows: Array<{
    productId: string;
    name: string | null;
    partCode: string | null;
    qty: number;
    revenue: number;
    profit: number;
    marginPct: number;
  }>;
  fmtMoney: (n: number, cur?: string) => string;
  cols: Record<string, string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-muted">
            <th className="pb-2 pr-2 font-semibold">{cols.product}</th>
            <th className="pb-2 px-2 text-right font-semibold">{cols.qty}</th>
            <th className="pb-2 px-2 text-right font-semibold">{cols.revenue}</th>
            <th className="pb-2 px-2 text-right font-semibold">{cols.profit}</th>
            <th className="pb-2 pl-2 text-right font-semibold">{cols.margin}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((r) => (
            <tr key={r.productId}>
              <td className="py-2 pr-2">
                <div className="max-w-[180px] truncate font-medium">
                  {r.name ?? r.partCode ?? "—"}
                </div>
                {r.partCode ? (
                  <div className="font-mono text-[10px] text-muted">{r.partCode}</div>
                ) : null}
              </td>
              <td className="px-2 py-2 text-right tabular-nums text-muted-strong">
                {r.qty}
              </td>
              <td className="px-2 py-2 text-right tabular-nums text-muted-strong">
                {fmtMoney(r.revenue)}
              </td>
              <td className="px-2 py-2 text-right tabular-nums font-semibold text-success">
                {fmtMoney(r.profit)}
              </td>
              <td className="py-2 pl-2 text-right tabular-nums">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                    r.marginPct >= 20
                      ? "bg-success/12 text-success"
                      : r.marginPct >= 8
                        ? "bg-warning/12 text-warning"
                        : "bg-destructive/12 text-destructive",
                  )}
                >
                  {r.marginPct.toFixed(0)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Top clients — ranked horizontal bars
// =============================================================================

function ClientBars({
  rows,
  fmtMoney,
  ordersLabel,
}: {
  rows: Array<{ name: string; orders: number; gross: number }>;
  fmtMoney: (n: number, cur?: string) => string;
  ordersLabel: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.gross));
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="truncate font-medium">{r.name}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold">{fmtMoney(r.gross)}</span>
              <span className="ml-1.5 text-[10px] text-muted">
                {r.orders} {ordersLabel}
              </span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              style={{ width: `${Math.max(4, (r.gross / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Shells
// =============================================================================

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface/95 p-6 shadow-[0_18px_40px_-22px_rgba(30,27,21,0.25)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl"
      />
      <header className="relative mb-5 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {title}
        </h3>
        {hint ? <span className="text-[10px] text-muted">{hint}</span> : null}
      </header>
      <div className="relative">{children}</div>
    </section>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[260px] place-items-center rounded-xl border border-dashed border-border/70 text-xs text-muted">
      {label}
    </div>
  );
}
