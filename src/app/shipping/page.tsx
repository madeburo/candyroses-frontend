import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";
import { formatPrice } from "@/lib/format";
import { getPaymentMethods, getSettings, getShippingMethods } from "@/lib/server-api";
import { freeFrom, HANDLING_DAYS, pageMetadata, RETURN_WINDOW_DAYS } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shipping & Payment",
  description: "Shipping options across the USA, delivery times, payment methods, exchanges and returns at Candy Roses Shop.",
  path: "/shipping",
});
export const revalidate = 300;

export default async function ShippingPage() {
  const [methods, payments, settings] = await Promise.all([getShippingMethods(), getPaymentMethods(), getSettings()]);
  return (
    <ProsePage title="Shipping & Payment" eyebrow="Customer care">
      <p>We ship across the USA. Shipping costs are calculated automatically at checkout based on the method you choose.</p>
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
      <p>Orders are processed within {HANDLING_DAYS[0]}–{HANDLING_DAYS[1]} business days. You’ll receive a tracking number as soon as your order ships.</p>
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
