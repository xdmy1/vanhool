import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Cog,
  Disc,
  Fan,
  Filter,
  Gauge,
  Hammer,
  ShieldCheck,
  Sofa,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/layout/SearchBar";
import { CategoryTile } from "@/components/catalog/CategoryTile";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Link } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { getRootCategories } from "@/lib/db/categories";
import { getFeaturedProducts } from "@/lib/db/products";
import type { Category, Locale } from "@/lib/db/types";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_ICONS: Record<string, IconComp> = {
  brakes: Disc,
  engine: Cog,
  chassis: Wrench,
  electro: Zap,
  air: Gauge,
  "air-pressure": Gauge,
  couplings: Filter,
  clutch: Cog,
  steering: Hammer,
  cooling: Wind,
  body: ShieldCheck,
  bodywork: ShieldCheck,
  interior: Sofa,
  hoses: Fan,
  filter: Filter,
  sensor: Zap,
  pump: Cog,
};

function iconFor(category: Category): IconComp {
  return (
    CATEGORY_ICONS[category.slug] ??
    CATEGORY_ICONS[category.iconKey as string] ??
    Cog
  );
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [t, tp, categories, featured] = await Promise.all([
    getTranslations("home"),
    getTranslations("product_card"),
    getRootCategories(loc),
    getFeaturedProducts(loc, 8),
  ]);

  const countLabel = loc === "ru" ? "позиций" : loc === "en" ? "parts" : "piese";

  const productLabels = {
    partCode: tp("part_code"),
    inStock: tp("in_stock"),
    lowStock: tp("low_stock"),
    outOfStock: tp("out_of_stock"),
    addToCart: tp("add_to_cart"),
  };

  const categoryList = categories.slice(0, 8);

  return (
    <>
      <Hero
        title1={t("hero_title_1")}
        title2={t("hero_title_2")}
        subtitle={t("hero_subtitle")}
        searchPlaceholder={t("search_placeholder")}
        searchButton={t("search_button")}
      />

      <section className="py-14 md:py-16">
        <Container>
          <SectionHeader
            title={t("categories_title")}
            subtitle={t("categories_subtitle")}
            linkHref="/categories"
            linkLabel={t("categories_all")}
            locale={loc}
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryList.map((cat) => (
              <CategoryTile
                key={cat.id}
                icon={iconFor(cat)}
                label={cat.name}
                count={cat.productCount}
                slug={cat.slug}
                locale={loc}
                countLabel={countLabel}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <SectionHeader
            title={t("featured_title")}
            subtitle={t("featured_subtitle")}
            linkHref="/catalog"
            linkLabel={t("featured_all")}
            locale={loc}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={loc}
                labels={productLabels}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function Hero({
  title1,
  title2,
  subtitle,
  searchPlaceholder,
  searchButton,
}: {
  title1: string;
  title2: string;
  subtitle: string;
  searchPlaceholder: string;
  searchButton: string;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title1} <span className="text-primary">{title2}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-strong md:text-lg">
            {subtitle}
          </p>
          <div className="mt-8">
            <SearchBar
              placeholder={searchPlaceholder}
              buttonLabel={searchButton}
              size="lg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  linkHref,
  linkLabel,
  locale,
}: {
  title: string;
  subtitle?: string;
  linkHref?: "/catalog" | "/categories";
  linkLabel?: string;
  locale?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-muted-strong md:text-base">{subtitle}</p>
        ) : null}
      </div>
      {linkHref && linkLabel && locale ? (
        <Link
          href={linkHref}
          locale={locale}
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover md:inline-flex"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
