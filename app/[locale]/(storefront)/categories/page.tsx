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
import { CategoryColumn } from "@/components/catalog/CategoryColumn";
import { getCategoryTree } from "@/lib/db/categories";
import { staticPageMeta } from "@/lib/seo";
import type { Category, Locale } from "@/lib/db/types";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return staticPageMeta("/categories", locale, {
    ro: {
      title: "Categorii piese auto — frâne, motor, suspensie, electrice",
      description:
        "Toate categoriile de piese pentru autobuze și microbuze: sistem de frânare, motor, suspensie, electrice, caroserie și multe altele.",
    },
    en: {
      title: "Auto parts categories — brakes, engine, suspension, electrics",
      description:
        "All parts categories for buses and minibuses: braking system, engine, suspension, electrics, body and more.",
    },
    ru: {
      title: "Категории автозапчастей — тормоза, двигатель, подвеска",
      description:
        "Все категории запчастей для автобусов и микроавтобусов: тормозная система, двигатель, подвеска, электрика, кузов и другое.",
    },
  });
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

  const [tNav, tHome, categoryTree] = await Promise.all([
    getTranslations("nav"),
    getTranslations("home"),
    getCategoryTree(loc),
  ]);

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-10">
          <div className="flex items-center gap-2 text-xs text-primary">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryTree.map((cat) => (
            <CategoryColumn
              key={cat.id}
              root={cat}
              subcategories={cat.children}
              icon={iconFor(cat)}
              locale={loc}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
