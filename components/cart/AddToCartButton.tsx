"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import type { Product } from "@/lib/db/types";

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  label,
  toastMessage,
}: {
  product: Product;
  quantity?: number;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  fullWidth?: boolean;
  label: string;
  toastMessage: string;
}) {
  const add = useCart((s) => s.add);
  const [justAdded, setJustAdded] = useState(false);
  const unavailable = product.stock === "out_of_stock";

  const onClick = () => {
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
      maxStock: Math.max(1, product.stockQuantity),
      quantity,
    });
    toast.success(toastMessage, { description: product.name });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={unavailable}
      className={className}
      style={fullWidth ? { width: "100%" } : undefined}
      aria-label={label}
    >
      {justAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
      <span>{label}</span>
    </Button>
  );
}
