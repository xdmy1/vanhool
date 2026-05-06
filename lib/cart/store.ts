"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CartItem, Promo, Totals } from "./types";
import { calcTotals } from "./pricing";

type AddPayload = Omit<CartItem, "quantity"> & { quantity?: number };

type CartState = {
  items: CartItem[];
  promo: Promo | null;
  isHydrated: boolean;

  add: (item: AddPayload) => void;
  remove: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  setPromo: (promo: Promo | null) => void;
  totals: () => Totals;
  setHydrated: (value: boolean) => void;
};

const STORAGE_KEY = "interbus_cart_v1";
const CHANNEL_NAME = "interbus_cart";

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    channel = null;
  }
  return channel;
}

function broadcast() {
  const c = getChannel();
  if (c) c.postMessage({ at: Date.now() });
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      isHydrated: false,

      add: (payload) => {
        const qty = Math.max(1, payload.quantity ?? 1);
        const items = [...get().items];
        const existing = items.find((i) => i.productId === payload.productId);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + qty, payload.maxStock);
        } else {
          items.push({ ...payload, quantity: Math.min(qty, payload.maxStock) });
        }
        set({ items });
        broadcast();
      },

      remove: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
        broadcast();
      },

      updateQuantity: (productId, quantity) => {
        const items = get().items
          .map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i,
          )
          .filter((i) => i.quantity > 0);
        set({ items });
        broadcast();
      },

      clear: () => {
        set({ items: [], promo: null });
        broadcast();
      },

      setPromo: (promo) => {
        set({ promo });
        broadcast();
      },

      totals: () => calcTotals(get().items, get().promo),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, promo: state.promo }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/**
 * Wire cross-tab sync: when another tab posts a change, re-read from
 * localStorage so all tabs stay in sync.
 */
export function attachCartCrossTabSync() {
  if (typeof window === "undefined") return () => {};
  const c = getChannel();
  if (!c) return () => {};
  const handler = () => {
    // Re-trigger persist's read to refresh in-memory state.
    useCart.persist.rehydrate();
  };
  c.addEventListener("message", handler);
  return () => c.removeEventListener("message", handler);
}
