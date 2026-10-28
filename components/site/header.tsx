"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { DestinationSelector } from "@/components/commerce/destination";
const navigation = [
  ["The shop", "/shop"],
  ["Collections", "/collections"],
  ["Our story", "/about"],
  ["Journal", "/journal"],
] as const;
export function SiteHeader() {
  const [panel, setPanel] = useState<"search" | "menu" | null>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        (panel === "search" ? searchButton : menuButton).current?.focus();
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
            <BrandMark />
            katukina<span className="brand-period">.</span>
          </Link>
          <nav className="desktop-navigation" aria-label="Main navigation">
            {navigation.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setPanel(null)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              ref={searchButton}
              className="icon-button"
              aria-label={panel === "search" ? "Close search" : "Open search"}
              aria-expanded={panel === "search"}
              aria-controls="site-search"
              onClick={() => setPanel(panel === "search" ? null : "search")}
            >
              {panel === "search" ? <X size={21} /> : <Search size={21} />}
            </button>
            <Link
              className="icon-button account-link"
              href="/account"
              aria-label="My account"
            >
              <UserRound size={21} />
            </Link>
            <Link className="icon-button" href="/cart" aria-label="Your bag">
              <ShoppingBag size={21} />
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
        {panel === "search" && (
          <div className="header-panel" id="site-search">
            <form className="search shell" action="/shop" role="search">
              <Search size={24} aria-hidden />
              <input
                autoFocus
                name="q"
                aria-label="Search the collection"
                placeholder="What would you like to discover?"
                maxLength={100}
              />
              <button className="button primary" aria-label="Search">
                Search <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}
        {panel === "menu" && (
          <nav
            className="header-panel mobile-navigation"
            id="mobile-navigation"
            aria-label="Mobile navigation"
          >
            {[
              ...navigation,
              ["Shipping & destinations", "/shipping"],
              ["My account", "/account"],
            ].map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setPanel(null)}>
                {label}
                <ArrowRight size={20} />
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
