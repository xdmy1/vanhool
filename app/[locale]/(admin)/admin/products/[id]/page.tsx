import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { buildProductFormLabels } from "@/components/admin/products/labels";
import { adminGetProduct, adminListCategories } from "@/lib/admin/queries";
import {
  adminGetProductVehicleMakeIds,
  adminListManufacturers,
  adminListVehicleMakes,
} from "@/lib/admin/products/lookups";
import { adminListBrandSuggestions } from "@/lib/admin/products/suggestions";
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

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, product, cats, manufacturers, vehicleMakes, brandSuggestions] =
    await Promise.all([
      getTranslations("admin"),
      adminGetProduct(id),
      adminListCategories(),
      adminListManufacturers(),
      adminListVehicleMakes(),
      adminListBrandSuggestions(),
    ]);

  if (!product) notFound();

  const initialVehicleMakeIds = await adminGetProductVehicleMakeIds(product.id);

  const categoryOptions = cats.map((c) => ({
    id: c.id,
    name: nameFor(c, locale as Locale),
    parentId: c.parent_id,
  }));

  const initial = {
    partCode: product.part_code ?? "",
    brand: product.brand ?? "",
    manufacturerId: product.manufacturer_id,
    slug: product.slug ?? "",
    price: Number(product.price ?? 0),
    costPrice: product.cost_price !== null ? Number(product.cost_price) : null,
    stockQuantity: Number(product.stock_quantity ?? 0),
    storageLocation: product.storage_location ?? "",
    condition: (product.condition ?? "new") as "new" | "refurbished" | "used",
    categoryId: product.category_id,
    subcategoryId: product.subcategory_id,
    warrantyMonths: product.warranty_months ?? 12,
    weight: product.weight,
    width: product.width,
    height: product.height,
    imageUrl: product.image_url ?? "",
    isActive: !!product.is_active,
    isFeatured: !!product.is_featured,
    nameRo: product.name_ro ?? "",
    nameEn: product.name_en ?? "",
    nameRu: product.name_ru ?? "",
    descriptionRo: product.description_ro ?? "",
    descriptionEn: product.description_en ?? "",
    descriptionRu: product.description_ru ?? "",
    oemCodes: product.oem_codes ?? [],
    crossReferences: product.cross_references ?? [],
    isPromo: !!product.is_promo,
    promoPrice: product.promo_price !== null ? Number(product.promo_price) : null,
    promoStartsAt: product.promo_starts_at ?? null,
    promoEndsAt: product.promo_ends_at ?? null,
  };

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={initial.nameRo || initial.nameEn || initial.nameRu || product.id.slice(0, 8)}
        subtitle={t("products_edit")}
        back={{
          href: "/admin/products",
          label: t("nav_products"),
          locale,
        }}
      />

      <div className="mt-6">
        <ProductForm
          productId={product.id}
          initial={initial}
          categories={categoryOptions}
          manufacturers={manufacturers}
          vehicleMakes={vehicleMakes}
          brandSuggestions={brandSuggestions}
          initialVehicleMakeIds={initialVehicleMakeIds}
          locale={locale}
          labels={buildProductFormLabels(t)}
        />
      </div>
    </div>
  );
}
