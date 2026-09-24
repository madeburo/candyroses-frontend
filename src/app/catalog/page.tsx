import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { hasActiveFilters, toApiQuery } from "@/lib/catalog-params";
import { getCategories, getProducts } from "@/lib/server-api";

export async function generateMetadata({ searchParams }: PageProps<"/catalog">): Promise<Metadata> {
  const sp = await searchParams;
  const title = "Shop All Girls’ Dresses";
  const description = "Shop every Candy Roses style: princess and party dresses and costumes. Filter by size, color, age and price.";
  return {
    title,
    description,
    alternates: { canonical: "/catalog" },
    robots: hasActiveFilters(sp) ? { index: false, follow: true } : undefined,
    openGraph: { url: "/catalog", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
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
