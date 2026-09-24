import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";
import { formatPrice } from "@/lib/format";
import { getSettings, safe } from "@/lib/server-api";
import type { PaymentMethod, ShippingMethod } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shipping & Payment",
  description: "Shipping options, delivery times, payment methods and exchanges at Candy Roses Shop.",
  alternates: { canonical: "/shipping" },
};
export const revalidate = 300;

const API = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");
async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}/api/v1${path}`, { next: { revalidate: 300 } });
  if (!r.ok) throw new Error(String(r.status));
  return ((await r.json()) as { data: T }).data;
}

export default async function ShippingPage() {
  const [methods, payments, settings] = await Promise.all([
    safe(() => get<ShippingMethod[]>("/shipping-methods"), []),
    safe(() => get<PaymentMethod[]>("/payment-methods"), []),
    getSettings(),
  ]);
  return (
    <ProsePage title="Shipping & Payment" eyebrow="Customer care">
      <p>We ship to all 50 US states. Shipping costs are calculated automatically at checkout based on the method you choose.</p>
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
                  {m.freeFromAmount && m.price > 0 ? <span className="block text-muted">Free over {formatPrice(m.freeFromAmount)}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Orders are processed within 1–2 business days. You’ll receive a tracking number as soon as your order ships.</p>
      <h2>Payment</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.code}>
            <strong className="text-ink">{p.title}</strong> — {p.description}
          </li>
        ))}
      </ul>
      <p>All prices are in US dollars. Payments are processed securely; we never store your card details.</p>
      <h2>Exchanges & returns</h2>
      <p>
        If something doesn’t fit, contact us within 14 days of delivery and we’ll help with an exchange or return. Items must be unworn, with tags attached. Custom-altered items can’t be returned.
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
