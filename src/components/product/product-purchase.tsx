"use client";

import { Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MAX_QTY, useCart } from "@/stores/cart";
import { PRODUCTION_TEXT } from "@/lib/seo";

type Selection = Record<string, string>;

function initialSelection(p: ProductDetail): Selection {
  const firstAvailable = p.variants.find((v) => v.inStock) ?? p.variants[0];
  if (!firstAvailable) return {};
  // Preselect every axis that has a single value, and the colour of the first available variant.
  const sel: Selection = {};
  for (const o of p.options) {
    if (o.values.length === 1 || o.type === "COLOR") sel[o.code] = firstAvailable.options[o.code];
  }
  return sel;
}

export function ProductPurchase({ product: p, delivery }: { product: ProductDetail; delivery?: string | null }) {
  const [selection, setSelection] = useState<Selection>(() => initialSelection(p));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = useCart((s) => s.add);

  const variant = useMemo(() => {
    if (p.options.length === 0) return p.variants[0];
    if (p.options.some((o) => !selection[o.code])) return undefined;
    return p.variants.find((v) => p.options.every((o) => v.options[o.code] === selection[o.code]));
  }, [p, selection]);

  /** Is a value selectable given the other current selections? */
  const valueState = (code: string, valueId: string) => {
    const candidates = p.variants.filter((v) => v.options[code] === valueId && p.options.every((o) => o.code === code || !selection[o.code] || v.options[o.code] === selection[o.code]));
    if (!candidates.length) return "none" as const;
    return candidates.some((v) => v.inStock) ? ("ok" as const) : ("out" as const);
  };

  const price = variant?.price ?? p.price;
  const compareAt = variant ? variant.compareAtPrice : p.compareAtPrice;
  const colorOption = p.options.find((o) => o.type === "COLOR");
  const selectedColor = colorOption ? colorOption.values.find((v) => v.id === selection[colorOption.code]) : undefined;

  const onAdd = () => {
    setError(null);
    if (!variant) {
      const missing = p.options.find((o) => !selection[o.code]);
      setError(missing ? `Please select a ${missing.name.toLowerCase()}` : "This combination is not available");
      return;
    }
    if (!variant.inStock) {
      setError("This option is currently sold out");
      return;
    }
    const image = p.images.find((i) => i.variantId === variant.id) ?? p.images[0];
    add({
      variantId: variant.id,
      quantity: Math.min(qty, variant.available),
      productName: p.name,
      productSlug: p.slug,
      variantTitle: variant.title,
      imageUrl: image?.url ?? null,
      price: variant.price,
      currency: p.currency,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className={cn("text-2xl font-semibold sm:text-[1.7rem]", compareAt && "text-rose-deep")}>
          {!variant && p.priceMax !== p.price && "From "}
          {formatPrice(price, p.currency)}
        </span>
        {compareAt && (
          <>
            <span className="text-lg text-muted line-through">{formatPrice(compareAt, p.currency)}</span>
            <span className="rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-rose-deep">−{Math.round((1 - price / compareAt) * 100)}%</span>
          </>
        )}
      </div>

      {p.options.map((o) => (
        <fieldset key={o.attributeId}>
          <legend className="mb-3 flex w-full items-center justify-between text-sm">
            <span className="font-semibold">
              {o.name}
              {o.type === "COLOR" && selectedColor ? <span className="ml-2 font-normal text-muted">{selectedColor.value}</span> : null}
              {o.unit && o.type !== "COLOR" ? <span className="ml-1 font-normal text-muted">({o.unit})</span> : null}
            </span>
            {(o.code === "size" || o.code === "size-years") && (
              <a
                href="#size-guide"
                onClick={() => {
                  const guide = document.getElementById("size-guide");
                  if (guide instanceof HTMLDetailsElement) guide.open = true;
                }}
                className="text-muted underline underline-offset-4 hover:text-ink"
              >
                Size guide
              </a>
            )}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {o.values.map((v) => {
              const state = valueState(o.code, v.id);
              const on = selection[o.code] === v.id;
              return o.type === "COLOR" ? (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${v.value}${state === "out" ? " — sold out" : ""}`}
                  title={v.value}
                  disabled={state === "none"}
                  onClick={() => { setError(null); setSelection((s) => ({ ...s, [o.code]: v.id })); }}
                  className={cn(
                    "relative size-10 rounded-full border border-ink/15 transition-shadow disabled:opacity-30",
                    on ? "ring-2 ring-ink ring-offset-2 ring-offset-warm-white" : "hover:ring-1 hover:ring-ink/40 hover:ring-offset-2",
                    state === "out" && "opacity-50",
                  )}
                  style={{ background: v.colorHex ?? "#eee" }}
                >
                  {state === "out" && <span className="absolute inset-0 m-auto h-px w-full rotate-45 bg-ink/50" />}
                </button>
              ) : (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={on}
                  disabled={state === "none"}
                  onClick={() => { setError(null); setSelection((s) => ({ ...s, [o.code]: v.id })); }}
                  className={cn(
                    "h-11 min-w-14 rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                    on ? "border-ink bg-ink text-warm-white" : "border-line bg-warm-white hover:border-ink/50",
                    state === "out" && !on && "text-muted line-through decoration-muted/70",
                  )}
                >
                  {v.value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div aria-live="polite" className="min-h-5 text-sm">
        {variant ? (
          variant.inStock ? (
            variant.lowStock ? (
              <span className="font-medium text-rose-deep">Only {variant.available} left — order soon</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check className="size-4" /> In stock
              </span>
            )
          ) : (
            <span className="text-danger">Sold out</span>
          )
        ) : !p.inStock ? (
          <span className="text-danger">Sold out</span>
        ) : null}
        {error && <p className="mt-1 text-danger">{error}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex h-12 items-center rounded-full border border-line" role="group" aria-label="Quantity">
          <button type="button" className="inline-flex size-12 items-center justify-center rounded-full hover:bg-cream disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full hover:bg-cream disabled:opacity-30"
            onClick={() => setQty((q) => Math.min(variant?.available ?? MAX_QTY, q + 1, MAX_QTY))}
            disabled={!!variant && qty >= variant.available}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button type="button" onClick={onAdd} disabled={!p.inStock} className="btn-primary flex-1">
          {added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
          {added ? "Added to bag" : p.inStock ? "Add to bag" : "Sold out"}
        </button>
      </div>

      {added && variant && (
        <div className="flex items-center gap-3 rounded-2xl bg-cream p-3 text-sm" role="status">
          {p.images[0] && (
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg">
              <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />
            </div>
          )}
          <p className="flex-1">Added to your bag</p>
          <Link href="/cart" className="font-semibold underline underline-offset-4">
            Checkout
          </Link>
        </div>
      )}

      <p className="flex items-start gap-2 text-sm leading-relaxed text-muted">
        <Truck className="mt-0.5 size-4 shrink-0" />
        <span>
          Handmade to order — ready to ship in {PRODUCTION_TEXT}
          {delivery ? `, delivered in ${delivery}` : ""}.{" "}
          <Link href="/shipping" className="underline underline-offset-4 hover:text-ink">
            Shipping details
          </Link>
        </span>
      </p>
    </div>
  );
}
