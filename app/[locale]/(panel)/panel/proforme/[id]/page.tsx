import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { ConvertProformaButton } from "@/components/panel/documents/ConvertProformaButton";
import { getInvoice } from "@/lib/panel/invoices/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/10 text-success",
  converted: "bg-success/15 text-success",
  void: "bg-destructive/10 text-destructive",
};

export default async function PanelProformaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const proforma = await getInvoice(id);
  if (!proforma || proforma.type !== "proforma") notFound();

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const statusLabel =
    proforma.status === "sent"
      ? t("proforma_status_sent")
      : proforma.status === "paid"
        ? t("proforma_status_paid")
        : proforma.status === "converted"
          ? t("proforma_status_converted")
          : proforma.status === "void"
            ? t("proforma_status_void")
            : t("proforma_status_draft");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/proforme", label: t("clienti_detail_back"), locale }}
        title={`${t("proforma_title")} ${proforma.series ?? ""}${proforma.number ?? ""}`}
        subtitle={`${proforma.customer_snapshot.name ?? "—"} · ${new Date(proforma.issued_date).toLocaleDateString(dateLocale)}`}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs uppercase tracking-wide",
                STATUS_TONE[proforma.status],
              )}
            >
              {statusLabel}
            </span>
            <Button asChild variant="outline" className="gap-1.5">
              <Link href={`/panel/proforme/${proforma.id}/print` as "/panel"} locale={locale}>
                <Printer className="size-4" />
                {t("action_print")}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-1">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("delivery_detail_client")}
          </h3>
          <p className="font-semibold">{proforma.customer_snapshot.name ?? "—"}</p>
          {proforma.customer_snapshot.idno ? (
            <p className="text-xs text-muted">IDNO {proforma.customer_snapshot.idno}</p>
          ) : null}
          {proforma.customer_snapshot.vat_number ? (
            <p className="text-xs">VAT: {proforma.customer_snapshot.vat_number}</p>
          ) : null}
          {proforma.customer_snapshot.email ? (
            <p className="text-xs">{proforma.customer_snapshot.email}</p>
          ) : null}
          {proforma.customer_snapshot.phone ? (
            <p className="text-xs">{proforma.customer_snapshot.phone}</p>
          ) : null}
          {proforma.customer_snapshot.address ? (
            <p className="mt-2 text-sm">{proforma.customer_snapshot.address}</p>
          ) : null}

          <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <dt className="text-muted">{t("proforma_issued_date")}</dt>
            <dd>{new Date(proforma.issued_date).toLocaleDateString(dateLocale)}</dd>
            <dt className="text-muted">{t("proforma_due_date")}</dt>
            <dd>
              {proforma.due_date
                ? new Date(proforma.due_date).toLocaleDateString(dateLocale)
                : "—"}
            </dd>
            <dt className="text-muted">{t("proforma_currency")}</dt>
            <dd>{proforma.currency}</dd>
            {proforma.order_id ? (
              <>
                <dt className="text-muted">{t("triage_col_order")}</dt>
                <dd>
                  <Link
                    href={`/admin/orders/${proforma.order_id}` as "/admin"}
                    locale={locale}
                    className="font-mono text-primary hover:underline"
                  >
                    #{proforma.order_id.slice(0, 8).toUpperCase()}
                  </Link>
                </dd>
              </>
            ) : null}
            {proforma.linked_invoice ? (
              <>
                <dt className="text-muted">{t("proforma_linked_invoice")}</dt>
                <dd>
                  <Link
                    href={`/panel/facturi/${proforma.linked_invoice.id}` as "/panel"}
                    locale={locale}
                    className="font-mono text-success hover:underline"
                  >
                    {proforma.linked_invoice.series}{proforma.linked_invoice.number}
                  </Link>
                </dd>
              </>
            ) : null}
          </dl>
        </section>

        <section className="overflow-x-auto rounded-md border border-border bg-surface lg:col-span-2">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("delivery_col_internal_code")}</th>
                <th className="px-4 py-3">{t("delivery_col_product")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_qty")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_price")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proforma.items_snapshot.map((it, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs">{it.partCode ?? "—"}</td>
                  <td className="px-4 py-2">
                    <div>{it.name ?? "—"}</div>
                    {it.description ? (
                      <div className="text-[11px] text-muted">{it.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{it.quantity ?? 0}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {Number(it.unit_price ?? 0).toFixed(2)} {proforma.currency}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    {Number(it.total ?? 0).toFixed(2)} {proforma.currency}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-elevated">
                <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted">
                  {t("delivery_detail_total")}
                </td>
                <td className="px-4 py-3 text-right text-base font-bold">
                  {proforma.total.toFixed(2)} {proforma.currency}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </div>

      <div className="mt-6">
        <ConvertProformaButton
          proformaId={proforma.id}
          locale={locale}
          alreadyConverted={!!proforma.converted_to_invoice_id || proforma.status === "void"}
        />
      </div>
    </div>
  );
}
