import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductGrid } from "@/components/catalog/product-card";
import { JsonLd } from "@/components/json-ld";
import { Gallery } from "@/components/product/gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { SizeGuide } from "@/components/product/size-guide";
import { getProduct, getRelated, getSettings, NotFoundError } from "@/lib/server-api";
import type { ProductDetail } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

async function load(slug: string) {
  try {
    return await getProduct(slug);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  const title = p.seo.title ?? p.name;
  const description = p.seo.description ?? p.shortDescription ?? `${p.name} by Candy Roses — special-occasion dresses for girls.`;
  const url = `/product/${p.slug}`;
  const images = p.images.slice(0, 4).map((i) => ({ url: i.url, width: i.width ?? undefined, height: i.height ?? undefined, alt: i.alt ?? p.name }));
  return {
    title,
    description,
    keywords: p.seo.keywords ?? undefined,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    other: {
      "product:price:amount": p.price.toFixed(2),
      "product:price:currency": p.currency,
      "product:availability": p.inStock ? "in stock" : "out of stock",
    },
  };
}

function productJsonLd(p: ProductDetail, storeName: string) {
  const url = absoluteUrl(`/product/${p.slug}`);
  const prices = p.variants.map((v) => v.price);
  const low = prices.length ? Math.min(...prices) : p.price;
  const high = prices.length ? Math.max(...prices) : p.price;
  const availability = p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const validUntil = new Date(Date.now() + 90 * 86400_000).toISOString().slice(0, 10);
  const offers =
    low === high
      ? { "@type": "Offer", url, price: low.toFixed(2), priceCurrency: p.currency, availability, itemCondition: "https://schema.org/NewCondition", priceValidUntil: validUntil, seller: { "@type": "Organization", name: storeName } }
      : {
          "@type": "AggregateOffer",
          url,
          lowPrice: low.toFixed(2),
          highPrice: high.toFixed(2),
          offerCount: p.variants.length,
          priceCurrency: p.currency,
          availability,
          offers: p.variants.map((v) => ({
            "@type": "Offer",
            sku: v.sku,
            price: v.price.toFixed(2),
            priceCurrency: p.currency,
            availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          })),
        };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    url,
    description: p.shortDescription ?? p.description ?? undefined,
    image: p.images.map((i) => i.url),
    brand: { "@type": "Brand", name: p.brand ?? storeName },
    category: p.category?.name,
    audience: { "@type": "PeopleAudience", suggestedGender: p.gender === "BOY" ? "male" : p.gender === "GIRL" ? "female" : "unisex" },
    offers,
  };
}

function Section({ title, children, defaultOpen = false, id }: { title: string; children: React.ReactNode; defaultOpen?: boolean; id?: string }) {
  return (
    <details id={id} open={defaultOpen} className="group scroll-mt-48 border-b border-line py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([load(slug), getSettings()]);
  const related = await getRelated(slug);
  const hasSize = p.options.some((o) => o.code === "size");
  const crumbs = [
    { name: "Shop All", href: "/catalog" },
    ...p.breadcrumbs.map((b) => ({ name: b.name, href: `/category/${b.slug}` })),
    { name: p.name },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(p, settings.storeName)} />
      <div className="container-page pt-6 sm:pt-8">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <div className="min-w-0 lg:sticky lg:top-32 lg:self-start xl:top-44">
            <Gallery images={p.images} name={p.name} />
          </div>
          <div className="min-w-0 lg:max-w-xl">
            {p.category && (
              <Link href={`/category/${p.category.slug}`} className="eyebrow hover:underline">
                {p.category.name}
              </Link>
            )}
            <h1 className="mt-3 font-display text-4xl leading-tight font-medium sm:text-5xl">{p.name}</h1>
            {p.shortDescription && <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{p.shortDescription}</p>}
            <div className="mt-7">
              <ProductPurchase product={p} />
            </div>
            <div className="mt-8 border-t border-line">
              {p.description && (
                <Section title="Description" defaultOpen>
                  <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">{p.description}</p>
                </Section>
              )}
              <Section title="Details & care">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
                  <dt className="text-muted">SKU</dt>
                  <dd>{p.sku}</dd>
                  {p.brand && (
                    <>
                      <dt className="text-muted">Brand</dt>
                      <dd>{p.brand}</dd>
                    </>
                  )}
                  {p.characteristics.map((c) => (
                    <div key={c.name} className="contents">
                      <dt className="text-muted">{c.name}</dt>
                      <dd>{c.values.join(", ")}</dd>
                    </div>
                  ))}
                  {p.material && (
                    <>
                      <dt className="text-muted">Fabric</dt>
                      <dd className="whitespace-pre-line">{p.material}</dd>
                    </>
                  )}
                  {p.careInstructions && (
                    <>
                      <dt className="text-muted">Care</dt>
                      <dd className="whitespace-pre-line">{p.careInstructions}</dd>
                    </>
                  )}
                </dl>
              </Section>
              {hasSize && (
                <Section title="Size guide" id="size-guide">
                  <SizeGuide />
                </Section>
              )}
              <Section title="Shipping & returns">
                <div className="space-y-2 text-sm leading-relaxed text-ink-soft">
                  <p>We ship to all 50 states. Shipping options and costs are calculated at checkout{settings.freeShippingFrom ? ` — standard shipping is free on orders over $${settings.freeShippingFrom}` : ""}.</p>
                  <p>
                    Questions about fit or delivery dates? <Link href="/contact" className="underline underline-offset-4">Contact us</Link> — we’re happy to help.
                  </p>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="related-title">
          <h2 id="related-title" className="heading-lg mb-8">
            You may also love
          </h2>
          <ProductGrid products={related.slice(0, 4)} className="xl:grid-cols-4" />
        </section>
      )}
    </>
  );
}
