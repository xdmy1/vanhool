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
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { CategoryColumn } from "@/components/catalog/CategoryColumn";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Link } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { getCategoryTree } from "@/lib/db/categories";
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

  const [t, tp, categoryTree, featured] = await Promise.all([
    getTranslations("home"),
    getTranslations("product_card"),
    getCategoryTree(loc),
    getFeaturedProducts(loc, 8),
  ]);

  const productLabels = {
    partCode: tp("part_code"),
    inStock: tp("in_stock"),
    lowStock: tp("low_stock"),
    outOfStock: tp("out_of_stock"),
    addToCart: tp("add_to_cart"),
  };

  // Homepage shows only 2 rows × 4 cols = 8 cards. Remaining categories live
  // on /categories (linked by "Vezi mai multe" below the grid).
  const HOME_LIMIT = 8;
  const categoryList = categoryTree.slice(0, HOME_LIMIT);
  const remainingCount = Math.max(0, categoryTree.length - HOME_LIMIT);

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
              <CategoryColumn
                key={cat.id}
                root={cat}
                subcategories={cat.children}
                icon={iconFor(cat)}
                locale={loc}
              />
            ))}
          </div>
          {remainingCount > 0 ? (
            <div className="mt-6 flex justify-center">
              <Link
                href="/categories"
                locale={loc}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {t("categories_see_more", { count: remainingCount })}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}
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
      <div className="border-t border-border/60">
        <BrandsMarquee />
      </div>
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
