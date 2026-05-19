import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, ExternalLink } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { MarkInvoicePaidButton } from "@/components/panel/documents/MarkInvoicePaidButton";
import { Link } from "@/lib/i18n/routing";
import { listInvoices } from "@/lib/panel/invoices/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  issued: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
  paid: "bg-success/10 text-success",
  void: "bg-destructive/10 text-destructive",
};

function isOverdue(row: { status: string; due_date: string | null }): boolean {
  if (row.status !== "issued" || !row.due_date) return false;
  return new Date(row.due_date) < new Date(new Date().toISOString().slice(0, 10));
}

export default async function PanelFacturiPage({
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

  const q = typeof sp.q === "string" ? sp.q : undefined;
  const rows = await listInvoices({ q, type: "invoice", scope: "conta1" });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const statusLabel = (s: string) =>
    t(`facturi_status_${s}` as "facturi_status_draft");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("conta1_eyebrow")}
        title={t("facturi_title")}
        subtitle={t("facturi_subtitle")}
      />

      <div className="mt-6 max-w-md">
        <SearchInput placeholder={t("facturi_search_placeholder")} />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("facturi_empty")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("facturi_col_number")}</th>
                  <th className="px-4 py-3">{t("facturi_col_date")}</th>
                  <th className="px-4 py-3">{t("facturi_col_client")}</th>
                  <th className="px-4 py-3">{t("facturi_col_status")}</th>
                  <th className="px-4 py-3 text-right">{t("facturi_col_total")}</th>
                  <th className="px-4 py-3">{t("facturi_col_refrens")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs">
                      {r.series ?? ""}-{r.number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-strong">
                      {new Date(r.issued_date).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{r.customer_snapshot?.name ?? "—"}</div>
                      {r.customer_snapshot?.idno ? (
                        <div className="text-xs text-muted">IDNO {r.customer_snapshot.idno}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          isOverdue(r) ? STATUS_TONE.overdue : STATUS_TONE[r.status],
                        )}
                      >
                        {isOverdue(r)
                          ? t("facturi_status_overdue")
                          : statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {r.total.toFixed(2)} MDL
                    </td>
                    <td className="px-4 py-3">
                      {r.refrens_url ? (
                        <a
                          href={r.refrens_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="size-3" />
                          PDF
                        </a>
                      ) : r.refrens_invoice_id ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="size-3" />
                          {r.refrens_invoice_id.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {r.status === "issued" ? (
                          <MarkInvoicePaidButton
                            invoiceId={r.id}
                            defaultAmount={r.total}
                            defaultCurrency={r.currency}
                            variant="compact"
                          />
                        ) : null}
                        {r.order_id ? (
                          <Link
                            href={`/admin/orders/${r.order_id}` as "/admin"}
                            locale={locale}
                            className="text-xs text-primary hover:underline"
                          >
                            {t("facturi_col_order")}
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
