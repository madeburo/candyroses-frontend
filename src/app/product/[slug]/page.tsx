import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductGrid } from "@/components/catalog/product-card";
import { JsonLd } from "@/components/json-ld";
import { Gallery } from "@/components/product/gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { AgeSizeChart } from "@/components/product/age-size-chart";
import { SizeGuide } from "@/components/product/size-guide";
import { formatPrice } from "@/lib/format";
import { deliveryTime, freeFrom, pageMetadata, PRODUCTION_TEXT, RETURN_WINDOW_DAYS, returnPolicyJsonLd, SHIPS_FROM, shippedMethods, shippingDetailsJsonLd, STORE_NAME } from "@/lib/seo";
import { getProduct, getRelated, getSettings, getShippingMethods, NotFoundError } from "@/lib/server-api";
import type { ProductDetail, ShippingMethod } from "@/lib/types";
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
  const images = p.images.slice(0, 4).map((i) => ({ url: i.url, width: i.width ?? undefined, height: i.height ?? undefined, alt: i.alt ?? p.name }));
  return {
    ...pageMetadata({
      title: p.seo.title ?? p.name,
      description: p.seo.description ?? p.shortDescription ?? `${p.name} by Candy Roses — special-occasion dresses for girls.`,
      path: `/product/${p.slug}`,
      images,
    }),
    keywords: p.seo.keywords ?? undefined,
    other: {
      "product:price:amount": p.price.toFixed(2),
      "product:price:currency": p.currency,
      "product:availability": p.inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": p.brand ?? STORE_NAME,
    },
  };
}

/**
 * schema.org Product / ProductGroup for Google merchant listings and AI answer engines:
 * one Product per variant (size, color, price, availability), with shipping and return policy.
 */
function productJsonLd(p: ProductDetail, methods: ShippingMethod[], storeFreeFrom: number | null) {
  const url = absoluteUrl(`/product/${p.slug}`);
  const validUntil = new Date(Date.now() + 90 * 86400_000).toISOString().slice(0, 10);
  const valueName = (code: string, id: string | undefined) => p.options.find((o) => o.code === code)?.values.find((v) => v.id === id)?.value;
  const sizeCode = p.options.find((o) => o.code === "size" || o.code.startsWith("size-"))?.code;
  const colorCode = p.options.find((o) => o.type === "COLOR")?.code;
  const description = (p.description ?? p.shortDescription ?? "").replace(/\s+/g, " ").trim() || undefined;
  const images = p.images.map((i) => i.url);
  const offer = (price: number, inStock: boolean, offerUrl: string) => ({
    "@type": "Offer",
    url: offerUrl,
    price: price.toFixed(2),
    priceCurrency: p.currency,
    priceValidUntil: validUntil,
    availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: STORE_NAME },
    shippingDetails: shippingDetailsJsonLd(methods, storeFreeFrom, price, p.currency),
    hasMerchantReturnPolicy: returnPolicyJsonLd(),
  });
  const common = {
    brand: { "@type": "Brand", name: p.brand ?? STORE_NAME },
    category: p.category?.name,
    ...(p.material ? { material: p.material } : {}),
    audience: { "@type": "PeopleAudience", suggestedGender: p.gender === "BOY" ? "male" : p.gender === "GIRL" ? "female" : "unisex" },
  };

  if (p.variants.length <= 1) {
    const v = p.variants[0];
    return { "@context": "https://schema.org", "@type": "Product", name: p.name, sku: v?.sku ?? p.sku, url, description, image: images, ...common, offers: offer(v?.price ?? p.price, v?.inStock ?? p.inStock, url) };
  }
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: p.name,
    productGroupID: p.sku,
    url,
    description,
    image: images,
    ...common,
    variesBy: [sizeCode && "https://schema.org/size", colorCode && "https://schema.org/color"].filter(Boolean),
    hasVariant: p.variants.map((v) => {
      const size = sizeCode ? valueName(sizeCode, v.options[sizeCode]) : undefined;
      const color = colorCode ? valueName(colorCode, v.options[colorCode]) : undefined;
      const variantImages = p.images.filter((i) => i.variantId === v.id).map((i) => i.url);
      return {
        "@type": "Product",
        name: [p.name, color, size].filter(Boolean).join(" — "),
        sku: v.sku,
        image: variantImages.length ? variantImages : images,
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
        offers: offer(v.price, v.inStock, url),
      };
    }),
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
  const [p, settings, methods] = await Promise.all([load(slug), getSettings(), getShippingMethods()]);
  const related = await getRelated(slug);
  const hasCmSize = p.options.some((o) => o.code === "size");
  const hasAgeSize = p.options.some((o) => o.code === "size-years");
  const delivery = deliveryTime(methods);
  const shipping = shippedMethods(methods)[0] ?? null;
  const shippingFree = shipping ? freeFrom(shipping, settings.freeShippingFrom) : null;
  const crumbs = [
    { name: "Shop All", href: "/catalog" },
    ...p.breadcrumbs.map((b) => ({ name: b.name, href: `/category/${b.slug}` })),
    { name: p.name },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(p, methods, settings.freeShippingFrom)} />
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
              <ProductPurchase product={p} delivery={delivery} />
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
              {(hasAgeSize || hasCmSize) && (
                <Section title="Size guide" id="size-guide">
                  {hasAgeSize ? <AgeSizeChart /> : <SizeGuide />}
                </Section>
              )}
              <Section title="Shipping & returns">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm leading-relaxed">
                  <dt className="text-muted">Handmade</dt>
                  <dd>Made especially for you once you order — {PRODUCTION_TEXT} to sew and prepare.</dd>
                  <dt className="text-muted">Delivery</dt>
                  <dd>
                    {delivery ? `${delivery} ` : ""}from {SHIPS_FROM.city}, {SHIPS_FROM.country} to your door anywhere in the USA, with a tracking number as soon as it ships.
                  </dd>
                  {shipping && (
                    <>
                      <dt className="text-muted">Shipping</dt>
                      <dd>
                        {shipping.price === 0
                          ? "Free"
                          : shippingFree !== null
                            ? `Free on orders of ${formatPrice(shippingFree)} or more, otherwise ${formatPrice(shipping.price)}`
                            : formatPrice(shipping.price)}
                      </dd>
                    </>
                  )}
                  <dt className="text-muted">Returns</dt>
                  <dd>
                    Exchanges and returns within {RETURN_WINDOW_DAYS} days of delivery (unworn, with tags attached).{" "}
                    <Link href="/shipping" className="underline underline-offset-4">
                      Details
                    </Link>
                  </dd>
                </dl>
                <p className="mt-4 text-sm text-muted">
                  Planning for a special date? We recommend ordering 3–4 weeks ahead. Questions about fit or delivery?{" "}
                  <Link href="/contact" className="underline underline-offset-4 hover:text-ink">
                    Contact us
                  </Link>
                  .
                </p>
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
