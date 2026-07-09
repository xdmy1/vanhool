import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { listAllProductsForIndex } from "@/lib/db/products";
import { Link } from "@/lib/i18n/routing";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/db/types";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const TITLES: Record<string, string> = {
  ro: "Toate piesele — index complet după cod",
  en: "All parts — full index by part code",
  ru: "Все запчасти — полный указатель по коду",
};

const DESCRIPTIONS: Record<string, string> = {
  ro: "Lista completă a pieselor auto disponibile la Inter Bus, ordonată după codul piesei.",
  en: "The complete list of auto parts available at Inter Bus, ordered by part code.",
  ru: "Полный список автозапчастей Inter Bus, отсортированный по коду детали.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: TITLES[locale] ?? TITLES.ro,
    description: DESCRIPTIONS[locale] ?? DESCRIPTIONS.ro,
    alternates: localeAlternates("/produse", locale),
  };
}

export default async function ProductIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [products, tCard] = await Promise.all([
    listAllProductsForIndex(loc),
    getTranslations("product_card"),
  ]);

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {TITLES[locale] ?? TITLES.ro}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-strong">
        {DESCRIPTIONS[locale] ?? DESCRIPTIONS.ro}
      </p>
      <p className="mt-1 text-xs text-muted tabular-nums">{products.length}</p>

      <ul className="mt-8 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug} className="min-w-0">
            <Link
              href={`/product/${p.slug}`}
              locale={loc}
              className="block truncate py-1 text-sm text-muted-strong transition-colors hover:text-primary"
            >
              {p.partCode ? (
                <span className="font-medium tabular-nums text-foreground">
                  {p.partCode}
                </span>
              ) : null}{" "}
              <span>{p.name}</span>
              {p.brand ? <span className="text-muted"> · {p.brand}</span> : null}
            </Link>
          </li>
        ))}
      </ul>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{tCard("out_of_stock")}</p>
      ) : null}
    </Container>
  );
}
