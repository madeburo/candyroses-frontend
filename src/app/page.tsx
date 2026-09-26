import { ArrowRight, Gift, Ruler, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ProductRail } from "@/components/home/product-rail";
import { InstagramIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { deliveryTime, pageMetadata, PRODUCTION_TEXT, STORE_NAME } from "@/lib/seo";
import { formatPrice } from "@/lib/format";
import { getCollections, getProducts, getSettings, getShippingMethods, safe } from "@/lib/server-api";
import type { PageMeta, ProductCard } from "@/lib/types";
import { instagramUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata({
    title: s.seoTitle ?? `${STORE_NAME} — Princess & Party Dresses for Girls`,
    description: s.seoDescription ?? "Princess dresses, birthday outfits and costumes for girls. Shipped across the USA.",
    path: "/",
    absoluteTitle: true,
    images: s.ogImageUrl ? [{ url: s.ogImageUrl, width: 1200, height: 630, alt: STORE_NAME }] : undefined,
  });
}

function shuffle<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const empty = { products: [] as ProductCard[], meta: { page: 1, limit: 8, total: 0, totalPages: 1 } as PageMeta };

export default async function HomePage() {
  // Rendered per request so the hero shows a different pair of products on every visit
  // (API responses themselves stay cached for 60s).
  await connection();
  const [settings, collections, methods] = await Promise.all([getSettings(), getCollections(), getShippingMethods()]);
  const delivery = deliveryTime(methods);
  const homeCollections = collections.filter((c) => c.showOnHome);

  const [pool, collectionProducts] = await Promise.all([
    safe(() => getProducts({ limit: 24, sort: "new" }), empty),
    Promise.all(homeCollections.map((c) => safe(() => getProducts({ collection: c.slug, limit: 8, sort: c.type === "AUTO_NEW" ? "new" : "popular" }), empty))),
  ]);
  const heroProducts = shuffle(pool.products.filter((p) => p.image && p.inStock)).slice(0, 2);
  const ig = instagramUrl(settings.instagram);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#fffdfa_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#ebdfd0_0%,transparent_60%)]" aria-hidden />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="hero-in max-w-xl">
            <p className="eyebrow">Little girls · Big dreams</p>
            <h1 className="heading-xl mt-5">
              Dresses made for <em className="font-normal text-rose-deep italic">her</em> biggest moments
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
              Princess dresses, party looks and costumes — crafted with soft fabrics, delicate details and a perfect fit.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalog" className="btn-primary">
                Shop the collection <ArrowRight className="size-4" />
              </Link>
              {homeCollections.find((c) => c.type === "AUTO_NEW") && (
                <Link href={`/collections/${homeCollections.find((c) => c.type === "AUTO_NEW")!.slug}`} className="btn-secondary">
                  New arrivals
                </Link>
              )}
            </div>
          </div>
          {heroProducts.length > 0 && (
            <ul className="relative mx-auto grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-5">
              {heroProducts.map((p, i) => (
                <li key={p.id} className={i === 1 ? "mt-10 sm:mt-16" : undefined}>
                  <Link href={`/product/${p.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-warm-white shadow-soft">
                    <Image
                      src={p.image!.url}
                      alt={p.image!.alt ?? p.name}
                      fill
                      priority
                      sizes="(min-width: 1024px) 24vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 rounded-full bg-warm-white/90 px-3.5 py-2 text-xs shadow-soft backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:text-sm">
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="shrink-0 tabular-nums text-ink-soft">{formatPrice(p.price, p.currency)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Collections from the CMS (New Arrivals, Bestsellers, Sale, manual collections) */}
      {homeCollections.map((c, i) => (
        <ProductRail
          key={c.id}
          title={c.name}
          eyebrow={c.type === "AUTO_NEW" ? "Just in" : c.type === "AUTO_BESTSELLERS" ? "Most loved" : c.type === "AUTO_SALE" ? "Limited time" : "Collection"}
          href={`/collections/${c.slug}`}
          products={collectionProducts[i]?.products ?? []}
        />
      ))}

      {/* Value props */}
      <Reveal as="section" className="container-page mt-24">
        <ul className="grid gap-4 rounded-[1.75rem] bg-cream p-6 sm:grid-cols-2 sm:p-10 lg:grid-cols-4">
          {[
            { icon: Gift, title: "Made for special days", text: "Delicate details, soft linings and comfort she’ll love all day." },
            { icon: Ruler, title: "Easy sizing", text: "Sizes by age, 1Y–10Y, with a detailed size chart — and we’re happy to help you choose." },
            { icon: Truck, title: "Handmade to order", text: `Made just for her in ${PRODUCTION_TEXT}, then delivered to your door across the USA${delivery ? ` in ${delivery}` : ""}.` },
            { icon: ShieldCheck, title: "Secure checkout", text: "Your payment and personal data are always protected." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-warm-white text-rose-deep">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      {ig && (
        <section className="container-page mt-24 text-center">
          <p className="eyebrow mb-3">@{settings.instagram?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/$/, "")}</p>
          <h2 className="heading-lg">Follow our little muses</h2>
          <p className="mx-auto mt-4 max-w-md text-muted">New arrivals, styling ideas and real Candy Roses girls on Instagram.</p>
          <a href={ig} target="_blank" rel="noreferrer" className="btn-secondary mt-8">
            <InstagramIcon className="size-5" /> Follow on Instagram
          </a>
        </section>
      )}
    </>
  );
}
