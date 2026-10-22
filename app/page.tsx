import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { getProducts, productName, productPrice } from "@/lib/commerce/catalog";
import { ProductGrid } from "@/components/catalog/product-grid";
import { BrandMark } from "@/components/site/brand-mark";
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
  const featured =
    catalog?.data.find(
      (product) => product.slug === "sacred-incense-harmony",
    ) || catalog?.data.find((product) => product.images.length);
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
      <section className="hero pattern-surface" aria-labelledby="hero-title">
        <div className="shell hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> CURIOUS BY NATURE
            </p>
            <h1 id="hero-title">
              Find your
              <br />
              <span>natural</span>
              <br />
              rhythm.
            </h1>
            <p className="hero-description">
              A world of botanicals, incense and meaningful objects. For the
              moments that bring you back to yourself.
            </p>
            <Link className="button primary" href="/shop">
              Explore the collection <ArrowUpRight size={19} />
            </Link>
            <a className="hero-scroll" href="#collection">
              <ArrowDown size={17} /> A little discovery goes a long way
            </a>
          </div>
          <div className="hero-feature">
            <div className="feature-topline">
              <span>THE EVERYDAY RITUAL</span>
              <BrandMark />
            </div>
            <Link
              className="feature-photo"
              href={featured ? `/products/${featured.slug}` : "/shop"}
              aria-label={
                featured
                  ? `Discover ${productName(featured)}`
                  : "Explore the collection"
              }
            >
              {featured?.images[0] ? (
                <img
                  src={featured.images[0].src}
                  alt={
                    plainText(featured.images[0].alt) || productName(featured)
                  }
                  width={680}
                  height={680}
                  fetchPriority="high"
                />
              ) : (
                <BrandMark className="feature-placeholder" />
              )}
              <span className="feature-badge">
                A closer
                <br />
                connection.
              </span>
              <span className="feature-arrow">
                <ArrowUpRight size={27} />
              </span>
            </Link>
            <div className="feature-caption">
              <div>
                <span className="eyebrow">A MOMENT TO PAUSE</span>
                <h2>
                  {featured
                    ? productName(featured).replace(
                        /^Sacred Incense\s*[–-]\s*/,
                        "",
                      )
                    : "Something to discover"}
                </h2>
              </div>
              <span>
                {featured ? productPrice(featured) : "Explore Katukina"}
              </span>
            </div>
          </div>
        </div>
        <div className="shell hero-bottom">
          <span>Rooted in tradition. Open to discovery.</span>
          <span>
            BOTANICALS <i /> OBJECTS <i /> CULTURE
          </span>
        </div>
      </section>
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
              Discover everything <ArrowUpRight size={18} />
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
              Try the collection again <ArrowRight size={18} />
            </Link>
          </div>
        )}
        {categories.length > 0 && (
          <div className="collection-paths">
            <span>Follow your curiosity</span>
            {categories.map((category) => (
              <Link key={category.id} href={`/collections/${category.slug}`}>
                {plainText(category.name)} <ArrowUpRight size={18} />
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
              Our story <ArrowUpRight size={19} />
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
            Read the journal <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
