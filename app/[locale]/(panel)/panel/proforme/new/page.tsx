import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewProformaForm } from "@/components/panel/proforma/NewProformaForm";

export default async function PanelProformaNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/proforme", label: t("clienti_detail_back"), locale }}
        title={t("proforma_new_title")}
        subtitle={t("proforma_new_subtitle")}
      />
      <div className="mt-8">
        <NewProformaForm locale={locale} />
      </div>
    </div>
  );
}
