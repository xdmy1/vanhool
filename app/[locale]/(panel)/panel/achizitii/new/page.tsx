import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PurchaseForm } from "@/components/panel/purchases/PurchaseForm";
import { getActiveBook } from "@/lib/panel/scope";

export default async function PanelAchizitiiNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);
  const scope = await getActiveBook(sp);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/achizitii", label: t("clienti_detail_back"), locale }}
        title={t("achizitii_new_title")}
        subtitle={t("achizitii_new_subtitle")}
      />
      <div className="mt-8">
        <PurchaseForm locale={locale} defaultScope={scope} />
      </div>
    </div>
  );
}
