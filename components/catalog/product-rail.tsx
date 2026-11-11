"use client";
import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductRail({ title, description, href, children }: { title: string; description: string; href: string; children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  function scroll(direction: number) {
    const element = rail.current?.querySelector(".product-grid");
    element?.scrollBy({left: direction * element.clientWidth * 0.85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  }
  return <section className="product-shelf" aria-label={title}>
    <div className="shelf-heading"><div><h2>{title}</h2><p>{description}</p></div><div className="shelf-actions"><Link href={href}>View all</Link><button aria-label={`Previous ${title}`} onClick={() => scroll(-1)}><ChevronLeft size={20} /></button><button aria-label={`Next ${title}`} onClick={() => scroll(1)}><ChevronRight size={20} /></button></div></div>
    <div ref={rail}>{children}</div>
  </section>;
}
