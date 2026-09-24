import "server-only";
import type { Category, Collection, Facets, PageMeta, ProductCard, ProductDetail, StoreSettings } from "./types";

const API = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");

export class NotFoundError extends Error {}

/**
 * Server-side fetch to the NestJS API with ISR caching. Catalog data is cached
 * for a short time so CMS edits appear on the storefront within ~a minute.
 */
async function get<T>(path: string, opts: { revalidate?: number; tags?: string[] } = {}): Promise<{ data: T; meta: Record<string, unknown> }> {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: opts.revalidate ?? 60, tags: opts.tags },
  });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return res.json() as Promise<{ data: T; meta: Record<string, unknown> }>;
}

/** Same as get(), but returns a fallback when the API is unreachable (keeps pages rendering). */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof NotFoundError) throw e;
    console.error("[storefront] API request failed:", (e as Error).message);
    return fallback;
  }
}

const EMPTY_SETTINGS: StoreSettings = {
  storeName: "Candy Roses Shop",
  phone: null,
  whatsapp: null,
  instagram: null,
  email: null,
  address: null,
  currency: "USD",
  shippingPrice: 0,
  freeShippingFrom: null,
  workingHours: null,
  announcement: null,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  ogImageUrl: null,
};

export const getSettings = () => safe(() => get<StoreSettings>("/settings/public", { revalidate: 300 }).then((r) => r.data), EMPTY_SETTINGS);
export const getCategories = () => safe(() => get<Category[]>("/categories", { revalidate: 120 }).then((r) => r.data), []);
export const getCollections = () => safe(() => get<Collection[]>("/collections", { revalidate: 120 }).then((r) => r.data), []);

export const getCategory = (slug: string) =>
  get<Category & { seoTitle: string | null; seoDescription: string | null; breadcrumbs: { id: string; name: string; slug: string }[] }>(
    `/categories/${encodeURIComponent(slug)}`,
    { revalidate: 120 },
  ).then((r) => r.data);

export const getCollection = (slug: string) => get<Collection>(`/collections/${encodeURIComponent(slug)}`, { revalidate: 120 }).then((r) => r.data);

export async function getProducts(query: Record<string, string | number | undefined>, revalidate = 60) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== "") qs.set(k, String(v));
  const r = await get<ProductCard[]>(`/products?${qs}`, { revalidate });
  return { products: r.data, meta: r.meta as unknown as PageMeta };
}

export async function searchProducts(query: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== "") qs.set(k, String(v));
  const r = await get<ProductCard[]>(`/products/search?${qs}`, { revalidate: 30 });
  return { products: r.data, meta: r.meta as unknown as PageMeta };
}

export async function getFacets(query: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v) qs.set(k, v);
  return safe(() => get<Facets>(`/products/facets?${qs}`, { revalidate: 120 }).then((r) => r.data), { attributes: [], price: { min: 0, max: 0 }, total: 0 });
}

export const getProduct = (slug: string) => get<ProductDetail>(`/products/${encodeURIComponent(slug)}`, { revalidate: 30, tags: [`product:${slug}`] }).then((r) => r.data);
export const getRelated = (slug: string) => safe(() => get<ProductCard[]>(`/products/${encodeURIComponent(slug)}/related`, { revalidate: 300 }).then((r) => r.data), []);
export const getSitemapData = () =>
  get<{ products: { slug: string; updatedAt: string; image: string | null }[]; categories: { slug: string; updatedAt: string }[]; collections: { slug: string; updatedAt: string }[] }>(
    "/products/sitemap",
    { revalidate: 600 },
  ).then((r) => r.data);

export { safe };
