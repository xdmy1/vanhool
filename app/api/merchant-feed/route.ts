import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";

// Google Merchant Center product feed (RSS 2.0 + g: namespace). Register the
// URL in GMC → Products → Feeds; Google refetches it daily. Powers free
// Shopping listings across Europe.
export const revalidate = 3600;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function gtinOf(barcode: string | null): string | null {
  if (!barcode) return null;
  const digits = barcode.replace(/\D/g, "");
  return [8, 12, 13, 14].includes(digits.length) ? digits : null;
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  type Row = {
    slug: string | null;
    part_code: string | null;
    name_ro: string | null;
    description_ro: string | null;
    brand: string | null;
    price: number | null;
    stock_quantity: number | null;
    lead_time_days: number | null;
    image_url: string | null;
    barcode: string | null;
    condition: "new" | "refurbished" | "used" | null;
    is_promo: boolean | null;
    promo_price: number | null;
    promo_ends_at: string | null;
  };

  const rows: Row[] = [];
  const pageSize = 1000;
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, part_code, name_ro, description_ro, brand, price, stock_quantity, lead_time_days, image_url, barcode, condition, is_promo, promo_price, promo_ends_at",
      )
      .eq("is_active", true)
      .not("slug", "is", null)
      .not("price", "is", null)
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as Row[]));
    if (data.length < pageSize) break;
  }

  const items = rows
    .filter((r) => r.slug && r.name_ro && r.price != null && r.price > 0)
    .map((r) => {
      const link = `${SITE_URL}/ro/product/${r.slug}`;
      const availability =
        (r.stock_quantity ?? 0) > 0
          ? "in_stock"
          : r.lead_time_days != null
            ? "backorder"
            : "out_of_stock";
      const promoActive =
        !!r.is_promo &&
        r.promo_price != null &&
        r.promo_price > 0 &&
        (!r.promo_ends_at || new Date(r.promo_ends_at) > new Date());
      const gtin = gtinOf(r.barcode);
      return [
        "<item>",
        `<g:id>${esc(r.part_code ?? r.slug!)}</g:id>`,
        `<g:title>${esc(r.name_ro!)}</g:title>`,
        `<g:description>${esc(r.description_ro || r.name_ro!)}</g:description>`,
        `<g:link>${esc(link)}</g:link>`,
        r.image_url ? `<g:image_link>${esc(r.image_url)}</g:image_link>` : "",
        `<g:availability>${availability}</g:availability>`,
        `<g:price>${r.price!.toFixed(2)} MDL</g:price>`,
        promoActive
          ? `<g:sale_price>${r.promo_price!.toFixed(2)} MDL</g:sale_price>`
          : "",
        `<g:condition>${r.condition === "used" ? "used" : r.condition === "refurbished" ? "refurbished" : "new"}</g:condition>`,
        r.brand ? `<g:brand>${esc(r.brand)}</g:brand>` : "",
        r.part_code ? `<g:mpn>${esc(r.part_code)}</g:mpn>` : "",
        gtin ? `<g:gtin>${gtin}</g:gtin>` : "",
        !gtin && !r.brand
          ? `<g:identifier_exists>no</g:identifier_exists>`
          : "",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel><title>Inter Bus</title><link>${SITE_URL}</link><description>Piese auto pentru autobuze si microbuze</description>${items.join("")}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
