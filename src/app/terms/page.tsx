import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";
import { getSettings } from "@/lib/server-api";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms of using the Candy Roses Shop website and placing orders: prices, payment, shipping, exchanges and returns.",
  path: "/terms",
});

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <ProsePage title="Terms of Service">
      <p>By using this website and placing an order with {s.storeName}, you agree to the following terms.</p>
      <h2>Orders & pricing</h2>
      <p>All prices are listed in US dollars. Prices and availability are confirmed when you place your order. We reserve the right to cancel an order in case of an obvious pricing error or if an item becomes unavailable; any payment will be refunded in full.</p>
      <h2>Payment</h2>
      <p>Online payments are processed by our payment partners. Orders paid online are reserved for a limited time until the payment is completed.</p>
      <h2>Shipping</h2>
      <p>
        Delivery times are estimates and may vary. See <Link href="/shipping">Shipping & Payment</Link> for details.
      </p>
      <h2>Returns</h2>
      <p>Unworn items with tags attached may be returned or exchanged within 14 days of delivery. Please contact us before sending an item back.</p>
      <h2>Product safety</h2>
      <p>Our garments contain decorative elements (sequins, beads, bows). Adult supervision is recommended for young children. Not intended as sleepwear.</p>
      <h2>Contact</h2>
      <p>{s.email ? <>Questions about these terms? Email <a href={`mailto:${s.email}`}>{s.email}</a>.</> : <>Questions? <Link href="/contact">Contact us</Link>.</>}</p>
    </ProsePage>
  );
}
