import { DocumentHeader } from "@/components/panel/documents/DocumentHeader";

import {
  type BankAccount,
  type CompanyInfo,
  pickBankForCurrency,
} from "@/lib/panel/settings/company";
import type {
  CustomerSnapshot,
  InvoiceDetail,
  InvoiceItemSnapshot,
} from "@/lib/panel/invoices/queries";

/**
 * Clients created from /panel/clienti without a real email get a synthetic
 * `panel-{uuid}@inter-bus.md` so auth.users insert succeeds. That address is
 * not the customer's — don't print it on documents.
 */
function isPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^panel-[a-f0-9-]+@inter-bus\.md$/i.test(email);
}

type Labels = {
  proformaTitle: string;
  invoiceTitle: string;
  numberLabel: string;
  invoiceDateLabel: string;
  dueDateLabel: string;
  paidLabel: string;
  billedBy: string;
  billedTo: string;
  vat: string;
  idno: string;
  vatReg: string;
  administrator: string;
  website: string;
  email: string;
  phone: string;
  itemHeader: string;
  vatRate: string;
  unit: string;
  quantity: string;
  rate: string;
  amount: string;
  vatCol: string;
  totalCol: string;
  amountSubtotal: string;
  vatTotal: string;
  totalLabel: string;
  amountPaid: string;
  bankDetailsTitle: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIban: string;
  bankSwift: string;
  bankName: string;
  bankCurrency: string;
  notesLabel: string;
  linkedProforma: string;
  linkedInvoice: string;
  discountLabel: string;
  discountBeforeLabel: string;
  termsTitle: string;
  terms: string[];
};

