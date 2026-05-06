import { getTranslations, setRequestLocale } from "next-intl/server";
import {
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
import { CategoryTile } from "@/components/catalog/CategoryTile";
import { getRootCategories } from "@/lib/db/categories";
import type { Category, Locale } from "@/lib/db/types";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
};

function iconFor(cat: Category): IconComp {
  return CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS[cat.iconKey as string] ?? Cog;
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [tNav, tHome, categories] = await Promise.all([
    getTranslations("nav"),
    getTranslations("home"),
    getRootCategories(loc),
  ]);

  const countLabel = loc === "ru" ? "позиций" : loc === "en" ? "parts" : "piese";

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-10">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-6 bg-primary" />
            {tNav("categories")}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {tHome("categories_title")}
          </h1>
          <p className="mt-2 text-muted-strong">{tHome("categories_subtitle")}</p>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryTile
              key={cat.id}
              icon={iconFor(cat)}
              label={cat.name}
              count={cat.productCount}
              slug={cat.slug}
              locale={loc}
              countLabel={countLabel}
              accent={i < 2}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
