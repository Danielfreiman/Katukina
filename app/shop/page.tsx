import { getCategories } from "@/lib/commerce/catalog";
import { CatalogPage } from "@/components/catalog/catalog-page";
import { SearchParams, singleParam } from "@/lib/commerce/catalog-query";
type Props = { searchParams: Promise<SearchParams> };
export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams;
  const q = singleParam(params.q).slice(0, 100);
  return {
    title: q ? `Search: ${q}` : "The collection",
    alternates: { canonical: "/shop" },
    ...(Object.keys(params).length
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}
export default async function Shop({ searchParams }: Props) {
  const [params, categories] = await Promise.all([
    searchParams,
    getCategories(),
  ]);
  return <CatalogPage params={params} categories={categories} />;
}
