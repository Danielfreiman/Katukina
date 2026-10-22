import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/site/editorial";
import { getEditorial } from "@/lib/wordpress/content";
import { plainText } from "@/lib/wordpress/text";
const reserved = new Set(["shop", "cart", "checkout", "my-account"]);
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (reserved.has(slug)) notFound();
  const article = await getEditorial("pages", slug);
  if (!article) notFound();
  return {
    title: plainText(article.title.rendered),
    alternates: { canonical: `/pages/${slug}` },
  };
}
export default async function Content({ params }: Props) {
  const { slug } = await params;
  if (reserved.has(slug)) notFound();
  return <EditorialPage type="pages" slug={slug} />;
}
