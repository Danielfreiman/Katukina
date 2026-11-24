import { notFound } from "next/navigation";
import { getEditorial } from "@/lib/wordpress/content";
import { plainText } from "@/lib/wordpress/text";
import Link from "next/link";
import { readingContent } from "@/lib/wordpress/reading-content";
import { ReadingPage } from "./reading-page";
export async function EditorialPage({
  type,
  slug,
}: {
  type: "posts" | "pages";
  slug: string;
}) {
  const article = await getEditorial(type, slug);
  if (!article) notFound();
  const title = plainText(article.title.rendered);
  const { introduction, chapters } = readingContent(article.content.rendered);
  return (
    <ReadingPage
      title={title}
      chapters={chapters}
      breadcrumb={
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> /
          {type === "posts" && (
            <>
              <Link href="/journal">The journal</Link> /
            </>
          )}
          <span aria-current="page">{title}</span>
        </nav>
      }
    >
      {introduction}
    </ReadingPage>
  );
}
