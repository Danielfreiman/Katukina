import Link from "next/link";
import { getCategories } from "@/lib/commerce/catalog";
import { plainText } from "@/lib/wordpress/text";
import { PageIntro } from "@/components/site/page-intro";
export const metadata = {
  title: "Collections",
  alternates: { canonical: "/collections" },
};
export default async function Collections() {
  const categories = await getCategories();
  return (
    <main id="content" className="shell page-content">
      <PageIntro title="Collections" eyebrow="EXPLORE YOUR CURIOSITY" />
      <div className="journal-grid">
        {categories.map((category) => (
          <Link
            className="journal-card"
            key={category.id}
            href={`/collections/${category.slug}`}
          >
            <h2>{plainText(category.name)}</h2>
            <p>{category.count} discoveries →</p>
          </Link>
        ))}
      </div>
      {!categories.length && (
        <div className="no-results">
          <h2>New discoveries are on their way.</h2>
          <p>Visit again soon to explore our collections.</p>
        </div>
      )}
    </main>
  );
}
