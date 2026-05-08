import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  Plug,
  XCircle,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Price } from "@/components/common/Price";
import {
  PullProductsButton,
  RefreshStockButton,
  RetryPushButton,
} from "@/components/admin/odoo/SyncButtons";
import {
  adminListFailedOrderPushes,
  adminListSyncLog,
  adminOdooStats,
} from "@/lib/admin/odoo/queries";
import { isOdooConfigured } from "@/lib/odoo/config";
import { cn } from "@/lib/utils/cn";

export default async function AdminOdooPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const enabled = isOdooConfigured();
  const odooUrl = process.env.ODOO_URL ?? "";

  const [stats, failed, log] = await Promise.all([
    adminOdooStats(),
    adminListFailedOrderPushes(),
    adminListSyncLog(50),
  ]);

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const buttonLabels = {
    pull_products: t("odoo_pull_products"),
    refresh_stock: t("odoo_refresh_stock"),
    retry_push: t("odoo_retry_push"),
    generate_invoice: t("odoo_generate_invoice"),
    pulling: t("odoo_pulling"),
    refreshing: t("odoo_refreshing"),
    retrying: t("odoo_retrying"),
    generating: t("odoo_generating"),
    not_configured: t("odoo_not_configured"),
    done: t("common_saved"),
  };

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_odoo")}
        title={t("odoo_title")}
        subtitle={t("odoo_subtitle")}
        actions={
          enabled ? (
            <>
              <PullProductsButton enabled={enabled} labels={buttonLabels} />
              <RefreshStockButton enabled={enabled} labels={buttonLabels} />
            </>
          ) : null
        }
      />

      {/* Connection state */}
      <section
        className={cn(
          "mt-6 flex items-start gap-4 rounded-md border p-5",
          enabled
            ? "border-success/40 bg-success/5"
            : "border-warning/40 bg-warning/10",
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-md",
            enabled ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
          )}
        >
          {enabled ? <Plug className="size-5" /> : <AlertTriangle className="size-5" />}
        </span>
        <div className="flex-1">
          <h2 className="text-base font-semibold tracking-tight">
            {enabled ? t("odoo_status_connected") : t("odoo_status_not_connected")}
          </h2>
          <p className="mt-1 text-sm text-muted-strong">
            {enabled ? odooUrl : t("odoo_status_not_connected_body")}
          </p>
          {enabled ? (
            <a
              href={odooUrl}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {t("odoo_open_instance")}
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </section>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("odoo_stat_products_linked")}
          value={`${stats.productsLinked} / ${stats.productsTotal}`}
          tone="primary"
        />
        <StatCard
          label={t("odoo_stat_orders_linked")}
          value={`${stats.ordersLinked} / ${stats.ordersTotal}`}
          tone="primary"
        />
        <StatCard
          label={t("odoo_stat_orders_failed")}
          value={String(stats.ordersFailed)}
          tone={stats.ordersFailed > 0 ? "destructive" : "muted"}
        />
        <StatCard
          label={t("odoo_stat_invoices_issued")}
          value={String(stats.invoicesIssued)}
          tone="success"
        />
      </div>

      {/* Failed pushes */}
      <section className="mt-8">
        <h3 className="mb-3 text-[11px] font-semibold">
          {t("odoo_failed_pushes")} ({failed.length})
        </h3>
        {failed.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
            <CheckCircle2 className="size-4 text-success" />
            {t("odoo_no_failed")}
          </div>
        ) : (
          <ul className="space-y-2">
            {failed.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      #{o.short_id}
                    </span>
                    <Price value={Number(o.total ?? 0)} size="sm" accent={false} />
                  </div>
                  <div className="mt-0.5 truncate text-sm text-muted-strong">
                    {o.customer_name ?? o.customer_email ?? "—"}
                  </div>
                  {o.odoo_sync_error ? (
                    <div className="mt-2 break-words rounded-sm border border-destructive/30 bg-background/40 p-2 text-[10px] text-destructive">
                      {o.odoo_sync_error}
                    </div>
                  ) : null}
                </div>
                <RetryPushButton orderId={o.id} labels={buttonLabels} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sync log */}
      <section className="mt-10">
        <h3 className="mb-3 text-[11px] font-semibold">
          {t("odoo_sync_log")}
        </h3>
        {log.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-10 text-sm text-muted">
            <Database className="mr-2 size-4" />
            {t("odoo_log_empty")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40 text-xs text-muted">
                  <th className="px-3 py-2.5">When</th>
                  <th className="px-3 py-2.5">Direction</th>
                  <th className="px-3 py-2.5">Operation</th>
                  <th className="px-3 py-2.5">Detail</th>
                  <th className="px-3 py-2.5">OK</th>
                  <th className="px-3 py-2.5 text-right">ms</th>
                </tr>
              </thead>
              <tbody>
                {log.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-2 text-[10px] text-muted-strong">
                      {new Date(row.created_at).toLocaleString(dateLocale, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "rounded-sm border px-1.5 py-0.5 text-xs",
                          row.direction === "pull"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : row.direction === "push"
                              ? "border-success/40 bg-success/10 text-success"
                              : "border-warning/40 bg-warning/10 text-warning",
                        )}
                      >
                        {row.direction}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{row.operation}</td>
                    <td className="px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-[10px] text-muted">
                          {detailSummary(row.detail)}
                        </summary>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-sm border border-border bg-background/40 p-2 text-[10px] text-muted-strong">
                          {JSON.stringify(row.detail, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td className="px-3 py-2">
                      {row.success ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <XCircle className="size-3.5 text-destructive" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-[10px] tabular-nums text-muted">
                      {row.duration_ms ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick links */}
      {enabled ? (
        <section className="mt-10 rounded-md border border-border bg-surface p-5">
          <h3 className="mb-3 text-[11px] font-semibold">
            {t("odoo_quick_links")}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            <QuickLink href={`${odooUrl}/odoo/sales`} label="Sales" />
            <QuickLink href={`${odooUrl}/odoo/inventory`} label="Inventory" />
            <QuickLink href={`${odooUrl}/odoo/contacts`} label="Contacts" />
            <QuickLink href={`${odooUrl}/odoo/accounting`} label="Accounting" />
            <QuickLink href={`${odooUrl}/odoo/barcode`} label="Barcode" />
            <QuickLink href={`${odooUrl}/odoo/purchase`} label="Purchase" />
          </div>
        </section>
      ) : null}

    </div>
  );
}

function detailSummary(detail: unknown): string {
  if (!detail || typeof detail !== "object") return "—";
  const d = detail as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof d.fetched === "number" || typeof d.upserted === "number") {
    parts.push(`fetched=${d.fetched ?? 0} upserted=${d.upserted ?? 0}`);
  }
  if (typeof d.updated === "number") parts.push(`updated=${d.updated}`);
  if (typeof d.matched === "number") parts.push(`matched=${d.matched}`);
  if (typeof d.error === "string") parts.push(`error=${d.error.slice(0, 60)}`);
  if (typeof d.reference === "string") parts.push(`ref=${d.reference}`);
  return parts.join(" · ") || "click to view";
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "destructive" | "muted";
}) {
  const tones = {
    primary: "border-primary/30",
    success: "border-success/30",
    destructive: "border-destructive/40 bg-destructive/5",
    muted: "border-border",
  } as const;
  return (
    <div className={cn("rounded-md border bg-surface p-5", tones[tone])}>
      <div className="text-xs text-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="text-xs">{label}</span>
      <ChevronRight className="size-3.5 text-muted" />
    </a>
  );
}
