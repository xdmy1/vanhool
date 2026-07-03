import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { BrandTile } from "@/components/vehicles/BrandTile";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import { listMakes } from "@/lib/db/vehicles";
import { routing } from "@/lib/i18n/routing";
import { staticPageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return staticPageMeta("/piese-auto", locale, {
    ro: {
      title: "Piese auto după marcă — Mercedes, MAN, Iveco, Volvo, Setra",
      description:
        "Alege marca și modelul vehiculului și găsește piesele compatibile: Mercedes-Benz, MAN, Iveco, Volvo, Setra, Neoplan și altele.",
    },
    en: {
      title: "Auto parts by vehicle make — Mercedes, MAN, Iveco, Volvo, Setra",
      description:
        "Pick your vehicle make and model to find compatible parts: Mercedes-Benz, MAN, Iveco, Volvo, Setra, Neoplan and more.",
    },
    ru: {
      title: "Автозапчасти по марке — Mercedes, MAN, Iveco, Volvo, Setra",
      description:
        "Выберите марку и модель, чтобы найти совместимые запчасти: Mercedes-Benz, MAN, Iveco, Volvo, Setra, Neoplan и другие.",
    },
  });
}

export default async function PieseAutoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, makes] = await Promise.all([
    getTranslations("vehicles"),
    listMakes(),
  ]);

  const popular = makes.filter((m) => m.isPopular);
  const others = makes.filter((m) => !m.isPopular);

  const countLabel = t("models_count");

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <VehicleBreadcrumb crumbs={[]} locale={locale} rootLabel={t("root_label")} />
          <div className="mt-4 flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            {t("step_1")}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("brand_title")}
          </h1>
          <p className="mt-2 text-muted-strong">{t("brand_subtitle")}</p>
        </Container>
      </section>

      <Container className="py-10">
        {popular.length > 0 && (
          <>
            <h2 className="mb-4 text-xs text-muted">
              {t("brand_popular")}
            </h2>
            <div className="mb-10 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {popular.map((m) => (
                <BrandTile
                  key={m.id}
                  slug={m.slug}
                  name={m.name}
                  modelCount={m.modelCount ?? 0}
                  locale={locale}
                  countLabel={countLabel}
                  popular
                />
              ))}
            </div>
          </>
        )}

        {others.length > 0 && (
          <>
            <h2 className="mb-4 text-xs text-muted">
              {t("brand_all")}
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {others.map((m) => (
                <BrandTile
                  key={m.id}
                  slug={m.slug}
                  name={m.name}
                  modelCount={m.modelCount ?? 0}
                  locale={locale}
                  countLabel={countLabel}
                />
              ))}
            </div>
          </>
        )}

        {makes.length === 0 && (
          <div className="rounded-md border border-border bg-surface p-10 text-center text-muted">
            {t("brand_empty")}
          </div>
        )}
      </Container>
    </div>
  );
}
