import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileSignature,
  Globe,
  Plus,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { SalesBarChart } from "@/components/panel/statistici/StatsCharts";
import { getCashBalance } from "@/lib/panel/cash/actions";
import { listInvoices } from "@/lib/panel/invoices/queries";
import { reportSalesByDay } from "@/lib/panel/reports/queries";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

export default async function PanelDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const supabase = await createClient();
  // eslint-disable-next-line react-hooks/purity
  const today = new Date().toISOString().slice(0, 10);
  // eslint-disable-next-line react-hooks/purity
  const sevenAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const [
    todaysOrders,
    cash,
    salesByDay,
    proformas,
    invoices,
    { count: triagePending },
    { count: lowStock },
    { count: draftPurchases },
    recentOrders,
    recentProformas,
    recentInvoices,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total, account_scope")
      .gte("created_at", `${today}T00:00:00`)
      .neq("status", "cancelled"),
    getCashBalance("main"),
    reportSalesByDay({ from: sevenAgo, to: today }),
    listInvoices({ type: "proforma" }),
    listInvoices({ type: "invoice" }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("source", "storefront")
      .is("triaged_at", null)
      .neq("status", "cancelled"),
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
      .select(
        "id, customer_name, customer_email, total, status, source, account_scope, triaged_at, created_at",
      )
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(6),
    listInvoices({ type: "proforma" }).then((all) => all.slice(0, 5)),
    listInvoices({ type: "invoice" }).then((all) => all.slice(0, 5)),
  ]);

  const todayTotal = (todaysOrders.data ?? []).reduce(
    (s, r) => s + Number(r.total ?? 0),
    0,
  );
  const todayConta1 = (todaysOrders.data ?? [])
    .filter((r) => r.account_scope === "conta1")
    .reduce((s, r) => s + Number(r.total ?? 0), 0);
  const todayConta2 = todayTotal - todayConta1;

  const openProformas = proformas.filter((p) => p.status === "sent").length;
  const unpaidInvoices = invoices.filter(
    (i) => i.status === "issued" || i.status === "sent" || i.status === "draft",
  ).length;

  // Fixed reference rates so totals across MDL/EUR/USD documents can be
  // expressed in a single number. Matches the rest of the panel.
  const FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };
  const toMdl = (total: number, currency: string | null | undefined) =>
    total * (FX_TO_MDL[(currency ?? "MDL").toUpperCase()] ?? 1);

  const proformaTotal = proformas
    .filter((p) => p.status === "sent")
    .reduce((s, p) => s + toMdl(p.total, p.currency), 0);

  const fmtDateTime = (d: string | null) =>
    d ? new Date(d).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <header className="mb-6 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("dashboard_title")}
          </h1>
          <p className="text-sm text-muted-strong md:text-base">
            {t("dashboard_today_subtitle", {
              date: new Date(today).toLocaleDateString(dateLocale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuickAction href="/panel/vanzare-noua" icon={ShoppingCart} label={t("nav_vanzare_noua")} primary />
          <QuickAction href="/panel/proforme/new" icon={FileSignature} label={t("proforma_new_button")} />
          <QuickAction href="/panel/achizitii/new" icon={ClipboardList} label={t("achizitii_new_button")} />
        </div>
      </header>

      {/* Primary KPIs */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label={t("dashboard_kpi_today")}
          value={<Price value={todayTotal} size="lg" accent={false} />}
          sub={t("dashboard_kpi_today_split", {
            c1: todayConta1.toFixed(2),
            c2: todayConta2.toFixed(2),
          })}
          accent
        />
        <KpiCard
          icon={Wallet}
          label={t("dashboard_kpi_cash")}
          value={`${cash.balance.toFixed(2)} MDL`}
          sub={t("dashboard_kpi_cash_sub", { count: cash.movements_count })}
        />
        <KpiCard
          icon={Globe}
          label={t("dashboard_kpi_triage")}
          value={String(triagePending ?? 0)}
          href="/panel/comenzi-site"
          locale={locale}
          accent={(triagePending ?? 0) > 0}
          tone={(triagePending ?? 0) > 0 ? "warning" : undefined}
        />
        <KpiCard
          icon={AlertTriangle}
          label={t("dashboard_kpi_low_stock")}
          value={String(lowStock ?? 0)}
          href="/panel/stock"
          locale={locale}
          accent={(lowStock ?? 0) > 0}
          tone={(lowStock ?? 0) > 0 ? "warning" : undefined}
        />
      </section>

      {/* Secondary KPIs */}
      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={FileSignature}
          label={t("dashboard_kpi_open_proformas")}
          value={String(openProformas)}
          sub={t("dashboard_kpi_open_proformas_sub", {
            total: proformaTotal.toFixed(2),
          })}
          href="/panel/proforme"
          locale={locale}
        />
        <KpiCard
          icon={Receipt}
          label={t("dashboard_kpi_unpaid_invoices")}
          value={String(unpaidInvoices)}
          href="/panel/facturi"
          locale={locale}
        />
        <KpiCard
          icon={ClipboardList}
          label={t("dashboard_kpi_draft_purchases")}
          value={String(draftPurchases ?? 0)}
          href="/panel/achizitii"
          locale={locale}
        />
        <KpiCard
          icon={TrendingUp}
          label={t("dashboard_kpi_7d_orders")}
          value={String(salesByDay.reduce((s, r) => s + r.orders, 0))}
          sub={t("dashboard_kpi_7d_orders_sub", {
            total: salesByDay.reduce((s, r) => s + r.gross, 0).toFixed(2),
          })}
        />
      </section>

      {/* Sales chart */}
      <section className="mt-6 rounded-md border border-border bg-surface p-5">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("dashboard_chart_7d")}</h2>
          <Link
            href={"/panel/statistici" as "/panel"}
            locale={locale}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {t("dashboard_more_stats")}
            <ArrowRight className="size-3" />
          </Link>
        </header>
        {salesByDay.length === 0 ? (
          <EmptyChart label={t("stats_chart_empty")} />
        ) : (
          <SalesBarChart data={salesByDay} />
        )}
      </section>

      {/* Recent activity */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel
          title={t("dashboard_recent_orders")}
          href="/panel/comenzi-site"
          locale={locale}
          ctaLabel={t("dashboard_see_all")}
        >
          {(recentOrders.data ?? []).length === 0 ? (
            <Empty label={t("dashboard_no_orders")} />
          ) : (
            <ul className="divide-y divide-border">
              {(recentOrders.data ?? []).map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {o.customer_name ?? o.customer_email ?? "—"}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 text-[9px] uppercase tracking-wide",
                      o.source === "storefront"
                        ? "bg-primary/10 text-primary"
                        : "bg-warning/15 text-warning",
                    )}
                  >
                    {o.source}
                  </span>
                  {o.source === "storefront" && !o.triaged_at ? (
                    <span className="rounded bg-warning/15 px-1.5 text-[9px] uppercase tracking-wide text-warning">
                      {t("triage_status_pending")}
                    </span>
                  ) : null}
                  <span className="w-24 text-right tabular-nums">
                    <Price value={Number(o.total ?? 0)} size="sm" accent={false} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("dashboard_recent_proformas")}
          href="/panel/proforme"
          locale={locale}
          ctaLabel={t("dashboard_see_all")}
        >
          {recentProformas.length === 0 ? (
            <Empty label={t("dashboard_no_proformas")} />
          ) : (
            <ul className="divide-y divide-border">
              {recentProformas.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/panel/proforme/${p.id}` as "/panel"}
                    locale={locale}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-elevated"
                  >
                    <span className="font-mono text-xs">{p.series}{p.number}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {p.customer_snapshot?.name ?? "—"}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 text-[9px] uppercase tracking-wide",
                        p.status === "converted"
                          ? "bg-success/10 text-success"
                          : p.status === "void"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      {t(`proforma_status_${p.status}` as "proforma_status_sent")}
                    </span>
                    <span className="w-24 text-right tabular-nums">
                      {p.total.toFixed(2)} {p.currency}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("dashboard_recent_invoices")}
          href="/panel/facturi"
          locale={locale}
          ctaLabel={t("dashboard_see_all")}
        >
          {recentInvoices.length === 0 ? (
            <Empty label={t("dashboard_no_invoices")} />
          ) : (
            <ul className="divide-y divide-border">
              {recentInvoices.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/panel/facturi/${i.id}` as "/panel"}
                    locale={locale}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-elevated"
                  >
                    <span className="font-mono text-xs">{i.series}{i.number}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {i.customer_snapshot?.name ?? "—"}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 text-[9px] uppercase tracking-wide",
                        i.status === "paid"
                          ? "bg-success/10 text-success"
                          : i.status === "void"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      {t(`facturi_status_${i.status === "issued" ? "issued" : i.status === "paid" ? "paid" : i.status === "void" ? "void" : "draft"}` as "facturi_status_issued")}
                    </span>
                    <span className="w-24 text-right tabular-nums">
                      {i.total.toFixed(2)} {i.currency}
                    </span>
                    <span className="text-[10px] text-muted">
                      {fmtDateTime(i.issued_date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  tone,
  href,
  locale,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  tone?: "warning";
  href?: string;
  locale?: string;
}) {
  const body = (
    <div
      className={cn(
        "rounded-md border bg-surface p-4 transition-colors",
        accent
          ? tone === "warning"
            ? "border-warning/50"
            : "border-primary/40"
          : "border-border",
        href ? "hover:border-primary/60" : "",
      )}
    >
      <div
        className={cn(
          "mb-2 grid size-8 place-items-center rounded",
          accent
            ? tone === "warning"
              ? "bg-warning/15 text-warning"
              : "bg-primary/15 text-primary"
            : "bg-background text-muted",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-muted">{sub}</div> : null}
    </div>
  );
  if (!href || !locale) return body;
  return (
    <Link href={href as "/panel"} locale={locale} className="block">
      {body}
    </Link>
  );
}

function Panel({
  title,
  href,
  locale,
  ctaLabel,
  children,
}: {
  title: string;
  href: string;
  locale: string;
  ctaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-elevated px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Link
          href={href as "/panel"}
          locale={locale}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {ctaLabel}
          <ArrowRight className="size-3" />
        </Link>
      </header>
      {children}
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center px-4 py-8 text-center text-xs text-muted">
      {label}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[220px] place-items-center rounded-md border border-dashed border-border text-xs text-muted">
      {label}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  primary?: boolean;
}) {
  return (
    <Button asChild variant={primary ? "primary" : "outline"} size="sm" className="gap-1.5">
      <Link href={href as "/panel"}>
        <Icon className="size-3.5" />
        <Plus className="size-3" />
        {label}
      </Link>
    </Button>
  );
}
