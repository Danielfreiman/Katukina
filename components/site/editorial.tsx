import { notFound } from "next/navigation";
import { getEditorial } from "@/lib/wordpress/content";
import { plainText } from "@/lib/wordpress/text";
import { PageIntro } from "./page-intro";
export async function EditorialPage({
  type,
  slug,
}: {
  type: "posts" | "pages";
  slug: string;
}) {
  const article = await getEditorial(type, slug);
  if (!article) notFound();
  return (
    <main id="content" className="shell page-content">
      <PageIntro
        title={plainText(article.title.rendered)}
        eyebrow={type === "posts" ? "THE JOURNAL" : "KATUKINA"}
      />
      <article className="editorial-text">
        {plainText(article.content.rendered)
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </article>
    </main>
  );
}
