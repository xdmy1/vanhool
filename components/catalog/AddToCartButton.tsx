"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import type { Product } from "@/lib/db/types";

/**
 * Wraps the "Add to cart" button used on product cards. Reads from the
 * Zustand cart store (`useCart`) so navbar count + cart page update
 * instantly across tabs.
 */
export function AddToCartButton({
  product,
  label,
  className,
  size = "sm",
}: {
  product: Product;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const add = useCart((s) => s.add);
  const unavailable = product.stock === "out_of_stock";

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // eslint-disable-next-line no-console
    console.log("[AddToCartButton] click", {
      productId: product.id,
      slug: product.slug,
      stock: product.stock,
      stockQuantity: product.stockQuantity,
    });
    if (unavailable) {
      toast.error("Produs indisponibil");
      return;
    }
    if (product.stockQuantity <= 0) {
      toast.error("Stoc 0");
      return;
    }
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
      maxStock: product.stockQuantity,
    });
    toast.success(`${product.name} · ${label}`);
  };

  return (
    <Button
      size={size}
      variant={unavailable ? "secondary" : "primary"}
      className={className}
      disabled={unavailable}
      onClick={onClick}
      aria-label={label}
    >
      <ShoppingBag className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
