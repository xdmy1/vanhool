import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus, Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { Button } from "@/components/ui/button";
import { ConvertProformaButton } from "@/components/panel/documents/ConvertProformaButton";
import { SendToAccountantButton } from "@/components/panel/documents/SendToAccountantButton";
import { Link } from "@/lib/i18n/routing";
import { listInvoices } from "@/lib/panel/invoices/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/10 text-success",
  converted: "bg-success/15 text-success",
  void: "bg-destructive/10 text-destructive",
};

export default async function PanelProformePage({
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
  const rows = await listInvoices({ type: "proforma", q });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const statusLabel = (s: string) =>
    s === "sent"
      ? t("proforma_status_sent")
      : s === "paid"
        ? t("proforma_status_paid")
        : s === "converted"
          ? t("proforma_status_converted")
          : s === "void"
            ? t("proforma_status_void")
            : t("proforma_status_draft");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("proforma_list_title")}
        subtitle={t("proforma_list_subtitle")}
        actions={
          <Button asChild className="gap-1.5">
            <Link href={"/panel/proforme/new" as "/panel"} locale={locale}>
              <Plus className="size-4" />
              {t("proforma_new_button")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6 max-w-md">
        <SearchInput placeholder={t("proforma_search_placeholder")} />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("proforma_empty")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("proforma_col_number")}</th>
                  <th className="px-4 py-3">{t("proforma_col_issued")}</th>
                  <th className="px-4 py-3">{t("proforma_col_due")}</th>
                  <th className="px-4 py-3">{t("proforma_col_client")}</th>
                  <th className="px-4 py-3">{t("proforma_col_status")}</th>
                  <th className="px-4 py-3 text-right">{t("proforma_col_total")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs">
                      {r.series}{r.number}
                    </td>
                    <td className="px-4 py-3 text-muted-strong">
                      {new Date(r.issued_date).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-4 py-3 text-muted-strong">
                      {r.due_date
                        ? new Date(r.due_date).toLocaleDateString(dateLocale)
                        : "—"}
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
                          STATUS_TONE[r.status],
                        )}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {r.total.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/panel/proforme/${r.id}/print` as "/panel"}
                          locale={locale}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-strong transition-colors hover:border-primary/40 hover:text-primary"
                          title={t("action_print")}
                        >
                          <Printer className="size-3.5" />
                          {t("action_print")}
                        </Link>
                        <SendToAccountantButton
                          invoiceId={r.id}
                          initialSentAt={r.accountant_sent_at}
                          compact
                        />
                        {r.status === "sent" || r.status === "draft" ? (
                          <ConvertProformaButton
                            proformaId={r.id}
                            locale={locale}
                            alreadyConverted={false}
                            variant="compact"
                          />
                        ) : null}
                        <Link
                          href={`/panel/proforme/${r.id}` as "/panel"}
                          locale={locale}
                          className="text-xs text-primary hover:underline"
                        >
                          {t("action_open")}
                        </Link>
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
