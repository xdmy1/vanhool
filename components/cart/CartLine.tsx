"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { Price } from "@/components/common/Price";
import { PartImage } from "@/components/common/PartImage";
import { useCart } from "@/lib/cart/store";
import type { CartItem } from "@/lib/cart/types";

export function CartLine({
  item,
  locale,
  labels,
}: {
  item: CartItem;
  locale: string;
  labels: { partCode: string; remove: string };
}) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.remove);

  const lineTotal = item.price * item.quantity;

  return (
    <article className="flex gap-4 border-b border-border bg-surface/40 p-4 last:border-b-0 sm:gap-5 sm:p-5">
      <Link
        href={`/product/${item.slug}`}
        locale={locale}
        className="relative block size-20 shrink-0 overflow-hidden rounded-md border border-border bg-accent-dark sm:size-24"
        aria-label={item.name}
      >
        <PartImage variant={item.illustration} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                {item.brand}
              </span>
              {item.partCode ? (
                <span className="rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-[10px] text-muted-strong">
                  {item.partCode}
                </span>
              ) : null}
            </div>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">
              <Link
                href={`/product/${item.slug}`}
                locale={locale}
                className="transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => remove(item.productId)}
            className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            aria-label={labels.remove}
            title={labels.remove}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <div className="inline-flex items-stretch overflow-hidden rounded-md border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="decrement"
              className="grid w-8 place-items-center text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <input
              value={item.quantity}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n > 0) updateQuantity(item.productId, n);
              }}
              type="number"
              min={1}
              max={item.maxStock}
              className={cn(
                "w-12 bg-transparent text-center text-sm tabular-nums outline-none",
                "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              aria-label="increment"
              className="grid w-8 place-items-center text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted">
              {item.quantity} × {item.price.toFixed(2)} lei
            </div>
            <Price value={lineTotal} size="lg" />
          </div>
        </div>
      </div>
    </article>
  );
}
