"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/client-api";
import type { CartQuote } from "@/lib/types";
import { useCart, type CartItem } from "@/stores/cart";
import { useCustomer } from "@/stores/customer";

export function linesToItems(quote: CartQuote): CartItem[] {
  return quote.lines
    .filter((l) => l.productSlug)
    .map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
      productName: l.productName,
      productSlug: l.productSlug!,
      variantTitle: l.variantTitle,
      imageUrl: l.imageUrl,
      price: l.unitPrice,
      currency: quote.currency,
    }));
}

/** Merges the guest cart into the account cart after login and keeps them in sync. */
export async function mergeServerCart() {
  const local = useCart.getState().items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));
  const res = await api.post<{ items: { variantId: string; quantity: number }[]; quote: CartQuote }>("/cart/merge", { items: local });
  useCart.setState({ items: linesToItems(res.quote) });
}

export function CartSync() {
  const { customer, load } = useCustomer();
  const syncing = useRef(false);

  useEffect(() => {
    void load().then(async (c) => {
      if (!c) return;
      syncing.current = true;
      await mergeServerCart().catch(() => undefined);
      syncing.current = false;
    });
  }, [load]);

  useEffect(() => {
    if (!customer) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useCart.subscribe((state, prev) => {
      if (syncing.current || state.items === prev.items) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void api.put("/cart", { items: state.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) }).catch(() => undefined);
      }, 700);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [customer]);

  return null;
}
