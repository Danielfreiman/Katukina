import Link from "next/link";
import { getProducts } from "@/lib/commerce/catalog";
import { ProductGrid } from "@/components/catalog/product-grid";
import { HomeCategoryStrip } from "@/components/catalog/home-category-strip";
import { BrandMark } from "@/components/site/brand-mark";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { siteUrl } from "@/lib/config/site";
export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await getProducts({ per_page: 8 }).catch((error: unknown) => {
    console.warn(
      "Catalogue temporarily unavailable:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  });
  return (
    <main id="content" className="home-page">
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
      <HeroCarousel labels={["Discover Katukina", "Explore Rapé", "Explore incense"]} slides={[
      <section key="katukina" className="hero hero-campaign" aria-labelledby="hero-title">
        <picture>
          <source media="(max-width: 600px)" srcSet="/images/home/hero-01/mobile.webp" />
        <img
          className="hero-campaign-image"
          src="/images/home/hero-01/desktop.webp"
          alt=""
          width={2400}
          height={1500}
          fetchPriority="high"
        />
        </picture>
        <div className="shell hero-campaign-layout">
          <div className="hero-copy">
            <h1 id="hero-title">
              Tribal Rapé, Mapacho, Kambo, Sananga,{" "}
              <span>Shamanic Tools &amp; Incenses</span>
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
          </div>
        </div>
      </section>,
      <section key="rape" className="hero hero-campaign hero-campaign-dark" aria-labelledby="hero-rape-title">
        <picture>
          <source media="(max-width: 600px)" srcSet="/images/home/hero-02/mobile.webp" />
        <img
          className="hero-campaign-image"
          src="/images/home/hero-02/desktop.webp"
          alt=""
          width={2400}
          height={1500}
          loading="eager"
        />
        </picture>
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
          </div>
        </div>
      </section>,
      <section key="incense" className="hero hero-campaign hero-campaign-dark hero-campaign-incense" aria-labelledby="hero-incense-title">
        <picture>
          <source media="(max-width: 600px)" srcSet="/images/home/hero-03/mobile.webp" />
          <img
            className="hero-campaign-image"
            src="/images/home/hero-03/desktop.webp"
            alt=""
            width={2400}
            height={1500}
            loading="eager"
          />
        </picture>
        <div className="shell hero-campaign-layout">
          <div className="hero-copy">
            <h2 id="hero-incense-title">
              Sticks, herbs &amp; resins.<br />
              <span>Create your ritual.</span>
            </h2>
            <p className="hero-description">
              Explore incense sticks, herbs and resins, with burners and holders
              to complete your ritual.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/collections/sacred-incense">
                Explore incense
              </Link>
              <Link className="button secondary" href="/collections/tools?q=incense">
                Incense accessories
              </Link>
            </div>
          </div>
        </div>
      </section>
      ]} />
      <div className="home-collection-background">
      <section className="section shell home-collection" id="collection">
        <div className="collection-intro">
          <h2>Explore the <span>collection.</span></h2>
          <p>
            A fresh perspective on incense, botanicals and the objects we
            surround ourselves with.
          </p>
          <Link className="text-link" href="/shop">
            Shop all products
          </Link>
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
        <HomeCategoryStrip />
      </section>
      </div>
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
      <div className="home-journal-background">
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
      </div>
    </main>
  );
}
