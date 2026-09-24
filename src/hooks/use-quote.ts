"use client";

import { useEffect, useMemo, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import type { CartQuote } from "@/lib/types";
import { useCart } from "@/stores/cart";

/** Authoritative cart pricing from the API, re-requested whenever inputs change. */
export function useQuote(opts: { shippingMethodCode?: string; email?: string; region?: string } = {}) {
  const items = useCart((s) => s.items);
  const promoCode = useCart((s) => s.promoCode);
  const payload = useMemo(
    () => JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), promoCode: promoCode || undefined, shippingMethodCode: opts.shippingMethodCode || undefined, email: opts.email || undefined, region: opts.region || undefined }),
    [items, promoCode, opts.shippingMethodCode, opts.email, opts.region],
  );
  const [state, setState] = useState<{ key: string; quote: CartQuote | null; error: string | null }>({ key: "", quote: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const body = JSON.parse(payload) as { items: unknown[] };
    if (!body.items.length) return;
    const t = setTimeout(() => {
      api
        .post<CartQuote>("/cart/quote", body)
        .then((quote) => !cancelled && setState({ key: payload, quote, error: null }))
        .catch((e: unknown) => !cancelled && setState((s) => ({ ...s, key: payload, error: errorText(e) })));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [payload, version]);

  const empty = items.length === 0;
  return {
    quote: empty ? null : state.quote,
    loading: !empty && state.key !== payload,
    error: empty ? null : state.error,
    refresh: () => setVersion((v) => v + 1),
  };
}
