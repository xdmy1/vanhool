"use client";

import { useEffect } from "react";

import { attachCartCrossTabSync } from "@/lib/cart/store";

export function CartBootstrap() {
  useEffect(() => {
    return attachCartCrossTabSync();
  }, []);
  return null;
}
