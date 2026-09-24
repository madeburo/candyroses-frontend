"use client";

import { Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductCard } from "@/lib/types";

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/search?q=${encodeURIComponent(term)}&limit=6`, { signal: ctrl.signal });
        const json = (await res.json()) as { data: ProductCard[] };
        setResults(json.data ?? []);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  const shown = q.trim().length >= 2 ? results : null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="inline-flex size-10 items-center justify-center rounded-full sm:size-11 hover:bg-cream" aria-label="Search">
          <Search className="size-[21px]" strokeWidth={1.6} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="anim-drop fixed inset-x-0 top-0 z-50 max-h-[90svh] overflow-y-auto bg-warm-white shadow-xl outline-none">
          <Dialog.Title className="sr-only">Search products</Dialog.Title>
          <Dialog.Description className="sr-only">Search by name, SKU or category</Dialog.Description>
          <div className="container-page py-5">
            <form onSubmit={submit} className="flex items-center gap-3" role="search">
              <Search className="size-5 shrink-0 text-muted" />
              <input
                autoFocus
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dresses, costumes…"
                className="h-12 min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted/60 sm:text-3xl"
                aria-label="Search query"
                enterKeyHint="search"
              />
              {loading && <Loader2 className="size-5 animate-spin text-muted" />}
              <Dialog.Close className="inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-cream" aria-label="Close search">
                <X className="size-5" />
              </Dialog.Close>
            </form>
            {shown && (
              <div className="mt-4 border-t border-line pt-4">
                {shown.length === 0 ? (
                  <p className="py-6 text-center text-muted">No results. Try a different search.</p>
                ) : (
                  <>
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      {shown.map((p) => (
                        <li key={p.id}>
                          <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="group block">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream">
                              {p.image && <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm">{p.name}</p>
                            <p className="text-sm font-semibold">{formatPrice(p.price, p.currency)}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={submit} className="btn-secondary mt-5 h-11">
                      View all results
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
