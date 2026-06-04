import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { PreorderStatusButtons } from "@/components/panel/preorders/PreorderStatusButtons";
import { deletePreorderWithPin } from "@/lib/panel/preorders/actions";
import { listPreorders, type PreorderStatus } from "@/lib/panel/preorders/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-muted/20 text-muted-strong",
  confirmed: "bg-success/10 text-success",
  ordered: "bg-primary/10 text-primary",
  arrived: "bg-warning/10 text-warning",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function PreordersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const statusFilter: PreorderStatus | "all" =
    sp.status === "pending" ||
    sp.status === "confirmed" ||
    sp.status === "ordered" ||
    sp.status === "arrived" ||
    sp.status === "delivered" ||
    sp.status === "cancelled" ||
    sp.status === "all"
      ? (sp.status as PreorderStatus | "all")
      : "all";

  const rows = await listPreorders({ status: statusFilter });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const filters: Array<{ id: PreorderStatus | "all"; label: string }> = [
    { id: "all", label: t("preorder_filter_all") },
    { id: "pending", label: t("preorder_status_pending") },
    { id: "confirmed", label: t("preorder_status_confirmed") },
    { id: "ordered", label: t("preorder_status_ordered") },
    { id: "arrived", label: t("preorder_status_arrived") },
    { id: "delivered", label: t("preorder_status_delivered") },
    { id: "cancelled", label: t("preorder_status_cancelled") },
  ];

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("preorder_title")}
        subtitle={t("preorder_subtitle")}
        actions={
          <Button asChild className="gap-1.5">
            <Link href={"/panel/precomenzi/new" as "/panel"} locale={locale}>
              <Plus className="size-4" />
              {t("preorder_new_button")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        {filters.map((f) => {
          const href = f.id === "all" ? "?" : `?status=${f.id}`;
          const active = statusFilter === f.id;
          return (
            <a
              key={f.id}
              href={href}
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-2.5 text-xs transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface hover:border-primary/40 hover:text-primary",
              )}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("preorder_empty")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("preorder_col_customer")}</th>
                  <th className="px-4 py-3">{t("preorder_col_part")}</th>
                  <th className="px-4 py-3 text-right">{t("preorder_col_qty")}</th>
                  <th className="px-4 py-3 text-right">{t("preorder_col_cost")}</th>
                  <th className="px-4 py-3 text-right">{t("preorder_col_price")}</th>
                  <th className="px-4 py-3 text-right">{t("preorder_col_margin")}</th>
                  <th className="px-4 py-3 text-right">{t("preorder_col_total")}</th>
                  <th className="px-4 py-3">{t("preorder_col_eta")}</th>
                  <th className="px-4 py-3">{t("preorder_col_status")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{r.customer_name}</div>
                      {r.customer_phone ? (
                        <div className="text-xs text-muted">{r.customer_phone}</div>
                      ) : null}
                      {r.customer_email ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <Mail className="size-3" />
                          {r.customer_email}
                          {r.confirmation_sent_at ? (
                            <span className="text-success" title={t("preorder_email_sent")}>
                              ✓
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {r.part_code ? (
                        <div className="font-mono text-xs text-muted-strong">
                          {r.part_code}
                        </div>
                      ) : null}
                      <div>{r.description}</div>
                      {r.supplier_name ? (
                        <div className="text-[11px] text-muted">{r.supplier_name}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums align-top">
                      {r.quantity}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums align-top text-muted-strong">
                      {r.supplier_unit_cost > 0
                        ? `${r.supplier_unit_cost.toFixed(2)} ${r.currency}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums align-top font-semibold">
                      {r.unit_price.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums align-top text-xs">
                      {r.supplier_unit_cost > 0 ? (
                        <span className="rounded bg-success/10 px-1.5 py-0.5 text-success">
                          +{r.margin_percent}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums align-top font-semibold">
                      {r.total.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-muted-strong">
                      {r.expected_delivery_date
                        ? new Date(r.expected_delivery_date).toLocaleDateString(
                            dateLocale,
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          STATUS_TONE[r.status],
                        )}
                      >
                        {t(`preorder_status_${r.status}` as "preorder_status_pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-end gap-1.5">
                        <PreorderStatusButtons
                          preorderId={r.id}
                          status={r.status}
                          hasEmail={!!r.customer_email}
                          confirmationSent={!!r.confirmation_sent_at}
                        />
                        <PinDeleteButton
                          action={deletePreorderWithPin}
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
