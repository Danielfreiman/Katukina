import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  Leaf,
  Truck,
  Package,
  Globe2,
  ChevronRight,
} from "lucide-react";
import { getCategories, getProduct, getProducts } from "@/lib/commerce/catalog";
import {
  productName,
  productPrice,
  formatPrice,
  type Product,
} from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";
import { siteUrl } from "@/lib/config/site";
import { getHomePromotionCards } from "@/lib/home-promotion-media";
import { getHomeHeroSlides } from "@/lib/home-hero-media";
import { HomeHeroSlider } from "@/components/home/hero-slider";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { ConexaoAncestral } from "@/components/home/conexao-ancestral";
import { ServiceStrip } from "@/components/home/service-strip";
import {
  HomeRail,
  HomeCard,
  HomeCollectionTabs,
  type HomeProduct,
} from "@/components/home/reference-widgets";
import "./modern-home.css";

export const dynamic = "force-dynamic";
const departments = [
  { slug: "rape", label: "Rapé" },
  { slug: "sacred-incense", label: "Sacred Incense" },
  { slug: "beauty-and-body", label: "Beauty & Body" },
  { slug: "herbal-teas", label: "Herbal Teas" },
  { slug: "giftshop", label: "Giftshop" },
  { slug: "shamanic-tools", label: "Shamanic Tools" },
  { slug: "kuripe-and-tepi", label: "Kuripe & Tepi" },
  { slug: "aromatics", label: "Aromatics" },
];
function card(product: Product): HomeProduct {
  return {
    id: product.id,
    name: productName(product),
    href: `/products/${product.slug}`,
    image: product.images[0]?.src || null,
    price: productPrice(product) || "View details",
    regular:
      product.type === "simple" &&
      product.on_sale &&
      product.prices.regular_price &&
      Number(product.prices.regular_price) > Number(product.prices.price)
        ? formatPrice(
            product.prices.regular_price,
            product.prices.currency_code,
            product.prices.currency_minor_unit,
          )
        : null,
    inStock: product.is_in_stock,
    rating: Number(product.average_rating) || 0,
    reviews: product.review_count || 0,
    category: plainText(product.categories[0]?.name || "Katukina"),
    sku: product.sku,
    summary: plainText(product.short_description).replace(/\s+/g, " ").trim(),
    variable: product.type === "variable",
    optionCount: product.variations?.length || 0,
    onSale: !!product.on_sale,
    backorder: !!product.is_on_backorder,
  };
}
async function products(query: Record<string, string | number>) {
  return getProducts({ per_page: 12, ...query })
    .then((result) => result.data.map(card))
    .catch(() => []);
}
function SectionTitle({
  title,
  href,
  link = "See more",
}: {
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="rh-section-title">
      <h2>{title}</h2>
      <span className="rh-title-rule" aria-hidden />
      {href && (
        <Link href={href}>
          {link}
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
function SmallProduct({ product }: { product: HomeProduct }) {
  return (
    <Link
      className="mh-small-product"
      href={product.href}
      data-product-id={product.id}
    >
      <div>
        {product.image ? (
          <img
            src={product.image}
            alt=""
            width={150}
            height={150}
            loading="lazy"
          />
        ) : (
          <Package size={30} />
        )}
      </div>
      <span>
        <small>{product.category}</small>
        <strong>{product.name}</strong>
        <b>{product.price}</b>
        {!product.inStock && <small>Out of stock</small>}
      </span>
    </Link>
  );
}
function Campaign({
  title,
  text,
  product,
  href,
  tone,
  tall = false,
  showPrice = true,
  cta = "Shop now",
  artwork,
  background,
}: {
  title: string;
  text: string;
  product?: HomeProduct;
  href: string;
  tone: string;
  tall?: boolean;
  showPrice?: boolean;
  cta?: string;
  artwork?: string;
  background?: string;
}) {
  return (
    <article
      className={`mh-campaign mh-${tone}${tall ? " mh-campaign-tall" : ""}`}
      data-has-artwork={Boolean(artwork)}
      style={background && existsSync(path.join(process.cwd(), "public", background))
        ? { backgroundImage: `url("${background}")` }
        : undefined}
    >
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        {showPrice && product && (
          <strong className="mh-campaign-price">{product.price}</strong>
        )}
        <Link className="mh-button" href={href}>
          {cta}
        </Link>
      </div>
      {artwork ? (
        <img className="mh-campaign-artwork" src={artwork} alt="" width={1000} height={1500} loading="lazy" />
      ) : product?.image && (
        <img
          src={product.image}
          alt={product.name}
          width={420}
          height={420}
          loading="lazy"
        />
      )}
    </article>
  );
}
export default async function Home() {
  const categories = await getCategories().catch(() => []);
  const available = departments.filter((item) =>
    categories.some(
      (category) => category.slug === item.slug && category.count > 0,
    ),
  );
  const sale = categories.find(
    (category) => category.slug === "exclusive-sale",
  );
  const [
    offers,
    newest,
    collections,
    incense,
    promotionCards,
    heroSlides,
    campaignProducts,
  ] = await Promise.all([
    products(sale ? { category: sale.id } : { on_sale: "true" }),
    products({ orderby: "date", order: "desc" }),
    Promise.all(
      available.map(async (item) => ({
        slug: item.slug,
        name: item.label,
        count: categories.find((category) => category.slug === item.slug)!
          .count,
        products: await products({
          category: categories.find((category) => category.slug === item.slug)!
            .id,
          orderby: "popularity",
          order: "desc",
        }),
      })),
    ),
    products({ search: "Palo Santo", per_page: 3 }),
    getHomePromotionCards(),
    getHomeHeroSlides(),
    Promise.all([
      getProduct("urucum-coconut-creme").catch(() => null),
      getProduct("yerba-santa-smudge-bundle").catch(() => null),
    ]),
  ]);
  const selection = Array.from(
    new Map(
      collections
        .flatMap((collection) => collection.products.slice(0, 2))
        .map((product) => [product.id, product]),
    ).values(),
  );
  const categoryCards = [
    ...collections,
    ...await Promise.all(categories
      .filter((category) => category.slug !== "uncategorized" && !collections.some((collection) => collection.slug === category.slug))
      .map(async (category) => ({
        slug: category.slug,
        name: plainText(category.name),
        count: category.count,
        products: category.image?.src
          ? [{ image: category.image.src }]
          : await products({ category: category.id, per_page: 1 }),
      }))),
  ];
  const featured = selection.length ? selection : newest;
  const featuredIds = new Set(featured.slice(0, 12).map((product) => product.id));
  const discoveryCollections = collections
    .map((collection) => ({
      ...collection,
      products: collection.products.filter((product) => !featuredIds.has(product.id)),
    }))
    .filter((collection) => collection.products.length > 0);
  const discovery = discoveryCollections[Math.floor(Math.random() * discoveryCollections.length)];
  const find = (slug: string) =>
    collections.find((collection) => collection.slug === slug)?.products[0];
  const main =
    incense.find((item) => item.image) || find("sacred-incense") || featured[0];
  const essentialOilsCategory = categories.find((category) => category.slug === "essential-oils");
  const essentialOil = essentialOilsCategory
    ? (await products({ category: essentialOilsCategory.id, per_page: 1 }))[0]
    : undefined;
  const tools =
    collections
      .find((collection) => collection.slug === "kuripe-and-tepi")
      ?.products.find((product) => /kuripe|tepi/i.test(product.name)) ||
    find("kuripe-and-tepi") ||
    find("shamanic-tools");
  const beautyDesktop = existsSync(path.join(process.cwd(), "public/images/home/beauty-body-banner/beauty-body-desktop.webp"));
  const beautyMobile = existsSync(path.join(process.cwd(), "public/images/home/beauty-body-banner/beauty-body-mobile.webp"));
  const productCampaigns = campaignProducts.flatMap((product, index) =>
    product ? [{
      product: {
        ...card(product),
        ...(product.slug === "yerba-santa-smudge-bundle"
          ? { image: "/images/home/product-cutouts/yerba-santa.webp" }
          : {}),
      },
      text: index === 0
        ? "Urucum and coconut in a body care creme."
        : "A botanical bundle for your incense collection.",
      tone: index === 0 ? "linen" : "sage",
      background: `/images/home/product-card-backgrounds/${product.slug}.webp`,
    }] : [],
  );
  const giftshopDesktop = existsSync(path.join(process.cwd(), "public/images/home/giftshop-banner/giftshop-desktop.webp"))
    ? "/images/home/giftshop-banner/giftshop-desktop.webp" : null;
  const giftshopMobile = existsSync(path.join(process.cwd(), "public/images/home/giftshop-banner/giftshop-mobile.webp"))
    ? "/images/home/giftshop-banner/giftshop-mobile.webp" : null;
  return (
    <main id="content" className="modern-home">
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
      <HomeHeroSlider
        slides={heroSlides}
        contentBySlide={{
          "03": (
            <div className="mh-wrap mh-hero-inner">
              <div className="mh-hero-copy">
                <h1 id="mh-hero-title">
                  The Spirit of
                  <br />
                  <em className="mh-hero-sananga-title">Sananga</em>
                </h1>
                <p>
                  Rooted in Amazonian tradition. Discover our pure Katukina and
                  Matses extracts, crafted for clarity, focus, and deep connection.
                </p>
                <Link
                  className="mh-cta-lift"
                  href="/collections/sananga"
                >
                  <span className="mh-button mh-button-primary">Discover the Collection</span>
                </Link>
              </div>
            </div>
          ),
          "02": (
            <div className="mh-wrap mh-hero-inner">
              <div className="mh-hero-copy">
                <h1 id="mh-hero-title">
                  Authentic
                  <br />
                  <span className="mh-hero-rape-title">Brazilian&nbsp;<em>Rapé</em></span>
                </h1>
                <p>
                  Grounding blends sourced from the heart of the Amazon. Browse
                  our signature varieties and find the right size for your journey.
                </p>
                <Link
                  className="mh-cta-lift"
                  href="/collections/rape"
                >
                  <span className="mh-button mh-button-primary">Shop Blends</span>
                </Link>
              </div>
            </div>
          ),
        }}
      >
        <div className="mh-wrap mh-hero-inner">
          <div className="mh-hero-copy">
            <h1 id="mh-hero-title">
              Find your
              <br />
              <em>natural rhythm.</em>
            </h1>
            <p>
              Botanicals, incense and meaningful objects.
              <br />A world of discoveries, rooted in nature.
            </p>
            <Link className="mh-cta-lift" href="/shop">
              <span className="mh-button mh-button-primary">Explore the collection</span>
            </Link>
          </div>
        </div>
      </HomeHeroSlider>
      <nav className="mh-discovery-strip" aria-label="Explore Katukina">
        <div className="mh-discovery-window">
          <div className="mh-discovery-track">
            {[false, true].map((copy) => (
              <div className="mh-discovery-group" key={String(copy)} aria-hidden={copy || undefined}>
                <Link href="/shop" tabIndex={copy ? -1 : undefined}>
                  <Leaf aria-hidden="true" /> Selected with care for quality
                </Link>
                <Link href="/collections" tabIndex={copy ? -1 : undefined}>
                  <Globe2 aria-hidden="true" /> Sourced from around the world
                </Link>
                <Link href="/about" tabIndex={copy ? -1 : undefined}>
                  <Leaf aria-hidden="true" /> Rooted in Amazonian traditions
                </Link>
                <Link href="/shipping" tabIndex={copy ? -1 : undefined}>
                  <Truck aria-hidden="true" /> Fast shipping options by destination
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>
      <section className="mh-wrap mh-categories" aria-label="Shop by category">
        <SectionTitle title="Shop by category" href="/collections" link="View all categories" />
        <CategoryCarousel className="mh-category-grid" label="Product categories">
          {categoryCards.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
            >
              <span className="mh-category-card">
                <span className="mh-category-image">
                  {(
                    collection.slug === "kuripe-and-tepi"
                      ? tools?.image
                      : collection.products[0]?.image
                  ) ? (
                    <img
                      src={
                        (collection.slug === "kuripe-and-tepi"
                          ? tools?.image
                          : collection.products[0]?.image)!
                      }
                      alt=""
                      width={130}
                      height={130}
                      loading="lazy"
                    />
                  ) : (
                    <Leaf size={36} />
                  )}
                </span>
                <strong>{collection.name}</strong>
                <small>{collection.count} {collection.count === 1 ? "product" : "products"}</small>
              </span>
            </Link>
          ))}
        </CategoryCarousel>
      </section>
      <div className="mh-wrap mh-promotions">
        {promotionCards.map((card) => (
          <Link
            key={card.slug}
            href={card.href}
            className="mh-promotion-card"
            data-has-image={Boolean(card.image)}
            style={
              card.image
                ? { backgroundImage: `url("${card.image}")` }
                : undefined
            }
          >
            <div className="mh-promotion-copy">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </div>
            <span className="mh-button">Shop collection</span>
          </Link>
        ))}
      </div>
      <div className="mh-wrap">
        <HomeRail
          title="Featured products"
          href="/shop"
          products={featured.slice(0, 12)}
        />
      </div>
      <div className="mh-wrap">
        <Link
          className="mh-banner mh-banner-incense mh-banner-artwork-layout"
          href="/collections/sacred-incense"
        >
          {existsSync(path.join(process.cwd(), "public/images/home/ritual-banner/ritual-incense-desktop.webp")) && (
            <picture className="mh-ritual-art" aria-hidden="true">
              {existsSync(path.join(process.cwd(), "public/images/home/ritual-banner/ritual-incense-mobile.webp")) && (
                <source media="(max-width: 640px)" srcSet="/images/home/ritual-banner/ritual-incense-mobile.webp" />
              )}
              <img src="/images/home/ritual-banner/ritual-incense-desktop.webp" alt="" width={2400} height={560} loading="lazy" />
            </picture>
          )}
          <div className="mh-ritual-content">
            <h2>Make room for a little ritual.</h2>
            <p>Explore sacred woods, resins and aromatic discoveries.</p>
            <span className="mh-cta-lift">
              <span className="mh-button mh-button-primary">Explore incense</span>
            </span>
          </div>
        </Link>
      </div>
      <section
        className="mh-wrap mh-discover-layout"
        aria-label="Discover the collection"
      >
        <Campaign
          title="Essential oils"
          text="Explore botanical aromas and find a new favourite scent for your everyday rituals."
          showPrice={false}
          cta="Essential oils"
          artwork="/images/home/essential-oils-banner/essential-oils.webp"
          product={essentialOil}
          href="/collections/essential-oils"
          tone="forest"
          tall
        />
        <div className="mh-discover-products">
          <SectionTitle
            title={discovery ? `Discover ${discovery.name}` : "Discover the collection"}
            href={discovery ? `/collections/${discovery.slug}` : "/collections"}
            link={discovery ? "View collection" : "View categories"}
          />
          <div className="mh-small-grid">
            {discovery?.products.slice(0, 6).map((product) => (
              <SmallProduct key={product.id} product={product} />
            ))}
          </div>
        </div>
        <div className="mh-stacked-campaigns">
          {productCampaigns.map(({ product, text, tone, background }) => (
            <Campaign
              key={product.id}
              title={product.name}
              text={text}
              product={product}
              href={product.href}
              tone={tone}
              cta="View product"
              background={background}
            />
          ))}
        </div>
      </section>
      <section className="mh-wrap mh-arrivals-layout" aria-label="New arrivals">
        <div>
          <SectionTitle title="New in the catalogue" href="/shop?sort=newest" />
          <div className="mh-arrivals-grid">
            <Link className="mh-giftshop-banner" href="/collections/giftshop" data-portrait-fallback={Boolean(giftshopDesktop && !giftshopMobile)}>
              {(giftshopDesktop || giftshopMobile) && (
                <picture className="mh-giftshop-art" aria-hidden="true">
                  {giftshopMobile && <source media="(max-width: 800px)" srcSet={giftshopMobile} />}
                  <img src={(giftshopDesktop || giftshopMobile)!} alt="" width={1000} height={2000} loading="lazy" />
                </picture>
              )}
              <div className="mh-giftshop-copy">
                <h3>Giftshop</h3>
                <p>Shells, incense accessories and meaningful gifts for everyday rituals, special occasions and people you care about.</p>
              </div>
              <span className="mh-button">Giftshop</span>
            </Link>
            {newest.slice(0, 6).map((product) => (
              <HomeCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <aside className="mh-edit">
          <SectionTitle title="More new arrivals" href="/shop?sort=newest" />
          {newest.slice(6, 12).map((product) => (
            <SmallProduct key={product.id} product={product} />
          ))}
        </aside>
      </section>
      {offers.length > 0 && (
        <div className="mh-wrap">
          <HomeRail
            title="Exclusive Sale"
            href={sale ? "/collections/exclusive-sale" : "/shop?sale=1"}
            products={offers}
          />
        </div>
      )}
      {collections.length > 0 && (
        <div className="mh-wrap">
          <HomeCollectionTabs collections={collections} />
        </div>
      )}
      <div className="mh-wrap">
        <Link
          className="mh-banner mh-banner-body mh-banner-artwork-layout"
          href="/collections/beauty-and-body"
        >
          {(beautyDesktop || beautyMobile) && (
            <picture className="mh-ritual-art" aria-hidden="true">
              {beautyMobile && <source media="(max-width: 640px)" srcSet="/images/home/beauty-body-banner/beauty-body-mobile.webp" />}
              <img src={`/images/home/beauty-body-banner/beauty-body-${beautyDesktop ? "desktop" : "mobile"}.webp`} alt="" width={2400} height={560} loading="lazy" />
            </picture>
          )}
          <div className="mh-ritual-content">
            <h2>A little nature. Every day.</h2>
            <p>Botanical care for <span className="mh-body-copy-ending">your everyday rituals.</span></p>
            <span className="mh-button">
              Shop the collection
            </span>
          </div>
        </Link>
      </div>
      <ConexaoAncestral />
      <ServiceStrip />
    </main>
  );
}
