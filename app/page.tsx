import Link from "next/link";
import { Flame, Leaf, Shapes } from "lucide-react";
import { getProducts } from "@/lib/commerce/catalog";
import { ProductGrid } from "@/components/catalog/product-grid";
import { BrandMark } from "@/components/site/brand-mark";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { siteUrl } from "@/lib/config/site";
import { plainText } from "@/lib/wordpress/text";
export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await getProducts({ per_page: 6 }).catch((error: unknown) => {
    console.error(
      "Catalogue read failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  });
  const categories = [
    ...new Map(
      catalog?.data
        .flatMap((product) => product.categories)
        .map((category) => [category.id, category]) || [],
    ).values(),
  ];
  return (
    <main id="content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Katukina",
            url: siteUrl,
            inLanguage: "en-GB",
          }).replace(/</g, "\\u003c"),
        }}
      />
      <HeroCarousel labels={["Discover Katukina", "Explore Rapé"]} slides={[
      <section key="katukina" className="hero hero-campaign" aria-labelledby="hero-title">
        <img
          className="hero-campaign-image"
          src="/images/campaigns/home/katukina-hero.webp"
          alt=""
          width={2400}
          height={1500}
          fetchPriority="high"
        />
        <div className="shell hero-campaign-layout">
          <div className="hero-copy">
            <h1 id="hero-title">
              Closer to nature.<br />
              <span>Rooted in tradition.</span>
            </h1>
            <p className="hero-description">
              Explore botanicals, incense, art and objects connected to forest
              traditions. Find something that speaks to your curiosity.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/shop">
                Shop all products
              </Link>
              <Link className="button secondary" href="/collections">
                Browse categories
              </Link>
            </div>
            <ul className="hero-highlights" aria-label="Discover Katukina">
              <li><Leaf aria-hidden="true" /><span><strong>Botanicals</strong><small>A world to explore</small></span></li>
              <li><Flame aria-hidden="true" /><span><strong>Incense</strong><small>Scent &amp; ritual</small></span></li>
              <li><Shapes aria-hidden="true" /><span><strong>Art &amp; objects</strong><small>Nature &amp; culture</small></span></li>
            </ul>
          </div>
        </div>
      </section>,
      <section key="rape" className="hero hero-campaign" aria-labelledby="hero-rape-title">
        <img
          className="hero-campaign-image"
          src="/images/campaigns/home/katukina-hero-rape.webp"
          alt=""
          width={2400}
          height={1500}
          loading="lazy"
        />
        <div className="shell hero-campaign-layout">
          <div className="hero-copy">
            <h2 id="hero-rape-title">
              Discover Rapé.<br />
              <span>Explore the varieties.</span>
            </h2>
            <p className="hero-description">
              Get to know our Rapé collection. Explore the varieties, compare
              sizes and find the details behind each product.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/collections/rape">
                Explore Rapé
              </Link>
              <Link className="button secondary" href="/shop">
                Shop all products
              </Link>
            </div>
            <ul className="hero-highlights" aria-label="Explore the Rapé collection">
              <li><Leaf aria-hidden="true" /><span><strong>Varieties</strong><small>Find your blend</small></span></li>
              <li><Shapes aria-hidden="true" /><span><strong>Presentations</strong><small>Compare sizes</small></span></li>
              <li><Leaf aria-hidden="true" /><span><strong>Product details</strong><small>Take a closer look</small></span></li>
            </ul>
          </div>
        </div>
      </section>
      ]} />
      <section className="section shell" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION / 01</p>
            <h2>
              Small things.
              <br />
              Meaningful moments.
            </h2>
          </div>
          <div className="section-aside">
            <p>
              A fresh perspective on incense, botanicals and the objects we
              surround ourselves with.
            </p>
            <Link className="text-link" href="/shop">
              Discover everything
            </Link>
          </div>
        </div>
        {catalog ? (
          <ProductGrid products={catalog.data} />
        ) : (
          <div className="no-results">
            <h2>The collection is temporarily unavailable.</h2>
            <p>Please try again in a little while.</p>
            <Link className="text-link" href="/shop">
              Try the collection again
            </Link>
          </div>
        )}
        {categories.length > 0 && (
          <div className="collection-paths">
            <span>Follow your curiosity</span>
            {categories.map((category) => (
              <Link key={category.id} href={`/collections/${category.slug}`}>
                {plainText(category.name)}
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="story-band pattern-surface">
        <div className="shell story-layout">
          <div className="story-heading">
            <p className="eyebrow">BEYOND THE OBJECT / 02</p>
            <h2>
              Everything
              <br />
              has roots.
            </h2>
            <BrandMark />
          </div>
          <div className="story-copy">
            <span className="story-index">[ NATURE + CULTURE ]</span>
            <p>
              Behind every botanical is a place. Behind every tradition, a
              community. We believe those connections deserve to be part of the
              story.
            </p>
            <p className="story-small">
              Get to know the people, places and traditions behind the Katukina
              collection.
            </p>
            <Link className="button secondary" href="/about">
              Our story
            </Link>
          </div>
        </div>
      </section>
      <section className="journal-invite shell">
        <div>
          <p className="eyebrow">THE JOURNAL / 03</p>
          <h2>
            A little more
            <br />
            to be curious about.
          </h2>
        </div>
        <div>
          <p>
            Explore the origins, materials and stories that give everyday
            discoveries their meaning.
          </p>
          <Link className="text-link" href="/journal">
            Read the journal
          </Link>
        </div>
      </section>
    </main>
  );
}
