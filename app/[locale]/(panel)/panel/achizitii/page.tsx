import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { SendMonthlyPurchasesButton } from "@/components/panel/purchases/SendMonthlyPurchasesButton";
import { SendPurchaseButton } from "@/components/panel/purchases/SendPurchaseButton";
import { deletePurchaseWithPin } from "@/lib/panel/purchases/actions";
import { listPurchases } from "@/lib/panel/purchases/queries";
import { getActiveBook } from "@/lib/panel/scope";
import { cn } from "@/lib/utils/cn";
import { TIMEZONE } from "@/lib/datetime";

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
  const q = typeof sp.q === "string" ? sp.q : undefined;
  // Status filter — "Draft" is the set the dashboard "Achiziții draft" card
  // links to; "Postat" is the everyday completed set.
  const PURCHASE_STATUS_FILTERS = ["draft", "posted"] as const;
  type PurchaseStatusFilter = (typeof PURCHASE_STATUS_FILTERS)[number];
  const statusParam: PurchaseStatusFilter | undefined =
    typeof sp.status === "string" &&
    (PURCHASE_STATUS_FILTERS as readonly string[]).includes(sp.status)
      ? (sp.status as PurchaseStatusFilter)
      : undefined;
  const rows = await listPurchases({ scope, q, status: statusParam });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const bookLabel = scope === "conta1" ? t("conta1") : t("conta2");
  const statusLabel = (s: string) =>
    t(`achizitii_status_${s}` as "achizitii_status_draft");

  function statusHref(id: PurchaseStatusFilter | null): string {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "status" || v === undefined) continue;
      next.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (id) next.set("status", id);
    return next.toString() ? `?${next}` : "?";
  }
  const statusChips: Array<{ id: PurchaseStatusFilter; label: string }> = [
    { id: "draft", label: t("achizitii_status_draft") },
    { id: "posted", label: t("achizitii_status_posted") },
  ];

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

      <div className="mt-6">
        <SearchInput
          placeholder={t("achizitii_search_placeholder")}
          className="w-full max-w-md"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <a
          href={statusHref(null)}
          className={cn(
            "inline-flex h-8 items-center rounded-md border px-3 text-[11px] uppercase tracking-wide transition-colors",
            !statusParam
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface hover:border-primary/40 hover:text-primary",
          )}
        >
          {t("facturi_filter_all")}
        </a>
        {statusChips.map((s) => {
          const active = statusParam === s.id;
          return (
            <a
              key={s.id}
              href={statusHref(s.id)}
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-3 text-[11px] uppercase tracking-wide transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface hover:border-primary/40 hover:text-primary",
              )}
            >
              {s.label}
            </a>
          );
        })}
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {q
              ? t("achizitii_empty_no_results")
              : t("achizitii_empty", { book: bookLabel })}
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
                      {new Date(r.document_date).toLocaleDateString(dateLocale, { timeZone: TIMEZONE })}
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
                            enteredAt={r.accountant_entered_at}
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
