import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/commerce/catalog";
import { ProductGrid } from "@/components/catalog/product-grid";
import { PageIntro } from "@/components/site/page-intro";
import { plainText } from "@/lib/wordpress/text";
type Props = { searchParams: Promise<{ q?: string; page?: string }> };
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = params.page;
  return {
    title: q ? `Search: ${q.slice(0, 100)}` : "The collection",
    alternates: { canonical: "/shop" },
    ...(q || page ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function Shop({ searchParams }: Props) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "")
    .trim()
    .slice(0, 100);
  const page = Math.max(1, Math.min(10000, parseInt(params.page || "1") || 1));
  const [products, categories] = await Promise.all([
    getProducts({ search: query, page }),
    getCategories(),
  ]);
  const link = (number: number) =>
    `/shop?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(number) })}`;
  return (
    <main id="content" className="shell page-content">
      <PageIntro
        title={query ? `Results for “${query}”` : "The collection"}
        eyebrow="BOTANICALS · ART · TRADITIONS"
      >
        <p>Find something that speaks to you.</p>
      </PageIntro>
      <div className="catalog-toolbar">
        <nav className="category-links" aria-label="Product collections">
          <Link href="/shop" aria-current="page">
            All discoveries
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/collections/${category.slug}`}>
              {plainText(category.name)}
            </Link>
          ))}
        </nav>
        <p className="catalog-count">{products.total} discoveries</p>
      </div>
      <ProductGrid products={products.data} />
      <nav className="pagination" aria-label="Pagination">
        {page > 1 && <Link href={link(page - 1)}>← Previous</Link>}
        {page < products.pages && <Link href={link(page + 1)}>Next →</Link>}
      </nav>
    </main>
  );
}
