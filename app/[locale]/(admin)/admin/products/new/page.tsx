import { ProductCreateScreen } from "@/components/admin/products/ProductCreateScreen";

export default async function NewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const fromLine = typeof sp.from_line === "string" ? sp.from_line : null;
  return (
    <ProductCreateScreen
      locale={locale}
      fromLineId={fromLine}
      back={{ href: "/admin/products" }}
    />
  );
}
