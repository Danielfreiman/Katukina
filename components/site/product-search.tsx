"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Search } from "lucide-react";

type Suggestion = { id: number; name: string; href: string; image: string | null; price: string | null };
type Result = { query: string; status: "loading" | "ready" | "error"; products: Suggestion[] };

export function ProductSearch({ onNavigate, inline = false }: { onNavigate: () => void; inline?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [active, setActive] = useState(-1);
  const id = useId();
  const router = useRouter();
  const query = value.trim();
  const current = result?.query === query ? result : null;
  const products = current?.status === "ready" ? current.products : [];

  useEffect(() => {
    if (active >= 0 && products[active]) document.getElementById(`${id}-${products[active].id}`)?.scrollIntoView({ block: "nearest" });
  }, [active, products, id]);

  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResult({ query, status: "loading", products: [] });
      try {
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ query, status: "ready", products: data.products });
      } catch {
        if (!controller.signal.aborted) setResult({ query, status: "error", products: [] });
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  return (
    <div className={inline ? "live-search inline-search" : "live-search shell"}
      onFocus={() => setExpanded(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}
      onKeyDown={event => { if (event.key === "Escape") { setExpanded(false); setActive(-1); } }}>
      <form className="search" action="/shop" role="search">
        <Search size={24} aria-hidden />
        <input autoFocus={!inline} name="q" value={value} maxLength={100} autoComplete="off"
          role="combobox" aria-label="Search the collection" aria-autocomplete="list"
          aria-expanded={(!inline || expanded) && products.length > 0} aria-controls={`${id}-results`}
          aria-activedescendant={active >= 0 && products[active] ? `${id}-${products[active].id}` : undefined}
          aria-describedby={`${id}-status`} placeholder="Search products"
          onChange={event => { setValue(event.target.value); setActive(-1); setExpanded(true); }}
          onKeyDown={event => {
            if (event.key === "ArrowDown" && products.length) { event.preventDefault(); setActive(index => (index + 1) % products.length); }
            if (event.key === "ArrowUp" && products.length) { event.preventDefault(); setActive(index => index <= 0 ? products.length - 1 : index - 1); }
            if (event.key === "Enter" && active >= 0 && products[active]) { event.preventDefault(); router.push(products[active].href); setExpanded(false); onNavigate(); }
          }} />
        <button className="button primary" aria-label="Search">Search</button>
      </form>
      <div className="search-results-panel" hidden={inline && !expanded}>
      <p className="search-status" id={`${id}-status`} role="status">
        {query.length < 2 ? "Type at least 2 characters to find products."
          : !current || current.status === "loading" ? "Searching…"
          : current.status === "error" ? "Suggestions are unavailable. Press Enter to search the shop."
          : products.length ? `${products.length} suggested products. Use the arrow keys to choose.`
          : "No matching products. Try a different name."}
      </p>
      <ul className="search-suggestions" id={`${id}-results`} role="listbox" aria-label="Suggested products">
        {products.map((product, index) => (
          <li key={product.id} role="none">
            <Link href={product.href} role="option" id={`${id}-${product.id}`} aria-selected={active === index}
              tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => { setExpanded(false); onNavigate(); }}>
              {product.image && <img src={product.image} alt="" width={56} height={56} />}
              <span><strong>{product.name}</strong><span>{product.price}</span></span>
            </Link>
          </li>
        ))}
      </ul>
      {query.length >= 2 && <Link className="search-all text-link" href={`/shop?q=${encodeURIComponent(query)}`} onClick={() => { setExpanded(false); onNavigate(); }}>View all results for “{query}”</Link>}
      </div>
    </div>
  );
}
