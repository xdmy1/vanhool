import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PanelProductForm } from "@/components/panel/PanelProductForm";
import {
  listCategoriesOptions,
  listManufacturersOptions,
  listSuppliersOptions,
} from "@/lib/panel/produse/queries";
import { getPurchaseItemPrefill } from "@/lib/panel/purchases/queries";

export default async function PanelProduseNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const fromLineRaw = sp.from_line;
  const fromLineId =
    typeof fromLineRaw === "string" && fromLineRaw.length > 0 ? fromLineRaw : null;

  const [categories, manufacturers, suppliers, prefill, t] = await Promise.all([
    listCategoriesOptions(),
    listManufacturersOptions(),
    listSuppliersOptions(),
    fromLineId ? getPurchaseItemPrefill(fromLineId) : Promise.resolve(null),
    getTranslations("panel"),
  ]);

  // If the user navigated with ?from_line=... but the line is already linked
  // (has product_id), just show the standard form without prefill.
  const usablePrefill = prefill && !prefill.product_id ? prefill : null;

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{
          href: usablePrefill
            ? `/panel/achizitii/${usablePrefill.purchaseId}`
            : "/panel/produse",
          label: usablePrefill ? t("clienti_detail_back") : t("product_edit_back"),
          locale,
        }}
        title={t("product_create_title")}
        subtitle={t("product_create_subtitle")}
      />
      <div className="mt-8">
        <PanelProductForm
          locale={locale}
          prefill={usablePrefill}
          categories={categories}
          manufacturers={manufacturers}
          suppliers={suppliers}
        />
      </div>
    </div>
  );
}