const FMT_DATE: Record<string, Intl.DateTimeFormat> = {};
function fmtDate(d: string | null | undefined, locale: string): string {
  if (!d) return "—";
  if (!FMT_DATE[locale]) {
    FMT_DATE[locale] = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return FMT_DATE[locale].format(new Date(d));
}

function fmtMoney(v: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "";
  const formatted = v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency}`;
}

export function InvoicePrintContent({
  invoice,
  company,
  banks,
  locale,
  labels,
}: {
  invoice: InvoiceDetail;
  company: CompanyInfo;
  banks: BankAccount[];
  locale: string;
  labels: Labels;
}) {
  const isProforma = invoice.type === "proforma";
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const customer = invoice.customer_snapshot as CustomerSnapshot;
  const items = invoice.items_snapshot as InvoiceItemSnapshot[];
  const number = `${invoice.series ?? ""}${invoice.number ?? "—"}`;
  const totalFmt = fmtMoney(invoice.total, invoice.currency);
  const isPaid = invoice.status === "paid";
  const bank = pickBankForCurrency(banks, invoice.currency);

  // Reconstruct the pre-discount gross from the snapshot so the totals stack
  // shows "what it would have cost" alongside "what it costs now". Items
  // without a per-line discount contribute identically to both totals; older
  // snapshots without `discounted_unit_price` also collapse cleanly.
  const grossBeforeDiscount = items.reduce((s, it) => {
    const qty = Number(it.quantity ?? 0);
    const list = Number(it.unit_price ?? 0);
    return s + qty * list;
  }, 0);
  const grossAfter = items.reduce((s, it) => {
    const qty = Number(it.quantity ?? 0);
    const list = Number(it.unit_price ?? 0);
    const dp =
      it.discounted_unit_price != null ? Number(it.discounted_unit_price) : null;
    const eff = dp != null && dp >= 0 && dp < list ? dp : list;
    return s + qty * eff;
  }, 0);
  const linesDiscountAmount = Number((grossBeforeDiscount - grossAfter).toFixed(2));
  const linesDiscountPct =
    grossBeforeDiscount > 0 && linesDiscountAmount > 0
      ? Math.min(100, Number(((linesDiscountAmount / grossBeforeDiscount) * 100).toFixed(2)))
      : 0;
  const hasAnyDiscount = linesDiscountAmount > 0 || invoice.discount_percent > 0;

  return (
    <main className="doc-sheet mx-auto max-w-[210mm] p-8">
      <div className="doc-watermark" aria-hidden />

      <DocumentHeader
        documentType={isProforma ? "proforma" : "invoice"}
        documentTitle={isProforma ? labels.proformaTitle : labels.invoiceTitle}
        documentNumberLabel={labels.numberLabel}
        documentNumber={number}
        issuedDate={`${labels.invoiceDateLabel}: ${fmtDate(invoice.issued_date, dateLocale)}`}
        dueDate={
          invoice.due_date
            ? `${labels.dueDateLabel}: ${fmtDate(invoice.due_date, dateLocale)}`
            : null
        }
        paidBadge={isPaid ? labels.paidLabel : null}
        company={company}
      />

      <section className="mb-6 grid grid-cols-2 gap-3">
        <div className="doc-box">
          <div className="mb-2 text-sm font-bold text-black">{labels.billedBy}</div>
          <div className="font-semibold">{company.legal_name}</div>
          <div className="mt-1 text-xs">{company.address}</div>
          <div className="mt-1 text-xs">
            {labels.idno}: <span className="font-mono">{company.idno}</span>
          </div>
          {company.vat_registration_number ? (
            <div className="text-xs">
              {labels.vatReg}: <span className="font-mono">{company.vat_registration_number}</span>
            </div>
          ) : null}
          {company.administrator ? (
            <div className="mt-1 text-xs">
              {labels.administrator}: {company.administrator}
            </div>
          ) : null}
          <div className="mt-1 text-xs">
            {labels.email}: {company.email}
          </div>
          <div className="text-xs">
            {labels.phone}: {company.phone}
          </div>
          {company.website ? (
            <div className="text-xs">
              {labels.website}: {company.website}
            </div>
          ) : null}
        </div>
        <div className="doc-box">
          <div className="mb-2 text-sm font-bold text-black">{labels.billedTo}</div>
          <div className="font-semibold">{customer.name ?? "—"}</div>
          {customer.address ? <div className="text-xs">{customer.address}</div> : null}
          {customer.idno ? (
            <div className="mt-1 text-xs">
              IDNO: <span className="font-mono">{customer.idno}</span>
            </div>
          ) : null}
          {customer.vat_number ? (
            <div className="text-xs">
              {labels.vat}: <span className="font-mono">{customer.vat_number}</span>
            </div>
          ) : null}
          {customer.email && !isPlaceholderEmail(customer.email) ? (
            <div className="text-xs">
              {labels.email}: {customer.email}
            </div>
          ) : null}
          {customer.phone ? (
            <div className="text-xs">
              {labels.phone}: {customer.phone}
            </div>
          ) : null}
        </div>
      </section>

      {invoice.linked_proforma ? (
        <div className="mb-3 text-xs text-gray-700">
          {labels.linkedProforma}:{" "}
          <span className="font-mono">
            {invoice.linked_proforma.series}
            {invoice.linked_proforma.number}
          </span>
        </div>
      ) : null}
      {invoice.linked_invoice ? (
        <div className="mb-3 text-xs text-gray-700">
          {labels.linkedInvoice}:{" "}
          <span className="font-mono">
            {invoice.linked_invoice.series}
            {invoice.linked_invoice.number}
          </span>
        </div>
      ) : null}

      <table className="items mb-4">
        <thead>
          <tr>
            <th style={{ width: "32px" }}>#</th>
            <th>{labels.itemHeader}</th>
            <th className="num" style={{ width: "60px" }}>{labels.vatRate}</th>
            <th className="num" style={{ width: "44px" }}>{labels.unit}</th>
            <th className="num" style={{ width: "70px" }}>{labels.quantity}</th>
            <th className="num" style={{ width: "80px" }}>{labels.rate}</th>
            <th className="num" style={{ width: "90px" }}>{labels.amount}</th>
            <th className="num" style={{ width: "60px" }}>{labels.vatCol}</th>
            <th className="num" style={{ width: "100px" }}>{labels.totalCol}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const qty = Number(it.quantity ?? 0);
            const listRate = Number(it.unit_price ?? 0);
            // Per-line discount: discounted_unit_price overrides the list rate
            // when present and lower. Effective rate = what the customer pays.
            const dp =
              it.discounted_unit_price != null
                ? Number(it.discounted_unit_price)
                : null;
            const hasDiscount = dp != null && dp >= 0 && dp < listRate;
            const effRate = hasDiscount ? dp! : listRate;
            const linePct = hasDiscount && listRate > 0
              ? Math.max(0, (1 - effRate / listRate) * 100)
              : 0;
            // unit_price is VAT-inclusive (gross) — break it back into net
            // + VAT so the document itemizes TVA without inflating the price.
            const vatRate = Number(it.vat_rate ?? 0);
            const factor = 1 + vatRate / 100;
            const gross = qty * effRate;
            const amount = factor > 0 ? gross / factor : gross;
            const vat = gross - amount;
            const total = gross;
            return (
              <tr key={i}>
                <td className="num">{i + 1}.</td>
                <td>
                  <div className="font-medium">
                    {it.partCode ? <span className="font-mono">{it.partCode} </span> : null}
                    {it.name ?? "—"}
                  </div>
                  {it.description ? (
                    <div className="text-[11px] text-gray-600">{it.description}</div>
                  ) : null}
                  {hasDiscount ? (
                    <div className="mt-0.5 text-[10px] font-semibold text-green-700">
                      {labels.discountLabel} -{Math.round(linePct)}%
                    </div>
                  ) : null}
                </td>
                <td className="num">{Number(it.vat_rate ?? 0)}%</td>
                <td className="num">{(it as { unit?: string }).unit ?? "buc"}</td>
                <td className="num">{qty}</td>
                <td className="num">
                  {hasDiscount ? (
                    <>
                      <div className="text-[10px] text-gray-500 line-through">
                        {fmtMoney(listRate, invoice.currency)}
                      </div>
                      <div className="font-semibold text-green-700">
                        {fmtMoney(effRate, invoice.currency)}
                      </div>
                    </>
                  ) : (
                    fmtMoney(effRate, invoice.currency)
                  )}
                </td>
                <td className="num">{fmtMoney(amount, invoice.currency)}</td>
                <td className="num">{fmtMoney(vat, invoice.currency)}</td>
                <td className="num font-semibold">{fmtMoney(total, invoice.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <section className="grid grid-cols-2 gap-4">
        <div className="doc-box">
          <div className="mb-2 text-sm font-bold text-black">{labels.bankDetailsTitle}</div>
          {bank ? (
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <div className="text-gray-600">{labels.bankAccountName}</div>
              <div className="font-medium">{bank.account_holder}</div>
              <div className="text-gray-600">{labels.bankCurrency}</div>
              <div className="font-mono">{bank.currency}</div>
              <div className="text-gray-600">{labels.bankIban}</div>
              <div className="font-mono">{bank.iban}</div>
              <div className="text-gray-600">{labels.bankSwift}</div>
              <div className="font-mono">{bank.swift}</div>
              <div className="text-gray-600">{labels.bankName}</div>
              <div>{bank.bank_name}</div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">—</div>
          )}
        </div>
        <div className="flex flex-col items-end justify-start gap-2 text-sm">
          <div className="w-full max-w-[280px]">
            {hasAnyDiscount && linesDiscountAmount > 0 ? (
              <>
                <div className="flex justify-between border-b border-gray-300 py-1 text-gray-500">
                  <span>{labels.discountBeforeLabel}</span>
                  <span className="line-through">
                    {fmtMoney(grossBeforeDiscount, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-1 text-green-700">
                  <span>
                    {labels.discountLabel}
                    {linesDiscountPct > 0
                      ? ` (-${Math.round(linesDiscountPct)}%)`
                      : ""}
                  </span>
                  <span className="font-medium">
                    -{fmtMoney(linesDiscountAmount, invoice.currency)}
                  </span>
                </div>
              </>
            ) : null}
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="text-gray-600">{labels.amountSubtotal}</span>
              <span className="font-medium">{fmtMoney(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="text-gray-600">{labels.vatTotal}</span>
              <span className="font-medium">{fmtMoney(invoice.vat_amount, invoice.currency)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-b-2 border-black py-1 text-base font-bold">
              <span>{labels.totalLabel} ({invoice.currency})</span>
              <span>{totalFmt}</span>
            </div>
            {isPaid ? (
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-600">{labels.amountPaid}</span>
                <span className="font-medium">({totalFmt})</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {invoice.notes ? (
        <section className="mt-6 border-t border-gray-300 pt-3 text-xs text-gray-700">
          <div className="font-semibold uppercase tracking-wide">{labels.notesLabel}</div>
          <div className="mt-1 whitespace-pre-wrap">{invoice.notes}</div>
        </section>
      ) : null}

      {labels.terms && labels.terms.length > 0 ? (
        <section
          className="mt-4 break-inside-avoid border-t border-gray-300 pt-2 text-[7.5px] leading-[1.25] text-gray-700"
          style={{ pageBreakInside: "avoid" }}
        >
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-black">
            {labels.termsTitle}
          </div>
          <ol
            className="grid list-decimal grid-cols-2 gap-x-3 gap-y-0.5 pl-3 marker:font-semibold marker:text-gray-600"
            style={{ columnGap: "12px" }}
          >
            {labels.terms.map((term, i) => (
              <li key={i} className="break-inside-avoid">
                {term}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
