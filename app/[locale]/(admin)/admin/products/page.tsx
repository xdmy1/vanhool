import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterChips } from "@/components/admin/FilterChips";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { TecdocImportModal } from "@/components/admin/tecdoc/TecdocImportModal";
import { adminListCategories, adminListProducts } from "@/lib/admin/queries";
import { isApifyConfigured } from "@/lib/apify/config";
import type { Locale } from "@/lib/db/types";

type Status = "all" | "active" | "inactive" | "featured" | "low_stock";

const STATUS_VALUES: readonly Status[] = ["all", "active", "inactive", "featured", "low_stock"] as const;

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

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const status: Status = STATUS_VALUES.includes(sp.status as Status)
    ? (sp.status as Status)
    : "all";

  const t = await getTranslations("admin");
  const page = Number(sp.page ?? 1);

  const [{ rows, total }, categories] = await Promise.all([
    adminListProducts({ q: sp.q, status, page, perPage: 25 }),
    adminListCategories(),
  ]);

  const categoriesMap = new Map<string, { name: string; slug: string | null }>();
  const categoryOptions: { id: string; name: string }[] = [];
  for (const c of categories) {
    const name = nameFor(c, locale as Locale);
    categoriesMap.set(c.id, { name, slug: c.slug });
    categoryOptions.push({ id: c.id, name });
  }

  const tecdocAvailable = isApifyConfigured();

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_products")}
        title={t("products_title")}
        subtitle={`${total} · ${total === 1 ? "1 product" : `${total} products`}`}
        actions={
          <>
            <TecdocImportModal
              isAvailable={tecdocAvailable}
              categories={categoryOptions}
              locale={locale}
              labels={{
                open: t("tecdoc_open"),
                title: t("tecdoc_title"),
                subtitle: t("tecdoc_subtitle"),
                search_placeholder: t("tecdoc_search_placeholder"),
                search: t("tecdoc_search"),
                refresh: t("tecdoc_refresh"),
                source_apify: t("tecdoc_source_apify"),
                source_cache: t("tecdoc_source_cache"),
                no_results: t("tecdoc_no_results"),
                not_configured: t("tecdoc_not_configured"),
                err_generic: t("common_error"),
                field_price: t("field_price"),
                field_stock: t("field_stock"),
                field_category: t("field_category"),
                field_category_none: t("field_category_none"),
                vehicle_compat: t("tecdoc_vehicle_compat"),
                oem_codes: t("tecdoc_oem_codes"),
                specs: t("tecdoc_specs"),
                images: t("tecdoc_images"),
                import: t("tecdoc_import"),
                importing: t("tecdoc_importing"),
                imported: t("tecdoc_imported"),
                edit_after: t("tecdoc_edit_after"),
                close: t("common_cancel"),
              }}
            />
            <Button asChild size="md" className="">
              <Link href={"/admin/products/new" as "/admin/products"} locale={locale}>
                <Plus className="size-4" />
                {t("products_new")}
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchInput
          placeholder={t("products_search_placeholder")}
          className="md:max-w-md md:flex-1"
        />
        <FilterChips
          paramName="status"
          options={[
            { value: "all", label: t("products_filter_all") },
            { value: "active", label: t("products_filter_active") },
            { value: "inactive", label: t("products_filter_inactive") },
            { value: "low_stock", label: t("products_filter_low_stock") },
            { value: "featured", label: t("products_filter_featured") },
          ]}
        />
      </div>

      <div className="mt-6">
        <ProductsTable
          rows={rows}
          categories={categoriesMap}
          locale={locale}
          labels={{
            empty: t("products_empty"),
            name: t("products_col_name"),
            code: t("products_col_code"),
            category: t("products_col_category"),
            price: t("products_col_price"),
            stock: t("products_col_stock"),
            status: t("products_col_status"),
            active: t("products_status_active"),
            inactive: t("products_status_inactive"),
            featured: t("products_status_featured"),
            edit: t("common_edit"),
            delete: t("common_delete"),
            confirm_delete: t("confirm_delete"),
            toggle_featured: t("products_status_featured"),
            toggle_active: t("products_status_active"),
          }}
        />
      </div>
    </div>
  );
}
