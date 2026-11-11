"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductScroller({ children, label }: { children: ReactNode; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const track = root.current?.querySelector<HTMLElement>(".product-grid");
    if (!track) return;
    const update = () => setEdges({ start: track.scrollLeft < 2, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    Array.from(track.children).forEach(child => observer.observe(child));
    track.addEventListener("scroll", update);
    update();
    return () => { observer.disconnect(); track.removeEventListener("scroll", update); };
  }, [children]);
  const move = (direction: number) => {
    const track = root.current?.querySelector<HTMLElement>(".product-grid");
    track?.scrollBy({ left: direction * track.clientWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className="product-scroller" ref={root}>
    <button type="button" className="product-scroller-prev" aria-label={`Previous ${label}`} disabled={edges.start} hidden={edges.start && edges.end} onClick={() => move(-1)}><ChevronLeft size={20} /></button>
    {children}
    <button type="button" className="product-scroller-next" aria-label={`Next ${label}`} disabled={edges.end} hidden={edges.start && edges.end} onClick={() => move(1)}><ChevronRight size={20} /></button>
  </div>;
}
