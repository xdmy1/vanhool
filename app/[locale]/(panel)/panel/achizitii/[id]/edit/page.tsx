import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  PurchaseForm,
  type PurchaseFormInitial,
} from "@/components/panel/purchases/PurchaseForm";
import { getPurchase } from "@/lib/panel/purchases/queries";

export default async function PanelAchizitiiEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([
    params,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const purchase = await getPurchase(id);
  if (!purchase) notFound();

  const initial: PurchaseFormInitial = {
    id: purchase.id,
    supplier: {
      id: purchase.supplier_id,
      name: purchase.supplier_name,
      idno: null,
      contact_phone: null,
    },
    scope: purchase.account_scope,
    documentNumber: purchase.document_number ?? "",
    documentDate: purchase.document_date,
    currency: purchase.currency,
    fxRate: purchase.fx_rate,
    notes: purchase.notes ?? "",
    lines: purchase.items.map((it) => ({
      supplier_code: it.supplier_code ?? "",
      internal_code: it.internal_code ?? "",
      description: it.description,
      quantity: it.quantity,
      unit_cost: it.unit_cost,
      vat_rate: it.vat_rate,
      add_to_catalog: it.add_to_catalog,
    })),
  };

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{
          href: `/panel/achizitii/${id}`,
          label: t("clienti_detail_back"),
          locale,
        }}
        title={`${t("achizitii_edit_title")} ${purchase.document_number ?? id.slice(0, 8).toUpperCase()}`}
        subtitle={t("achizitii_edit_subtitle")}
      />
      <div className="mt-8">
        <PurchaseForm
          locale={locale}
          defaultScope={purchase.account_scope}
          initial={initial}
        />
      </div>
    </div>
  );
}
