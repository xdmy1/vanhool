import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { CategoryTree } from "@/components/admin/categories/CategoryTree";
import {
  adminCategoryProductCounts,
  adminListCategories,
} from "@/lib/admin/queries";
import type { Locale } from "@/lib/db/types";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, cats, counts] = await Promise.all([
    getTranslations("admin"),
    adminListCategories(),
    adminCategoryProductCounts(),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_categories")}
        title={t("categories_title")}
        actions={
          <Button asChild size="md" className="">
            <Link href={"/admin/categories/new" as "/admin/categories"} locale={locale}>
              <Plus className="size-4" />
              {t("categories_new")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {cats.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-sm text-muted">
            {t("categories_empty")}
          </div>
        ) : (
          <CategoryTree
            categories={cats}
            counts={Object.fromEntries(counts)}
            locale={locale as Locale}
          />
        )}
      </div>
    </div>
  );
}

