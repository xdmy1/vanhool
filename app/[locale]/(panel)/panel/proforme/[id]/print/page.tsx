import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  AutoPrintGeneric,
  PrintButton,
} from "@/components/panel/documents/AutoPrintGeneric";
import { InvoicePrintContent } from "@/components/panel/documents/InvoicePrintContent";
import { getInvoice } from "@/lib/panel/invoices/queries";
import { getCompanyAndBank } from "@/lib/panel/settings/company";

export default async function ProformaPrintPage({
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
  const invoice = await getInvoice(id);
  if (!invoice || invoice.type !== "proforma") notFound();
  const auto = sp.auto === "1";
  const { company, bank } = await getCompanyAndBank();

  return (
    <>
      <AutoPrintGeneric auto={auto} />
      <InvoicePrintContent
        invoice={invoice}
        company={company}
        bank={bank}
        locale={locale}
        labels={{
          proformaTitle: t("invoice_print_proforma_title"),
          invoiceTitle: t("invoice_print_invoice_title"),
          numberLabel: t("invoice_print_number_label"),
          invoiceDateLabel: t("invoice_print_issued_date"),
          dueDateLabel: t("invoice_print_due_date"),
          paidLabel: t("invoice_print_paid"),
          billedBy: t("invoice_print_billed_by"),
          billedTo: t("invoice_print_billed_to"),
          vat: t("invoice_print_vat"),
          email: t("invoice_print_email"),
          phone: t("invoice_print_phone"),
          itemHeader: t("invoice_print_col_item"),
          vatRate: t("invoice_print_col_vat_rate"),
          quantity: t("invoice_print_col_qty"),
          rate: t("invoice_print_col_rate"),
          amount: t("invoice_print_col_amount"),
          vatCol: t("invoice_print_col_vat"),
          totalCol: t("invoice_print_col_total"),
          amountSubtotal: t("invoice_print_subtotal"),
          vatTotal: t("invoice_print_vat_total"),
          totalLabel: t("invoice_print_total_label"),
          amountPaid: t("invoice_print_amount_paid"),
          bankDetailsTitle: t("invoice_print_bank_title"),
          bankAccountName: t("invoice_print_bank_account_name"),
          bankAccountNumber: t("invoice_print_bank_account_number"),
          bankIban: t("invoice_print_bank_iban"),
          bankSwift: t("invoice_print_bank_swift"),
          bankName: t("invoice_print_bank_name"),
          notesLabel: t("delivery_notes_label"),
          linkedProforma: t("invoice_print_linked_proforma"),
          linkedInvoice: t("invoice_print_linked_invoice"),
        }}
      />
      <footer className="no-print mt-6 flex justify-center pb-10">
        <PrintButton label={t("action_print")} />
      </footer>
    </>
  );
}
