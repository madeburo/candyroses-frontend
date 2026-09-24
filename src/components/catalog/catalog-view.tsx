import { Suspense } from "react";
import { getFacets } from "@/lib/server-api";
import { hasActiveFilters, type SearchParams } from "@/lib/catalog-params";
import { plural } from "@/lib/format";
import type { PageMeta, ProductCard } from "@/lib/types";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { ActiveFilters, Filters, SortSelect } from "./filters";
import { Pagination } from "./pagination";
import { ProductGrid } from "./product-card";

export async function CatalogView({
  title,
  description,
  eyebrow,
  crumbs,
  pathname,
  searchParams,
  scope,
  products,
  meta,
  categories,
  hideFlags,
}: {
  title: string;
  description?: string | null;
  eyebrow?: string;
  crumbs: Crumb[];
  pathname: string;
  searchParams: SearchParams;
  scope: { category?: string; collection?: string; q?: string };
  products: ProductCard[];
  meta: PageMeta;
  categories?: { name: string; slug: string }[];
  hideFlags?: ("isNew" | "sale")[];
}) {
  const facets = await getFacets(scope);
  return (
    <div className="container-page pt-6 pb-10 sm:pt-8">
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl sm:mt-8 sm:mb-10">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="heading-lg">{title}</h1>
        {description && <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>}
      </header>
      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-14">
        <Suspense>
          <Filters facets={facets} categories={categories} hideFlags={hideFlags} total={meta.total} />
        </Suspense>
        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {meta.total} {plural(meta.total, "item", "items")}
            </p>
            <div className="flex items-center gap-2">
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
          </div>
          <Suspense>
            <ActiveFilters facets={facets} />
          </Suspense>
          {products.length ? (
            <ProductGrid products={products} priorityCount={4} className="xl:grid-cols-3 2xl:grid-cols-4" />
          ) : (
            <div className="rounded-[var(--radius-card)] bg-cream px-6 py-20 text-center">
              <p className="font-display text-3xl">No products found</p>
              <p className="mt-3 text-muted">{hasActiveFilters(searchParams) ? "Try changing or clearing your filters." : "New styles are coming soon."}</p>
            </div>
          )}
          <Pagination pathname={pathname} searchParams={searchParams} page={meta.page} totalPages={meta.totalPages} />
        </div>
      </div>
    </div>
  );
}
