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

export default async function EditProformaPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([
    params,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const proforma = await getInvoice(id);
  if (!proforma || proforma.type !== "proforma") notFound();
  // Lock once the document is no longer mutable.
  if (proforma.converted_to_invoice_id || proforma.status === "void") {
    redirect(`/${locale}/panel/proforme/${id}`);
  }

  const cs = proforma.customer_snapshot;
  const initial: ProformaInitial = {
    id: proforma.id,
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
      proforma.items_snapshot.length > 0
        ? proforma.items_snapshot.map((it) => ({
            part_code: it.partCode ?? "",
            name: it.name ?? "",
            description: it.description ?? "",
            quantity: Number(it.quantity ?? 1),
            unit_price: Number(it.unit_price ?? 0),
            discounted_unit_price:
              it.discounted_unit_price != null
                ? Number(it.discounted_unit_price)
                : null,
            vat_rate: Number(it.vat_rate ?? 20),
            // Snapshot doesn't carry cost — set 0 so the Marja pill stays
            // hidden until the operator re-picks the product or types a
            // value manually.
            cost_price: 0,
          }))
        : [
            {
              part_code: "",
              name: "",
              description: "",
              quantity: 1,
              unit_price: 0,
              discounted_unit_price: null,
              vat_rate: 20,
              cost_price: 0,
            },
          ],
    scope: proforma.account_scope,
    currency: (proforma.currency as "MDL" | "EUR" | "USD") ?? "MDL",
    outputLocale: proforma.output_locale,
    dueDays: diffDays(proforma.issued_date, proforma.due_date),
    notes: proforma.notes ?? "",
  };

  const number = `${proforma.series ?? ""}${proforma.number ?? ""}`;
  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: `/panel/proforme/${id}`, label: t("clienti_detail_back"), locale }}
        title={`${t("proforma_edit_title")} ${number}`}
        subtitle={t("proforma_edit_subtitle")}
      />
      <div className="mt-8">
        <NewProformaForm locale={locale} initial={initial} />
      </div>
    </div>
  );
}
