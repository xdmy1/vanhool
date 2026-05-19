import { redirect } from "next/navigation";

/**
 * Always use the full admin form for creating a product, including from
 * a purchase line (?from_line=...). The panel keeps the list view but
 * delegates create/edit to /admin/products to avoid two divergent forms.
 */
export default async function PanelProduseNewRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const fromLine = typeof sp.from_line === "string" ? sp.from_line : null;
  const target = fromLine
    ? `/${locale}/admin/products/new?from_line=${encodeURIComponent(fromLine)}`
    : `/${locale}/admin/products/new`;
  redirect(target);
}
