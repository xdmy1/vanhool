import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Building2, Edit3, FileText, Receipt, User } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { deleteClientWithPin } from "@/lib/panel/clienti/actions";
import { getClientDocuments, getPanelClient } from "@/lib/panel/clienti/queries";
import type { ClientDocument } from "@/lib/panel/clienti/queries";
import {
  getClientCredits,
  creditBalanceByCurrency,
  owedByCurrency,
} from "@/lib/panel/credits/queries";
import { IssueCreditButton } from "@/components/panel/credits/IssueCreditButton";
import { VoidCreditButton } from "@/components/panel/credits/VoidCreditButton";
import { getActiveBook } from "@/lib/panel/scope";
import { cn } from "@/lib/utils/cn";
import { TIMEZONE } from "@/lib/datetime";

export default async function PanelClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, id }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const scope = await getActiveBook(sp);
  const client = await getPanelClient(id, scope);
  if (!client) notFound();

  // The document folder spans BOTH books. A tab filters by type; default shows
  // invoices (the operator's usual "did they pay" question).
  const docTab: "invoice" | "proforma" =
    sp.docs === "proforma" ? "proforma" : "invoice";
  const allDocuments = await getClientDocuments(id, client.idno);
  const documents = allDocuments.filter((d) => d.type === docTab);

  // Balance with us — kept strictly per-currency (never mix lei/eur):
  //   owed   = open invoices (issued/sent/partial) this client hasn't paid,
  //   credit = available store credit,
  //   net    = owed − credit  (positive = they owe, negative = we owe them).
  const credits = await getClientCredits(id);
  const owed = owedByCurrency(allDocuments);
  const creditBal = creditBalanceByCurrency(credits);
  const balanceCurrencies = Array.from(
    new Set([...Object.keys(owed), ...Object.keys(creditBal)]),
  ).sort();
  const invoiceCount = allDocuments.filter((d) => d.type === "invoice").length;
  const proformaCount = allDocuments.filter((d) => d.type === "proforma").length;

  const isBusiness = client.account_type === "business";
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(dateLocale, { timeZone: TIMEZONE }) : "—";
  const bookLabel = scope === "conta1" ? t("conta1") : t("conta2");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/clienti", label: t("clienti_detail_back"), locale }}
        title={
          isBusiness
            ? client.company_name ?? client.full_name ?? client.email ?? id
            : client.full_name ?? client.email ?? id
        }
        subtitle={
          isBusiness && client.idno
            ? t("clienti_detail_company", { idno: client.idno })
            : t("clienti_detail_individual")
        }
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-1.5">
              <Link
                href={`/panel/clienti/${id}/edit` as "/panel"}
                locale={locale}
              >
                <Edit3 className="size-4" />
                {t("action_edit")}
              </Link>
            </Button>
            <PinDeleteButton
              action={deleteClientWithPin}
              entityId={id}
              redirectTo={`/${locale}/panel/clienti`}
            />
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={cn(
                "grid size-12 place-items-center rounded-full",
                isBusiness ? "bg-primary/10 text-primary" : "bg-surface-elevated text-muted",
              )}
            >
              {isBusiness ? <Building2 className="size-5" /> : <User className="size-5" />}
            </span>
            <div>
              <div className="text-sm font-semibold">{client.email ?? "—"}</div>
              <div className="text-xs text-muted">{client.phone ?? ""}</div>
            </div>
          </div>

          <dl className="space-y-2 text-sm">
            <Row label={t("clienti_detail_label_discount")}>
              {client.discount_percent ? `${client.discount_percent}%` : "—"}
            </Row>
            <Row label={t("clienti_detail_label_type")}>
              {isBusiness ? t("clienti_type_b2b") : t("clienti_type_b2c")}
            </Row>
            {isBusiness ? (
              <>
                <Row label={t("clienti_detail_label_legal_form")}>{client.legal_form ?? "—"}</Row>
                <Row label={t("clienti_detail_label_vat")}>{client.vat_code ?? "—"}</Row>
              </>
            ) : null}
            <Row label={t("clienti_detail_label_member_since")}>{fmtDate(client.created_at)}</Row>
          </dl>

          {(client.billing_country || client.billing_city) ? (
            <div className="mt-4 border-t border-border pt-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {t("clienti_detail_billing_address")}
              </div>
              <div className="mt-1 text-sm text-muted-strong">
                {[client.billing_street, client.billing_city, client.billing_district, client.billing_postal, client.billing_country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-2">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {t("clienti_detail_activity", { book: bookLabel })}
            </h2>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label={t("clienti_detail_total_orders")} value={String(client.orders_count)} />
            <Stat
              label={t("clienti_detail_total_spent")}
              value={
                Object.keys(client.total_spent_by_currency).length === 0 ? (
                  <Price value={0} size="lg" accent={false} />
                ) : (
                  <div className="flex flex-col gap-1">
                    {Object.entries(client.total_spent_by_currency).map(
                      ([currency, sum]) => (
                        <Price
                          key={currency}
                          value={sum}
                          currency={currency}
                          size="lg"
                          accent={false}
                        />
                      ),
                    )}
                  </div>
                )
              }
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {t("clienti_detail_recent_orders")}
            </div>
            {client.recent_orders.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
                {t("clienti_detail_no_orders")}
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {client.recent_orders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/panel/comenzi/${o.id}` as "/admin"}
                      locale={locale}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-elevated"
                    >
                      <span className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 text-[10px] uppercase tracking-wide",
                          o.account_scope === "conta1"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/15 text-warning",
                        )}
                      >
                        {o.account_scope === "conta1" ? t("conta1") : t("conta2")}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-muted">
                        {o.source}
                      </span>
                      <span className="ml-auto text-xs text-muted-strong">
                        {fmtDate(o.created_at)}
                      </span>
                      <span className="w-28 text-right tabular-nums">
                        {o.total !== null ? (
                          <Price
                            value={Number(o.total)}
                            currency={o.currency}
                            size="sm"
                            accent={false}
                          />
                        ) : (
                          "—"
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Balance with us — per-currency, never summed across lei/eur. */}
      <section className="mt-6 rounded-md border border-border bg-surface p-5">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Balanță cu noi</h2>
          <IssueCreditButton clientId={id} />
        </header>

        {balanceCurrencies.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
            Fără facturi deschise și fără credit.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {balanceCurrencies.map((cur) => {
              const o = Number((owed[cur] ?? 0).toFixed(2));
              const c = Number((creditBal[cur] ?? 0).toFixed(2));
              const net = Number((o - c).toFixed(2));
              return (
                <div key={cur} className="rounded-md border border-border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted">{cur}</div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted">Facturi deschise</span>
                    <span className="tabular-nums font-medium text-destructive">
                      {o.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Credit disponibil</span>
                    <span className="tabular-nums font-medium text-success">
                      {c.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs uppercase tracking-wide text-muted">
                      {net > 0 ? "Datorează" : net < 0 ? "Are în plus" : "La zi"}
                    </span>
                    <span
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        net > 0 ? "text-destructive" : net < 0 ? "text-success" : "text-foreground",
                      )}
                    >
                      {Math.abs(net).toFixed(2)} {cur}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {credits.length > 0 ? (
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Credite emise
            </div>
            <ul className="divide-y divide-border rounded-md border border-border">
              {credits.map((cr) => {
                const avail = Number((cr.amount - cr.used_amount).toFixed(2));
                return (
                  <li key={cr.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="font-mono text-xs font-semibold">{cr.serial ?? "—"}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 text-[10px] uppercase tracking-wide",
                        cr.status === "active"
                          ? "bg-success/15 text-success"
                          : cr.status === "used"
                            ? "bg-surface-elevated text-muted"
                            : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {cr.status === "active" ? "activ" : cr.status === "used" ? "folosit" : "anulat"}
                    </span>
                    {cr.reason ? <span className="text-xs text-muted">{cr.reason}</span> : null}
                    <span className="ml-auto tabular-nums">
                      <span className="text-muted">disp. </span>
                      <span className="font-semibold text-success">
                        {avail.toFixed(2)} {cr.currency}
                      </span>
                      <span className="text-xs text-muted"> / {cr.amount.toFixed(2)}</span>
                    </span>
                    <a
                      href={`/${locale}/dashboard/credit/${cr.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-border bg-surface px-2 py-0.5 text-[11px] text-primary transition-colors hover:bg-primary/10"
                    >
                      PDF
                    </a>
                    {cr.status === "active" ? <VoidCreditButton creditId={cr.id} /> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      {/* The client "folder": every invoice + proforma tied to them across
          BOTH books, newest first — with paid / unpaid status at a glance.
          The tab switches between facturi and proforme. */}
      <section className="mt-6 rounded-md border border-border bg-surface p-5">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">{t("clienti_detail_documents_all")}</h2>
          <div className="inline-flex overflow-hidden rounded-md border border-border text-xs">
            <Link
              href={`/panel/clienti/${id}?docs=invoice` as "/panel"}
              locale={locale}
              className={cn(
                "px-3 py-1.5 transition-colors",
                docTab === "invoice"
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-strong hover:text-foreground",
              )}
            >
              {t("clienti_detail_tab_invoices", { count: invoiceCount })}
            </Link>
            <Link
              href={`/panel/clienti/${id}?docs=proforma` as "/panel"}
              locale={locale}
              className={cn(
                "px-3 py-1.5 transition-colors",
                docTab === "proforma"
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-strong hover:text-foreground",
              )}
            >
              {t("clienti_detail_tab_proformas", { count: proformaCount })}
            </Link>
          </div>
        </header>

        {documents.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
            {t("clienti_detail_no_documents_type")}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {documents.map((d) => (
              <DocumentRow key={d.id} doc={d} locale={locale} t={t} fmtDate={fmtDate} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DocumentRow({
  doc,
  locale,
  fmtDate,
  t,
}: {
  doc: ClientDocument;
  locale: string;
  fmtDate: (d: string | null) => string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const isInvoice = doc.type === "invoice";
  const href = (isInvoice
    ? `/panel/facturi/${doc.id}`
    : `/panel/proforme/${doc.id}`) as "/panel";

  const statusTone: Record<string, string> = {
    paid: "bg-success/15 text-success",
    issued: "bg-warning/15 text-warning",
    sent: "bg-primary/10 text-primary",
    partial: "bg-warning/15 text-warning",
    draft: "bg-surface-elevated text-muted",
    void: "bg-danger/15 text-danger",
    converted: "bg-surface-elevated text-muted",
  };
  const statusLabel =
    isInvoice
      ? t(`facturi_status_${doc.status}`)
      : t(`proforma_status_${doc.status}`);

  // The whole point of the client folder is telling paid from unpaid at a
  // glance, so invoices get a dedicated green/red/amber pill — separate from
  // the document status. Proformas have no payment state here.
  const payment: { label: string; tone: string } | null = !isInvoice
    ? null
    : doc.paid_at || doc.status === "paid"
      ? {
          label: doc.paid_at
            ? t("clienti_detail_doc_paid_on", { date: fmtDate(doc.paid_at) })
            : t("clienti_detail_doc_paid"),
          tone: "bg-success/15 text-success",
        }
      : doc.status === "partial"
        ? { label: t("facturi_status_partial"), tone: "bg-warning/20 text-warning" }
        : doc.status === "issued" || doc.status === "sent"
          ? { label: t("clienti_detail_doc_unpaid"), tone: "bg-danger/15 text-danger" }
          : null;

  return (
    <li>
      <Link
        href={href}
        locale={locale}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm transition-colors hover:bg-surface-elevated"
      >
        <span className="text-muted">
          {isInvoice ? <Receipt className="size-4" /> : <FileText className="size-4" />}
        </span>
        <span
          className={cn(
            "rounded px-1.5 text-[10px] uppercase tracking-wide",
            doc.account_scope === "conta1"
              ? "bg-primary/10 text-primary"
              : "bg-warning/15 text-warning",
          )}
        >
          {doc.account_scope === "conta1" ? t("conta1") : t("conta2")}
        </span>
        <span className="font-mono text-xs font-semibold">
          {(doc.series ?? "") + (doc.number ?? "")}
        </span>
        <span
          className={cn(
            "rounded px-1.5 text-[10px] uppercase tracking-wide",
            statusTone[doc.status] ?? "bg-surface-elevated text-muted",
          )}
        >
          {statusLabel}
        </span>
        <span className="ml-auto text-xs text-muted-strong">{fmtDate(doc.issued_date)}</span>
        {payment ? (
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              payment.tone,
            )}
          >
            {payment.label}
          </span>
        ) : (
          <span className="w-16" aria-hidden />
        )}
        <span className="w-28 text-right tabular-nums">
          <Price value={doc.total} currency={doc.currency} size="sm" accent={false} />
        </span>
      </Link>
    </li>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
