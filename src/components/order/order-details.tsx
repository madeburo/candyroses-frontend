import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { PublicOrder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "./labels";

const FLOW = ["NEW", "PROCESSING", "SHIPPED", "COMPLETED"];

export function OrderDetails({ order: o }: { order: PublicOrder }) {
  const current = FLOW.indexOf(o.status);
  const address = [o.shippingAddress1, o.shippingAddress2, o.shippingCity, [o.shippingRegion, o.shippingPostalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-8">
        {current >= 0 ? (
          <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
            {FLOW.map((s, i) => (
              <li key={s} className="text-center">
                <span className={cn("mx-auto flex size-8 items-center justify-center rounded-full text-xs font-semibold", i <= current ? "bg-ink text-warm-white" : "bg-soft-gray text-muted")}>
                  {i <= current ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn("mt-2 block text-xs sm:text-sm", i <= current ? "font-medium" : "text-muted")}>{ORDER_STATUS[s]}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl bg-soft-gray px-4 py-3 text-sm font-medium">This order was {ORDER_STATUS[o.status]?.toLowerCase()}.</p>
        )}

        <section aria-label="Items">
          <ul className="divide-y divide-line border-y border-line">
            {o.items.map((i) => (
              <li key={i.id} className="flex gap-4 py-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                  {i.imageUrl && <Image src={i.imageUrl} alt={i.productName} fill sizes="80px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  {i.productSlug ? (
                    <Link href={`/product/${i.productSlug}`} className="font-medium hover:underline">
                      {i.productName}
                    </Link>
                  ) : (
                    <p className="font-medium">{i.productName}</p>
                  )}
                  <p className="mt-1 text-sm text-muted">{[i.color, i.size && `Size ${i.size}`].filter(Boolean).join(" · ") || i.variantName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {i.quantity} × {formatPrice(i.unitPrice, o.currency)}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatPrice(i.totalPrice, o.currency)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(o.subtotal, o.currency)}</dd>
            </div>
            {o.discountTotal > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount{o.promoCode ? ` (${o.promoCode})` : ""}</dt>
                <dd className="tabular-nums">−{formatPrice(o.discountTotal, o.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-soft">Shipping</dt>
              <dd className="tabular-nums">{o.shippingTotal ? formatPrice(o.shippingTotal, o.currency) : "Free"}</dd>
            </div>
            {o.taxTotal > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Sales tax</dt>
                <dd className="tabular-nums">{formatPrice(o.taxTotal, o.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(o.total, o.currency)}</dd>
            </div>
          </dl>
        </section>
      </div>
      <aside className="h-fit space-y-5 rounded-[1.5rem] bg-cream/70 p-6 text-sm">
        <div>
          <p className="eyebrow mb-1.5">Placed</p>
          <p>{formatDateTime(o.createdAt)}</p>
        </div>
        <div>
          <p className="eyebrow mb-1.5">Contact</p>
          <p>
            {o.firstName} {o.lastName}
          </p>
          <p className="text-muted">{o.email}</p>
          <p className="text-muted">{o.phone}</p>
        </div>
        <div>
          <p className="eyebrow mb-1.5">Delivery</p>
          <p>{o.shippingMethodName}</p>
          {address && <p className="text-muted">{address}</p>}
          {o.trackingNumber && (
            <p className="mt-1">
              Tracking: <span className="font-mono">{o.trackingNumber}</span>
            </p>
          )}
        </div>
        <div>
          <p className="eyebrow mb-1.5">Payment</p>
          <p>{PAYMENT_METHOD[o.paymentMethod] ?? o.paymentMethod}</p>
          <p className="text-muted">{PAYMENT_STATUS[o.paymentStatus] ?? o.paymentStatus}</p>
        </div>
        {o.customerComment && (
          <div>
            <p className="eyebrow mb-1.5">Notes</p>
            <p className="whitespace-pre-line text-muted">{o.customerComment}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
