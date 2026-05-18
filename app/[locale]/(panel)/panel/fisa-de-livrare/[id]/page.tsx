import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { getDeliveryNote } from "@/lib/panel/delivery_notes/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  dispatched: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  returned: "bg-warning/10 text-warning",
};

export default async function PanelDeliveryNoteDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const note = await getDeliveryNote(id);
  if (!note) notFound();

  const statusLabel = t(`delivery_status_${note.status}` as "delivery_status_draft");
  const payMap: Record<string, string> = {
    cash: t("delivery_pay_cash"),
    transfer: t("delivery_pay_transfer"),
    already_paid: t("delivery_pay_already"),
  };

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/fisa-de-livrare", label: t("delivery_detail_back"), locale }}
        title={`${t("delivery_number_label")} ${note.series ?? ""}-${note.number ?? note.id.slice(0, 8).toUpperCase()}`}
        subtitle={`${note.customer_name} · ${note.account_scope === "conta1" ? t("conta1") : t("conta2")}`}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs uppercase tracking-wide",
                STATUS_TONE[note.status],
              )}
            >
              {statusLabel}
            </span>
            <Button asChild className="gap-1.5">
              <Link
                href={`/panel/fisa-de-livrare/${note.id}/print` as "/panel"}
                locale={locale}
              >
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
          <p className="font-semibold">{note.customer_name}</p>
          {note.customer_idno ? <p className="text-xs text-muted">IDNO {note.customer_idno}</p> : null}
          {note.customer_phone ? <p className="text-xs">{note.customer_phone}</p> : null}
          <p className="mt-2 text-sm">{note.delivery_address}</p>

          <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("delivery_detail_payment")}
          </h3>
          <p className="text-sm uppercase tracking-wide">
            {payMap[note.payment_method ?? ""] ?? note.payment_method ?? "—"}
          </p>

          {note.driver_name || note.vehicle_plate ? (
            <>
              <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {t("delivery_detail_driver")}
              </h3>
              <p className="text-sm">
                {note.driver_name ?? "—"}
                {note.vehicle_plate ? ` · ${note.vehicle_plate}` : ""}
              </p>
            </>
          ) : null}

          {note.notes ? (
            <>
              <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {t("delivery_detail_notes")}
              </h3>
              <p className="whitespace-pre-wrap text-sm">{note.notes}</p>
            </>
          ) : null}
        </section>

        <section className="overflow-x-auto rounded-md border border-border bg-surface lg:col-span-2">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("delivery_col_internal_code")}</th>
                <th className="px-4 py-3">{t("delivery_col_product")}</th>
                <th className="px-4 py-3">{t("delivery_col_location")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_qty")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_price")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {note.items_snapshot.map((it, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs">{it.partCode ?? "—"}</td>
                  <td className="px-4 py-2">{it.name ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{it.storage_location ?? "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{it.quantity ?? 0}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {(it.price ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    {(it.total ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-elevated">
                <td colSpan={5} className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted">
                  {t("delivery_detail_total")}
                </td>
                <td className="px-4 py-3 text-right text-base font-bold">
                  {note.total.toFixed(2)} MDL
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </div>
    </div>
  );
}
