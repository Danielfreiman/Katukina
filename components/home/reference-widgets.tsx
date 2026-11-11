"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";

export type HomeProduct = {
  id: number;
  name: string;
  href: string;
  image: string | null;
  price: string;
  regular: string | null;
  inStock: boolean;
  rating: number;
  reviews: number;
  category: string;
};
export function HomeCard({ product }: { product: HomeProduct }) {
  return (
    <article className="rh-product" data-product-id={product.id}>
      <Link
        className="rh-product-photo"
        href={product.href}
        aria-label={product.name}
      >
        {product.image ? (
          <img
            src={product.image}
            alt=""
            width={240}
            height={200}
            loading="lazy"
          />
        ) : (
          <span>Image unavailable</span>
        )}
        <span className="rh-product-action">View product</span>
      </Link>
      <Link className="rh-product-name" href={product.href}>
        {product.name}
      </Link>
      {product.reviews > 0 && (
        <div
          className="rh-rating"
          aria-label={`${product.rating} out of 5, ${product.reviews} reviews`}
        >
          <Star size={15} aria-hidden />
          {product.rating.toFixed(1)} <span>({product.reviews})</span>
        </div>
      )}
      <p className="rh-product-price">
        {product.price}
        {product.regular && <del>{product.regular}</del>}
      </p>
      <small className="rh-stock">
        {product.inStock ? "In stock" : "Out of stock"}
      </small>
    </article>
  );
}
export function HomeRail({
  title,
  href,
  products,
  children,
}: {
  title: string;
  href?: string;
  products?: HomeProduct[];
  children?: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const update = () => {
    const el = track.current;
    if (el)
      setEdges({
        start: el.scrollLeft < 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
  };
  useEffect(() => {
    const observer = new ResizeObserver(update);
    if (track.current) observer.observe(track.current);
    update();
    return () => observer.disconnect();
  }, [products]);
  const move = (direction: number) =>
    track.current?.scrollBy({
      left: direction * track.current.clientWidth,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section className="rh-rail" aria-label={title}>
      <div className="rh-section-title">
        <h2>{title}</h2>
        {href && <Link href={href}>View all</Link>}
      </div>
      <div className="rh-rail-body">
        <button
          className="rh-arrow rh-prev"
          aria-label={`Previous ${title}`}
          disabled={edges.start}
          onClick={() => move(-1)}
        >
          <ChevronLeft size={20} />
        </button>
        <div ref={track} className="rh-product-track" onScroll={update}>
          {children ??
            products?.map((product) => (
              <HomeCard key={product.id} product={product} />
            ))}
        </div>
        <button
          className="rh-arrow rh-next"
          aria-label={`Next ${title}`}
          disabled={edges.end}
          onClick={() => move(1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {products?.length === 0 && (
        <p className="rh-empty">
          This collection is currently unavailable.{" "}
          <Link href="/shop">Browse all products</Link>
        </p>
      )}
    </section>
  );
}
const campaigns = [
  {
    title: "Discover your natural rhythm",
    text: "Botanicals, incense and meaningful objects",
    href: "/shop",
    cta: "Shop now",
    image: "/images/home/banners/discover-katukina.webp",
  },
  {
    title: "Explore Tepi & Kuripe",
    text: "Discover our collection of applicators",
    href: "/collections/kuripe-and-tepi",
    cta: "Shop Tepi & Kuripe",
    image: "/images/home/banners/tepi-kuripe.webp",
  },
  {
    title: "Explore Sacred Incense",
    text: "Find your next scent and discover the collection",
    href: "/collections/sacred-incense",
    cta: "Shop incense",
    image: "/images/home/banners/sacred-incense.webp",
  },
];
export function HomeCampaigns() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (motion.matches) setPaused(true);
    };
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || hovered) return;
    const timer = setInterval(() => {
      if (!document.hidden)
        setActive((index) => (index + 1) % campaigns.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [paused, hovered]);
  return (
    <section
      className="rh-campaigns"
      aria-label="Katukina highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <div className="rh-campaign-pair">
        {[0, 1].map((offset) => {
          const campaign = campaigns[(active + offset) % campaigns.length];
          return (
            <article className="rh-campaign" key={offset}>
              <img
                src={campaign.image}
                alt=""
                width={680}
                height={510}
                fetchPriority={offset === 0 ? "high" : undefined}
              />
              <div>
                <h2>{campaign.title}</h2>
                <p>{campaign.text}</p>
              </div>
              <Link className="button primary rh-campaign-cta" href={campaign.href}>
                {campaign.cta}
              </Link>
            </article>
          );
        })}
      </div>
      <button
        className="rh-arrow rh-prev"
        aria-label="Previous campaign"
        onClick={() =>
          setActive(
            (index) => (index + campaigns.length - 1) % campaigns.length,
          )
        }
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="rh-arrow rh-next"
        aria-label="Next campaign"
        onClick={() => setActive((index) => (index + 1) % campaigns.length)}
      >
        <ChevronRight size={20} />
      </button>
      <div className="rh-campaign-counter">
        <button
          aria-label={paused ? "Play campaigns" : "Pause campaigns"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
        <span aria-live="off">
          {active + 1} / {campaigns.length}
        </span>
      </div>
    </section>
  );
}
export function HomeCollectionTabs({
  collections,
}: {
  collections: { name: string; slug: string; products: HomeProduct[] }[];
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const collection = collections[active];
  if (!collection) return null;
  return (
    <section className="rh-tabbed" aria-labelledby="rh-tabbed-title">
      <div className="rh-section-title">
        <h2 id="rh-tabbed-title">Shop by collection</h2>
        <Link href={`/collections/${collection.slug}`}>
          View all {collection.name}
        </Link>
      </div>
      <div
        className="rh-tabs"
        role="tablist"
        aria-label="Product collections"
        onKeyDown={(event) => {
          let next = active;
          if (event.key === "ArrowRight")
            next = (active + 1) % collections.length;
          else if (event.key === "ArrowLeft")
            next = (active + collections.length - 1) % collections.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = collections.length - 1;
          else return;
          event.preventDefault();
          setActive(next);
          tabRefs.current[next]?.focus();
        }}
      >
        {collections.map((item, index) => (
          <button
            key={item.slug}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`rh-tab-${item.slug}`}
            role="tab"
            aria-controls={`rh-panel-${item.slug}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      {collections.map((item, index) => (
        <div
          key={item.slug}
          id={`rh-panel-${item.slug}`}
          role="tabpanel"
          aria-labelledby={`rh-tab-${item.slug}`}
          hidden={index !== active}
          className="rh-tab-products"
        >
          {item.products.map((product) => (
            <HomeCard key={product.id} product={product} />
          ))}
          {!item.products.length && (
            <p>
              No products available in this collection.{" "}
              <Link href={`/collections/${item.slug}`}>View collection</Link>
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
