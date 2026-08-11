import { ProductEditScreen } from "@/components/admin/products/ProductEditScreen";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return (
    <ProductEditScreen locale={locale} id={id} back={{ href: "/admin/products" }} />
  );
}
