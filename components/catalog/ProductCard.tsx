import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { PartImage } from "@/components/common/PartImage";
import { Price } from "@/components/common/Price";
import { StockBadge } from "@/components/common/StockBadge";
import type { Product } from "@/lib/db/types";

export type ProductCardLabels = {
  partCode: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  /** Pre-formatted "On order · N days" string. Parent page resolves the
   * {days} ICU placeholder using product.leadTimeDays before passing it
   * (Server Components can't pass functions to Client Components). */
  onOrder?: string;
  addToCart: string;
  vatIncluded: string;
  vatExcluded: string;
};

export function ProductCard({
  product,
  locale,
  labels,
  eurRate,
}: {
  product: Product;
  locale: string;
  labels: ProductCardLabels;
  eurRate?: number | null;
}) {
  const stockLabel =
    product.stock === "in_stock"
      ? labels.inStock
      : product.stock === "low_stock"
        ? labels.lowStock
        : product.stock === "on_order"
          ? labels.onOrder ?? labels.outOfStock
          : labels.outOfStock;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface-elevated transition-shadow",
        "hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        locale={locale}
        className="relative block aspect-square overflow-hidden border-b border-border bg-white"
        aria-label={product.name}
      >
        <PartImage
          variant={product.illustration}
          imageUrl={product.imageUrl}
          alt={product.name}
          fit="cover"
          className="absolute inset-0"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isPromo && product.listPrice > 0 ? (
            <span className="rounded-sm bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
              -{Math.round((1 - product.price / product.listPrice) * 100)}%
            </span>
          ) : product.oldPrice ? (
            <span className="rounded-sm bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <StockBadge status={product.stock} label={stockLabel} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">
          <Link
            href={`/product/${product.slug}`}
            locale={locale}
            className="transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>

        {product.partCode || product.brand ? (
          <div className="mb-3 text-xs text-muted">
            {product.brand}
            {product.brand && product.partCode ? " · " : ""}
            {product.partCode ? `${labels.partCode} ${product.partCode}` : ""}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {product.isPromo && product.listPrice > product.price ? (
              <span className="text-xs text-muted line-through">
                {product.listPrice.toFixed(2)} lei
              </span>
            ) : product.oldPrice ? (
              <span className="text-xs text-muted line-through">
                {product.oldPrice.toFixed(2)} lei
              </span>
            ) : null}
            <Price
              value={product.price}
              size="lg"
              eurRate={eurRate}
              showVat
              vatLabels={{
                withVat: labels.vatIncluded,
                withoutVat: labels.vatExcluded,
              }}
            />
          </div>
          <AddToCartButton
            product={product}
            label={labels.addToCart}
            className="gap-1.5"
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
