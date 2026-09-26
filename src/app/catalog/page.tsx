import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { hasActiveFilters, toApiQuery } from "@/lib/catalog-params";
import { listingMetadata } from "@/lib/seo";
import { getCategories, getProducts } from "@/lib/server-api";

export async function generateMetadata({ searchParams }: PageProps<"/catalog">): Promise<Metadata> {
  const sp = await searchParams;
  const query = toApiQuery(sp);
  const { products, meta } = await getProducts(query);
  return listingMetadata({
    title: "Shop All Girls’ Dresses",
    description: "Shop every Candy Roses style: princess and party dresses and costumes for girls. Filter by size, color and price. Shipped across the USA.",
    path: "/catalog",
    meta,
    filtered: hasActiveFilters(sp),
    images: products[0]?.image ? [{ url: products[0].image.url, alt: products[0].image.alt ?? products[0].name }] : undefined,
  });
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const sp = await searchParams;
  const [{ products, meta }, categories] = await Promise.all([getProducts(toApiQuery(sp)), getCategories()]);
  return (
      <CatalogView
        title="Shop All"
        eyebrow="Candy Roses"
        description="Special-occasion dresses for girls — for birthdays, holidays and every celebration in between."
        crumbs={[{ name: "Shop All" }]}
        pathname="/catalog"
        searchParams={sp}
        scope={{}}
        products={products}
        meta={meta}
        categories={categories.filter((c) => c.showInMenu).map((c) => ({ name: c.name, slug: c.slug }))}
      />
  );
}
