import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { ModelTile } from "@/components/vehicles/ModelTile";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import { listModelsByMake } from "@/lib/db/vehicles";
import { localeAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; brand: string }>;
}) {
  const { locale, brand } = await params;
  const result = await listModelsByMake(brand);
  if (!result) return {};
  const name = result.make.name;
  const titles: Record<string, string> = {
    ro: `Piese auto ${name} — toate modelele`,
    en: `${name} parts — all models`,
    ru: `Запчасти ${name} — все модели`,
  };
  const descriptions: Record<string, string> = {
    ro: `Piese pentru autobuze și microbuze ${name}: alege modelul și motorizarea ca să vezi piesele compatibile din stoc.`,
    en: `Parts for ${name} buses and minibuses: pick the model and engine to see compatible parts in stock.`,
    ru: `Запчасти для автобусов и микроавтобусов ${name}: выберите модель и двигатель, чтобы увидеть совместимые детали.`,
  };
  return {
    title: titles[locale] ?? titles.ro,
    description: descriptions[locale] ?? descriptions.ro,
    alternates: localeAlternates(`/piese-auto/${brand}`, locale),
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string; brand: string }>;
}) {
  const { locale, brand } = await params;
  setRequestLocale(locale);

  const [t, result] = await Promise.all([
    getTranslations("vehicles"),
    listModelsByMake(brand),
  ]);

  if (!result) notFound();

  const { make, models } = result;
  const countLabel = t("engines_count");

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <VehicleBreadcrumb
            crumbs={[{ label: make.name }]}
            locale={locale}
            rootLabel={t("root_label")}
          />
          <div className="mt-4 flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            {t("step_2")}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("model_title", { brand: make.name })}
          </h1>
          <p className="mt-2 text-muted-strong">{t("model_subtitle")}</p>
        </Container>
      </section>

      <Container className="py-10">
        {models.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-10 text-center text-muted">
            {t("model_empty")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m) => (
              <ModelTile
                key={m.id}
                brandSlug={make.slug}
                modelSlug={m.slug}
                name={m.name}
                yearFrom={m.yearFrom}
                yearTo={m.yearTo}
                bodyType={m.bodyType}
                typeCount={m.typeCount ?? 0}
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
