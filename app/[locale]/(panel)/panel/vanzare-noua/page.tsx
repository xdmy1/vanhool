import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewSaleWizard } from "@/components/panel/sales/NewSaleWizard";

export default async function PanelVanzareNouaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader title={t("sale_title")} subtitle={t("sale_subtitle")} />
      <div className="mt-8">
        <NewSaleWizard locale={locale} />
      </div>
    </div>
  );
}
