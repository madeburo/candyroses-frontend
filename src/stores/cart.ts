"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Local cart (guests and a fast cache for customers). Display fields are only a
 * snapshot for instant rendering — prices/stock are always re-validated by the
 * API (/cart/quote) before showing totals and at checkout.
 */
export interface CartItem {
  variantId: string;
  quantity: number;
  productName: string;
  productSlug: string;
  variantTitle: string;
  imageUrl: string | null;
  price: number;
  currency: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string;
  open: boolean;
  add: (item: CartItem) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  replaceQuantities: (items: { variantId: string; quantity: number }[]) => void;
  clear: () => void;
  setPromo: (code: string) => void;
  setOpen: (open: boolean) => void;
}

export const MAX_QTY = 99;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: "",
      open: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: s.items.map((i) => (i.variantId === item.variantId ? { ...i, ...item, quantity: Math.min(MAX_QTY, i.quantity + item.quantity) } : i)),
            };
          }
          return { items: [...s.items, { ...item, quantity: Math.min(MAX_QTY, item.quantity) }].slice(-50) };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: quantity <= 0 ? s.items.filter((i) => i.variantId !== variantId) : s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      replaceQuantities: (list) =>
        set((s) => ({
          items: list
            .map((l) => {
              const known = s.items.find((i) => i.variantId === l.variantId);
              return known ? { ...known, quantity: l.quantity } : null;
            })
            .filter((x): x is CartItem => !!x),
        })),
      clear: () => set({ items: [], promoCode: "" }),
      setPromo: (promoCode) => set({ promoCode }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "crs-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
