import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Tag } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getActivePromotions } from "@/lib/db/products";
import { getEurToMdlRate } from "@/lib/exchange-rate";
import type { Locale } from "@/lib/db/types";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// searchParams aren't used here, but keeping the page dynamic ensures we never
// serve a stale "no promotions" snapshot once admin enables one.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promotions" });
  return {
    title: t("page_title"),
    description: t("page_subtitle"),
  };
}

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [products, t, tCard, eurRate] = await Promise.all([
    getActivePromotions(loc, 60),
    getTranslations("promotions"),
    getTranslations("product_card"),
    getEurToMdlRate(),
  ]);

  const cardLabels = {
    partCode: tCard("part_code"),
    inStock: tCard("in_stock"),
    lowStock: tCard("low_stock"),
    outOfStock: tCard("out_of_stock"),
    addToCart: tCard("add_to_cart"),
    vatIncluded: tCard("vat_included"),
    vatExcluded: tCard("vat_excluded"),
  };

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-10">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Tag className="size-3.5" />
            <span className="h-px w-6 bg-primary" />
            {t("eyebrow")}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {t("page_title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-strong md:text-base">
            {t("page_subtitle")}
          </p>
        </Container>
      </section>

      <Container className="py-10">
        {products.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-10 text-center">
            <Tag className="mx-auto size-8 text-muted" />
            <h2 className="mt-4 text-lg font-semibold">{t("empty_title")}</h2>
            <p className="mt-2 text-sm text-muted-strong">{t("empty_body")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                locale={loc}
                labels={{
                  ...cardLabels,
                  onOrder:
                    p.leadTimeDays != null
                      ? tCard("on_order", { days: p.leadTimeDays })
                      : undefined,
                }}
                eurRate={eurRate.rate}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
