/**
 * Maps storefront URL query params (shareable, human readable) to API params.
 *   URL:  ?size=98,104&color=blush&age=3-4&priceMin=10000&inStock=1&sale=1&sort=price_asc&page=2
 *   API:  attrs=size:98,104;color:blush;age:3-4&priceMin=10000&inStock=true&...
 */
export const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "new", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export const RESERVED = new Set(["page", "sort", "priceMin", "priceMax", "inStock", "isNew", "sale", "q", "limit"]);

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const SLUG_LIST = /^[a-z0-9-]+(,[a-z0-9-]+)*$/;

export function toApiQuery(sp: SearchParams, limit = 24) {
  const attrs: string[] = [];
  for (const [k, v] of Object.entries(sp)) {
    const val = first(v);
    if (RESERVED.has(k) || !val || !/^[a-z0-9_]+$/.test(k) || !SLUG_LIST.test(val)) continue;
    attrs.push(`${k}:${val}`);
  }
  const num = (v: string | undefined) => (v && /^\d+$/.test(v) ? v : undefined);
  const page = Math.max(1, Math.min(10000, Number(num(first(sp.page)) ?? 1)));
  const sort = first(sp.sort);
  return {
    page,
    limit,
    sort: SORTS.some((s) => s.value === sort) ? sort : undefined,
    attrs: attrs.length ? attrs.join(";") : undefined,
    priceMin: num(first(sp.priceMin)),
    priceMax: num(first(sp.priceMax)),
    inStock: first(sp.inStock) === "1" ? "true" : undefined,
    isNew: first(sp.isNew) === "1" ? "true" : undefined,
    sale: first(sp.sale) === "1" ? "true" : undefined,
  };
}

export function hasActiveFilters(sp: SearchParams) {
  return Object.keys(sp).some((k) => k !== "page" && k !== "sort" && k !== "q" && first(sp[k]));
}

export function pageHref(pathname: string, sp: SearchParams, page: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = first(v);
    if (val && k !== "page") p.set(k, val);
  }
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `${pathname}?${s}` : pathname;
}
