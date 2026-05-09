"use client";

import { ArrowRight, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/common/Price";
import { Link } from "@/lib/i18n/routing";
import { CART_CONFIG } from "@/lib/cart/types";
import { useCart } from "@/lib/cart/store";
import { calcTotals } from "@/lib/cart/pricing";
import { cn } from "@/lib/utils/cn";

export function CartSummary({
  locale,
  labels,
}: {
  locale: string;
  labels: {
    title: string;
    subtotal: string;
    discount: string;
    shipping: string;
    free: string;
    total: string;
    checkout: string;
    almostFreeShipping: (remaining: string) => string;
    freeShippingHint: string;
  };
}) {
  const items = useCart((s) => s.items);
  const promo = useCart((s) => s.promo);
  const totals = calcTotals(items, promo);

  const remaining = Math.max(
    0,
    CART_CONFIG.freeShippingThreshold - (totals.subtotal - totals.discount),
  );

  return (
    <div className="rounded-md border border-border bg-surface p-5 md:p-6">
      <h2 className="mb-4 text-[11px] font-semibold text-foreground">
        {labels.title}
      </h2>

      <dl className="space-y-2 text-sm">
        <Row label={labels.subtotal} value={`${totals.subtotal.toFixed(2)} lei`} />
        {totals.discount > 0 ? (
          <Row
            label={`${labels.discount}${promo ? ` · ${promo.code}` : ""}`}
            value={`-${totals.discount.toFixed(2)} lei`}
            tone="success"
          />
        ) : null}
        <Row
          label={labels.shipping}
          value={
            totals.shipping === 0 ? (
              <span className="text-success">
                {labels.free}
              </span>
            ) : (
              `${totals.shipping.toFixed(2)} lei`
            )
          }
        />
      </dl>

      {/* Free-shipping progress */}
      {items.length > 0 ? (
        <div className="mt-4 rounded-sm border border-border bg-background/40 p-3">
          {totals.shipping === 0 ? (
            <div className="flex items-center gap-2 text-xs text-success">
              <Truck className="size-3" /> {labels.freeShippingHint}
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span className="">{labels.almostFreeShipping(`${remaining.toFixed(2)} lei`)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-accent-dark">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, ((CART_CONFIG.freeShippingThreshold - remaining) / CART_CONFIG.freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
        <span className="text-[11px] font-semibold text-foreground">
          {labels.total}
        </span>
        <Price value={totals.total} size="xl" />
      </div>

      <Button
        asChild
        size="lg"
        disabled={items.length === 0}
        className={cn(
          "mt-5 w-full",
          items.length === 0 && "pointer-events-none opacity-50",
        )}
      >
        <Link href="/checkout" locale={locale}>
          {labels.checkout}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
