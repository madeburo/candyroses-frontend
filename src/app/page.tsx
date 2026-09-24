import { ArrowRight, Gift, Ruler, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductRail } from "@/components/home/product-rail";
import { InstagramIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { getCategories, getCollections, getProducts, getSettings, safe } from "@/lib/server-api";
import type { PageMeta, ProductCard } from "@/lib/types";
import { instagramUrl } from "@/lib/utils";

export const revalidate = 60;

const empty = { products: [] as ProductCard[], meta: { page: 1, limit: 8, total: 0, totalPages: 1 } as PageMeta };

export default async function HomePage() {
  const [settings, categories, collections] = await Promise.all([getSettings(), getCategories(), getCollections()]);
  const homeCollections = collections.filter((c) => c.showOnHome);
  const homeCategories = categories.filter((c) => c.showOnHome);

  const [featured, collectionProducts, categoryCovers] = await Promise.all([
    safe(() => getProducts({ limit: 3, sort: "popular" }), empty),
    Promise.all(homeCollections.map((c) => safe(() => getProducts({ collection: c.slug, limit: 8, sort: c.type === "AUTO_NEW" ? "new" : "popular" }), empty))),
    Promise.all(homeCategories.map((c) => (c.imageUrl ? Promise.resolve(empty) : safe(() => getProducts({ category: c.slug, limit: 1 }), empty)))),
  ]);
  const heroImages = featured.products.map((p) => p.image).filter(Boolean).slice(0, 2);
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
          {heroImages.length > 0 && (
            <div className="relative mx-auto grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-5">
              {heroImages.map((img, i) => (
                <div key={img!.url} className={`relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-warm-white shadow-soft ${i === 1 ? "mt-10 sm:mt-16" : ""}`}>
                  <Image src={img!.url} alt={img!.alt ?? "Candy Roses dress"} fill priority sizes="(min-width: 1024px) 24vw, 45vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {homeCategories.length > 0 && (
        <section className="container-page mt-20 sm:mt-24" aria-labelledby="cat-title">
          <div className="mb-8 text-center">
            <p className="eyebrow mb-2">Shop by occasion</p>
            <h2 id="cat-title" className="heading-lg">
              Find her perfect look
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {homeCategories.map((c, i) => {
              const img = c.imageUrl ?? categoryCovers[i]?.products[0]?.image?.url ?? null;
              return (
                <Reveal as="li" key={c.id} delay={i * 90}>
                  <Link href={`/category/${c.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-blush">
                      {img && <Image src={img} alt="" fill sizes="(min-width: 1024px) 23vw, 48vw" className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-warm-white sm:p-6">
                        <h3 className="font-display text-2xl leading-tight font-medium sm:text-3xl">{c.name}</h3>
                        {c.description && <p className="mt-1 line-clamp-2 hidden text-sm text-warm-white/85 sm:block">{c.description}</p>}
                        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
                          Shop now <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </section>
      )}

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
            { icon: Ruler, title: "Size by height", text: "Sizes match your child’s height in cm — see the size guide on every product." },
            { icon: Truck, title: "Ships across the USA", text: "Careful packaging and delivery to all 50 states." },
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
