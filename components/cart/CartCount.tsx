"use client";

import { useCart } from "@/lib/cart/store";

export function CartCount() {
  const items = useCart((s) => s.items);
  const isHydrated = useCart((s) => s.isHydrated);
  const count = isHydrated ? items.reduce((acc, i) => acc + i.quantity, 0) : 0;
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-background/30 px-1 py-px font-mono text-[10px] tabular-nums">
      {count}
    </span>
  );
}
