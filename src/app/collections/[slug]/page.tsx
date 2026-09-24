import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { hasActiveFilters, toApiQuery } from "@/lib/catalog-params";
import { getCategories, getCollection, getProducts, NotFoundError } from "@/lib/server-api";

async function load(slug: string) {
  try {
    return await getCollection(slug);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params, searchParams }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await load(slug);
  const title = c.seoTitle ?? c.name;
  const description = c.seoDescription ?? c.description ?? `${c.name} — Candy Roses Shop`;
  const url = `/collections/${c.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: hasActiveFilters(sp) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url, title, description, images: c.imageUrl ? [{ url: c.imageUrl }] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const collection = await load(slug);
  const defaultSort = collection.type === "AUTO_NEW" ? "new" : undefined;
  const query = toApiQuery(sp);
  const [{ products, meta }, categories] = await Promise.all([getProducts({ ...query, sort: query.sort ?? defaultSort, collection: slug }), getCategories()]);
  return (
    <CatalogView
      title={collection.name}
      description={collection.description}
      eyebrow="Collection"
      crumbs={[{ name: "Shop All", href: "/catalog" }, { name: collection.name }]}
      pathname={`/collections/${slug}`}
      searchParams={sp}
      scope={{ collection: slug }}
      products={products}
      meta={meta}
      categories={categories.filter((c) => c.showInMenu).map((c) => ({ name: c.name, slug: c.slug }))}
      hideFlags={collection.type === "AUTO_NEW" ? ["isNew"] : collection.type === "AUTO_SALE" ? ["sale"] : []}
    />
  );
}
