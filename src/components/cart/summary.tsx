import { formatPrice } from "@/lib/format";
import type { CartQuote } from "@/lib/types";

export function Summary({ quote, showShipping = false, shippingPending }: { quote: CartQuote; showShipping?: boolean; shippingPending?: boolean }) {
  const c = quote.currency;
  return (
    <dl className="space-y-2.5 text-[15px]">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Subtotal ({quote.itemsCount} {quote.itemsCount === 1 ? "item" : "items"})</dt>
        <dd className="tabular-nums">{formatPrice(quote.subtotal, c)}</dd>
      </div>
      {quote.discountTotal > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount{quote.promotion ? ` (${quote.promotion.code})` : ""}</dt>
          <dd className="tabular-nums">−{formatPrice(quote.discountTotal, c)}</dd>
        </div>
      )}
      {showShipping && (
        <div className="flex justify-between">
          <dt className="text-ink-soft">Shipping</dt>
          <dd className="tabular-nums">{quote.shipping ? (quote.shipping.isFree ? "Free" : formatPrice(quote.shipping.price, c)) : shippingPending ? "—" : ""}</dd>
        </div>
      )}
      {/* Orders ship from Kazakhstan, so no US sales tax is configured; the line appears only if a rate is ever set. */}
      {quote.taxTotal > 0 && (
        <div className="flex justify-between">
          <dt className="text-ink-soft">Sales tax{quote.taxRate ? ` (${quote.taxRate}%)` : ""}</dt>
          <dd className="tabular-nums">{formatPrice(quote.taxTotal, c)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-line pt-3.5 text-lg font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(quote.total, c)}</dd>
      </div>
    </dl>
  );
}

export function FreeShippingBar({ quote }: { quote: CartQuote }) {
  const remaining = quote.freeShippingRemaining;
  if (remaining === null || remaining <= 0) {
    if (quote.shipping?.isFree || remaining === 0)
      return <p className="rounded-xl bg-blush px-4 py-3 text-sm font-medium">🎉 You’ve unlocked free shipping!</p>;
    return null;
  }
  const threshold = quote.subtotal - quote.discountTotal + remaining;
  const pct = Math.min(100, ((threshold - remaining) / threshold) * 100);
  return (
    <div className="rounded-xl bg-blush px-4 py-3 text-sm">
      <p>
        You’re <strong>{formatPrice(remaining, quote.currency)}</strong> away from free standard shipping
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-warm-white" aria-hidden>
        <div className="h-full rounded-full bg-rose-deep transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
