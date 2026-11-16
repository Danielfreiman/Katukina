"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryCarousel } from "./category-carousel";

export function HomeCategoryCircles({ categories, initialIcons }: {
  categories: { slug: string; label: string; icon: string }[];
  initialIcons: Record<string, string>;
}) {
  const [icons, setIcons] = useState(initialIcons);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function refresh() {
      try {
        if (document.visibilityState === "visible") {
          const response = await fetch("/api/home-category-icons", {
            cache: "no-store", signal: controller.signal,
          });
          if (response.ok && !disposed) setIcons(await response.json());
        }
      } catch {
        // Keep the current icons while the development server restarts.
      } finally {
        if (!disposed) timer = setTimeout(refresh, 1000);
      }
    }
    void refresh();
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, []);

  return (
    <CategoryCarousel className="rh-category-circles" label="Main categories">
      {categories.map(({ slug, label, icon }) => {
        const customIcon = icons[slug];
        const showCustom = customIcon && !failed[customIcon];
        const source = showCustom ? customIcon : icon;
        return (
          <Link key={slug} href={`/collections/${slug}`}>
            <span>
              <span
                className="rh-category-icon"
                aria-hidden="true"
                style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
              >
                <img
                  key={source}
                  src={source}
                  alt="" width={64} height={64}
                  draggable={false}
                  onError={showCustom ? () => setFailed((current) => ({ ...current, [customIcon]: true })) : undefined}
                />
              </span>
            </span>
            {label}
          </Link>
        );
      })}
    </CategoryCarousel>
  );
}
