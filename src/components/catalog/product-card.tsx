import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { formatPrice } from "@/lib/format";
import type { ProductCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product: p, priority = false, sizes }: { product: Card; priority?: boolean; sizes?: string }) {
  return (
    <article className="group relative flex min-w-0 flex-col">
      <Link href={`/product/${p.slug}`} className="block" aria-label={p.name}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-cream">
          {p.image ? (
            <>
              <Image
                src={p.image.url}
                alt={p.image.alt ?? p.name}
                fill
                priority={priority}
                sizes={sizes ?? "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"}
                className={cn("object-cover transition-all duration-700 ease-[var(--ease-soft)]", p.hoverImage && "group-hover:opacity-0")}
              />
              {p.hoverImage && (
                <Image
                  src={p.hoverImage.url}
                  alt=""
                  fill
                  sizes={sizes ?? "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"}
                  className="scale-[1.02] object-cover opacity-0 transition-all duration-700 ease-[var(--ease-soft)] group-hover:scale-100 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-display text-2xl text-muted/50">Candy Roses</div>
          )}
          <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 sm:top-3 sm:left-3">
            {p.discountPercent ? <span className="rounded-full bg-rose-deep px-2.5 py-1 text-[11px] font-semibold text-warm-white">−{p.discountPercent}%</span> : null}
            {p.isNew && <span className="rounded-full bg-warm-white/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink">NEW</span>}
            {p.isBestseller && !p.isNew && <span className="rounded-full bg-warm-white/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink">BESTSELLER</span>}
          </div>
          {!p.inStock && (
            <span className="absolute inset-x-2.5 bottom-2.5 rounded-full bg-warm-white/90 py-1.5 text-center text-xs font-medium text-muted sm:inset-x-3 sm:bottom-3">Sold out</span>
          )}
        </div>
      </Link>
      <div className="mt-3 flex min-w-0 flex-1 flex-col gap-1 px-0.5">
        {p.category && <p className="truncate text-[11px] font-medium tracking-[0.12em] text-muted uppercase">{p.category.name}</p>}
        <h3 className="line-clamp-2 text-[15px] leading-snug font-medium text-ink">
          <Link href={`/product/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] sm:after:hidden">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className={cn("text-[15px] font-semibold", p.compareAtPrice && "text-rose-deep")}>
            {p.hasPriceRange && "From "}
            {formatPrice(p.price, p.currency)}
          </span>
          {p.compareAtPrice && <span className="text-sm text-muted line-through">{formatPrice(p.compareAtPrice, p.currency)}</span>}
        </div>
        {p.colors.length > 1 && (
          <div className="mt-1.5 flex items-center gap-1.5" aria-label={`Colors: ${p.colors.map((c) => c.name).join(", ")}`}>
            {p.colors.slice(0, 5).map((c) => (
              <span key={c.slug} title={c.name} className="size-3.5 rounded-full border border-ink/15" style={{ background: c.hex ?? "#ddd" }} />
            ))}
            {p.colors.length > 5 && <span className="text-xs text-muted">+{p.colors.length - 5}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0, className }: { products: Card[]; priorityCount?: number; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} className="min-w-0" delay={(i % 4) * 70}>
          <ProductCard product={p} priority={i < priorityCount} />
        </Reveal>
      ))}
    </ul>
  );
}
