import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  Leaf,
  Flame,
  BookOpen,
  Package,
  Globe2,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { getCategories, getProducts } from "@/lib/commerce/catalog";
import {
  productName,
  productPrice,
  formatPrice,
  type Product,
} from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";
import { getArticles } from "@/lib/wordpress/content";
import { siteUrl } from "@/lib/config/site";
import { getHomePromotionCards } from "@/lib/home-promotion-media";
import { getHomeHeroSlides } from "@/lib/home-hero-media";
import { HomeHeroSlider } from "@/components/home/hero-slider";
import { CategoryCarousel } from "@/components/home/category-carousel";
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
}: {
  title: string;
  text: string;
  product?: HomeProduct;
  href: string;
  tone: string;
  tall?: boolean;
}) {
  return (
    <article
      className={`mh-campaign mh-${tone}${tall ? " mh-campaign-tall" : ""}`}
    >
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        {product && (
          <strong className="mh-campaign-price">{product.price}</strong>
        )}
        <Link className="mh-button" href={href}>
          Shop now
        </Link>
      </div>
      {product?.image && (
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
    articles,
    incense,
    promotionCards,
    heroSlides,
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
    getArticles(1, 4)
      .then((result) => result.data)
      .catch(() => []),
    products({ search: "Palo Santo", per_page: 3 }),
    getHomePromotionCards(),
    getHomeHeroSlides(),
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
  const find = (slug: string) =>
    collections.find((collection) => collection.slug === slug)?.products[0];
  const main =
    incense.find((item) => item.image) || find("sacred-incense") || featured[0];
  const tea = find("herbal-teas");
  const tools =
    collections
      .find((collection) => collection.slug === "kuripe-and-tepi")
      ?.products.find((product) => /kuripe|tepi/i.test(product.name)) ||
    find("kuripe-and-tepi") ||
    find("shamanic-tools");
  const beauty = find("beauty-and-body") || find("aromatics");
  const stories = [
    ...articles
      .filter((article) => article.slug !== "hello-world")
      .map((article, index) => ({
        title: plainText(article.title.rendered),
        href: `/journal/${article.slug}`,
        image: [
          "/images/forest.jpg",
          "/images/palo-santo.jpg",
          "/images/bamboo.jpg",
          "/images/editorial/objects-with-meaning.webp",
        ][index % 4],
        text: plainText(article.excerpt.rendered).slice(0, 135),
      })),
    {
      title: "Nature. Culture. Connection.",
      href: "/about",
      image: "/images/forest.jpg",
      text: "Discover the story behind the Katukina collection.",
    },
    {
      title: "A world of scent",
      href: "/collections/sacred-incense",
      image: "/images/palo-santo.jpg",
      text: "Explore our collection of woods, resins and incense.",
    },
    {
      title: "Discover botanicals",
      href: "/collections",
      image: "/images/bamboo.jpg",
      text: "Find your way through botanicals and natural materials.",
    },
    {
      title: "Objects with meaning",
      href: "/collections/shamanic-tools",
      image: "/images/editorial/objects-with-meaning.webp",
      text: "Take a closer look at the objects in our collection.",
    },
  ];
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
                  className="mh-button mh-button-primary"
                  href="/collections/sananga"
                >
                  Discover the Collection
                </Link>
              </div>
            </div>
          ),
          "02": (
            <div className="mh-wrap mh-hero-inner">
              <div className="mh-hero-copy">
                <h1 id="mh-hero-title">
                  Authentic Brazilian
                  <br />
                  <em className="mh-hero-rape-title">Rapé</em>
                </h1>
                <p>
                  Grounding blends sourced from the heart of the Amazon. Browse
                  our signature varieties and find the right size for your journey.
                </p>
                <Link
                  className="mh-button mh-button-primary"
                  href="/collections/rape"
                >
                  Shop Blends
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
            <Link className="mh-button mh-button-primary" href="/shop">
              Explore the collection
            </Link>
          </div>
        </div>
      </HomeHeroSlider>
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
      <div className="mh-discovery-strip">
        <div className="mh-wrap">
          <span>
            <Leaf />
            Botanicals & natural materials
          </span>
          <span>
            <Flame />
            Discover your next scent
          </span>
          <span>
            <BookOpen />
            Stories, origins & inspiration
          </span>
        </div>
      </div>
      <div className="mh-wrap">
        <HomeRail
          title="Featured products"
          href="/shop"
          products={featured.slice(0, 12)}
        />
      </div>
      <section className="mh-wrap mh-categories" aria-label="Shop by category">
        <SectionTitle title="Shop by category" href="/collections" />
        <CategoryCarousel className="mh-category-grid" label="Product categories">
          {categoryCards.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
            >
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
            </Link>
          ))}
        </CategoryCarousel>
      </section>
      <div className="mh-wrap">
        <Link
          className="mh-banner mh-banner-incense"
          href="/collections/sacred-incense"
        >
          {existsSync(path.join(process.cwd(), "public/images/home/ritual-banner/background.webp")) && (
            <picture className="mh-ritual-art" aria-hidden="true">
              {existsSync(path.join(process.cwd(), "public/images/home/ritual-banner/background-mobile.webp")) && (
                <source media="(max-width: 640px)" srcSet="/images/home/ritual-banner/background-mobile.webp" />
              )}
              <img src="/images/home/ritual-banner/background.webp" alt="" width={2400} height={560} loading="lazy" />
            </picture>
          )}
          <div className="mh-ritual-content">
            <h2>Make room for a little ritual.</h2>
            <p>Explore sacred woods, resins and aromatic discoveries.</p>
            <span className="mh-button mh-button-primary">Explore incense</span>
          </div>
        </Link>
      </div>
      <section
        className="mh-wrap mh-discover-layout"
        aria-label="Discover the collection"
      >
        <Campaign
          title="The art of slowing down"
          text="Find your next favourite tea."
          product={tea}
          href="/collections/herbal-teas"
          tone="forest"
          tall
        />
        <div className="mh-discover-products">
          <SectionTitle title="Discover the collection" href="/shop" />
          <div className="mh-small-grid">
            {featured.slice(0, 6).map((product) => (
              <SmallProduct key={product.id} product={product} />
            ))}
          </div>
        </div>
        <div className="mh-stacked-campaigns">
          <Campaign
            title="Naturally you"
            text="Beauty & body"
            product={beauty}
            href="/collections/beauty-and-body"
            tone="linen"
          />
          <Campaign
            title="Objects with a story"
            text="Explore shamanic tools"
            product={find("shamanic-tools")}
            href="/collections/shamanic-tools"
            tone="sage"
          />
        </div>
      </section>
      <section className="mh-wrap mh-arrivals-layout" aria-label="New arrivals">
        <div>
          <SectionTitle title="New in the catalogue" href="/shop?sort=newest" />
          <div className="mh-arrivals-grid">
            {newest.slice(0, 7).map((product) => (
              <HomeCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <aside className="mh-edit">
          <SectionTitle title="More to explore" href="/shop" />
          {featured.slice(6, 10).map((product) => (
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
      <div className="mh-wrap">
        <HomeCollectionTabs collections={collections} />
      </div>
      <div className="mh-wrap">
        <Link
          className="mh-banner mh-banner-body"
          href="/collections/beauty-and-body"
        >
          <div>
            <h2>A little nature. Every day.</h2>
            <p>Discover the Beauty & Body collection.</p>
          </div>
          <span className="mh-button mh-button-primary">
            Shop the collection
          </span>
          {beauty?.image && (
            <img
              src={beauty.image}
              alt=""
              width={250}
              height={220}
              loading="lazy"
            />
          )}
        </Link>
      </div>
      <section className="mh-journal" aria-label="The Katukina journal">
        <div className="mh-wrap">
          <SectionTitle
            title="Stories & inspiration"
            href="/journal"
            link="The journal"
          />
          <div className="mh-journal-grid">
            {stories.slice(0, 4).map((story) => (
              <article key={story.href}>
                <Link href={story.href}>
                  <img
                    src={story.image}
                    alt=""
                    width={400}
                    height={260}
                    loading="lazy"
                  />
                  <div>
                    <h3>{story.title}</h3>
                    <p>{story.text}</p>
                    <span>
                      {story.href.startsWith("/collections")
                        ? "Explore the collection"
                        : "Read the story"}
                      <ChevronRight size={15} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <nav className="mh-wrap mh-service-strip" aria-label="Shopping guidance">
        {[
          {
            icon: Globe2,
            title: "Shipping & destinations",
            text: "Check delivery options",
            href: "/shipping",
          },
          {
            icon: Package,
            title: "Find your presentation",
            text: "Explore available sizes",
            href: "/shop",
          },
          {
            icon: Leaf,
            title: "Explore the collection",
            text: "Botanicals, incense & objects",
            href: "/collections",
          },
          {
            icon: Headphones,
            title: "Your account",
            text: "Orders and account details",
            href: "/account",
          },
        ].map(({ icon: Icon, title, text, href }) => (
          <Link key={title} href={href}>
            <Icon size={36} strokeWidth={1.3} />
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
