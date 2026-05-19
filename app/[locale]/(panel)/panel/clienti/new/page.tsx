import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ClientForm } from "@/components/panel/clienti/ClientForm";

export default async function PanelClientNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/clienti", label: t("clienti_detail_back"), locale }}
        title={t("client_new_title")}
        subtitle={t("client_new_subtitle")}
      />
      <div className="mt-8">
        <ClientForm locale={locale} />
      </div>
    </div>
  );
}
