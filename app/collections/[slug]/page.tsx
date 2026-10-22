import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/commerce/catalog";
import { plainText } from "@/lib/wordpress/text";
import { ProductGrid } from "@/components/catalog/product-grid";
import { PageIntro } from "@/components/site/page-intro";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};
export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();
  return {
    title: plainText(category.name),
    alternates: { canonical: `/collections/${slug}` },
    ...((await searchParams).page
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}
export default async function Collection({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();
  const page = Math.max(1, parseInt((await searchParams).page || "1") || 1);
  const products = await getProducts({ category: category.id, page });
  return (
    <main id="content" className="shell page-content">
      <PageIntro title={plainText(category.name)}>
        <p>{plainText(category.description)}</p>
      </PageIntro>
      <ProductGrid products={products.data} />
      <nav className="pagination" aria-label="Pagination">
        {page > 1 && (
          <Link href={`/collections/${slug}?page=${page - 1}`}>← Previous</Link>
        )}
        {page < products.pages && (
          <Link href={`/collections/${slug}?page=${page + 1}`}>Next →</Link>
        )}
      </nav>
    </main>
  );
}
