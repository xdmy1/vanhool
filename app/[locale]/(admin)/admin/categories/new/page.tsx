import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
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

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const cats = await adminListCategories();
  const parents = cats.map((c) => ({ id: c.id, name: nameFor(c, locale as Locale) }));

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("categories_new")}
        back={{ href: "/admin/categories", label: t("nav_categories"), locale }}
      />
      <div className="mt-6">
        <CategoryForm
          parents={parents}
          locale={locale}
          labels={{
            slug: t("field_slug"),
            name_ro: t("field_name_ro"),
            name_en: t("field_name_en"),
            name_ru: t("field_name_ru"),
            parent: t("field_parent"),
            parent_none: t("field_parent_none"),
            sort_order: t("field_sort_order"),
            active: t("field_active"),
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
