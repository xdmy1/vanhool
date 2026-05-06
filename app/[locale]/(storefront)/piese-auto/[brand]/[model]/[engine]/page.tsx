import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Cog,
  Disc,
  Fan,
  Filter,
  Gauge,
  Hammer,
  Lightbulb,
  ShieldCheck,
  Sofa,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Container } from "@/components/layout/Container";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import { VehicleCategoryTile } from "@/components/vehicles/VehicleCategoryTile";
import { getTypeBySlug, listCategoriesForType } from "@/lib/db/vehicles";
import type { Locale } from "@/lib/db/types";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_ICONS: Record<string, IconComp> = {
  brakes: Disc,
  engine: Cog,
  filtre: Filter,
  filters: Filter,
  suspension: Wrench,
  transmission: Cog,
  cooling: Wind,
  electro: Zap,
  exhaust: Fan,
  steering: Hammer,
  body: ShieldCheck,
  interior: Sofa,
  lighting: Lightbulb,
  air: Gauge,
};

function iconFor(slug: string): IconComp {
  return CATEGORY_ICONS[slug] ?? Cog;
}

export default async function EnginePage({
  params,
}: {
  params: Promise<{ locale: string; brand: string; model: string; engine: string }>;
}) {
  const { locale, brand, model, engine } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [t, ctx] = await Promise.all([
    getTranslations("vehicles"),
    getTypeBySlug(brand, model, engine),
  ]);

  if (!ctx) notFound();

  const categories = await listCategoriesForType(ctx.type.id, loc);
  const countLabel = t("parts_count");

  const specs: string[] = [];
  if (ctx.type.powerKw) specs.push(`${ctx.type.powerKw} kW`);
  if (ctx.type.powerHp) specs.push(`${ctx.type.powerHp} HP`);
  if (ctx.type.capacityCc) specs.push(`${(ctx.type.capacityCc / 1000).toFixed(1)} L`);
  if (ctx.type.fuel) specs.push(ctx.type.fuel);
  if (ctx.type.yearFrom && ctx.type.yearTo)
    specs.push(`${ctx.type.yearFrom}–${ctx.type.yearTo}`);

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <VehicleBreadcrumb
            crumbs={[
              { label: ctx.make.name, href: `/piese-auto/${ctx.make.slug}` },
              {
                label: ctx.model.name,
                href: `/piese-auto/${ctx.make.slug}/${ctx.model.slug}`,
              },
              { label: ctx.type.name },
            ]}
            locale={locale}
            rootLabel={t("root_label")}
          />
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-6 bg-primary" />
            {t("step_4")}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {ctx.make.name} {ctx.model.name} · {ctx.type.name}
          </h1>
          {specs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-strong">
              {specs.map((s) => (
                <span key={s}>{s}</span>
              ))}
              {ctx.type.engineCode && (
                <span className="text-primary">{ctx.type.engineCode}</span>
              )}
            </div>
          )}
        </Container>
      </section>

      <Container className="py-10">
        {categories.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-10 text-center text-muted">
            {t("category_empty")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((c) => (
              <VehicleCategoryTile
                key={c.id}
                icon={iconFor(c.slug)}
                label={c.name}
                count={c.productCount}
                brandSlug={ctx.make.slug}
                modelSlug={ctx.model.slug}
                engineSlug={ctx.type.slug}
                categorySlug={c.slug}
                locale={locale}
                countLabel={countLabel}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
