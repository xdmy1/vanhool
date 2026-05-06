import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { adminListCategories } from "@/lib/admin/queries";
import type { Locale } from "@/lib/db/types";

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

  const cats = await adminListCategories();
  const categoryOptions = cats.map((c) => ({
    id: c.id,
    name: nameFor(c, locale as Locale),
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
          locale={locale}
          labels={{
            field_part_code: t("field_part_code"),
            field_brand: t("field_brand"),
            field_slug: t("field_slug"),
            field_slug_hint: t("field_slug_hint"),
            field_price: t("field_price"),
            field_stock: t("field_stock"),
            field_category: t("field_category"),
            field_category_none: t("field_category_none"),
            field_warranty: t("field_warranty"),
            field_weight: t("field_weight"),
            field_width: t("field_width"),
            field_height: t("field_height"),
            field_image_url: t("field_image_url"),
            field_active: t("field_active"),
            field_featured: t("field_featured"),
            field_name_ro: t("field_name_ro"),
            field_name_en: t("field_name_en"),
            field_name_ru: t("field_name_ru"),
            field_description_ro: t("field_description_ro"),
            field_description_en: t("field_description_en"),
            field_description_ru: t("field_description_ru"),
            save: t("common_save"),
            saving: t("common_saving"),
            create: t("common_create"),
            creating: t("common_creating"),
            delete: t("common_delete"),
            confirm_delete: t("confirm_delete"),
            cancel: t("common_cancel"),
            required: t("common_required"),
            error_generic: t("common_error"),
          }}
        />
      </div>
    </div>
  );
}
