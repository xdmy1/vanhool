"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/cart/store";

/**
 * Mounted on the thank-you page so a successful checkout clears any cart
 * state that survived the redirect (e.g. from a different tab).
 */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  const isHydrated = useCart((s) => s.isHydrated);
  useEffect(() => {
    if (!isHydrated) return;
    clear();
  }, [isHydrated, clear]);
  return null;
}
