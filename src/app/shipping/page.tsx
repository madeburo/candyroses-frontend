import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";
import { formatPrice } from "@/lib/format";
import { getPaymentMethods, getSettings, getShippingMethods } from "@/lib/server-api";
import { deliveryTime, freeFrom, pageMetadata, PRODUCTION_TEXT, RETURN_WINDOW_DAYS, SHIPS_FROM } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shipping & Payment",
  description: "Handmade to order and shipped from Almaty, Kazakhstan to anywhere in the USA: production and delivery times, shipping costs, payment, exchanges and returns.",
  path: "/shipping",
});
export const revalidate = 300;

export default async function ShippingPage() {
  const [methods, payments, settings] = await Promise.all([getShippingMethods(), getPaymentMethods(), getSettings()]);
  const delivery = deliveryTime(methods);
  return (
    <ProsePage title="Shipping & Payment" eyebrow="Customer care">
      <p>
        Every Candy Roses piece is handmade especially for your order — nothing sits on a warehouse shelf. Here’s what happens after you place it:
      </p>
      <ul>
        <li>
          <strong className="text-ink">Making & preparing — {PRODUCTION_TEXT}.</strong> We sew your piece, check every seam and bow, and pack it with care.
        </li>
        <li>
          <strong className="text-ink">Delivery — {delivery ?? "see below"}.</strong> Your parcel travels from {SHIPS_FROM.city}, {SHIPS_FROM.country} ({SHIPS_FROM.region}) straight to your
          doorstep anywhere in the USA.
        </li>
      </ul>
      <p>
        Planning for a birthday or another big day? We recommend ordering 3–4 weeks ahead, so everything arrives with time to spare. As soon as your order ships, we’ll email
        you a tracking number so you can follow its journey.
      </p>
      <h2>Shipping options</h2>
      <div className="not-prose overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-cream text-xs tracking-wide text-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Method</th>
              <th scope="col" className="px-4 py-3">Delivery time</th>
              <th scope="col" className="px-4 py-3">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {methods.map((m) => (
              <tr key={m.code}>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{m.name}</p>
                  {m.description && <p className="text-muted">{m.description}</p>}
                </td>
                <td className="px-4 py-3">{m.estimatedDays ?? "—"}</td>
                <td className="px-4 py-3">
                  {m.price === 0 ? "Free" : formatPrice(m.price)}
                  {m.price > 0 && freeFrom(m, settings.freeShippingFrom) !== null ? (
                    <span className="block text-muted">Free on orders of {formatPrice(freeFrom(m, settings.freeShippingFrom)!)} or more</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Payment</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.code}>
            <strong className="text-ink">{p.title}</strong> — {p.description}
            {!p.available && " (coming soon)"}
          </li>
        ))}
      </ul>
      <p>All prices are in US dollars. Payments are processed securely; we never store your card details.</p>
      <h2>Exchanges & returns</h2>
      <p>
        If something doesn’t fit, contact us within {RETURN_WINDOW_DAYS} days of delivery and we’ll help with an exchange or return. Items must be unworn, with tags attached. Custom-altered items can’t be returned.
      </p>
      <p>
        Questions? <Link href="/contact">Contact us</Link>
        {settings.email ? (
          <>
            {" "}
            or email <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </>
        ) : null}
        .
      </p>
    </ProsePage>
  );
}
