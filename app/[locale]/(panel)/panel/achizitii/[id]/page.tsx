import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Plus, Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { deletePurchaseWithPin } from "@/lib/panel/purchases/actions";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { IssuePOButton } from "@/components/panel/purchases/IssuePOButton";
import { PostPurchaseButton } from "@/components/panel/purchases/PostPurchaseButton";
import { getPurchase } from "@/lib/panel/purchases/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  ordered: "bg-primary/15 text-primary",
  received: "bg-primary/10 text-primary",
  posted: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function PanelAchizitieDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const purchase = await getPurchase(id);
  if (!purchase) notFound();

  const disabled = purchase.status === "posted" || purchase.status === "cancelled";
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const statusLabel =
    purchase.status === "draft"
      ? t("achizitii_status_label_draft")
      : purchase.status === "ordered"
        ? t("po_status_ordered")
        : t(`achizitii_status_${purchase.status}` as "achizitii_status_draft");
  const scopeLabel = purchase.account_scope === "conta1" ? t("conta1") : t("conta2");
  const canIssuePO = purchase.status === "draft" || purchase.status === "ordered";
  const hasLines = purchase.items.length > 0;

  const unlinkedCount = purchase.items.filter((it) => !it.product_id).length;
  const canCatalogManually = purchase.status === "draft" && unlinkedCount > 0;

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/achizitii", label: t("clienti_detail_back"), locale }}
        title={`${t("achizitii_col_doc")} ${purchase.document_number ?? purchase.id.slice(0, 8).toUpperCase()}`}
        subtitle={t("achizitii_subtitle_detail", {
          supplier: purchase.supplier_name,
          date: new Date(purchase.document_date).toLocaleDateString(dateLocale),
          scope: scopeLabel,
        })}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded px-3 py-1 text-xs uppercase tracking-wide",
                STATUS_TONE[purchase.status],
              )}
            >
              {statusLabel}
            </span>
            <PinDeleteButton
              action={deletePurchaseWithPin}
              entityId={purchase.id}
              redirectTo={`/${locale}/panel/achizitii`}
            />
          </div>
        }
      />

      <div className="mt-8 space-y-4">
        <section className="rounded-md border border-border bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label={t("achizitii_subtotal")}>
              <span className="font-semibold tabular-nums">
                {purchase.subtotal.toFixed(2)} {purchase.currency}
              </span>
            </Stat>
            <Stat label={t("achizitii_vat_total")}>
              <span className="font-semibold tabular-nums">
                {purchase.vat_amount.toFixed(2)} {purchase.currency}
              </span>
            </Stat>
            <Stat label={t("achizitii_total")}>
              <span className="text-lg font-bold tabular-nums">
                {purchase.total.toFixed(2)} {purchase.currency}
              </span>
            </Stat>
            {purchase.fx_rate ? (
              <Stat label="FX">
                <span className="tabular-nums">{purchase.fx_rate}</span>
              </Stat>
            ) : null}
          </div>
        </section>

        {canCatalogManually ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="font-semibold text-primary">
              {t("achizitii_catalog_banner_title", { count: unlinkedCount })}
            </div>
            <p className="mt-1 text-xs text-muted-strong">
              {t("achizitii_catalog_banner_body")}
            </p>
          </div>
        ) : null}

        <section className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("achizitii_line_supplier_code")}</th>
                <th className="px-4 py-3">{t("achizitii_line_internal_code")}</th>
                <th className="px-4 py-3">{t("achizitii_line_description")}</th>
                <th className="px-4 py-3 text-right">{t("achizitii_line_qty")}</th>
                <th className="px-4 py-3 text-right">{t("achizitii_line_cost")}</th>
                <th className="px-4 py-3 text-right">{t("achizitii_line_total")}</th>
                <th className="px-4 py-3">{t("achizitii_line_catalog")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchase.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-2 font-mono text-xs">{it.supplier_code ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{it.internal_code ?? "—"}</td>
                  <td className="px-4 py-2">{it.description}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{it.quantity}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{it.unit_cost.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    {it.line_total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    {it.product_id ? (
                      <Link
                        href={`/admin/products/${it.product_id}` as "/admin"}
                        locale={locale}
                        className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-success hover:bg-success/20"
                      >
                        <CheckCircle2 className="size-3" />
                        {t("achizitii_line_in_catalog")}
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/products/new?from_line=${it.id}` as "/admin"}
                        locale={locale}
                        className="inline-flex items-center gap-1 rounded border border-primary px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary hover:bg-primary/10"
                      >
                        <Plus className="size-3" />
                        {t("achizitii_line_add_to_catalog")}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {purchase.notes ? (
          <section className="rounded-md border border-border bg-surface p-5 text-sm">
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
              {t("achizitii_notes")}
            </h3>
            <p className="whitespace-pre-wrap">{purchase.notes}</p>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {purchase.po_number ? (
            <Button asChild variant="outline" className="gap-1.5">
              <Link
                href={`/panel/achizitii/${purchase.id}/po` as "/panel"}
                locale={locale}
              >
                <Printer className="size-4" />
                {t("po_button_view")}: <span className="font-mono">{purchase.po_number}</span>
              </Link>
            </Button>
          ) : null}
          {canIssuePO && !purchase.po_number ? (
            <IssuePOButton purchaseId={purchase.id} hasLines={hasLines} />
          ) : null}
          <PostPurchaseButton purchaseId={purchase.id} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
