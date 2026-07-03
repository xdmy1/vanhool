import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { EngineRow } from "@/components/vehicles/EngineRow";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import { listTypesByModel } from "@/lib/db/vehicles";
import { localeAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; brand: string; model: string }>;
}) {
  const { locale, brand, model } = await params;
  const result = await listTypesByModel(brand, model);
  if (!result) return {};
  const full = `${result.make.name} ${result.model.name}`;
  const titles: Record<string, string> = {
    ro: `Piese ${full} — alege motorizarea`,
    en: `${full} parts — choose the engine`,
    ru: `Запчасти ${full} — выберите двигатель`,
  };
  const descriptions: Record<string, string> = {
    ro: `Piese compatibile pentru ${full}: frâne, motor, suspensie, electrice. Selectează motorizarea pentru lista exactă.`,
    en: `Compatible parts for ${full}: brakes, engine, suspension, electrics. Select the engine variant for the exact list.`,
    ru: `Совместимые запчасти для ${full}: тормоза, двигатель, подвеска, электрика. Выберите двигатель для точного списка.`,
  };
  return {
    title: titles[locale] ?? titles.ro,
    description: descriptions[locale] ?? descriptions.ro,
    alternates: localeAlternates(`/piese-auto/${brand}/${model}`, locale),
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; brand: string; model: string }>;
}) {
  const { locale, brand, model } = await params;
  setRequestLocale(locale);

  const [t, result] = await Promise.all([
    getTranslations("vehicles"),
    listTypesByModel(brand, model),
  ]);

  if (!result) notFound();

  const { make, model: modelData, types } = result;

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <VehicleBreadcrumb
            crumbs={[
              { label: make.name, href: `/piese-auto/${make.slug}` },
              { label: modelData.name },
            ]}
            locale={locale}
            rootLabel={t("root_label")}
          />
          <div className="mt-4 flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            {t("step_3")}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {make.name} {modelData.name}
          </h1>
          <p className="mt-2 text-muted-strong">{t("engine_subtitle")}</p>
        </Container>
      </section>

      <Container className="py-10">
        {types.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-10 text-center text-muted">
            {t("engine_empty")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            {types.map((typeData) => (
              <EngineRow
                key={typeData.id}
                brandSlug={make.slug}
                modelSlug={modelData.slug}
                typeSlug={typeData.slug}
                name={typeData.name}
                powerKw={typeData.powerKw}
                powerHp={typeData.powerHp}
                capacityCc={typeData.capacityCc}
                fuel={typeData.fuel}
                yearFrom={typeData.yearFrom}
                yearTo={typeData.yearTo}
                engineCode={typeData.engineCode}
                locale={locale}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
