import { formatPrice } from "@/lib/format";
import { deliveryTime, PRODUCTION_TEXT, RETURN_WINDOW_DAYS, SHIPS_FROM, shippingSummary } from "@/lib/seo";
import { getCategories, getPaymentMethods, getProducts, getSettings, getShippingMethods, safe } from "@/lib/server-api";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

/** llms.txt (https://llmstxt.org): a plain-markdown summary of the store for AI assistants and answer engines. */
export async function GET() {
  const [s, categories, methods, payments, catalog] = await Promise.all([
    getSettings(),
    getCategories(),
    getShippingMethods(),
    getPaymentMethods(),
    safe(() => getProducts({ limit: 100, sort: "new" }), null),
  ]);
  const products = catalog?.products ?? [];
  const counts = await Promise.all(categories.map((c) => safe(() => getProducts({ category: c.slug, limit: 1 }).then((r) => r.meta.total), 0)));
  const liveCategories = categories.filter((_, i) => counts[i] > 0);

  const out: string[] = [
    `# ${s.storeName}`,
    "",
    `> ${s.seoDescription ?? "Princess dresses, birthday outfits and costumes for girls, shipped across the USA."} Online store for the United States; prices in US dollars.`,
    "",
    "## Key facts",
    `- Website: ${absoluteUrl("/")}`,
    "- Market: United States (ships across the USA)",
    `- Ships from: ${SHIPS_FROM.city}, ${SHIPS_FROM.country} (${SHIPS_FROM.region})`,
    "- Currency: USD",
    ...shippingSummary(methods, s.freeShippingFrom, formatPrice).map((l) => `- ${l}`),
    `- Handmade to order: ${PRODUCTION_TEXT} to make and prepare, then ${deliveryTime(methods) ?? "standard"} delivery to the USA; tracking number sent when the order ships`,
    "- Sizes: by age, 1Y–10Y, with height, chest, waist and hip measurements in the size guide",
    `- Returns: exchanges and returns within ${RETURN_WINDOW_DAYS} days of delivery (unworn, tags attached)`,
    ...(payments.length ? [`- Payment: ${payments.map((p) => `${p.title}${p.available ? "" : " (coming soon)"}`).join(", ")}`] : []),
    ...(s.email ? [`- Contact: ${s.email}${s.phone ? `, ${s.phone}` : ""}${s.workingHours ? ` (${s.workingHours})` : ""}`] : []),
    "",
    "## Pages",
    `- [Shop all dresses](${absoluteUrl("/catalog")}): full catalog with size, color and price filters`,
    ...liveCategories.map((c) => `- [${c.name}](${absoluteUrl(`/category/${c.slug}`)})${c.description ? `: ${c.description}` : ""}`),
    `- [FAQ](${absoluteUrl("/faq")}): shipping, delivery times, sizes, payment and returns`,
    `- [Size guide](${absoluteUrl("/size-guide")}): children’s size chart for ages 1–10 (inches and centimeters)`,
    `- [Shipping & Payment](${absoluteUrl("/shipping")}): shipping options, costs and return policy`,
    `- [Contact](${absoluteUrl("/contact")})`,
  ];
  if (products.length) {
    out.push("", "## Products");
    for (const p of products) {
      const price = p.hasPriceRange ? `${formatPrice(p.price)}–${formatPrice(p.priceMax)}` : formatPrice(p.price);
      const details = [price, p.category?.name, p.colors.length ? `colors: ${p.colors.map((c) => c.name).join(", ")}` : null, p.inStock ? "in stock" : "out of stock"];
      out.push(`- [${p.name}](${absoluteUrl(`/product/${p.slug}`)}): ${details.filter(Boolean).join("; ")}`);
    }
  }
  return new Response(out.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
