import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { ProductCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Product grid: 2 columns (first 4 products) on phones and tablets, 4 columns on desktop. */
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
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <li key={p.id} className={cn("min-w-0", i >= 4 && "hidden lg:block")}>
            <ProductCard product={p} sizes="(min-width: 1024px) 23vw, 48vw" />
          </li>
        ))}
      </ul>
      <Link href={href} className="btn-secondary mt-6 w-full sm:hidden">
        Shop all
      </Link>
    </Reveal>
  );
}
