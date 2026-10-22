import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/site/editorial";
import { getEditorial } from "@/lib/wordpress/content";
import { plainText } from "@/lib/wordpress/text";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getEditorial("posts", slug);
  if (!article) notFound();
  return {
    title: plainText(article.title.rendered),
    description: plainText(article.excerpt.rendered).slice(0, 160),
    alternates: { canonical: `/journal/${slug}` },
  };
}
export default async function Article({ params }: Props) {
  return <EditorialPage type="posts" slug={(await params).slug} />;
}
