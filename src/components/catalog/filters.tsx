"use client";

import { Check, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "radix-ui";
import { useState, useTransition } from "react";
import { SORTS } from "@/lib/catalog-params";
import { formatPrice } from "@/lib/format";
import type { Facets } from "@/lib/types";
import { cn } from "@/lib/utils";

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    const qs = next.toString();
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { params, update, pending, pathname };
}

function toggleInList(list: string | null, slug: string) {
  const set = new Set((list ?? "").split(",").filter(Boolean));
  if (set.has(slug)) set.delete(slug);
  else set.add(slug);
  return [...set].join(",") || null;
}

export function SortSelect() {
  const { params, update } = useQueryUpdater();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort by</span>
      <select
        value={params.get("sort") ?? ""}
        onChange={(e) => update({ sort: e.target.value || null })}
        className="h-11 appearance-none rounded-full border border-line bg-warm-white py-0 pr-9 pl-4 text-sm font-medium outline-none focus:border-rose-deep"
      >
        <option value="">{params.get("q") ? "Best match" : "Most popular"}</option>
        {SORTS.filter((s) => s.value !== "popular").map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
        {params.get("q") && <option value="popular">Most popular</option>}
      </select>
      <svg className="pointer-events-none absolute right-3.5 size-4 text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M5.2 7.2a.75.75 0 0 1 1.06.02L10 11.1l3.74-3.88a.75.75 0 1 1 1.08 1.04l-4.28 4.44a.75.75 0 0 1-1.08 0L5.18 8.26a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </label>
  );
}

interface FiltersProps {
  facets: Facets;
  categories?: { name: string; slug: string }[];
  hideFlags?: ("isNew" | "sale")[];
}

