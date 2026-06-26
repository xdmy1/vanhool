import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pencil, Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { MarkInvoicePaidButton } from "@/components/panel/documents/MarkInvoicePaidButton";
import { SendToAccountantButton } from "@/components/panel/documents/SendToAccountantButton";
import { VoidInvoiceButton } from "@/components/panel/documents/VoidInvoiceButton";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { deleteInvoiceWithPin } from "@/lib/panel/invoices/actions";
import { Link } from "@/lib/i18n/routing";
import { getInvoice } from "@/lib/panel/invoices/queries";
import {
  applyCostFallback,
  buildCostFallbackByCode,
} from "@/lib/panel/invoices/cost-fallback";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  issued: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
  paid: "bg-success/10 text-success",
  void: "bg-destructive/10 text-destructive",
};

function isOverdue(invoice: {
  status: string;
  due_date: string | null;
}): boolean {
  if (invoice.status !== "issued" || !invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date(new Date().toISOString().slice(0, 10));
}

export default async function PanelInvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const invoice = await getInvoice(id);
  if (!invoice || invoice.type !== "invoice") notFound();

  // Legacy snapshots predate the cost_price field. Fall back to the
  // most recent unit_cost on a matching purchase_item (normalized
  // part_code match) so the admin-only margin columns still light up.
  const costFallback = await buildCostFallbackByCode(invoice.items_snapshot);
  invoice.items_snapshot = applyCostFallback(
    invoice.items_snapshot,
    costFallback,
  );

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const overdue = isOverdue(invoice);
  const statusLabel = overdue
    ? t("facturi_status_overdue")
    : t(`facturi_status_${invoice.status}` as "facturi_status_draft");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/facturi", label: t("clienti_detail_back"), locale }}
        title={`${t("facturi_title").replace(/i$/, "")} ${invoice.series ?? ""}${invoice.number ?? ""}`}
        subtitle={`${invoice.customer_snapshot.name ?? "—"} · ${new Date(invoice.issued_date).toLocaleDateString(dateLocale)}`}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs uppercase tracking-wide",
                overdue ? STATUS_TONE.overdue : STATUS_TONE[invoice.status],
              )}
            >
              {statusLabel}
            </span>
            <Button asChild variant="outline" className="gap-1.5">
              <Link href={`/panel/facturi/${invoice.id}/print` as "/panel"} locale={locale}>
                <Printer className="size-4" />
                {t("action_print")}
              </Link>
            </Button>
            {/* Edit only while the invoice is still mutable. Paid /
                voided / converted rows are accounting-locked and the
                edit page redirects back here anyway, so we don't even
                surface the button. */}
            {invoice.status !== "paid" &&
            invoice.status !== "void" &&
            invoice.status !== "converted" ? (
              <Button asChild variant="outline" className="gap-1.5">
                <Link
                  href={`/panel/facturi/${invoice.id}/edit` as "/panel"}
                  locale={locale}
                >
                  <Pencil className="size-4" />
                  {t("action_edit")}
                </Link>
              </Button>
            ) : null}
            <SendToAccountantButton
              invoiceId={invoice.id}
              initialSentAt={invoice.accountant_sent_at}
            />
            {invoice.status !== "void" ? (
              <VoidInvoiceButton invoiceId={invoice.id} />
            ) : null}
            <PinDeleteButton
              action={deleteInvoiceWithPin}
              entityId={invoice.id}
              redirectTo={`/${locale}/panel/facturi`}
            />
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-1">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("delivery_detail_client")}
          </h3>
          <p className="font-semibold">{invoice.customer_snapshot.name ?? "—"}</p>
          {invoice.customer_snapshot.idno ? (
            <p className="text-xs text-muted">IDNO {invoice.customer_snapshot.idno}</p>
          ) : null}
          {invoice.customer_snapshot.vat_number ? (
            <p className="text-xs">VAT: {invoice.customer_snapshot.vat_number}</p>
          ) : null}
          {invoice.customer_snapshot.email ? (
            <p className="text-xs">{invoice.customer_snapshot.email}</p>
          ) : null}
          {invoice.customer_snapshot.phone ? (
            <p className="text-xs">{invoice.customer_snapshot.phone}</p>
          ) : null}
          {invoice.customer_snapshot.address ? (
            <p className="mt-2 text-sm">{invoice.customer_snapshot.address}</p>
          ) : null}

          <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <dt className="text-muted">{t("proforma_issued_date")}</dt>
            <dd>{new Date(invoice.issued_date).toLocaleDateString(dateLocale)}</dd>
            {invoice.paid_at ? (
              <>
                <dt className="text-muted">{t("invoice_paid_at")}</dt>
                <dd>{new Date(invoice.paid_at).toLocaleString(dateLocale)}</dd>
              </>
            ) : null}
            <dt className="text-muted">{t("proforma_currency")}</dt>
            <dd>{invoice.currency}</dd>
            {invoice.due_date && invoice.status === "issued" ? (
              <>
                <dt className="text-muted">{t("invoice_due_date")}</dt>
                <dd className={overdue ? "font-semibold text-destructive" : ""}>
                  {new Date(invoice.due_date).toLocaleDateString(dateLocale)}
                </dd>
              </>
            ) : null}
            {invoice.paid_amount != null ? (
              <>
                <dt className="text-muted">{t("invoice_paid_amount")}</dt>
                <dd className="font-semibold">
                  {invoice.paid_amount.toFixed(2)} {invoice.paid_currency ?? invoice.currency}
                </dd>
              </>
            ) : null}
            {invoice.paid_method ? (
              <>
                <dt className="text-muted">{t("invoice_paid_method")}</dt>
                <dd>{t(`payment_${invoice.paid_method}` as "payment_cash")}</dd>
              </>
            ) : null}
            {invoice.order_id ? (
              <>
                <dt className="text-muted">{t("triage_col_order")}</dt>
                <dd>
                  <Link
                    href={`/panel/comenzi/${invoice.order_id}` as "/admin"}
                    locale={locale}
                    className="font-mono text-primary hover:underline"
                  >
                    #{invoice.order_id.slice(0, 8).toUpperCase()}
                  </Link>
                </dd>
              </>
            ) : null}
            {invoice.linked_proforma ? (
              <>
                <dt className="text-muted">{t("invoice_from_proforma")}</dt>
                <dd>
                  <Link
                    href={`/panel/proforme/${invoice.linked_proforma.id}` as "/panel"}
                    locale={locale}
                    className="font-mono text-primary hover:underline"
                  >
                    {invoice.linked_proforma.series}{invoice.linked_proforma.number}
                  </Link>
                </dd>
              </>
            ) : null}
          </dl>

          {invoice.status === "issued" ? (
            <div className="mt-5 border-t border-border pt-5">
              <MarkInvoicePaidButton
                invoiceId={invoice.id}
                defaultAmount={invoice.total}
                defaultCurrency={invoice.currency}
              />
            </div>
          ) : null}
        </section>

        <section className="overflow-x-auto rounded-md border border-border bg-surface lg:col-span-2">
          <div className="border-b border-border bg-warning/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-warning">
            Coloanele Cost / Marjă sunt vizibile DOAR aici (admin) — nu apar pe print sau pe documentul trimis clientului.
          </div>
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("delivery_col_internal_code")}</th>
                <th className="px-4 py-3">{t("delivery_col_product")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_qty")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_price")}</th>
                <th className="px-4 py-3 text-right">{t("delivery_col_total")}</th>
                <th className="px-4 py-3 text-right text-warning">Cost unit. (admin)</th>
                <th className="px-4 py-3 text-right text-warning">Marjă (admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items_snapshot.map((it, i) => {
                const list = Number(it.unit_price ?? 0);
                const dp =
                  it.discounted_unit_price != null ? Number(it.discounted_unit_price) : null;
                const eff = dp != null && dp >= 0 && dp < list ? dp : list;
                const hasDiscount = eff < list;
                const pct = hasDiscount && list > 0
                  ? Math.max(0, (1 - eff / list) * 100)
                  : 0;
                const qty = Number(it.quantity ?? 0);
                const cost = it.cost_price != null ? Number(it.cost_price) : null;
                const lineTotal = Number(it.total ?? 0);
                const lineCostTotal = cost != null ? qty * cost : null;
                const lineProfit =
                  lineCostTotal != null
                    ? Number((lineTotal - lineCostTotal).toFixed(2))
                    : null;
                const lineMarginPct =
                  cost != null && cost > 0 && eff > 0
                    ? Number((((eff - cost) / cost) * 100).toFixed(1))
                    : null;
                return (
                  <tr key={i}>
                    <td className="px-4 py-2 font-mono text-xs">{it.partCode ?? "—"}</td>
                    <td className="px-4 py-2">
                      <div>{it.name ?? "—"}</div>
                      {it.description ? (
                        <div className="text-[11px] text-muted">{it.description}</div>
                      ) : null}
                      {hasDiscount ? (
                        <div className="mt-0.5 text-[10px] font-semibold text-success">
                          {t("delivery_discount_label", { percent: Math.round(pct) })}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{it.quantity ?? 0}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {hasDiscount ? (
                        <>
                          <div className="text-[10px] text-muted line-through">
                            {list.toFixed(2)} {invoice.currency}
                          </div>
                          <div className="font-semibold text-success">
                            {eff.toFixed(2)} {invoice.currency}
                          </div>
                        </>
                      ) : (
                        <>{list.toFixed(2)} {invoice.currency}</>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                      {lineTotal.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-warning">
                      {cost != null
                        ? `${cost.toFixed(2)} ${invoice.currency}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {lineProfit != null && lineMarginPct != null ? (
                        <>
                          <div
                            className={cn(
                              "font-semibold",
                              lineProfit >= 0 ? "text-success" : "text-destructive",
                            )}
                          >
                            {lineProfit >= 0 ? "+" : ""}
                            {lineProfit.toFixed(2)} {invoice.currency}
                          </div>
                          <div className="text-[10px] text-muted">
                            {lineMarginPct.toFixed(1)}%
                          </div>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {(() => {
                let before = 0;
                let after = 0;
                for (const it of invoice.items_snapshot) {
                  const qty = Number(it.quantity ?? 0);
                  const list = Number(it.unit_price ?? 0);
                  const dp =
                    it.discounted_unit_price != null ? Number(it.discounted_unit_price) : null;
                  const eff = dp != null && dp >= 0 && dp < list ? dp : list;
                  before += qty * list;
                  after += qty * eff;
                }
                const discountAmount = Number((before - after).toFixed(2));
                const discountPct =
                  before > 0 && discountAmount > 0
                    ? Math.min(100, Number(((discountAmount / before) * 100).toFixed(2)))
                    : 0;
                if (discountAmount <= 0) return null;
                return (
                  <>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs uppercase tracking-wide text-muted">
                        {t("delivery_subtotal_before_discount")}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted line-through">
                        {before.toFixed(2)} {invoice.currency}
                      </td>
                      <td colSpan={2} className="px-4 py-2" />
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs uppercase tracking-wide text-success">
                        {t("delivery_discount_label", { percent: Math.round(discountPct) })}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-success">
                        -{discountAmount.toFixed(2)} {invoice.currency}
                      </td>
                      <td colSpan={2} className="px-4 py-2" />
                    </tr>
                  </>
                );
              })()}
              <tr className="bg-surface-elevated">
                <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted">
                  {t("delivery_detail_total")}
                </td>
                <td className="px-4 py-3 text-right text-base font-bold">
                  {invoice.total.toFixed(2)} {invoice.currency}
                </td>
                {(() => {
                  // Admin-only roll-up — total cost + total profit +
                  // margin %. Mirrors the per-line cells; missing cost
                  // on any line shows "(parțial)" so the operator knows
                  // the number doesn't cover everything.
                  let totalCost = 0;
                  let totalSell = 0;
                  let anyMissing = false;
                  for (const it of invoice.items_snapshot) {
                    const qty = Number(it.quantity ?? 0);
                    const list = Number(it.unit_price ?? 0);
                    const dp = it.discounted_unit_price != null
                      ? Number(it.discounted_unit_price) : null;
                    const eff = dp != null && dp >= 0 && dp < list ? dp : list;
                    totalSell += qty * eff;
                    if (it.cost_price == null) anyMissing = true;
                    else totalCost += qty * Number(it.cost_price);
                  }
                  if (anyMissing && totalCost === 0) {
                    return (
                      <>
                        <td className="px-4 py-3 text-right tabular-nums text-muted">—</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted">—</td>
                      </>
                    );
                  }
                  const profit = Number((totalSell - totalCost).toFixed(2));
                  const marginPct = totalCost > 0
                    ? Number((((totalSell - totalCost) / totalCost) * 100).toFixed(1))
                    : 0;
                  return (
                    <>
                      <td className="px-4 py-3 text-right tabular-nums text-warning">
                        {totalCost.toFixed(2)} {invoice.currency}
                        {anyMissing ? <div className="text-[9px] text-muted">(parțial)</div> : null}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <div
                          className={cn(
                            "font-bold",
                            profit >= 0 ? "text-success" : "text-destructive",
                          )}
                        >
                          {profit >= 0 ? "+" : ""}{profit.toFixed(2)} {invoice.currency}
                        </div>
                        <div className="text-[10px] text-muted">
                          {marginPct.toFixed(1)}%
                        </div>
                      </td>
                    </>
                  );
                })()}
              </tr>
            </tfoot>
          </table>
        </section>
      </div>
    </div>
  );
}
