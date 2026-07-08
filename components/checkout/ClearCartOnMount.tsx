"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/cart/store";

/** Empties the cart once, on the payment-success return page. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
