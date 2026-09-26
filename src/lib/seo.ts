import type { Metadata } from "next";
import type { PageMeta, ProductCard, ShippingMethod } from "./types";
import { absoluteUrl } from "./utils";

export const STORE_NAME = "Candy Roses Shop";
export const DEFAULT_OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: STORE_NAME };
/** Exchanges & returns window, shown on /shipping and /faq and published in structured data. */
export const RETURN_WINDOW_DAYS = 14;
/** Order processing time before an order ships (business days). */
export const HANDLING_DAYS: [number, number] = [1, 2];

type OgImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * Page metadata with a self-referencing canonical and a complete Open Graph block.
 * Next.js replaces (not merges) `openGraph` from the root layout, so every page passes
 * url, site name, locale and an image here; otherwise shares fall back to the home page.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  noindex,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  images?: OgImage[];
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const imgs = images?.length ? images : [DEFAULT_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", siteName: STORE_NAME, locale: "en_US", url: path, title, description, images: imgs },
    twitter: { card: "summary_large_image", title, description, images: imgs.map((i) => i.url) },
  };
}

/** Listing pages: page 2+ are canonical to themselves; empty, filtered or out-of-range pages stay out of the index. */
export function listingMetadata(opts: { title: string; description: string; path: string; meta: PageMeta; filtered: boolean; images?: OgImage[] }) {
  const { page, total, totalPages } = opts.meta;
  const path = page > 1 ? `${opts.path}?page=${page}` : opts.path;
  const title = page > 1 ? `${opts.title} — Page ${page}` : opts.title;
  return pageMetadata({ title, description: opts.description, path, images: opts.images, noindex: opts.filtered || total === 0 || page > Math.max(1, totalPages) });
}

export function itemListJsonLd(name: string, path: string, products: ProductCard[], meta: PageMeta) {
  const offset = (meta.page - 1) * meta.limit;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: meta.total,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: offset + i + 1,
        url: absoluteUrl(`/product/${p.slug}`),
        name: p.name,
        ...(p.image ? { image: p.image.url } : {}),
      })),
    },
  };
}

/** "3–7 business days" → [3, 7]; "Ready in 1 day" → [1, 1]. */
export function parseDays(text: string | null): [number, number] | null {
  const nums = (text ?? "").match(/\d+/g)?.map(Number);
  if (!nums?.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

export const shippedMethods = (methods: ShippingMethod[]) => methods.filter((m) => m.requiresAddress);

/** Free-shipping threshold of a method; like the API, falls back to the store-wide threshold. */
export const freeFrom = (m: ShippingMethod, storeFreeFrom: number | null) => m.freeFromAmount ?? storeFreeFrom;

export function shippingDetailsJsonLd(methods: ShippingMethod[], storeFreeFrom: number | null, price: number, currency: string) {
  return shippedMethods(methods).map((m) => {
    const days = parseDays(m.estimatedDays);
    const threshold = freeFrom(m, storeFreeFrom);
    const free = m.price === 0 || (threshold !== null && price >= threshold);
    return {
      "@type": "OfferShippingDetails",
      shippingLabel: m.name,
      shippingRate: { "@type": "MonetaryAmount", value: free ? 0 : m.price, currency },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      ...(days
        ? {
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: HANDLING_DAYS[0], maxValue: HANDLING_DAYS[1], unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: days[0], maxValue: days[1], unitCode: "DAY" },
            },
          }
        : {}),
    };
  });
}

export function returnPolicyJsonLd() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "US",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: RETURN_WINDOW_DAYS,
    merchantReturnLink: absoluteUrl("/shipping"),
  };
}

/** Plain-language shipping summary used on product pages, /faq and llms.txt. */
export function shippingSummary(methods: ShippingMethod[], storeFreeFrom: number | null, fmt: (n: number) => string) {
  return shippedMethods(methods).map((m) => {
    const threshold = freeFrom(m, storeFreeFrom);
    const cost = m.price === 0 ? "free" : threshold !== null ? `${fmt(m.price)}, free on orders of ${fmt(threshold)} or more` : fmt(m.price);
    return `${m.name}: ${cost}${m.estimatedDays ? ` (${m.estimatedDays})` : ""}`;
  });
}
