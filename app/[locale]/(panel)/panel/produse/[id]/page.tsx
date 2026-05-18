import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PanelProductForm } from "@/components/panel/PanelProductForm";
import {
  getPanelProduct,
  listCategoriesOptions,
  listManufacturersOptions,
  listSuppliersOptions,
} from "@/lib/panel/produse/queries";

export default async function PanelProduseEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [product, categories, manufacturers, suppliers, t] = await Promise.all([
    getPanelProduct(id),
    listCategoriesOptions(),
    listManufacturersOptions(),
    listSuppliersOptions(),
    getTranslations("panel"),
  ]);
  if (!product) notFound();

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/produse", label: t("product_edit_back"), locale }}
        title={product.name_ro ?? product.part_code ?? "—"}
        subtitle={
          product.part_code
            ? t("product_edit_internal_code", { code: product.part_code })
            : undefined
        }
      />
      <div className="mt-8">
        <PanelProductForm
          locale={locale}
          initial={product}
          categories={categories}
          manufacturers={manufacturers}
          suppliers={suppliers}
        />
      </div>
    </div>
  );
}
