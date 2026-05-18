import { getTranslations, setRequestLocale } from "next-intl/server";
import { Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { Link } from "@/lib/i18n/routing";
import { listDeliveryNotes } from "@/lib/panel/delivery_notes/queries";
import { getActiveBook } from "@/lib/panel/scope";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  dispatched: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  returned: "bg-warning/10 text-warning",
};

export default async function PanelFiseLivrarePage({
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

  const scope = await getActiveBook(sp);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const rows = await listDeliveryNotes({ scope, q });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const bookLabel = scope === "conta1" ? t("conta1") : t("conta2");
  const statusLabel = (s: string) =>
    t(`delivery_status_${s}` as "delivery_status_draft");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={scope === "conta1" ? t("conta1_eyebrow") : t("conta2_eyebrow")}
        title={t("delivery_list_title")}
        subtitle={t("delivery_list_subtitle")}
      />

      <div className="mt-6 max-w-md">
        <SearchInput placeholder={t("delivery_search_placeholder")} />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("delivery_empty", { book: bookLabel })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("delivery_col_number")}</th>
                  <th className="px-4 py-3">{t("delivery_col_date")}</th>
                  <th className="px-4 py-3">{t("delivery_col_client")}</th>
                  <th className="px-4 py-3">{t("delivery_col_payment")}</th>
                  <th className="px-4 py-3">{t("delivery_col_status")}</th>
                  <th className="px-4 py-3 text-right">{t("delivery_col_total")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs">
                      {r.series}-{r.number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-strong">
                      {new Date(r.issued_at).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{r.customer_name}</div>
                      <div className="line-clamp-1 text-xs text-muted">{r.delivery_address}</div>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted">
                      {r.payment_method ?? "—"}
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
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.total !== null ? `${r.total.toFixed(2)} MDL` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/panel/fisa-de-livrare/${r.id}` as "/panel"}
                        locale={locale}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("action_open")}
                      </Link>{" "}
                      ·{" "}
                      <Link
                        href={`/panel/fisa-de-livrare/${r.id}/print` as "/panel"}
                        locale={locale}
                        className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                      >
                        <Printer className="size-3" />
                        {t("delivery_action_print")}
                      </Link>
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
