import Link from "next/link";
import { getArticles } from "@/lib/wordpress/content";
import { plainText } from "@/lib/wordpress/text";
import { PageIntro } from "@/components/site/page-intro";
export const metadata = {
  title: "Journal",
  alternates: { canonical: "/journal" },
};
export default async function Journal({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, parseInt((await searchParams).page || "1") || 1);
  const articles = await getArticles(page);
  return (
    <main id="content" className="shell page-content">
      <PageIntro title="The journal" eyebrow="KNOWLEDGE WORTH SHARING" />
      <div className="journal-grid">
        {articles.data.map((article) => (
          <Link
            className="journal-card"
            key={article.id}
            href={`/journal/${article.slug}`}
          >
            <h2>{plainText(article.title.rendered)}</h2>
            <p>{plainText(article.excerpt.rendered).slice(0, 180)}</p>
            <span className="text-link">Read the story →</span>
          </Link>
        ))}
      </div>
      {!articles.data.length && (
        <p>New stories are on their way. Visit again soon.</p>
      )}
      <nav className="pagination" aria-label="Pagination">
        {page > 1 && <Link href={`/journal?page=${page - 1}`}>← Previous</Link>}
        {page < articles.pages && (
          <Link href={`/journal?page=${page + 1}`}>Next →</Link>
        )}
      </nav>
    </main>
  );
}
