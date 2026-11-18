import { notFound } from "next/navigation";
import { getCategories } from "@/lib/commerce/catalog";
import { getCollectionBannerCopy } from "@/lib/collection-banner-copy";
import { plainText } from "@/lib/wordpress/text";
import { CatalogPage } from "@/components/catalog/catalog-page";
import type { SearchParams } from "@/lib/commerce/catalog-query";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

// Use the storefront spelling in the heading, breadcrumbs and category links.
async function getCollectionCategories() {
  return (await getCategories()).map((category) => ({
    ...category,
    name: category.name.replace(/\bRape\b/g, "Rapé"),
  }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = (await getCollectionCategories()).find(
    (item) => item.slug === slug,
  );
  if (!category) notFound();
  return {
    title: plainText(category.name),
    description: (
      plainText(category.description) ||
      getCollectionBannerCopy(category).description
    ).slice(0, 160),
    alternates: { canonical: `/collections/${slug}` },
    ...(Object.keys(await searchParams).length
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}
export default async function Collection({ params, searchParams }: Props) {
  const [{ slug }, query, categories] = await Promise.all([
    params,
    searchParams,
    getCollectionCategories(),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  return (
    <CatalogPage params={query} category={category} categories={categories} />
  );
}
