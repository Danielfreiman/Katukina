import Link from "next/link";
import {
  Leaf,
  Flame,
  Coffee,
  Flower2,
  Gift,
  Wind,
  Droplets,
  TreePine,
  BookOpen,
  Package,
  Truck,
  UserRound,
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
import {
  HomeCampaigns,
  HomeRail,
  HomeCollectionTabs,
  type HomeProduct,
} from "@/components/home/reference-widgets";
import "./reference-home.css";
import { CategoryCarousel } from "@/components/home/category-carousel";
export const dynamic = "force-dynamic";
const departments = [
  { slug: "rape", label: "Rapé", icon: Leaf },
  { slug: "sacred-incense", label: "Sacred Incense", icon: Flame },
  { slug: "beauty-and-body", label: "Beauty & Body", icon: Flower2 },
  { slug: "herbal-teas", label: "Herbal Teas", icon: Coffee },
  { slug: "giftshop", label: "Giftshop", icon: Gift },
  { slug: "shamanic-tools", label: "Shamanic Tools", icon: TreePine },
  { slug: "kuripe-and-tepi", label: "Kuripe & Tepi", icon: Wind },
  { slug: "aromatics", label: "Aromatics", icon: Droplets },
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
  };
}
async function products(query: Record<string, string | number>) {
  return getProducts({ per_page: 12, ...query })
    .then((result) => result.data.map(card))
    .catch(() => []);
}
function Guidance() {
  const items = [
    { icon: BookOpen, title: "Product details", href: "/shop" },
    { icon: Leaf, title: "Explore botanicals", href: "/collections" },
    { icon: Truck, title: "Shipping options", href: "/shipping" },
    { icon: UserRound, title: "Your account", href: "/account" },
  ];
  return (
    <section className="rh-guidance" aria-label="Shopping with Katukina">
      <div className="rh-wide rh-guidance-inner">
        <div>
          <h2>
            <Leaf size={23} />
            Shopping with Katukina
          </h2>
          <p>
            Discover the collection, check product details and plan your
            delivery. <Link href="/about">Learn more</Link>
          </p>
        </div>
        <div className="rh-guidance-cards">
          {items.map(({ icon: Icon, title, href }) => (
            <Link href={href} key={title}>
              <Icon size={29} strokeWidth={1.5} />
              <span>{title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
export default async function Home() {
  const categories = await getCategories().catch(() => []);
  const available = departments.filter((item) =>
    categories.some((category) => category.slug === item.slug),
  );
  const sale = categories.find(
    (category) => category.slug === "exclusive-sale",
  );
  const [offers, discoveries, newest, collections, articles] =
    await Promise.all([
      products(sale ? { category: sale.id } : { on_sale: "true" }),
      products({ orderby: "title", order: "asc" }),
      products({ orderby: "date", order: "desc" }),
      Promise.all(
        available.map(async (item) => ({
          slug: item.slug,
          name: item.label,
          products: await products({
            category: categories.find(
              (category) => category.slug === item.slug,
            )!.id,
            per_page: 18,
            orderby: "popularity",
            order: "desc",
          }),
        })),
      ),
      getArticles(1, 6)
        .then((result) => result.data)
        .catch(() => []),
    ]);
  const editorial = articles.map((article, index) => ({
    title: plainText(article.title.rendered),
    href: `/journal/${article.slug}`,
    image: [
      "/images/forest.jpg",
      "/images/palo-santo.jpg",
      "/images/bamboo.jpg",
    ][index % 3],
  }));
  const fallback = [
    { title: "Our story", href: "/about", image: "/images/forest.jpg" },
    {
      title: "Discover botanicals",
      href: "/collections",
      image: "/images/bamboo.jpg",
    },
    {
      title: "Explore incense",
      href: "/collections/sacred-incense",
      image: "/images/palo-santo.jpg",
    },
    {
      title: "Objects with meaning",
      href: "/collections/shamanic-tools",
      image: "/images/editorial/objects-with-meaning.webp",
    },
    { title: "A little discovery", href: "/shop", image: "/images/benzoe.jpg" },
    {
      title: "Find your next scent",
      href: "/collections/aromatics",
      image: "/images/editorial/incense-selection.webp",
    },
  ];
  const stories = [...editorial, ...fallback].slice(0, 6);
  return (
    <main id="content" className="reference-home">
      <h1 className="sr-only">
        Katukina — botanicals, incense and meaningful objects
      </h1>
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
      <div className="rh-wide rh-opening">
        <HomeCampaigns />
        <div className="rh-signin">
          <p>Make your Katukina experience more personal</p>
          <Link href="/account">Sign in or create an account</Link>
        </div>
      </div>
      <Guidance />
      <div className="rh-wide">
        <HomeRail
          title="Exclusive Sale"
          href={sale ? "/collections/exclusive-sale" : "/shop?sale=1"}
          products={offers}
        />
      </div>
      <section
        className="rh-categories rh-wide"
        aria-labelledby="rh-categories-title"
      >
        <h2 id="rh-categories-title">Shop by category</h2>
        <CategoryCarousel className="rh-category-circles" label="Main categories">
          {available.map(({ slug, label, icon: Icon }) => (
            <Link key={slug} href={`/collections/${slug}`}>
              <span>
                <Icon size={56} strokeWidth={1.5} />
              </span>
              {label}
            </Link>
          ))}
        </CategoryCarousel>
        <CategoryCarousel className="rh-category-chips" label="More categories">
          {categories
            .filter(
              (category) =>
                category.count > 0 &&
                !available.some((item) => item.slug === category.slug),
            )
            .slice(0, 18)
            .map((category) => (
              <Link href={`/collections/${category.slug}`} key={category.id}>
                {plainText(category.name)}
              </Link>
            ))}
        </CategoryCarousel>
      </section>
      <div className="rh-wide">
        <HomeRail
          title="Discover Katukina"
          href="/shop"
          products={discoveries}
        />
        <HomeCollectionTabs collections={collections} />
      </div>
      <section className="rh-story rh-wide" aria-labelledby="rh-story-title">
        <div className="rh-story-banner">
          <div className="rh-section-title">
            <h2 id="rh-story-title">
              <TreePine />
              Nature. Culture. Connection.
            </h2>
            <Link href="/about">Learn more</Link>
          </div>
          <p>
            Explore the materials, scents and objects that bring the Katukina
            collection together.
          </p>
          <div className="rh-story-features">
            {[
              {
                icon: Leaf,
                text: "Botanicals and natural materials",
                href: "/collections/rape",
              },
              {
                icon: Flame,
                text: "Incense and aromatic discoveries",
                href: "/collections/sacred-incense",
              },
              {
                icon: Package,
                text: "Product details and available sizes",
                href: "/shop",
              },
              {
                icon: BookOpen,
                text: "Stories, origins and inspiration",
                href: "/journal",
              },
            ].map(({ icon: Icon, text, href }) => (
              <Link href={href} key={text}>
                <Icon size={28} />
                {text}
              </Link>
            ))}
          </div>
        </div>
        <nav className="rh-story-circles" aria-label="Explore collections">
          {available.map(({ slug, label }) => (
            <Link href={`/collections/${slug}`} key={slug}>
              {label}
            </Link>
          ))}
        </nav>
      </section>
      <div className="rh-wide">
        <HomeRail
          title="New in the catalogue"
          href="/shop?sort=newest"
          products={newest}
        />
      </div>
      <section className="rh-discovery-band" aria-label="From the collection">
        <div className="rh-wide">
          <HomeRail title="From the collection" href="/shop">
            {discoveries.slice(0, 9).map((product) => (
              <article className="rh-discovery-card" key={product.id}>
                <p>
                  <Leaf size={17} />
                  {product.category}
                </p>
                <Link href={product.href}>
                  <img
                    src={product.image || "/images/brand/katukina-tree.svg"}
                    alt=""
                    width={140}
                    height={140}
                    loading="lazy"
                  />
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </Link>
              </article>
            ))}
          </HomeRail>
        </div>
      </section>
      <section className="rh-editorial rh-wide" aria-label="The journal">
        <div className="rh-editorial-grid">
          {stories.slice(0, 3).map((story) => (
            <Link key={story.href} href={story.href}>
              <img
                src={story.image}
                alt=""
                width={220}
                height={130}
                loading="lazy"
              />
              <span>{story.title}</span>
            </Link>
          ))}
          <Link href="/journal" className="rh-journal-tile">
            <span>Discover</span>
            <strong>The journal</strong>
          </Link>
          {stories.slice(3).map((story) => (
            <Link key={story.href} href={story.href}>
              <img
                src={story.image}
                alt=""
                width={220}
                height={130}
                loading="lazy"
              />
              <span>{story.title}</span>
            </Link>
          ))}
        </div>
        <Link className="rh-subscribe" href="/subscribe">
          <span>
            <small>KATUKINA / STAY CONNECTED</small>
            <strong>
              Discover stories, collection updates and new arrivals.
            </strong>
          </span>
          <span aria-hidden>+</span>
        </Link>
      </section>
      <Guidance />
    </main>
  );
}
