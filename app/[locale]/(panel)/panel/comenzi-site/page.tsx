import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { TriageButtons } from "@/components/panel/triage/TriageButtons";
import { listStorefrontOrders } from "@/lib/panel/triage/queries";
import { cn } from "@/lib/utils/cn";

export default async function PanelComenziSitePage({
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

  const showTriaged = sp.show === "all";
  const rows = await listStorefrontOrders({ showTriaged });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const pendingCount = rows.filter((r) => !r.triaged_at).length;

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("triage_title")}
        subtitle={t("triage_subtitle")}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <a
            href="?"
            className={`inline-flex h-9 items-center rounded-md border px-3 text-xs transition-colors ${
              !showTriaged
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface hover:border-primary/40"
            }`}
          >
            {t("triage_filter_pending", { count: pendingCount })}
          </a>
          <a
            href="?show=all"
            className={`inline-flex h-9 items-center rounded-md border px-3 text-xs transition-colors ${
              showTriaged
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface hover:border-primary/40"
            }`}
          >
            {t("triage_filter_all")}
          </a>
        </div>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {showTriaged ? t("triage_empty_all") : t("triage_empty_pending")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("triage_col_order")}</th>
                  <th className="px-4 py-3">{t("triage_col_date")}</th>
                  <th className="px-4 py-3">{t("triage_col_customer")}</th>
                  <th className="px-4 py-3">{t("triage_col_payment")}</th>
                  <th className="px-4 py-3 text-right">{t("triage_col_total")}</th>
                  <th className="px-4 py-3">{t("triage_col_status_panel")}</th>
                  <th className="px-4 py-3 text-right">{t("triage_col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => {
                  const triaged = !!r.triaged_at;
                  return (
                    <tr key={r.id} className="hover:bg-surface-elevated">
                      <td className="px-4 py-3">
                        <Link
                          href={`/panel/comenzi/${r.id}` as "/admin"}
                          locale={locale}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          #{r.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-strong">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString(dateLocale)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{r.customer_name ?? "—"}</div>
                        <div className="text-xs text-muted">
                          {r.customer_email ?? ""}
                          {r.customer_phone ? ` · ${r.customer_phone}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs uppercase">
                        {r.payment_method
                          ? t(`pay_${r.payment_method === "paynet" ? "card" : r.payment_method}` as "pay_cash")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        <Price value={r.total} size="sm" accent={false} />
                      </td>
                      <td className="px-4 py-3">
                        {triaged ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                              r.account_scope === "conta1"
                                ? "bg-primary/10 text-primary"
                                : "bg-warning/15 text-warning",
                            )}
                          >
                            {r.account_scope === "conta1" ? t("conta1") : t("conta2")}
                          </span>
                        ) : (
                          <span className="rounded bg-muted/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-strong">
                            {t("triage_status_pending")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <TriageButtons
                          orderId={r.id}
                          currentScope={r.account_scope}
                          triaged={triaged}
                          locale={locale}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