function FilterBody({ facets, categories, hideFlags = [] }: FiltersProps) {
  const { params, update } = useQueryUpdater();
  const [min, setMin] = useState(params.get("priceMin") ?? "");
  const [max, setMax] = useState(params.get("priceMax") ?? "");
  const flag = (k: string) => params.get(k) === "1";

  return (
    <div className="space-y-8">
      {categories && categories.length > 0 && (
        <section>
          <h3 className="eyebrow mb-3">Category</h3>
          <ul className="space-y-2 text-[15px]">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-rose-deep">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {facets.attributes.map((a) => {
        const selected = (params.get(a.code) ?? "").split(",").filter(Boolean);
        const isColor = a.type === "COLOR";
        return (
          <section key={a.id}>
            <h3 className="eyebrow mb-3">
              {a.name}
              {a.unit ? `, ${a.unit}` : ""}
            </h3>
            <div className={cn("flex flex-wrap gap-2", isColor && "gap-2.5")}>
              {a.values.map((v) => {
                const on = selected.includes(v.slug);
                return isColor ? (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => update({ [a.code]: toggleInList(params.get(a.code), v.slug) })}
                    aria-pressed={on}
                    aria-label={`${v.value} (${v.count})`}
                    title={v.value}
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-full border transition-shadow",
                      on ? "ring-2 ring-ink ring-offset-2 ring-offset-warm-white" : "border-ink/15 hover:ring-1 hover:ring-ink/30 hover:ring-offset-2",
                    )}
                    style={{ background: v.colorHex ?? "#eee" }}
                  >
                    {on && <Check className={cn("size-4", isLight(v.colorHex) ? "text-ink" : "text-white")} />}
                  </button>
                ) : (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => update({ [a.code]: toggleInList(params.get(a.code), v.slug) })}
                    aria-pressed={on}
                    className={cn(
                      "h-10 min-w-11 rounded-full border px-3.5 text-sm transition-colors",
                      on ? "border-ink bg-ink text-warm-white" : "border-line bg-warm-white hover:border-ink/40",
                    )}
                  >
                    {v.value}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {facets.price.max > 0 && (
        <section>
          <h3 className="eyebrow mb-3">Price, $</h3>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              update({ priceMin: min.replace(/\D/g, "") || null, priceMax: max.replace(/\D/g, "") || null });
            }}
          >
            <input className="input h-11 min-w-0" inputMode="numeric" placeholder={`Min ${Math.floor(facets.price.min)}`} value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" />
            <span className="text-muted">—</span>
            <input className="input h-11 min-w-0" inputMode="numeric" placeholder={`Max ${Math.ceil(facets.price.max)}`} value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" />
            <button type="submit" className="btn-secondary h-11 shrink-0 px-4">
              OK
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">
            {formatPrice(facets.price.min)} — {formatPrice(facets.price.max)}
          </p>
        </section>
      )}

      <section className="space-y-3">
        {(
          [
            ["inStock", "In stock only"],
            ["isNew", "New arrivals"],
            ["sale", "On sale"],
          ] as const
        )
          .filter(([k]) => !hideFlags.includes(k as "isNew" | "sale"))
          .map(([k, label]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-[15px]">
              {label}
              <button
                type="button"
                role="switch"
                aria-checked={flag(k)}
                onClick={() => update({ [k]: flag(k) ? null : "1" })}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", flag(k) ? "bg-ink" : "bg-soft-gray")}
              >
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", flag(k) ? "left-[22px]" : "left-0.5")} />
              </button>
            </label>
          ))}
      </section>
    </div>
  );
}

function isLight(hex: string | null) {
  if (!hex) return true;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

export function ActiveFilters({ facets }: { facets: Facets }) {
  const { params, update, pathname } = useQueryUpdater();
  const chips: { key: string; label: string; patch: Record<string, string | null> }[] = [];
  for (const a of facets.attributes) {
    for (const slug of (params.get(a.code) ?? "").split(",").filter(Boolean)) {
      const v = a.values.find((x) => x.slug === slug);
      chips.push({ key: `${a.code}-${slug}`, label: `${a.name}: ${v?.value ?? slug}`, patch: { [a.code]: toggleInList(params.get(a.code), slug) } });
    }
  }
  if (params.get("priceMin") || params.get("priceMax"))
    chips.push({ key: "price", label: `Price: $${params.get("priceMin") ?? 0}–${params.get("priceMax") ? `$${params.get("priceMax")}` : "∞"}`, patch: { priceMin: null, priceMax: null } });
  if (params.get("inStock") === "1") chips.push({ key: "inStock", label: "In stock", patch: { inStock: null } });
  if (params.get("isNew") === "1") chips.push({ key: "isNew", label: "New arrivals", patch: { isNew: null } });
  if (params.get("sale") === "1") chips.push({ key: "sale", label: "On sale", patch: { sale: null } });
  if (!chips.length) return null;
  const q = params.get("q");
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.key} type="button" onClick={() => update(c.patch)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blush px-3.5 text-sm hover:bg-blush-deep">
          {c.label} <X className="size-3.5" aria-label="Remove" />
        </button>
      ))}
      <Link href={q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname} className="px-2 text-sm text-muted underline underline-offset-4 hover:text-ink">
        Clear all
      </Link>
    </div>
  );
}

export function Filters(props: FiltersProps & { total: number }) {
  const [open, setOpen] = useState(false);
  const { params, pending } = useQueryUpdater();
  const activeCount = [...params.keys()].filter((k) => !["page", "sort", "q"].includes(k)).length;
  const bodyKey = `${params.get("priceMin") ?? ""}|${params.get("priceMax") ?? ""}`;
  return (
    <>
      <aside className="hidden lg:block" aria-label="Filters">
        <div className={cn("sticky top-32 xl:top-44 max-h-[calc(100svh-9rem)] xl:max-h-[calc(100svh-12rem)] overflow-y-auto pr-2 pb-8 transition-opacity", pending && "opacity-60")}>
          <FilterBody key={bodyKey} {...props} />
        </div>
      </aside>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button type="button" className="btn-secondary h-11 px-5 lg:hidden">
            <SlidersHorizontal className="size-4" /> Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-ink/30" />
          <Dialog.Content className="anim-sheet-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col rounded-t-3xl bg-warm-white outline-none">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Dialog.Title className="font-display text-2xl">Filters</Dialog.Title>
              <Dialog.Close className="inline-flex size-10 items-center justify-center rounded-full hover:bg-cream" aria-label="Close">
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Refine products by attributes</Dialog.Description>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterBody key={bodyKey} {...props} />
            </div>
            <div className="border-t border-line p-4">
              <button type="button" className="btn-primary w-full" onClick={() => setOpen(false)}>
                Show {props.total} {props.total === 1 ? "item" : "items"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
