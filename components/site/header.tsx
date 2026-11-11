"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ChevronDown, ShoppingBag, UserRound, X } from "lucide-react";
import { plainText } from "@/lib/wordpress/text";
import { DestinationSelector } from "@/components/commerce/destination";
import { ProductSearch } from "./product-search";
const navigation = [
  ["All categories", "/shop"],
  ["Our story", "/about"],
] as const;
const categoryNavigation = [
  ["Rapé", "/collections/rape"],
  ["Kuripe & Tepi", "/collections/kuripe-and-tepi"],
  ["Sacred Incense", "/collections/sacred-incense"],
  ["Herbal Teas", "/collections/herbal-teas"],
  ["Shamanic Tools", "/collections/shamanic-tools"],
  ["Beauty & Body", "/collections/beauty-and-body"],
  ["Giftshop", "/collections/giftshop"],
] as const;
export function SiteHeader({ categories }: { categories: { id: number; name: string; slug: string; count: number }[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/shop" && pathname.startsWith("/products/"));
  const [panel, setPanel] = useState<"categories" | "menu" | null>(null);
  const categoryButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        (panel === "categories" ? categoryButton : menuButton).current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="site-note">
        A world of nature. A little closer. <DestinationSelector />
      </div>
      <header className="header-wrap">
        <div className="site-header shell">
          <Link
            href="/"
            className="wordmark"
            aria-label="Katukina — home"
            onClick={() => setPanel(null)}
          >
            <Image
              src="/images/brand/katukina-logo-horizontal.svg"
              alt="Katukina"
              width={600}
              height={120}
              className="header-logo"
              loading="eager"
              unoptimized
            />
          </Link>
          <div className="header-search-slot" onFocus={() => setPanel(null)}>
            <ProductSearch inline onNavigate={() => setPanel(null)} />
          </div>
          <div className="header-actions">
            <Link
              className="icon-button account-link"
              href="/account"
              aria-label="My account"
            >
              <UserRound size={22} strokeWidth={1.5} />
              <span className="header-action-label">Account</span>
            </Link>
            <Link className="icon-button" href="/cart" aria-label="Your bag">
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className="header-action-label">Bag</span>
            </Link>
            <button
              ref={menuButton}
              className="icon-button menu-toggle"
              aria-label={panel === "menu" ? "Close menu" : "Open menu"}
              aria-expanded={panel === "menu"}
              aria-controls="mobile-navigation"
              onClick={() => setPanel(panel === "menu" ? null : "menu")}
            >
              {panel === "menu" ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        <div className="header-categories">
          <nav className="shell category-navigation" aria-label="Main navigation">
            <button ref={categoryButton} className="departments-trigger" aria-expanded={panel === "categories"} aria-controls="all-categories-panel"
              onClick={() => setPanel(panel === "categories" ? null : "categories")}>
              <Menu size={17} /> All categories <ChevronDown size={14} />
            </button>
            {[...categoryNavigation, ...navigation.slice(1)].map(([label, href]) => (
              <Link key={href} href={href}
                aria-current={pathname === href ? "page" : undefined}
                data-active={isActive(href)} onClick={() => setPanel(null)}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {panel === "categories" && (
          <div className="header-panel departments-panel" id="all-categories-panel">
            <div className="shell departments-layout">
              <div className="departments-intro"><p className="eyebrow">FIND YOUR NEXT DISCOVERY</p><h2>Explore Katukina</h2><p>Browse botanicals, incense and meaningful objects by category.</p><Link className="button primary" href="/shop" onClick={() => setPanel(null)}>Shop all products</Link></div>
              <nav className="departments-grid" aria-label="All product categories">
                {categories.filter(category => category.count > 0).sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                  <Link key={category.id} href={`/collections/${category.slug}`} onClick={() => setPanel(null)}>{plainText(category.name)} <span>{category.count}</span></Link>
                ))}
                {!categories.length && <Link href="/collections" onClick={() => setPanel(null)}>Browse collections</Link>}
              </nav>
            </div>
          </div>
        )}
        {panel === "menu" && (
          <nav
            className="header-panel mobile-navigation"
            id="mobile-navigation"
            aria-label="Mobile navigation"
          >
            {[
              navigation[0],
              ...categoryNavigation,
              ...navigation.slice(1),
              ["Shipping & destinations", "/shipping"],
              ["My account", "/account"],
              ...categories.filter(category => category.count > 0 && !categoryNavigation.some(([, href]) => href === `/collections/${category.slug}`)).map(category => [plainText(category.name), `/collections/${category.slug}`]),
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                data-active={isActive(href)}
                onClick={() => setPanel(null)}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {panel && (
        <button
          className="header-backdrop"
          aria-label="Close navigation panel"
          onClick={() => setPanel(null)}
        />
      )}
    </>
  );
}
