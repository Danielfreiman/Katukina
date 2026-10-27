"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/commerce/product";
import { ProductGrid } from "./product-grid";
import { useCookieConsent } from "@/components/privacy/cookie-consent";
import {
  CONSENT_KEY,
  HISTORY_KEY as storageKey,
  HISTORY_MAX_AGE,
  parseConsent,
} from "@/lib/privacy/consent";

// Store only public product IDs. Always retrieve current price and publication state.
export function RecentlyViewed({ currentId }: { currentId?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const { functional } = useCookieConsent();
  useEffect(() => {
    const controller = new AbortController();
    setProducts([]);
    if (!functional) return;
    let ids: number[] = [];
    try {
      if (!parseConsent(localStorage.getItem(CONSENT_KEY))?.functional) return;
      const stored: unknown = JSON.parse(
        localStorage.getItem(storageKey) || "[]",
      );
      const now = Date.now();
      const entries: { id: number; viewedAt: number }[] = Array.isArray(stored)
        ? stored
            .filter(
              (item) =>
                item &&
                Number.isSafeInteger(item.id) &&
                item.id > 0 &&
                Number.isSafeInteger(item.viewedAt) &&
                item.viewedAt <= now &&
                item.viewedAt > now - HISTORY_MAX_AGE &&
                item.id !== currentId,
            )
            .slice(0, 8)
        : [];
      ids = [...new Set(entries.map((item) => item.id))];
      const updated = (
        currentId ? [{ id: currentId, viewedAt: now }, ...entries] : entries
      ).slice(0, 8);
      if (updated.length)
        localStorage.setItem(storageKey, JSON.stringify(updated));
      else localStorage.removeItem(storageKey);
    } catch {
      return; // Browsing works with storage disabled.
    }
    if (ids.length) {
      const query = new URLSearchParams({
        include: ids.join(","),
        orderby: "include",
        per_page: "8",
      });
      fetch(`/wp-json/wc/store/v1/products?${query}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) return;
          const data: Product[] = await response.json();
          if (
            Array.isArray(data) &&
            !controller.signal.aborted &&
            parseConsent(localStorage.getItem(CONSENT_KEY))?.functional
          )
            setProducts(data.filter((product) => ids.includes(product.id)));
        })
        .catch(() => {
          /* Optional history must not interrupt shopping. */
        });
    }
    return () => controller.abort();
  }, [currentId, functional]);
  useEffect(() => {
    const clear = (event: StorageEvent) => {
      if (event.key === storageKey && !event.newValue) setProducts([]);
    };
    window.addEventListener("storage", clear);
    return () => window.removeEventListener("storage", clear);
  }, []);
  if (!functional || !products.length) return null;
  return (
    <section className="recently-viewed" aria-label="Recently viewed products">
      <div className="related-heading">
        <h2>Recently viewed</h2>
        <button
          className="filter-show-more"
          onClick={() => {
            try {
              localStorage.removeItem(storageKey);
            } catch {
              /* Storage may be unavailable. */
            }
            setProducts([]);
          }}
        >
          Clear history
        </button>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
