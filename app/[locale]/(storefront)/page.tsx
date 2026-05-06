import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Cog,
  Disc,
  Fan,
  Filter,
  Fuel,
  Gauge,
  Hammer,
  Headphones,
  Lightbulb,
  Phone,
  ShieldCheck,
  Sofa,
  Truck,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Button } from "@/components/ui/button";
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

  const [t, tp, tf, categories, featured] = await Promise.all([
    getTranslations("home"),
    getTranslations("product_card"),
    getTranslations("footer"),
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

  // Visual accent on first 2 categories
  const categoryList = categories.slice(0, 12).map((c, i) => ({
    ...c,
    accent: i < 2,
  }));

  return (
    <>
      <HeroSection
        kicker={t("kicker")}
        title1={t("hero_title_1")}
        title2={t("hero_title_2")}
        subtitle={t("hero_subtitle")}
        searchEyebrow={t("search_eyebrow")}
        searchPlaceholder={t("search_placeholder")}
        searchButton={t("search_button")}
        locale={loc}
      />

      <TrustStrip
        labels={{
          fast: t("trust_fast"),
          warranty: t("trust_warranty"),
          original: t("trust_original"),
          support: t("trust_support"),
        }}
      />

      {/* CATEGORII */}
      <section className="border-t border-border bg-background py-16">
        <Container>
          <SectionHeader
            eyebrow={t("categories_eyebrow")}
            title={t("categories_title")}
            subtitle={t("categories_subtitle")}
            linkHref="/categories"
            linkLabel={t("categories_all")}
            locale={loc}
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryList.map((cat) => (
              <CategoryTile
                key={cat.id}
                icon={iconFor(cat)}
                label={cat.name}
                count={cat.productCount}
                slug={cat.slug}
                locale={loc}
                countLabel={countLabel}
                accent={cat.accent}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* PRODUSE RECOMANDATE */}
      <section className="border-t border-border bg-surface/40 py-16">
        <Container>
          <SectionHeader
            eyebrow={t("featured_eyebrow")}
            title={t("featured_title")}
            subtitle={t("featured_subtitle")}
            linkHref="/catalog"
            linkLabel={t("featured_all")}
            locale={loc}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* BRANDS */}
      <section className="border-t border-border bg-background py-14">
        <Container>
          <div className="mb-8 max-w-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              BRANDS
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
              {t("brands_title")}
            </h3>
            <p className="mt-1 text-sm text-muted">{t("brands_subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4 lg:grid-cols-8">
            {BRANDS.map((brand) => (
              <div
                key={brand}
                className="flex h-16 items-center justify-center bg-surface px-3 font-mono text-[11px] font-bold tracking-[0.2em] text-muted-strong transition-colors hover:text-primary md:text-sm"
              >
                {brand}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* WHY US */}
      <section className="border-t border-border bg-surface/40 py-16">
        <Container>
          <SectionHeader eyebrow="ADVANTAGES" title={t("why_title")} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard
              number="01"
              icon={Truck}
              title={t("why_stock_title")}
              body={t("why_stock_body")}
            />
            <FeatureCard
              number="02"
              icon={Fuel}
              title={t("why_delivery_title")}
              body={t("why_delivery_body")}
            />
            <FeatureCard
              number="03"
              icon={Headphones}
              title={t("why_support_title")}
              body={t("why_support_body")}
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-y-2 border-primary/80 bg-surface py-14">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                SUPPORT TEHNIC
              </div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                {t("why_support_title")}
              </h3>
              <p className="mt-2 text-muted-strong">{t("why_support_body")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="uppercase tracking-wider">
                <a href={`tel:${tf("contact_phone").replace(/\s/g, "")}`}>
                  <Phone className="size-4" /> {t("cta_call")}
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="uppercase tracking-wider">
                <Link href="/contact" locale={loc}>
                  {t("cta_contact")}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

const BRANDS = [
  "BOSCH",
  "WABCO",
  "KNORR-BREMSE",
  "MANN-FILTER",
  "SACHS",
  "ZF",
  "MAHLE",
  "HELLA",
];

function HeroSection({
  kicker,
  title1,
  title2,
  subtitle,
  searchEyebrow,
  searchPlaceholder,
  searchButton,
  locale,
}: {
  kicker: string;
  title1: string;
  title2: string;
  subtitle: string;
  searchEyebrow: string;
  searchPlaceholder: string;
  searchButton: string;
  locale: string;
}) {
  const popular = [
    { label: "Plăcuțe frână", q: "placute" },
    { label: "Filtru ulei", q: "filtru ulei" },
    { label: "Pompă apă", q: "pompa apa" },
    { label: "Senzor ABS", q: "senzor ABS" },
  ];
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_0%,transparent_42%,rgba(208,73,65,0.12)_42%,rgba(208,73,65,0.12)_46%,transparent_46%,transparent_54%,rgba(208,73,65,0.06)_54%,rgba(208,73,65,0.06)_58%,transparent_58%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid-dim opacity-40" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-background to-transparent"
      />

      <Container className="relative py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm border-l-2 border-primary bg-surface/80 py-1 pl-3 pr-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-strong backdrop-blur">
              {kicker}
            </div>
            <h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              <span className="block">{title1}</span>
              <span className="block text-primary">{title2}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-strong md:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="rounded-md border border-border bg-surface/80 p-5 shadow-[0_20px_60px_-30px_rgba(208,73,65,0.5)] backdrop-blur md:p-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {searchEyebrow}
            </div>
            <SearchBar
              placeholder={searchPlaceholder}
              buttonLabel={searchButton}
              size="lg"
            />
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted">Popular:</span>
              {popular.map((p) => (
                <Link
                  key={p.q}
                  href={`/catalog?q=${encodeURIComponent(p.q)}`}
                  locale={locale}
                  className="rounded-sm border border-border bg-accent-dark px-2 py-0.5 font-mono text-[10px] text-muted-strong transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function TrustStrip({
  labels,
}: {
  labels: { fast: string; warranty: string; original: string; support: string };
}) {
  const items = [
    { icon: Truck, label: labels.fast },
    { icon: ShieldCheck, label: labels.warranty },
    { icon: Lightbulb, label: labels.original },
    { icon: Headphones, label: labels.support },
  ];
  return (
    <div className="border-b border-border bg-surface">
      <Container className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center gap-3 px-4 py-4 first:pl-0 last:pr-0"
          >
            <span className="grid size-9 place-items-center rounded-sm bg-primary/10 text-primary">
              <item.icon className="size-4" />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground md:text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </Container>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  linkHref,
  linkLabel,
  locale,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  linkHref?: "/catalog" | "/categories";
  linkLabel?: string;
  locale?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          <span className="h-px w-8 bg-primary" />
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-muted-strong">{subtitle}</p>
        ) : null}
      </div>
      {linkHref && linkLabel && locale ? (
        <Link
          href={linkHref}
          locale={locale}
          className="group hidden shrink-0 items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-muted-strong transition-colors hover:text-primary md:inline-flex"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

function FeatureCard({
  number,
  icon: Icon,
  title,
  body,
}: {
  number: string;
  icon: IconComp;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-background p-6">
      <span className="pointer-events-none absolute -right-4 -top-4 font-mono text-6xl font-bold text-accent-dark">
        {number}
      </span>
      <div className="mb-5 grid size-11 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-strong">{body}</p>
    </div>
  );
}
