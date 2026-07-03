import type { Metadata } from "next";

import type { Product } from "@/lib/db/types";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.inter-bus.md"
).replace(/\/+$/, "");

const LOCALES = ["ro", "en", "ru"] as const;

/**
 * Canonical + hreflang alternates for a localized path ("" = home).
 * Every indexable storefront page must ship these — without them Google
 * sees ro/en/ru as three duplicate sites and refuses to index any of them.
 */
export function localeAlternates(
  path: string,
  locale: string,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
  );
  languages["x-default"] = `${SITE_URL}/ro${path}`;
  return { canonical: `${SITE_URL}/${locale}${path}`, languages };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * schema.org Product. `mpn`/`sku` carry the public internal part code only —
 * supplier codes never leave the DB. Prices are MDL VAT-inclusive, matching
 * what the buy box charges.
 */
export function productJsonLd(product: Product, locale: string) {
  const url = `${SITE_URL}/${locale}/product/${product.slug}`;
  const availability =
    product.stockQuantity > 0
      ? "https://schema.org/InStock"
      : product.leadTimeDays != null
        ? "https://schema.org/BackOrder"
        : "https://schema.org/OutOfStock";
  const images = [product.imageUrl, ...product.images].filter(
    (x, i, arr): x is string => !!x && arr.indexOf(x) === i,
  );
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.partCode,
    mpn: product.partCode,
    brand: { "@type": "Brand", name: product.brand },
    ...(product.description ? { description: product.description } : {}),
    ...(images.length ? { image: images } : {}),
    url,
    offers: {
      "@type": "Offer",
      url,
      price: product.price.toFixed(2),
      priceCurrency: "MDL",
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Inter Bus" },
      // 14 zile — matches the published policy on /informatii/garantie-si-retur.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "MD",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
      },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Real NAP data — mirrors the footer. Keep the two in sync. */
export function autoPartsStoreJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "Inter Bus",
    url: SITE_URL,
    email: "sales@inter-bus.md",
    telephone: "+37360319000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "str. Dimo 9, Durlești",
      addressLocality: "Chișinău",
      addressCountry: "MD",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  };
}

type LocalizedPageMeta = Record<string, { title: string; description?: string }>;

/** Trilingual title/description + canonical/hreflang for a static page. */
export function staticPageMeta(
  path: string,
  locale: string,
  dict: LocalizedPageMeta,
): Metadata {
  const m = dict[locale] ?? dict.ro;
  return {
    title: m.title,
    ...(m.description ? { description: m.description } : {}),
    alternates: localeAlternates(path, locale),
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Inter Bus",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/ro/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
