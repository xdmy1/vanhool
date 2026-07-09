import type { MetadataRoute } from "next";

import { createPublicClient } from "@/lib/supabase/public";

// Re-fetch the sitemap once an hour. Long enough not to hammer Supabase on
// every crawl, short enough that newly-published products show up the same day.
// Reads go through the cookie-less client — `lib/supabase/server.ts` would call
// `cookies()` and force this route dynamic, making the revalidate below dead.
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
  "/produse",
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
  const supabase = createPublicClient();

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

  // Vehicle landing pages. Only makes that actually carry a product are
  // listed. `/piese-auto/{make}/{model}` is deliberately excluded: those are
  // steps 2-3 of the "find my part" wizard, they link to zero products, and
  // their copy is near-identical across all 985 of them. Advertising ~1100
  // such pages in a 1515-URL sitemap told Google the site was mostly thin
  // templated content, and it responded by leaving the real product pages at
  // "Discovered - currently not indexed". They stay crawlable via the nav;
  // they just no longer drown out the catalog.
  const [{ data: makes }, { data: makeLinks }] = await Promise.all([
    supabase.from("vehicle_makes").select("id, slug").eq("is_active", true),
    supabase.from("product_vehicle_makes").select("vehicle_make_id"),
  ]);
  const makesWithProducts = new Set(
    (makeLinks ?? []).map((l) => l.vehicle_make_id as string),
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

  const vehiclePaths: string[] = (makes ?? [])
    .filter((m) => makesWithProducts.has(m.id as string))
    .map((m) => `/piese-auto/${m.slug}`);

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
