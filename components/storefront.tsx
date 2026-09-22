"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  ShoppingBag,
  Menu,
  X,
  Plus,
  Minus,
  Leaf,
  Globe2,
  BookOpen,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { products, faqs } from "@/lib/content";
const money = (n: number) =>
  n.toLocaleString("en-GB", { style: "currency", currency: "EUR" });
export default function Storefront() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("katukina-bag") || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved))
        setCart(
          Object.fromEntries(
            Object.entries(saved)
              .filter(
                ([id, n]) =>
                  products.some((p) => p.id === id) &&
                  Number.isInteger(n) &&
                  Number(n) > 0,
              )
              .map(([id, n]) => [id, Math.min(Number(n), 99)]),
          ),
        );
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem("katukina-bag", JSON.stringify(cart));
      } catch {}
    }
  }, [cart, loaded]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce((a, p) => a + p.price * (cart[p.id] || 0), 0);
  const filtered = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.name} ${p.category}`
        .toLocaleLowerCase("en-GB")
        .includes(query.toLocaleLowerCase("en-GB")),
  );
  function add(id: string) {
    setCart((c) => ({ ...c, [id]: Math.min((c[id] || 0) + 1, 99) }));
    dialog.current?.showModal();
  }
  function change(id: string, delta: number) {
    setCart((c) => {
      const next = { ...c, [id]: Math.min(99, (c[id] || 0) + delta) };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }
  function select(value: string) {
    setCategory(value);
    setQuery("");
    setMenu(false);
  }
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="announcement">
        <span>From nature. From tradition. Back to our roots.</span>
        <span>
          A fresh perspective. The same spirit. <Sparkles size={12} />
        </span>
      </div>
      <header className="site-header shell">
        <Link href="/" className="wordmark" aria-label="Katukina — home">
          Katukina<span>BOTANICALS · ART · TRADITIONS</span>
        </Link>
        <form
          className="search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document
              .getElementById("collection")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Search size={18} />
          <input
            aria-label="Search the collection"
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCategory("All");
            }}
          />
          <button aria-label="Search">
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="header-links">
          <a href="#origins">Our story</a>
          <a href="#questions">Need a hand?</a>
          <button
            className="bag"
            onClick={() => dialog.current?.showModal()}
            aria-label={`Open bag, ${count} items`}
          >
            <ShoppingBag size={21} />
            <span className="bag-label">Bag</span>
            <b>{count}</b>
          </button>
          <button
            className="mobile-toggle"
            aria-label="Open categories"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="nav-wrap">
        <nav
          className={`main-nav shell ${menu ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <a
            href="#collection"
            onClick={() => select("All")}
            className="all-categories"
          >
            <Menu size={16} /> Explore the shop <ChevronDown size={13} />
          </a>
          <a href="#collection" onClick={() => select("Incense & aromas")}>
            Incense & aromas
          </a>
          <a href="#collection" onClick={() => select("Tea & botanicals")}>
            Tea & botanicals
          </a>
          <a href="#journal" onClick={() => setMenu(false)}>
            Art & traditions
          </a>
          <a href="#origins" onClick={() => setMenu(false)}>
            Our roots
          </a>
          <a
            href="#collection"
            onClick={() => select("All")}
            className="nav-new"
          >
            Discoveries <span>✧</span>
          </a>
        </nav>
      </div>
      <main id="content" className="shell">
        <section className="hero" aria-labelledby="hero-title">
          <Image
            className="hero-image"
            src="/images/forest.jpg"
            alt="Sunlight falling between the trees of a dense forest"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> ROOTED IN NATURE
            </p>
            <h1 id="hero-title">
              Deep roots.
              <br />
              <em>Living discoveries.</em>
            </h1>
            <p>
              Botanicals, aromas and wisdom passed through generations.
              <br className="desktop-break" /> A connection to nature. A return
              to what matters.
            </p>
            <a className="button primary" href="#collection">
              Explore the collection <ArrowRight size={17} />
            </a>
            <a className="hero-story" href="#origins">
              Discover our roots <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="hero-caption">
            <span>01 — THE SPIRIT REMAINS</span>
            <span>INSPIRED BY THE FOREST</span>
          </div>
          <div className="hero-seal">
            <Leaf size={25} />
            <span>
              NATURE
              <br />& TRADITION
            </span>
          </div>
        </section>
        <div className="values">
          <div>
            <Leaf />
            <span>
              Nature at the heart
              <small>A closer connection to the botanical world</small>
            </span>
          </div>
          <div>
            <Globe2 />
            <span>
              Origins that matter
              <small>People and their stories come first</small>
            </span>
          </div>
          <div>
            <BookOpen />
            <span>
              Knowledge worth sharing
              <small>Explore the stories behind the traditions</small>
            </span>
          </div>
        </div>
        <section className="collection section" id="collection">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR CONNECTION</p>
              <h2>Small rituals. New discoveries.</h2>
            </div>
            <a
              href="#products"
              onClick={() => select("All")}
              className="text-link"
            >
              Explore the selection <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="collection-toolbar">
            <div className="tabs" aria-label="Filter products">
              {["All", "Incense & aromas", "Tea & botanicals"].map((c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  className={category === c ? "active" : ""}
                  onClick={() => select(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <span className="collection-count">
              {filtered.length} discoveries
            </span>
          </div>
          <div className="product-grid" id="products">
            {filtered.map((p) => (
              <article className="product-card" key={p.id}>
                <Link className="product-photo" href={`/products/${p.id}`}>
                  <Image
                    src={p.image}
                    alt={`${p.name} — original Katukina photograph`}
                    fill
                    sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 400px"
                  />
                  <span className="product-tag">{p.label}</span>
                  <span className="photo-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
                <div className="product-info">
                  <p className="product-category">{p.category}</p>
                  <h3>
                    <Link href={`/products/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p className="product-note">{p.note}</p>
                  <div className="product-bottom">
                    <span>{money(p.price)}</span>
                    <button
                      onClick={() => add(p.id)}
                      aria-label={`Add ${p.name} to bag`}
                    >
                      <Plus size={16} /> Add to bag
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="no-results">
              <h3>No discoveries here just yet.</h3>
              <p>Try another search or explore the full selection.</p>
              <button
                className="button secondary"
                onClick={() => select("All")}
              >
                Clear search
              </button>
            </div>
          )}
          <p className="demo-note">
            A glimpse into the collection. Original Katukina photography.
            Illustrative prices in this demo.
          </p>
        </section>
        <section id="origins" className="origins">
          <div className="origins-art">
            <span className="ornament">◇</span>
            <span>KATUKINA</span>
            <p>
              A story that begins
              <br />
              in the forest.
            </p>
            <span className="ornament">◇</span>
          </div>
          <div className="origins-copy">
            <p className="eyebrow">OUR ROOTS. OUR JOURNEY.</p>
            <h2>
              More than an origin.
              <br />
              <em>A relationship.</em>
            </h2>
            <p>
              Behind every tradition are people, places and stories that deserve
              to be known.
            </p>
            <p>
              Katukina’s relationship with the Noke Ko’í in Acre, Brazil, is
              part of that story. Discover the community initiatives and
              accounts shared on the original website.
            </p>
            <a
              href="https://katukina.com/"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Read the story on the original website <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <section className="section journal" id="journal">
          <div className="section-heading">
            <div>
              <p className="eyebrow">KNOWLEDGE THAT CONNECTS</p>
              <h2>Between the forest and the everyday.</h2>
            </div>
            <span className="journal-label">THE KATUKINA JOURNAL</span>
          </div>
          <div className="journal-grid">
            <a href="#questions" className="journal-card">
              <span className="journal-number">01 / BOTANICALS</span>
              <h3>
                A little closer
                <br />
                to nature.
              </h3>
              <p>Every discovery begins with knowing where it comes from.</p>
              <ArrowUpRight />
            </a>
            <a href="#origins" className="journal-card">
              <span className="journal-number">02 / CULTURE & ORIGINS</span>
              <h3>
                Living traditions.
                <br />
                Stories worth listening to.
              </h3>
              <p>Honouring knowledge and the people who keep it alive.</p>
              <ArrowUpRight />
            </a>
            <a href="#collection" className="journal-card">
              <span className="journal-number">03 / EVERYDAY RITUALS</span>
              <h3>
                Rediscover the simple.
                <br />
                Find your moment.
              </h3>
              <p>Aromas, textures and small moments of connection.</p>
              <ArrowUpRight />
            </a>
          </div>
        </section>
        <section id="questions" className="faq section">
          <div>
            <p className="eyebrow">A LITTLE MORE UNDERSTANDING</p>
            <h2>
              A deeper connection
              <br />
              starts with a question.
            </h2>
            <p>
              A little more about Katukina
              <br />
              and this new experience.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((f) => (
              <details key={f.question}>
                <summary>
                  {f.question}
                  <Plus size={17} />
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-main shell">
          <div>
            <Link href="/" className="wordmark">
              Katukina<span>BOTANICALS · ART · TRADITIONS</span>
            </Link>
            <p>
              Connected to nature.
              <br />
              With respect for our roots.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="#collection" onClick={() => select("All")}>
              Our selection
            </a>
            <a href="#journal">Katukina journal</a>
            <a href="#origins">Our roots</a>
          </div>
          <div>
            <h3>Information</h3>
            <a href="#questions">Frequently asked questions</a>
            <a href="https://katukina.com/" target="_blank" rel="noreferrer">
              Original website ↗
            </a>
            <span>English · EUR</span>
          </div>
          <div className="footer-quote">
            <span>✧</span>
            <p>
              New beginnings.
              <br />
              <em>The spirit remains.</em>
            </p>
          </div>
        </div>
        <div className="footer-bottom shell">
          <span>
            © {new Date().getFullYear()} Katukina · Demonstration concept
          </span>
          <span>With respect for nature and the stories it holds.</span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="cart-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="cart-inner">
          <div className="cart-heading">
            <h2>
              Your bag <small>({count})</small>
            </h2>
            <button
              aria-label="Close bag"
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
          </div>
          <p className="muted">A selection for your moments of connection.</p>
          {count === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={40} />
              <h3>New discoveries are waiting for you.</h3>
              <button
                className="button primary"
                onClick={() => dialog.current?.close()}
              >
                Keep exploring <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              {products
                .filter((p) => cart[p.id])
                .map((p) => (
                  <div className="cart-item" key={p.id}>
                    <Image src={p.image} alt={p.name} width={76} height={85} />
                    <div>
                      <h3>{p.name}</h3>
                      <p>{money(p.price)}</p>
                      <div className="quantity">
                        <button
                          aria-label={`Decrease quantity of ${p.name}`}
                          onClick={() => change(p.id, -1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{cart[p.id]}</span>
                        <button
                          aria-label={`Increase quantity of ${p.name}`}
                          onClick={() => change(p.id, 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove"
                      aria-label={`Remove ${p.name}`}
                      onClick={() =>
                        setCart((c) => {
                          const n = { ...c };
                          delete n[p.id];
                          return n;
                        })
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              <div className="cart-total">
                <span>Illustrative subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <p className="cart-disclaimer">
                This is a demonstration. No orders or payments will be
                processed.
              </p>
              <button
                className="button primary full"
                onClick={() => dialog.current?.close()}
              >
                Keep exploring <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
