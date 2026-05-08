import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import { VehicleBreadcrumb } from "@/components/vehicles/VehicleBreadcrumb";
import {
  getTypeBySlug,
  listPartsForTypeAndCategory,
} from "@/lib/db/vehicles";
import { getCategoryBySlug } from "@/lib/db/categories";
import type { Locale } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function PartsPage({
  params,
}: {
  params: Promise<{
    locale: string;
    brand: string;
    model: string;
    engine: string;
    category: string;
  }>;
}) {
  const { locale, brand, model, engine, category } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [tVehicles, tCard, ctx, categoryData] = await Promise.all([
    getTranslations("vehicles"),
    getTranslations("product_card"),
    getTypeBySlug(brand, model, engine),
    getCategoryBySlug(category, loc),
  ]);

  if (!ctx) notFound();

  const products = await listPartsForTypeAndCategory(ctx.type.id, category, loc);
  const categoryName = categoryData?.name ?? category;

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
              {
                label: ctx.type.name,
                href: `/piese-auto/${ctx.make.slug}/${ctx.model.slug}/${ctx.type.slug}`,
              },
              { label: categoryName },
            ]}
            locale={locale}
            rootLabel={tVehicles("root_label")}
          />
          <div className="mt-4 flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            {tVehicles("step_5")}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {categoryName}
          </h1>
          <p className="mt-2 text-muted-strong">
            {tVehicles("parts_for_vehicle", {
              vehicle: `${ctx.make.name} ${ctx.model.name} ${ctx.type.name}`,
            })}
          </p>
        </Container>
      </section>

      <Container className="py-10">
        {products.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-10 text-center text-muted">
            {tVehicles("parts_empty")}
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs text-muted">
              {tVehicles("parts_found", { count: products.length })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  locale={locale}
                  labels={{
                    partCode: tCard("part_code"),
                    inStock: tCard("in_stock"),
                    lowStock: tCard("low_stock"),
                    outOfStock: tCard("out_of_stock"),
                    addToCart: tCard("add_to_cart"),
                  }}
                />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
