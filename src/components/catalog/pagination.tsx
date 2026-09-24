import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { pageHref, type SearchParams } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";

export function Pagination({ pathname, searchParams, page, totalPages }: { pathname: string; searchParams: SearchParams; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const item = "inline-flex size-11 items-center justify-center rounded-full text-sm transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={pageHref(pathname, searchParams, page - 1)} className={cn(item, "hover:bg-cream")} aria-label="Previous page" rel="prev">
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span className={cn(item, "text-muted/40")} aria-hidden>
          <ChevronLeft className="size-5" />
        </span>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted">…</span>
        ) : (
          <Link
            key={p}
            href={pageHref(pathname, searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "bg-ink font-semibold text-warm-white" : "hover:bg-cream")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={pageHref(pathname, searchParams, page + 1)} className={cn(item, "hover:bg-cream")} aria-label="Next page" rel="next">
          <ChevronRight className="size-5" />
        </Link>
      ) : (
        <span className={cn(item, "text-muted/40")} aria-hidden>
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}
