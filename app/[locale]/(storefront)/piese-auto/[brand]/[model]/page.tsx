import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { EngineRow } from "@/components/vehicles/EngineRow";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import { listTypesByModel } from "@/lib/db/vehicles";

export const dynamic = "force-dynamic";

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
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
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
