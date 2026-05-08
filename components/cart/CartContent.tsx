"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { CartLine } from "./CartLine";
import { PromoInput } from "./PromoInput";
import { CartSummary } from "./CartSummary";

export function CartContent({ locale }: { locale: string }) {
  const items = useCart((s) => s.items);
  const isHydrated = useCart((s) => s.isHydrated);

  const t = useTranslations("cart");

  if (!isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-md border border-border bg-surface p-12 text-center">
        <div className="mb-5 grid size-16 place-items-center rounded-full border border-border bg-background text-muted">
          <ShoppingBag className="size-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{t("empty_title")}</h2>
        <p className="mt-2 text-sm text-muted-strong">{t("empty_body")}</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/catalog" locale={locale}>
            {t("empty_cta")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <div className="mb-3 text-xs text-muted">
          {t("items_count", { count: items.length })}
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          {items.map((item) => (
            <CartLine
              key={item.productId}
              item={item}
              locale={locale}
              labels={{ partCode: t("part_code"), remove: t("remove") }}
            />
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <PromoInput
          labels={{
            title: t("promo_title"),
            placeholder: t("promo_placeholder"),
            apply: t("promo_apply"),
            remove: t("promo_remove"),
            invalid: t("promo_invalid"),
            applied: t("promo_applied"),
            minOrder: t("promo_min_order"),
          }}
        />
        <CartSummary
          locale={locale}
          labels={{
            title: t("summary"),
            subtotal: t("subtotal"),
            discount: t("discount"),
            shipping: t("shipping"),
            free: t("free"),
            total: t("total"),
            checkout: t("checkout"),
            almostFreeShipping: (remaining: string) =>
              t("almost_free_shipping", { remaining }),
            freeShippingHint: t("free_shipping_hint"),
          }}
        />
      </aside>
    </div>
  );
}
