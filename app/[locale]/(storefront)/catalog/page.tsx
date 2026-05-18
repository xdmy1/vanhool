import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search, SlidersHorizontal } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogSort } from "@/components/catalog/CatalogSort";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCatalog, type CatalogFilters as Filters } from "@/lib/db/products";
import { getCategoryTree } from "@/lib/db/categories";
import { listVehicleMakesForFilter } from "@/lib/db/vehicles";
import { getEurToMdlRate } from "@/lib/exchange-rate";
import type { Locale } from "@/lib/db/types";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// searchParams (q, category, sort, page, ...) drive every render — Next.js
// must re-fetch on each request, never serve a cached static version.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function toInt(value: string | string[] | undefined): number | undefined {
  if (Array.isArray(value)) value = value[0];
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toStr(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) value = value[0];
  return value?.trim() ? value : undefined;
}

const VALID_SORTS: Filters["sort"][] = [
  "featured",
  "name-asc",
  "price-asc",
  "price-desc",
  "newest",
];

function parseFilters(
  searchParams: SearchParams,
): Filters {
  const q = toStr(searchParams.q);
  const cats = toStr(searchParams.category);
  const makes = toStr(searchParams.vehicleMake);
  const minPrice = toInt(searchParams.minPrice);
  const maxPrice = toInt(searchParams.maxPrice);
  const inStock = searchParams.inStock === "1";
  const featured = searchParams.featured === "1";
  const rawSort = toStr(searchParams.sort) as Filters["sort"] | undefined;
  const sort = rawSort && VALID_SORTS.includes(rawSort) ? rawSort : "featured";
  const page = Math.max(1, toInt(searchParams.page) ?? 1);
  return {
    q,
    categorySlugs: cats ? cats.split(",").filter(Boolean) : undefined,
    vehicleMakeSlugs: makes ? makes.split(",").filter(Boolean) : undefined,
    minPrice,
    maxPrice,
    inStock,
    featured,
    sort,
    page,
    perPage: 12,
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const loc = locale as Locale;
  const filters = parseFilters(sp);

  const [categoryTree, vehicleMakes, result, tNav, tCat, tProduct, eurRate] =
    await Promise.all([
      getCategoryTree(loc),
      listVehicleMakesForFilter(),
      getCatalog(loc, filters),
      getTranslations("nav"),
      getTranslations("catalog"),
      getTranslations("product_card"),
      getEurToMdlRate(),
    ]);

  const productLabels = {
    partCode: tProduct("part_code"),
    inStock: tProduct("in_stock"),
    lowStock: tProduct("low_stock"),
    outOfStock: tProduct("out_of_stock"),
    addToCart: tProduct("add_to_cart"),
    vatIncluded: tProduct("vat_included"),
    vatExcluded: tProduct("vat_excluded"),
  };

  return (
    <div className="bg-background">
      {/* Page header */}
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-primary">
              <span className="h-px w-6 bg-primary" />
              {tNav("catalog")}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {tCat("page_title")}
            </h1>
            <p className="text-xs text-muted-strong">
              {tCat("results_count", { count: result.total })}
              {filters.q ? ` ${tCat("results_for", { q: filters.q })}` : ""}
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filters */}
          <aside className="lg:block">
            <CatalogFilters
              categoryTree={categoryTree}
              vehicleMakes={vehicleMakes}
              labels={{
                filters: tCat("filters"),
                apply: tCat("apply"),
                reset: tCat("reset"),
                category: tCat("category"),
                vehicleMake: tCat("vehicle_make"),
                priceRange: tCat("price_range"),
                from: tCat("price_from"),
                to: tCat("price_to"),
                inStock: tCat("in_stock_only"),
                featured: tCat("featured_only"),
                searchHint: tCat("search_hint"),
              }}
            />
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs text-muted">
                <SlidersHorizontal className="size-3.5" />
                <span className="hidden sm:inline">{tCat("results_count", { count: result.total })}</span>
                <span className="sm:hidden">{result.total}</span>
              </div>
              <CatalogSort
                labels={{
                  sort: tCat("sort"),
                  featured: tCat("sort_featured"),
                  "name-asc": tCat("sort_name"),
                  "price-asc": tCat("sort_price_asc"),
                  "price-desc": tCat("sort_price_desc"),
                  newest: tCat("sort_newest"),
                }}
              />
            </div>

            {/* Grid or empty state */}
            {result.products.length === 0 ? (
              <div className="rounded-md border border-border bg-surface/40 p-12 text-center">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full border border-border bg-background text-muted">
                  <Search className="size-6" />
                </div>
                <h2 className="text-xl font-semibold">{tCat("no_results_title")}</h2>
                <p className="mt-2 text-sm text-muted-strong">
                  {tCat("no_results_body")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={loc}
                    labels={{
                      ...productLabels,
                      onOrder:
                        product.leadTimeDays != null
                          ? tProduct("on_order", { days: product.leadTimeDays })
                          : undefined,
                    }}
                    eurRate={eurRate.rate}
                  />
                ))}
              </div>
            )}

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={sp}
              locale={loc}
              labels={{
                prev: tCat("prev"),
                next: tCat("next"),
                page: tCat("page"),
                of: tCat("of"),
              }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
