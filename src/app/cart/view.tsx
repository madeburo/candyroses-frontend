"use client";

import { AlertCircle, ArrowRight, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FreeShippingBar, Summary } from "@/components/cart/summary";
import { PromoForm } from "@/components/cart/promo-form";
import { useHydrated } from "@/hooks/use-hydrated";
import { useQuote } from "@/hooks/use-quote";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MAX_QTY, useCart } from "@/stores/cart";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { quote, loading, error } = useQuote();

  if (!hydrated) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-blush">
          <ShoppingBag className="size-7 text-rose-deep" strokeWidth={1.5} />
        </span>
        <h1 className="heading-lg mt-6">Your bag is empty</h1>
        <p className="mt-3 max-w-sm text-muted">Discover dresses made for her most special days.</p>
        <Link href="/catalog" className="btn-primary mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  const lineFor = (variantId: string) => quote?.lines.find((l) => l.variantId === variantId);

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="heading-lg">Shopping bag</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <section aria-label="Items in your bag" className="min-w-0">
          {quote?.hasIssues && (
            <div className="mb-5 flex gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm" role="alert">
              <AlertCircle className="size-5 shrink-0 text-danger" />
              <p>Some items have changed availability. Please update them before checking out.</p>
            </div>
          )}
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => {
              const line = lineFor(item.variantId);
              const unit = line?.unitPrice ?? item.price;
              const issue = line?.issue;
              return (
                <li key={item.variantId} className={cn("flex gap-4 py-5 sm:gap-6", issue?.code === "UNAVAILABLE" && "opacity-70")}>
                  <Link href={`/product/${item.productSlug}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-40 sm:w-32">
                    {(line?.imageUrl ?? item.imageUrl) && <Image src={(line?.imageUrl ?? item.imageUrl)!} alt={item.productName} fill sizes="128px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/product/${item.productSlug}`} className="line-clamp-2 font-medium hover:underline">
                          {line?.productName ?? item.productName}
                        </Link>
                        {(line?.variantTitle ?? item.variantTitle) && <p className="mt-1 text-sm text-muted">{line?.variantTitle ?? item.variantTitle}</p>}
                        <p className="mt-1 text-sm text-muted">{formatPrice(unit, quote?.currency ?? item.currency)} each</p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums">{formatPrice(unit * item.quantity, quote?.currency ?? item.currency)}</p>
                    </div>
                    {issue && (
                      <div className="mt-2 text-sm text-danger">
                        {issue.message}
                        {issue.code === "INSUFFICIENT_STOCK" && (issue.available ?? 0) > 0 && (
                          <button type="button" className="ml-2 underline underline-offset-4" onClick={() => setQuantity(item.variantId, issue.available!)}>
                            Update to {issue.available}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex h-10 items-center rounded-full border border-line" role="group" aria-label={`Quantity for ${item.productName}`}>
                        <button type="button" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-cream disabled:opacity-30" onClick={() => setQuantity(item.variantId, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          className="inline-flex size-10 items-center justify-center rounded-full hover:bg-cream disabled:opacity-30"
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= Math.min(MAX_QTY, line?.available ?? MAX_QTY)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button type="button" onClick={() => remove(item.variantId)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-danger">
                        <Trash2 className="size-4" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/catalog" className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4">
            Continue shopping
          </Link>
        </section>

        <aside className="h-fit space-y-5 rounded-[1.5rem] bg-cream/70 p-5 sm:p-7 lg:sticky lg:top-32 xl:top-44">
          <h2 className="font-display text-2xl">Order summary</h2>
          {quote ? <FreeShippingBar quote={quote} /> : null}
          <PromoForm quote={quote} loading={loading} />
          {quote ? (
            <div className={cn("transition-opacity", loading && "opacity-60")}>
              <Summary quote={quote} />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">{error ? <p className="text-sm text-danger">{error}</p> : <Loader2 className="size-5 animate-spin text-muted" />}</div>
          )}
          <Link
            href="/checkout"
            aria-disabled={!quote || quote.hasIssues || loading}
            className={cn("btn-primary w-full", (!quote || quote.hasIssues) && "pointer-events-none opacity-50")}
          >
            Checkout <ArrowRight className="size-4" />
          </Link>
          <p className="text-center text-xs text-muted">Prices and availability are confirmed at checkout.</p>
        </aside>
      </div>
    </div>
  );
}
