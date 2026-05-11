import type { Product } from "@/lib/db/types";

export function ProductSpecs({
  product,
  labels,
}: {
  product: Product;
  labels: {
    specifications: string;
    brand: string;
    partCode: string;
    weight: string;
    dimensions: string;
    length: string;
    ribCount: string;
    warranty: string;
    warrantyMonths: (count: number) => string;
  };
}) {
  const rows: { label: string; value: string | null }[] = [
    { label: labels.brand, value: product.brand || null },
    { label: labels.partCode, value: product.partCode || null },
    {
      label: labels.weight,
      value: product.weight ? `${product.weight} kg` : null,
    },
    {
      label: labels.dimensions,
      value:
        product.width && product.height
          ? `${product.width} × ${product.height} mm`
          : product.width
            ? `${product.width} mm`
            : null,
    },
    {
      label: labels.length,
      value: product.length ? `${product.length} mm` : null,
    },
    {
      label: labels.ribCount,
      value: product.ribCount ? String(product.ribCount) : null,
    },
    {
      label: labels.warranty,
      value: product.warrantyMonths
        ? labels.warrantyMonths(product.warrantyMonths)
        : null,
    },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-[11px] font-semibold text-foreground">
          {labels.specifications}
        </h3>
      </div>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_1.5fr] gap-4 px-5 py-3 text-sm"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
