import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { toApiQuery } from "@/lib/catalog-params";
import { searchProducts } from "@/lib/server-api";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = String((await searchParams).q ?? "").slice(0, 100);
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false, follow: true }, alternates: { canonical: "/search" } };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = String(Array.isArray(sp.q) ? sp.q[0] : (sp.q ?? "")).trim().slice(0, 200);
  const { products, meta } = q
    ? await searchProducts({ ...toApiQuery(sp), q })
    : { products: [], meta: { page: 1, limit: 24, total: 0, totalPages: 1 } };
  return (
    <CatalogView
      title={q ? `“${q}”` : "Search"}
      eyebrow="Search results"
      description={q ? undefined : "Search by product name, SKU, description or category."}
      crumbs={[{ name: "Search" }]}
      pathname="/search"
      searchParams={sp}
      scope={{ q }}
      products={products}
      meta={meta}
    />
  );
}
