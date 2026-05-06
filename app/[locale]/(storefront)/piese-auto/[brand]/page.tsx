import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { ModelTile } from "@/components/vehicles/ModelTile";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import { listModelsByMake } from "@/lib/db/vehicles";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
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
