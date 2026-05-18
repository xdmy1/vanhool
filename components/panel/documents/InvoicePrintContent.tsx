import { DocumentHeader } from "@/components/panel/documents/DocumentHeader";

import type { BankInfo, CompanyInfo } from "@/lib/panel/settings/company";
import type {
  CustomerSnapshot,
  InvoiceDetail,
  InvoiceItemSnapshot,
} from "@/lib/panel/invoices/queries";

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
  email: string;
  phone: string;
  itemHeader: string;
  vatRate: string;
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
  notesLabel: string;
  linkedProforma: string;
  linkedInvoice: string;
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
  bank,
  locale,
  labels,
}: {
  invoice: InvoiceDetail;
  company: CompanyInfo;
  bank: BankInfo;
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
          <div className="mb-2 text-sm font-bold text-[#5b4fc4]">{labels.billedBy}</div>
          <div className="font-semibold">{company.name}</div>
          <div className="text-xs">{company.legal_name}</div>
          <div className="mt-1 text-xs">{company.address}</div>
          <div className="mt-1 text-xs">
            {labels.vat}: <span className="font-mono">{company.vat_number}</span>
          </div>
          <div className="text-xs">
            {labels.email}: {company.email}
          </div>
          <div className="text-xs">
            {labels.phone}: {company.phone}
          </div>
        </div>
        <div className="doc-box">
          <div className="mb-2 text-sm font-bold text-[#5b4fc4]">{labels.billedTo}</div>
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
          {customer.email ? (
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
            const rate = Number(it.unit_price ?? 0);
            const amount = qty * rate;
            const vat = amount * (Number(it.vat_rate ?? 0) / 100);
            const total = amount + vat;
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
                </td>
                <td className="num">{Number(it.vat_rate ?? 0)}%</td>
                <td className="num">{qty}</td>
                <td className="num">{fmtMoney(rate, invoice.currency)}</td>
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
          <div className="mb-2 text-sm font-bold text-[#5b4fc4]">{labels.bankDetailsTitle}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <div className="text-gray-600">{labels.bankAccountName}</div>
            <div className="font-medium">{bank.account_name}</div>
            <div className="text-gray-600">{labels.bankAccountNumber}</div>
            <div className="font-mono">{bank.account_number}</div>
            <div className="text-gray-600">{labels.bankIban}</div>
            <div className="font-mono">{bank.iban}</div>
            <div className="text-gray-600">{labels.bankSwift}</div>
            <div className="font-mono">{bank.swift}</div>
            <div className="text-gray-600">{labels.bankName}</div>
            <div>{bank.name}</div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-start gap-2 text-sm">
          <div className="w-full max-w-[260px]">
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
    </main>
  );
}
