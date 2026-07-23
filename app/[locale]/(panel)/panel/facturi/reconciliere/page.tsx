import { setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReconcileClient } from "@/components/panel/reconciliation/ReconcileClient";

export default async function PanelReconciliationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow="Facturi"
        title="Reconciliere bancară"
        subtitle="Încarcă extrasul bancar (XML). Panelul potrivește fiecare încasare cu clientul după codul fiscal și propune ce facturi deschise se achită — tu confirmi la un click."
      />
      <div className="mt-6">
        <ReconcileClient />
      </div>
    </div>
  );
}
