import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight, Headphones, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductAlternatives } from "@/components/product/ProductAlternatives";
import { Link } from "@/lib/i18n/routing";
import {
  getCrossCompatibleProducts,
  getProductAlternativeCodes,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/db/products";
import { getCategoryBySlug } from "@/lib/db/categories";
import type { Locale } from "@/lib/db/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as Locale);
  if (!product) return {};
  return {
    title: `${product.name} — ${product.partCode || product.brand}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const product = await getProductBySlug(slug, loc);
  if (!product) notFound();

  const [
    related,
    alternatives,
    crossCompatible,
    category,
    tNav,
    tProd,
    tCard,
    tHome,
  ] = await Promise.all([
    getRelatedProducts(product, loc, 4),
    getProductAlternativeCodes(product.id),
    getCrossCompatibleProducts(product.id, loc, 8),
    product.categorySlug ? getCategoryBySlug(product.categorySlug, loc) : null,
    getTranslations("nav"),
    getTranslations("product"),
    getTranslations("product_card"),
    getTranslations("home"),
  ]);

  const specsLabels = {
    specifications: tProd("specifications"),
    brand: tProd("brand"),
    partCode: tProd("part_code"),
    weight: tProd("weight"),
    dimensions: tProd("dimensions"),
    length: tProd("length"),
    ribCount: tProd("rib_count"),
    warranty: tProd("warranty"),
    warrantyMonths: (count: number) => tProd("warranty_months", { count }),
  };

  const buyBoxLabels = {
    quantity: tProd("quantity"),
    addToCart: tProd("add_to_cart"),
    buyNow: tProd("buy_now"),
    inStock: tCard("in_stock"),
    lowStock: tCard("low_stock"),
    outOfStock: tCard("out_of_stock"),
    trustDelivery: tHome("trust_fast"),
    trustWarranty: tHome("trust_warranty"),
    stockAvailable: tProd("stock_available", { count: product.stockQuantity }),
  };

  const cardLabels = {
    partCode: tCard("part_code"),
    inStock: tCard("in_stock"),
    lowStock: tCard("low_stock"),
    outOfStock: tCard("out_of_stock"),
    addToCart: tCard("add_to_cart"),
  };

  return (
    <div className="bg-background">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-surface/40">
        <Container className="flex items-center gap-2 py-4 text-xs text-muted">
          <Link href="/" locale={loc} className="transition-colors hover:text-foreground">
            {tNav("home")}
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/catalog" locale={loc} className="transition-colors hover:text-foreground">
            {tNav("catalog")}
          </Link>
          {category ? (
            <>
              <ChevronRight className="size-3" />
              <Link
                href={`/catalog?category=${category.slug}`}
                locale={loc}
                className="transition-colors hover:text-foreground"
              >
                {category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{product.name}</span>
        </Container>
      </div>

      <Container className="py-10">
        {/* Hero: gallery + buy box */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.4fr_1fr]">
          <div>
            <ProductGallery product={product} />
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-primary">
                <span className="h-px w-6 bg-primary" />
                {category?.name ?? tNav("catalog")}
              </div>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {product.name}
              </h1>
              {product.description ? (
                <p className="mt-4 text-sm text-muted-strong md:text-base">
                  {product.description}
                </p>
              ) : null}
            </div>

            <ProductBuyBox product={product} labels={buyBoxLabels} />
          </div>
        </div>

        {/* Details: specs + alternative codes + compatibility */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <ProductSpecs product={product} labels={specsLabels} />

          <ProductAlternatives
            data={alternatives}
            locale={loc}
            labels={{
              title: tProd("alternatives_title"),
              oem: tProd("alternatives_oem"),
              cross: tProd("alternatives_cross"),
              empty: tProd("alternatives_empty"),
            }}
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-[11px] font-semibold text-foreground">
                {tProd("compatibility")}
              </h3>
            </div>
            <div className="flex items-start gap-3 p-5 text-sm text-muted-strong">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>{tProd("compatibility_empty")}</p>
            </div>
            <div className="border-t border-border p-5">
              <Button asChild variant="secondary" size="md" className="w-full">
                <Link href="/contact" locale={loc}>
                  <Headphones className="size-4" /> {tProd("ask_support")}
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Cross-compatible parts (products sharing ≥ 1 code) */}
        {crossCompatible.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-center gap-2 text-xs text-primary">
              <span className="h-px w-6 bg-primary" />
              {tProd("cross_compatible_title")}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              {tProd("cross_compatible_title")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-strong">
              {tProd("cross_compatible_subtitle")}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {crossCompatible.map((p) => (
                <ProductCard key={p.id} product={p} locale={loc} labels={cardLabels} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-center gap-2 text-xs text-primary">
              <span className="h-px w-6 bg-primary" />
              {tProd("related")}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              {tProd("related")}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={loc} labels={cardLabels} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
