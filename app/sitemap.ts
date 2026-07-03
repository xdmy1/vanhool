import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

// Re-fetch the sitemap once an hour. Long enough not to hammer Supabase on
// every crawl, short enough that newly-published products show up the same day.
export const revalidate = 3600;

const LOCALES = ["ro", "en", "ru"] as const;

/**
 * Static storefront pages that should always be in the sitemap, regardless
 * of catalog state. Listed once; the sitemap entry duplicates across the
 * three locales via the `alternates.languages` map.
 */
const STATIC_PATHS = [
  "", // home
  "/about",
  "/contact",
  "/catalog",
  "/categories",
  "/promotions",
  "/piese-auto",
  "/informatii/livrare",
  "/informatii/termeni-si-conditii",
  "/informatii/garantie-si-retur",
  "/informatii/confidentialitate",
] as const;

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.inter-bus.md";
  return raw.replace(/\/+$/, "");
}

function localized(path: string): Record<(typeof LOCALES)[number], string> {
  const base = siteUrl();
  return Object.fromEntries(
    LOCALES.map((l) => [l, `${base}/${l}${path}`]),
  ) as Record<(typeof LOCALES)[number], string>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Pull every active product. Supabase caps `select` at 1000 rows per call,
  // so paginate. The site won't be in 50k territory for a while; if it gets
  // there, switch to `generateSitemaps()` to split into multiple files.
  type Row = {
    slug: string | null;
    created_at: string | null;
    image_url: string | null;
  };
  const rows: Row[] = [];
  const pageSize = 1000;
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("products")
      .select("slug, created_at, image_url")
      .eq("is_active", true)
      .not("slug", "is", null)
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as Row[]));
    if (data.length < pageSize) break;
  }

  // Vehicle landing pages (/piese-auto/{make} and /piese-auto/{make}/{model})
  // are the brand+model query magnets — surface them all to crawlers.
  const [{ data: makes }, { data: models }] = await Promise.all([
    supabase.from("vehicle_makes").select("id, slug"),
    supabase.from("vehicle_models").select("slug, make_id"),
  ]);
  const makeSlugById = new Map(
    (makes ?? []).map((m) => [m.id as string, m.slug as string]),
  );

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => {
    const langs = localized(p);
    return {
      url: langs.ro,
      lastModified: now,
      changeFrequency: p === "" ? "daily" : "weekly",
      priority: p === "" ? 1 : 0.6,
      alternates: { languages: langs },
    };
  });

  const productEntries: MetadataRoute.Sitemap = rows
    .filter((r): r is Row & { slug: string } => !!r.slug)
    .map((r) => {
      const langs = localized(`/product/${r.slug}`);
      return {
        url: langs.ro,
        lastModified: r.created_at ? new Date(r.created_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: langs },
        ...(r.image_url ? { images: [r.image_url] } : {}),
      };
    });

  const vehiclePaths: string[] = [
    ...(makes ?? []).map((m) => `/piese-auto/${m.slug}`),
    ...(models ?? []).flatMap((m) => {
      const makeSlug = makeSlugById.get(m.make_id as string);
      return makeSlug ? [`/piese-auto/${makeSlug}/${m.slug}`] : [];
    }),
  ];

  const vehicleEntries: MetadataRoute.Sitemap = vehiclePaths.map((p) => {
    const langs = localized(p);
    return {
      url: langs.ro,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: langs },
    };
  });

  return [...staticEntries, ...vehicleEntries, ...productEntries];
}
