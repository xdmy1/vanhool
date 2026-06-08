import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { SendMonthlyPurchasesButton } from "@/components/panel/purchases/SendMonthlyPurchasesButton";
import { SendPurchaseButton } from "@/components/panel/purchases/SendPurchaseButton";
import { deletePurchaseWithPin } from "@/lib/panel/purchases/actions";
import { listPurchases } from "@/lib/panel/purchases/queries";
import { getActiveBook } from "@/lib/panel/scope";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  received: "bg-primary/10 text-primary",
  posted: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function PanelAchizitiiPage({
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
  const rows = await listPurchases({ scope });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const bookLabel = scope === "conta1" ? t("conta1") : t("conta2");
  const statusLabel = (s: string) =>
    t(`achizitii_status_${s}` as "achizitii_status_draft");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={scope === "conta1" ? t("conta1_eyebrow") : t("conta2_eyebrow")}
        title={t("achizitii_title")}
        subtitle={t("achizitii_subtitle")}
        actions={
          <div className="flex items-center gap-2">
            {scope === "conta1" ? <SendMonthlyPurchasesButton /> : null}
            <Button asChild className="gap-1.5">
              <Link href={"/panel/achizitii/new" as "/panel"} locale={locale}>
                <Plus className="size-4" />
                {t("achizitii_new_button")}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mt-8">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("achizitii_empty", { book: bookLabel })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("achizitii_col_doc")}</th>
                  <th className="px-4 py-3">{t("achizitii_col_date")}</th>
                  <th className="px-4 py-3">{t("achizitii_col_supplier")}</th>
                  <th className="px-4 py-3">{t("achizitii_col_status")}</th>
                  <th className="px-4 py-3 text-right">{t("achizitii_col_total")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs">{r.document_number ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-strong">
                      {new Date(r.document_date).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-4 py-3">{r.supplier_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          STATUS_TONE[r.status] ?? "bg-surface text-muted",
                        )}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.total.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/panel/achizitii/${r.id}` as "/panel"}
                          locale={locale}
                          className="text-xs text-primary hover:underline"
                        >
                          {t("action_open")}
                        </Link>
                        {scope === "conta1" ? (
                          <SendPurchaseButton
                            purchaseId={r.id}
                            initialSentAt={r.accountant_sent_at}
                          />
                        ) : null}
                        <PinDeleteButton
                          action={deletePurchaseWithPin}
                          entityId={r.id}
                          compact
                        />
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
