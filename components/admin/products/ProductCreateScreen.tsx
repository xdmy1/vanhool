import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { buildProductFormLabels } from "@/components/admin/products/labels";
import { adminListCategories } from "@/lib/admin/queries";
import {
  adminListManufacturers,
  adminListVehicleMakes,
} from "@/lib/admin/products/lookups";
import { adminListBrandSuggestions } from "@/lib/admin/products/suggestions";
import type { Locale } from "@/lib/db/types";
import { getPurchaseItemPrefill } from "@/lib/panel/purchases/queries";
import { getDefaultMarkupPercent } from "@/lib/panel/settings/actions";
import type { ProductFormValues } from "@/lib/admin/products/actions";

/** Same fixed reference table as the panel — predictable 20 MDL/EUR. */
const DEFAULT_FX_TO_MDL: Record<string, number> = {
  MDL: 1,
  EUR: 20,
  USD: 17,
};

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

/**
 * The ONE product create screen, shared by /admin/products/new and
 * /panel/produse/new. Supports ?from_line= prefill from a purchase line
 * (which overrides back/redirect to bounce to the purchase). `back` and
 * `basePath` keep plain creates inside the caller's section.
 */
export async function ProductCreateScreen({
  locale,
  fromLineId,
  back,
  basePath,
}: {
  locale: string;
  fromLineId: string | null;
  back: { href: string; label?: string };
  basePath?: string;
}) {
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [cats, manufacturers, vehicleMakes, brandSuggestions, prefill, markup] =
    await Promise.all([
      adminListCategories(),
      adminListManufacturers(),
      adminListVehicleMakes(),
      adminListBrandSuggestions(),
      fromLineId ? getPurchaseItemPrefill(fromLineId) : Promise.resolve(null),
      fromLineId ? getDefaultMarkupPercent() : Promise.resolve(30),
    ]);

  // Same policy as the edit page: keep inactive categories visible + labeled
  // so operators registering a new part can still pick from the retired
  // tree if that's where the part actually belongs (or move it to a
  // TecDoc canonical cat afterwards).
  const categoryOptions = cats.map((c) => ({
    id: c.id,
    name:
      c.is_active === false
        ? `${nameFor(c, locale as Locale)} (inactivă)`
        : nameFor(c, locale as Locale),
    parentId: c.parent_id,
  }));

  // If the line is already linked to a product, don't prefill — bounce the
  // user to that product's edit page.
  const usablePrefill = prefill && !prefill.product_id ? prefill : null;

  let initial: Partial<ProductFormValues> | undefined;
  let linkLineId: string | undefined;
  let backHref = back.href;
  let backLabel = back.label;
  let redirectAfterCreate: string | undefined;

  if (usablePrefill) {
    const cur = (usablePrefill.currency || "MDL").toUpperCase();
    const rate =
      cur === "MDL" ? 1 : (usablePrefill.fx_rate ?? DEFAULT_FX_TO_MDL[cur] ?? 1);
    // Cost stored on products is GROSS (what the operator actually
    // paid out of pocket). purchase_items.unit_cost is NET (pre-VAT),
    // so apply the vat factor before converting to MDL. Matches the
    // postPurchase write path and the searchDraftPurchaseItems read
    // path.
    const vatFactor = 1 + Number(usablePrefill.vat_rate ?? 0) / 100;
    const costMdl = Number(
      (usablePrefill.unit_cost * vatFactor * rate).toFixed(2),
    );
    const markupFactor = 1 + (Number.isFinite(markup) ? markup : 30) / 100;
    initial = {
      partCode: usablePrefill.internal_code ?? usablePrefill.supplier_code ?? "",
      nameRo: usablePrefill.description.slice(0, 200),
      costPrice: costMdl,
      price: Number((costMdl * markupFactor).toFixed(2)),
      // Stock stays 0 here — postPurchase increments it from the line qty
      // once the user clicks "Recepționează & postează" on the purchase.
      stockQuantity: 0,
      // Inactive by default so the owner reviews before exposing on the site.
      isActive: false,
      crossReferences: usablePrefill.supplier_code
        ? [{ brand: usablePrefill.supplier_name, code: usablePrefill.supplier_code }]
        : [],
    };
    linkLineId = usablePrefill.lineId;
    backHref = `/panel/achizitii/${usablePrefill.purchaseId}`;
    backLabel = t("nav_products");
    redirectAfterCreate = `/${locale}/panel/achizitii/${usablePrefill.purchaseId}`;
  }

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("products_new")}
        back={{
          href: backHref as "/admin/products",
          label: backLabel ?? t("nav_products"),
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
          initial={initial}
          linkLineId={linkLineId}
          redirectAfterCreate={redirectAfterCreate}
          basePath={basePath}
        />
      </div>
    </div>
  );
}
