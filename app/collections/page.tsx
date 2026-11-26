import Link from "next/link";
import { getCategories } from "@/lib/commerce/catalog";
import { publicImageUrl } from "@/lib/public-image";
import { plainText } from "@/lib/wordpress/text";
import { CollectionDirectory } from "./collection-directory";
import styles from "./collections.module.css";
export const metadata = {
  title: "Collections",
  alternates: { canonical: "/collections" },
};
export default async function Collections() {
  const categories = await getCategories();
  const entries = await Promise.all(
    categories.map(async ({ id, name, slug, image }) => {
      const banner = /^[a-z0-9_-]+$/.test(slug)
        ? await publicImageUrl(
            `/images/collections/banners/desktop/${slug}.webp`,
          )
        : null;
      return {
        id,
        name: plainText(name),
        slug,
        photo: banner || image?.src || "/images/brand/katukina-tree.svg",
        hasBanner: Boolean(banner),
      };
    }),
  );
  entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
  return (
    <main id="content" className={`shell ${styles.page}`}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Collections</span>
      </nav>
      {entries.length ? (
        <CollectionDirectory entries={entries} />
      ) : (
        <div className="no-results">
          <h1>Collections</h1>
          <p>Visit again soon to explore our collections.</p>
        </div>
      )}
    </main>
  );
}
