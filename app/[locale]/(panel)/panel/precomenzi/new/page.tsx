import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PreorderForm } from "@/components/panel/preorders/PreorderForm";
import { listSuppliersOptions } from "@/lib/panel/produse/queries";

export default async function NewPreorderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t, suppliers] = await Promise.all([
    params,
    getTranslations("panel"),
    listSuppliersOptions(),
  ]);
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/precomenzi", label: t("preorder_back"), locale }}
        title={t("preorder_new_title")}
        subtitle={t("preorder_new_subtitle")}
      />
      <div className="mt-8">
        <PreorderForm locale={locale} suppliers={suppliers} />
      </div>
    </div>
  );
}
