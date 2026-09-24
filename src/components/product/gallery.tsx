"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ProductDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Gallery({ images, name }: { images: ProductDetail["images"]; name: string }) {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  if (!images.length) {
    return <div className="flex aspect-[4/5] items-center justify-center rounded-[var(--radius-card)] bg-cream font-display text-3xl text-muted/50">Candy Roses</div>;
  }
  const go = (i: number) => {
    const next = (i + images.length) % images.length;
    setActive(next);
    const el = scroller.current;
    if (el) el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
  };
  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto lg:max-h-[640px] lg:w-20 lg:flex-col lg:overflow-y-auto" aria-label="Thumbnails">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === active}
                className={cn("relative block h-20 w-16 overflow-hidden rounded-xl bg-cream transition-opacity lg:h-24 lg:w-20", i === active ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100")}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative min-w-0 flex-1">
        <div
          ref={scroller}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-[var(--radius-card)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
        >
          {images.map((img, i) => (
            <div key={img.id} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-cream">
              <Image
                src={img.url}
                alt={img.alt ?? `${name} — photo ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={85}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(active - 1)} className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/90 shadow-soft hover:bg-warm-white sm:inline-flex" aria-label="Previous photo">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(active + 1)} className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/90 shadow-soft hover:bg-warm-white sm:inline-flex" aria-label="Next photo">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((img, i) => (
                <span key={img.id} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-ink" : "w-1.5 bg-ink/30")} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
