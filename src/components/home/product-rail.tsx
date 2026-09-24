import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { ProductCard as Card } from "@/lib/types";

/** Horizontal scroll on mobile, grid on desktop. */
export function ProductRail({ title, eyebrow, href, products }: { title: string; eyebrow?: string; href: string; products: Card[] }) {
  if (!products.length) return null;
  return (
    <Reveal as="section" className="container-page mt-20 sm:mt-28">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="heading-lg">{title}</h2>
        </div>
        <Link href={href} className="group hidden shrink-0 items-center gap-2 text-sm font-semibold sm:inline-flex">
          Shop all <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {products.slice(0, 8).map((p) => (
          <li key={p.id} className="w-[46vw] shrink-0 snap-start sm:w-[36vw] md:w-[30vw] lg:w-auto">
            <ProductCard product={p} sizes="(min-width: 1024px) 23vw, 46vw" />
          </li>
        ))}
      </ul>
      <Link href={href} className="btn-secondary mt-6 w-full sm:hidden">
        Shop all
      </Link>
    </Reveal>
  );
}
