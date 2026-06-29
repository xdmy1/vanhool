// Edit page for fiscal invoices, mirrors the proforma edit page.
// Same form component (NewProformaForm), `documentType="invoice"`
// switches the submit path to updateInvoice. Locked once the
// invoice is paid, voided, or converted — those rows must stay
// frozen for accounting.
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  NewProformaForm,
  type ProformaInitial,
} from "@/components/panel/proforma/NewProformaForm";
import { getInvoice } from "@/lib/panel/invoices/queries";

const MS_PER_DAY = 86_400_000;

function diffDays(issued: string, due: string | null): number {
  if (!due) return 7;
  const a = new Date(issued).getTime();
  const b = new Date(due).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 7;
  return Math.max(0, Math.round((b - a) / MS_PER_DAY));
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([
    params,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const invoice = await getInvoice(id);
  if (!invoice || invoice.type !== "invoice") notFound();
  // Hard accounting locks. Paid/void invoices can't be edited because
  // their numbers already hit the bookkeeper's books; a re-edit would
  // desync the gross totals with the reconciliation.
  if (
    invoice.status === "paid" ||
    invoice.status === "void" ||
    invoice.status === "converted"
  ) {
    redirect(`/${locale}/panel/facturi/${id}`);
  }

  const cs = invoice.customer_snapshot;
  const initial: ProformaInitial = {
    id: invoice.id,
    walkin: {
      name: cs.name ?? "",
      company_name: "",
      email: cs.email ?? "",
      phone: cs.phone ?? "",
      idno: cs.idno ?? "",
      vat_number: cs.vat_number ?? "",
      address: cs.address ?? "",
    },
    lines:
      invoice.items_snapshot.length > 0
        ? invoice.items_snapshot.map((it) => ({
            part_code: it.partCode ?? "",
            name: it.name ?? "",
            description: it.description ?? "",
            quantity: Number(it.quantity ?? 1),
            unit: ((it as { unit?: "buc" | "l" | "m" }).unit ?? "buc") as
              | "buc"
              | "l"
              | "m",
            unit_price: Number(it.unit_price ?? 0),
            discounted_unit_price:
              it.discounted_unit_price != null
                ? Number(it.discounted_unit_price)
                : null,
            vat_rate: Number(it.vat_rate ?? 20),
            // Preserve admin-only cost across edits so margin stays
            // visible. Legacy snapshots before the cost_price field
            // existed default to 0.
            cost_price: Number(it.cost_price ?? 0),
            // Catalog price isn't snapshotted on the doc, so no yellow
            // reference for already-saved lines (only fresh picks show it).
            catalog_price: 0,
          }))
        : [
            {
              part_code: "",
              name: "",
              description: "",
              quantity: 1,
              unit: "buc" as const,
              unit_price: 0,
              discounted_unit_price: null,
              vat_rate: 20,
              cost_price: 0,
              catalog_price: 0,
            },
          ],
    scope: invoice.account_scope,
    currency: (invoice.currency as "MDL" | "EUR" | "USD") ?? "MDL",
    outputLocale: invoice.output_locale,
    dueDays: diffDays(invoice.issued_date, invoice.due_date),
    notes: invoice.notes ?? "",
  };

  const number = `${invoice.series ?? ""}${invoice.number ?? ""}`;
  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{
          href: `/panel/facturi/${id}`,
          label: t("clienti_detail_back"),
          locale,
        }}
        title={`${t("factura_edit_title")} ${number}`}
        subtitle={t("factura_edit_subtitle")}
      />
      <div className="mt-8">
        <NewProformaForm
          locale={locale}
          initial={initial}
          documentType="invoice"
        />
      </div>
    </div>
  );
}
