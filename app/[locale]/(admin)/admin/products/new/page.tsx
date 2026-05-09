import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { adminListCategories } from "@/lib/admin/queries";
import {
  adminListManufacturers,
  adminListVehicleMakes,
} from "@/lib/admin/products/lookups";
import { adminListBrandSuggestions } from "@/lib/admin/products/suggestions";
import type { Locale } from "@/lib/db/types";
import { buildProductFormLabels } from "@/components/admin/products/labels";

function nameFor(
  cat: { name_ro: string | null; name_en: string | null; name_ru: string | null; slug: string | null },
  locale: Locale,
): string {
  return (
    (locale === "ro" ? cat.name_ro : locale === "en" ? cat.name_en : cat.name_ru) ??
    cat.name_en ??
    cat.name_ro ??
    cat.slug ??
    ""
  );
}

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [cats, manufacturers, vehicleMakes, brandSuggestions] = await Promise.all([
    adminListCategories(),
    adminListManufacturers(),
    adminListVehicleMakes(),
    adminListBrandSuggestions(),
  ]);

  const categoryOptions = cats.map((c) => ({
    id: c.id,
    name: nameFor(c, locale as Locale),
    parentId: c.parent_id,
  }));

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("products_new")}
        back={{
          href: "/admin/products",
          label: t("nav_products"),
          locale,
        }}
      />

      <div className="mt-6">
        <ProductForm
          categories={categoryOptions}
          manufacturers={manufacturers}
          vehicleMakes={vehicleMakes}
          brandSuggestions={brandSuggestions}
          locale={locale}
          labels={buildProductFormLabels(t)}
        />
      </div>
    </div>
  );
}
