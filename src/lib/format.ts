export const STORE_TIMEZONE = process.env.NEXT_PUBLIC_STORE_TIMEZONE ?? "America/New_York";
const cache = new Map<string, Intl.NumberFormat>();

export function formatPrice(value: number | null | undefined, currency = "USD") {
  if (value === null || value === undefined) return "";
  let f = cache.get(currency);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" });
    cache.set(currency, f);
  }
  return f.format(value);
}

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: STORE_TIMEZONE }).format(new Date(d));

export const formatDateTime = (d: string | Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: STORE_TIMEZONE }).format(new Date(d));

export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}
