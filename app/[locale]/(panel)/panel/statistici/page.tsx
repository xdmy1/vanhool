import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  CashTrendChart,
  CategoryMixChart,
  SalesBarChart,
} from "@/components/panel/statistici/StatsCharts";
import { createClient } from "@/lib/supabase/server";
import { getCashBalance } from "@/lib/panel/cash/actions";
import {
  reportCashTrend,
  reportSalesByDay,
  reportTopProducts,
} from "@/lib/panel/reports/queries";

export default async function PanelStatisticiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  // eslint-disable-next-line react-hooks/purity
  const today = new Date().toISOString().slice(0, 10);
  // eslint-disable-next-line react-hooks/purity
  const thirtyAgo = new Date(Date.now() - 30 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const supabase = await createClient();
  const [
    salesByDay,
    topProducts,
    cashTrend,
    cash,
    { count: lowStock },
    { count: draftPurchases },
    todaysRevenue,
  ] = await Promise.all([
    reportSalesByDay({ from: thirtyAgo, to: today }),
    reportTopProducts({ from: thirtyAgo, to: today }, undefined, 8),
    reportCashTrend({ from: thirtyAgo, to: today }),
    getCashBalance("main"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .lte("stock_quantity", 5),
    supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("orders")
      .select("total, currency")
      .gte("created_at", `${today}T00:00:00`)
      .neq("status", "cancelled"),
  ]);

  // Group today's revenue by currency so EUR / USD sales stay in their own
  // bucket instead of being forced into a single "MDL equivalent" number.
  const todayByCurrency: Record<string, number> = {};
  for (const r of (todaysRevenue.data ?? []) as {
    total: number | string | null;
    currency?: string | null;
  }[]) {
    const c = (r.currency ?? "MDL").toUpperCase();
    todayByCurrency[c] = (todayByCurrency[c] ?? 0) + Number(r.total ?? 0);
  }
  const todayTotalLabel = Object.entries(todayByCurrency)
    .filter(([, n]) => Math.abs(n) > 0.005)
    .map(([c, n]) => `${n.toFixed(2)} ${c}`)
    .join(", ") || "0.00 MDL";

  const productSlice = topProducts.map((p) => ({
    name: p.name?.slice(0, 24) ?? p.partCode ?? "—",
    value: Number(p.gross.toFixed(2)),
  }));

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("stats_eyebrow")}
        title={t("stats_title")}
        subtitle={t("stats_subtitle", { from: thirtyAgo, to: today })}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label={t("stats_kpi_today")}
          value={todayTotalLabel}
          accent
        />
        <KpiCard
          icon={Wallet}
          label={t("stats_kpi_cash")}
          value={`${cash.balance.toFixed(2)} MDL`}
        />
        <KpiCard
          icon={ShoppingBag}
          label={t("stats_kpi_draft")}
          value={String(draftPurchases ?? 0)}
        />
        <KpiCard
          icon={AlertTriangle}
          label={t("stats_kpi_low_stock")}
          value={String(lowStock ?? 0)}
          accent={(lowStock ?? 0) > 0}
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title={t("stats_chart_sales")}>
          {salesByDay.length === 0 ? (
            <EmptyChart label={t("stats_chart_empty")} />
          ) : (
            <SalesBarChart data={salesByDay} />
          )}
        </Panel>
        <Panel title={t("stats_chart_mix")}>
          {productSlice.length === 0 ? (
            <EmptyChart label={t("stats_chart_empty")} />
          ) : (
            <CategoryMixChart data={productSlice} />
          )}
        </Panel>
      </section>

      <section className="mt-6">
        <Panel title={t("stats_chart_cash")}>
          {cashTrend.length === 0 ? <EmptyChart label={t("stats_chart_empty")} /> : <CashTrendChart data={cashTrend} />}
        </Panel>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-md border bg-surface p-4 ${
        accent ? "border-primary/40" : "border-border"
      }`}
    >
      <div
        className={`mb-2 grid size-8 place-items-center rounded ${
          accent ? "bg-primary/15 text-primary" : "bg-background text-muted"
        }`}
      >
        <Icon className="size-4" />
      </div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface/95 p-6 shadow-[0_18px_40px_-22px_rgba(30,27,21,0.25)]">
      {/* Subtle radial highlight in the top-left for a glass-card feel */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl"
      />
      <header className="relative mb-5 flex items-end justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {title}
        </h3>
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
