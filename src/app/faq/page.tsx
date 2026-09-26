import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";
import { JsonLd } from "@/components/json-ld";
import { formatPrice } from "@/lib/format";
import { HANDLING_DAYS, pageMetadata, RETURN_WINDOW_DAYS, SHIPS_FROM, shippedMethods, shippingSummary } from "@/lib/seo";
import { getPaymentMethods, getSettings, getShippingMethods } from "@/lib/server-api";
import type { PaymentMethod, ShippingMethod, StoreSettings } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "FAQ — Shipping, Sizes & Returns",
  description: "Answers to common questions about Candy Roses Shop: shipping across the USA, delivery times, sizes, payment, exchanges and returns.",
  path: "/faq",
});

/** Every answer is built from live store data, so the page and its FAQPage markup never drift apart. */
function buildFaq(s: StoreSettings, methods: ShippingMethod[], payments: PaymentMethod[]) {
  const shipped = shippedMethods(methods);
  const pickup = methods.find((m) => !m.requiresAddress);
  const lines = shippingSummary(methods, s.freeShippingFrom, formatPrice);
  const contacts = [
    s.email && `email ${s.email}`,
    s.phone && `call ${s.phone}`,
    s.whatsapp && `message us on WhatsApp (${s.whatsapp})`,
    s.instagram && `send a DM on Instagram (@${s.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")})`,
  ]
    .filter(Boolean)
    .join(", ")
    .replace(/, ([^,]*)$/, " or $1");
  const faq: { q: string; a: string }[] = [
    {
      q: "Do you ship across the USA?",
      a: `Yes. ${s.storeName} ships to addresses across the United States${pickup ? `, and ${pickup.name.toLowerCase()} is also available${pickup.price === 0 ? " for free" : ""}` : ""}. All orders ship from ${SHIPS_FROM.city}, ${SHIPS_FROM.country}.`,
    },
  ];
  if (lines.length) faq.push({ q: "How much does shipping cost?", a: `${lines.join(". ")}.` });
  if (shipped.length) {
    faq.push({
      q: "How long does delivery take?",
      a: `Orders are processed within ${HANDLING_DAYS[0]}–${HANDLING_DAYS[1]} business days. Delivery then takes ${shipped
        .filter((m) => m.estimatedDays)
        .map((m) => `${m.estimatedDays} with ${m.name}`)
        .join(", or ")}. You’ll receive a tracking number as soon as your order ships.`,
    });
  }
  faq.push(
    {
      q: "How do I choose the right size?",
      a: "Each product page lists the available sizes — by the child’s age (for example 1Y–10Y) or by height in centimeters, with a size guide. If you’re not sure, send us your child’s height and age and we’ll recommend a size.",
    },
    {
      q: "What is your return policy?",
      a: `If something doesn’t fit, contact us within ${RETURN_WINDOW_DAYS} days of delivery and we’ll help with an exchange or return. Items must be unworn, with tags attached. Custom-altered items can’t be returned.`,
    },
  );
  if (payments.length) {
    const ready = payments.filter((p) => p.available);
    const soon = payments.filter((p) => !p.available);
    const parts = [
      ready.length ? `We accept ${ready.map((p) => `${p.title} (${p.description.replace(/\.$/, "").toLowerCase()})`).join(", ")}.` : "",
      soon.length ? `${soon.map((p) => p.title).join(", ")} ${soon.length > 1 ? "are" : "is"} coming soon.` : "",
      !ready.length ? "Until then, contact us to place an order." : "",
      "All prices are in US dollars.",
    ];
    faq.push({ q: "What payment methods do you accept?", a: parts.filter(Boolean).join(" ") });
  }
  faq.push({ q: "How can I track my order?", a: "When your order ships, we send you a tracking number. You can also follow the status of your order from the link in your order confirmation email or in your account." });
  if (contacts) faq.push({ q: "How can I contact you?", a: `You can ${contacts}${s.workingHours ? ` (${s.workingHours})` : ""}. We’re happy to help with sizing, orders and delivery.` });
  return faq;
}

export default async function FaqPage() {
  const [s, methods, payments] = await Promise.all([getSettings(), getShippingMethods(), getPaymentMethods()]);
  const faq = buildFaq(s, methods, payments);
  return (
    <ProsePage title="Frequently asked questions" eyebrow="Customer care">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      {faq.map((f) => (
        <section key={f.q}>
          <h2>{f.q}</h2>
          <p className="mt-3">{f.a}</p>
        </section>
      ))}
      <p className="pt-4">
        More details: <Link href="/shipping">Shipping & Payment</Link> · <Link href="/contact">Contact us</Link>
      </p>
    </ProsePage>
  );
}
