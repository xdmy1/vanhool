"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/common/Price";
import { StockBadge } from "@/components/common/StockBadge";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/lib/db/types";

export function ProductBuyBox({
  product,
  labels,
  eurRate,
}: {
  product: Product;
  labels: {
    quantity: string;
    addToCart: string;
    buyNow: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    trustDelivery: string;
    trustWarranty: string;
    stockAvailable: string;
    vatIncluded: string;
    vatExcluded: string;
  };
  eurRate?: number | null;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const max = Math.max(1, product.stockQuantity);
  const unavailable = product.stock === "out_of_stock";
  const stockLabel =
    product.stock === "in_stock"
      ? labels.inStock
      : product.stock === "low_stock"
        ? labels.lowStock
        : labels.outOfStock;

  const addCurrent = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      partCode: product.partCode,
      price: product.price,
      oldPrice: product.oldPrice,
      illustration: product.illustration,
      imageUrl: product.imageUrl,
      maxStock: max,
      quantity: qty,
    });
  };

  const onAddToCart = () => {
    if (unavailable) return;
    addCurrent();
    toast.success(`${product.name} · ${labels.addToCart}`);
  };

  const onBuyNow = () => {
    if (unavailable) return;
    addCurrent();
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-5 rounded-md border border-border bg-surface p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted">
            {product.brand}
          </span>
          <Price
            value={product.price}
            size="xl"
            className="mt-1 text-3xl md:text-4xl"
            eurRate={eurRate}
            showVat
            vatLabels={{
              withVat: labels.vatIncluded,
              withoutVat: labels.vatExcluded,
            }}
          />
          {product.oldPrice ? (
            <span className="text-sm text-muted line-through">
              {product.oldPrice.toFixed(2)} lei
            </span>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StockBadge status={product.stock} label={stockLabel} />
          {!unavailable ? (
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {labels.stockAvailable}
            </span>
          ) : null}
        </div>
      </div>

      {/* Quantity + CTA */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted">
            {labels.quantity}
          </label>
          <div className="inline-flex items-stretch overflow-hidden rounded-md border border-border">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              disabled={qty <= 1 || unavailable}
              aria-label="decrement"
              className="grid w-9 place-items-center text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <input
              value={qty}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 1) setQty(Math.min(v, max));
              }}
              type="number"
              min={1}
              max={max}
              disabled={unavailable}
              className={cn(
                "w-14 bg-transparent text-center text-sm tabular-nums outline-none",
                "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
            <button
              type="button"
              onClick={() => setQty((v) => Math.min(max, v + 1))}
              disabled={qty >= max || unavailable}
              aria-label="increment"
              className="grid w-9 place-items-center text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onAddToCart}
            variant="primary"
            size="lg"
            disabled={unavailable}
            className="flex-1"
          >
            <ShoppingBag className="size-4" /> {labels.addToCart}
          </Button>
          <Button
            onClick={onBuyNow}
            variant="secondary"
            size="lg"
            disabled={unavailable}
            className="flex-1"
          >
            {labels.buyNow}
          </Button>
        </div>
      </div>

      {/* Trust */}
      <ul className="space-y-2 border-t border-border pt-4 text-xs text-muted-strong">
        <li className="flex items-center gap-2">
          <Truck className="size-4 shrink-0 text-primary" /> {labels.trustDelivery}
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-primary" />{" "}
          {labels.trustWarranty}
        </li>
      </ul>
    </div>
  );
}
