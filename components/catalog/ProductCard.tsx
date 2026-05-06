import { ShoppingBag } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { PartImage } from "@/components/common/PartImage";
import { Price } from "@/components/common/Price";
import { StockBadge } from "@/components/common/StockBadge";
import type { Product } from "@/lib/db/types";

export type ProductCardLabels = {
  partCode: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  addToCart: string;
};

export function ProductCard({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: string;
  labels: ProductCardLabels;
}) {
  const stockLabel =
    product.stock === "in_stock"
      ? labels.inStock
      : product.stock === "low_stock"
        ? labels.lowStock
        : labels.outOfStock;

  const unavailable = product.stock === "out_of_stock";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface transition-all",
        "hover:border-primary/60 hover:shadow-[0_0_0_1px_rgba(208,73,65,0.35)]",
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        locale={locale}
        className="relative block aspect-square border-b border-border bg-[color:var(--accent-dark)]"
        aria-label={product.name}
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.oldPrice ? (
            <span className="rounded-sm bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <StockBadge status={product.stock} label={stockLabel} />
        </div>
        <PartImage variant={product.illustration} />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {product.brand}
          </span>
          {product.partCode ? (
            <span
              className={cn(
                "rounded-sm border border-border bg-accent-dark px-1.5 py-0.5",
                "font-mono text-[10px] tracking-wider text-muted-strong",
              )}
              title={`${labels.partCode} ${product.partCode}`}
            >
              {product.partCode}
            </span>
          ) : null}
        </div>
        <h3 className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-foreground">
          <Link
            href={`/product/${product.slug}`}
            locale={locale}
            className="transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {product.oldPrice ? (
              <span className="font-mono text-xs text-muted line-through">
                €{product.oldPrice.toFixed(2)}
              </span>
            ) : null}
            <Price value={product.price} size="lg" />
          </div>
          <Button
            size="sm"
            variant={unavailable ? "secondary" : "primary"}
            className="gap-1.5"
            disabled={unavailable}
            aria-label={labels.addToCart}
          >
            <ShoppingBag className="size-3.5" />
            <span className="hidden sm:inline">{labels.addToCart}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
