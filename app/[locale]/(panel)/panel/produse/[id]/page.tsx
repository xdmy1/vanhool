import { redirect } from "next/navigation";

/**
 * The panel keeps the slimmed-down list view, but editing always happens on
 * the full /admin/products/[id] form (images, OEM codes, cross-refs, bus
 * compat, etc.). Anyone landing on the old panel edit URL is bounced over
 * so there's a single source of truth for the product form.
 */
export default async function PanelProduseEditRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/admin/products/${id}`);
}
