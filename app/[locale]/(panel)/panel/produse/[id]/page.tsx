import { ProductEditScreen } from "@/components/admin/products/ProductEditScreen";

/**
 * Product editing INSIDE the panel — same shared form as /admin/products/[id]
 * (one source of truth), but navigation stays in the panel: back goes to the
 * panel product list, post-create/delete redirects stay under /panel/produse.
 */
export default async function PanelProduseEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return (
    <ProductEditScreen
      locale={locale}
      id={id}
      back={{ href: "/panel/produse" }}
      basePath={`/${locale}/panel/produse`}
    />
  );
}
