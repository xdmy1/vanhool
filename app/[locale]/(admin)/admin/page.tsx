import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AlertTriangle,
  ArrowRight,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { adminOverviewStats } from "@/lib/admin/queries";
import { Price } from "@/components/common/Price";
import { cn } from "@/lib/utils/cn";

const STATUS_TONES: Record<string, string> = {
  pending: "border-warning/40 bg-warning/10 text-warning",
  confirmed: "border-primary/40 bg-primary/10 text-primary",
  processing: "border-primary/40 bg-primary/10 text-primary",
  shipped: "border-primary/40 bg-primary/10 text-primary",
  delivered: "border-success/40 bg-success/10 text-success",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tAuth, stats] = await Promise.all([
    getTranslations("admin"),
    getTranslations("auth"),
    adminOverviewStats(),
  ]);

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const stripped = (id: string) => id.slice(0, 8).toUpperCase();
  const statusLabel = (status: string | null) => {
    const key = `dashboard_status_${status ?? "pending"}` as "dashboard_status_pending";
    return tAuth(key);
  };

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {t("overview_title")}
        </h1>
        <p className="text-sm text-muted-strong md:text-base">{t("overview_subtitle")}</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label={t("stat_orders_total")}
          value={String(stats.ordersTotal)}
          accent={false}
        />
        <StatCard
          icon={ShoppingBag}
          label={t("stat_orders_pending")}
          value={String(stats.ordersPending)}
          accent={stats.ordersPending > 0}
        />
        <StatCard
          icon={TrendingUp}
          label={t("stat_revenue_30d")}
          value={<Price value={stats.revenueLast30} size="lg" accent={false} />}
        />
        <StatCard
          icon={Wallet}
          label={t("stat_revenue_total")}
          value={<Price value={stats.revenueTotal} size="lg" accent={false} />}
        />
        <StatCard
          icon={AlertTriangle}
          label={t("stat_low_stock")}
          value={String(stats.lowStockCount)}
          accent={stats.lowStockCount > 0}
        />
        <StatCard
          icon={Package}
          label={t("stat_products_active")}
          value={String(stats.productsActive)}
        />
        <StatCard
          icon={Users}
          label={t("stat_customers")}
          value={String(stats.customersCount)}
        />
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <Section
          title={t("recent_orders")}
          href="/admin/orders"
          locale={locale}
          ctaLabel={t("view_all")}
        >
          {stats.recentOrders.length === 0 ? (
            <Empty>{t("recent_orders_empty")}</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}` as "/admin/orders"}
                    locale={locale}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">
                          #{stripped(o.id)}
                        </span>
                        <span
                          className={cn(
                            "rounded-sm border px-1.5 py-0.5 text-[9px]",
                            STATUS_TONES[o.status ?? "pending"] ??
                              "border-border bg-accent-dark text-muted",
                          )}
                        >
                          {statusLabel(o.status)}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-muted-strong">
                        {o.customer_name ?? o.customer_email ?? "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <Price value={Number(o.total ?? 0)} size="sm" accent={false} />
                      <div className="text-xs text-muted">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString(dateLocale)
                          : "—"}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Low stock */}
      <div className="mt-4">
        <Section
          title={t("low_stock_title")}
          subtitle={t("low_stock_threshold")}
          href="/admin/products?status=low_stock"
          locale={locale}
          ctaLabel={t("view_all")}
        >
          {stats.lowStockProducts.length === 0 ? (
            <Empty>{t("low_stock_empty")}</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}` as "/admin/products"}
                    locale={locale}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted">
                        {p.brand ?? "—"} · {p.part_code ?? "—"}
                      </div>
                      <div className="line-clamp-1 text-sm font-semibold">
                        {p.name_ro ?? p.name_en ?? p.slug}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-sm border px-2 py-0.5 text-xs",
                        (p.stock_quantity ?? 0) === 0
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-warning/40 bg-warning/10 text-warning",
                      )}
                    >
                      {p.stock_quantity ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-surface p-5",
        accent ? "border-primary/40" : "border-border",
      )}
    >
      <div
        className={cn(
          "mb-3 grid size-9 place-items-center rounded-sm border",
          accent
            ? "border-primary/50 bg-primary/15 text-primary"
            : "border-border bg-background text-muted",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="text-xs text-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  href,
  ctaLabel,
  locale,
  children,
}: {
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel: string;
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface-elevated">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <span className="text-xs text-muted">
              {subtitle}
            </span>
          ) : null}
        </div>
        <Link
          href={href as "/admin/orders"}
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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center px-4 py-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}
