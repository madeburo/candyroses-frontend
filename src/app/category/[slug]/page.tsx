import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { hasActiveFilters, toApiQuery } from "@/lib/catalog-params";
import { listingMetadata } from "@/lib/seo";
import { getCategory, getProducts, NotFoundError } from "@/lib/server-api";

async function load(slug: string) {
  try {
    return await getCategory(slug);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params, searchParams }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await load(slug);
  const query = toApiQuery(sp);
  const { products, meta } = await getProducts({ ...query, category: slug });
  const cover = c.imageUrl ? { url: c.imageUrl, alt: c.name } : products[0]?.image ? { url: products[0].image.url, alt: products[0].image.alt ?? products[0].name } : null;
  return listingMetadata({
    title: c.seoTitle ?? `${c.name} for Girls`,
    description: c.seoDescription ?? c.description ?? `Shop ${c.name} by Candy Roses — special-occasion dresses for girls, shipped across the USA.`,
    path: `/category/${c.slug}`,
    meta,
    filtered: hasActiveFilters(sp),
    images: cover ? [cover] : undefined,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await load(slug);
  const { products, meta } = await getProducts({ ...toApiQuery(sp), category: slug });
  return (
    <CatalogView
      title={category.name}
      description={category.description}
      eyebrow="Category"
      crumbs={[{ name: "Shop All", href: "/catalog" }, ...category.breadcrumbs.slice(0, -1).map((b) => ({ name: b.name, href: `/category/${b.slug}` })), { name: category.name }]}
      pathname={`/category/${slug}`}
      searchParams={sp}
      scope={{ category: slug }}
      products={products}
      meta={meta}
      categories={category.children.filter((c) => c.showInMenu).map((c) => ({ name: c.name, slug: c.slug }))}
    />
  );
}
