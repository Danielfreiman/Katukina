import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { getProducts } from "@/lib/commerce/catalog";
import { ProductGrid } from "@/components/catalog/product-grid";
import { HomeCategoryStrip } from "@/components/catalog/home-category-strip";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { siteUrl } from "@/lib/config/site";
export const dynamic = "force-dynamic";
export default async function Home() {
  const bannerArtwork = async (side: string, search: string) => {
    const base = "images/home/collections-banner";
    for (const file of [`${side}.webp`, "background.webp"]) {
      if (existsSync(path.join(process.cwd(), "public", base, file))) {
        return { src: `/${base}/${file}`, product: false };
      }
    }
    const product = await getProducts({ search, per_page: 1 }).catch(() => null);
    return {
      src: product?.data[0]?.images[0]?.src || `/${base}/placeholder.svg`,
      product: true,
    };
  };
  const [kuripeArtwork, tepiArtwork] = await Promise.all([
    bannerArtwork("left", "kuripe"),
    bannerArtwork("right", "tepi"),
  ]);
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
      <section className="collections-banner" aria-labelledby="collections-banner-title">
        <img
          className="collections-banner-image"
          src={kuripeArtwork.src}
          data-product={kuripeArtwork.product}
          alt=""
          width={900}
          height={1100}
          loading="lazy"
        />
        <div className="collections-banner-layout">
          <div className="collections-banner-copy">
            <h2 id="collections-banner-title">Kuripe &amp; Tepi</h2>
            <p>
              Explore kuripes and tepis in a range of materials and designs.
            </p>
            <div className="collections-banner-actions">
              <Link className="button" href="/collections/kuripe-and-tepi?q=kuripe">
                Shop Kuripe
              </Link>
              <Link className="button" href="/collections/kuripe-and-tepi?q=tepi">
                Shop Tepi
              </Link>
            </div>
          </div>
        </div>
        <img
          className="collections-banner-image"
          src={tepiArtwork.src}
          data-product={tepiArtwork.product}
          alt=""
          width={900}
          height={1100}
          loading="lazy"
        />
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
