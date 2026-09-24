"use client";

import { Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import type { CartQuote } from "@/lib/types";
import { useCart } from "@/stores/cart";

export function PromoForm({ quote, loading }: { quote: CartQuote | null; loading: boolean }) {
  const promoCode = useCart((s) => s.promoCode);
  const setPromo = useCart((s) => s.setPromo);
  const [value, setValue] = useState("");
  if (promoCode) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-cream px-3.5 py-2.5 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Tag className="size-4 text-rose-deep" /> {promoCode}
          </span>
          <button type="button" onClick={() => setPromo("")} className="rounded-full p-1 text-muted hover:text-ink" aria-label="Remove promo code">
            <X className="size-4" />
          </button>
        </div>
        {loading ? (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Loader2 className="size-3 animate-spin" /> Checking code…
          </p>
        ) : quote?.promoError ? (
          <p className="text-xs text-danger" role="alert">
            {quote.promoError.message}
          </p>
        ) : quote?.promotion ? (
          <p className="text-xs text-success">{quote.promotion.name} applied</p>
        ) : null}
      </div>
    );
  }
  const apply = () => {
    if (value.trim()) setPromo(value.trim().toUpperCase());
    setValue("");
  };
  // Not a <form>: this component is also rendered inside the checkout form.
  return (
    <div className="flex gap-2">
      <label htmlFor="promo" className="sr-only">
        Promo code
      </label>
      <input
        id="promo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
        placeholder="Promo code"
        className="input h-11 uppercase placeholder:normal-case"
        autoComplete="off"
      />
      <button type="button" onClick={apply} className="btn-secondary h-11 shrink-0 px-5">
        Apply
      </button>
    </div>
  );
}
