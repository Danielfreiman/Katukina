"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDragScroll } from "@/components/home/use-drag-scroll";
import { CarouselHint } from "@/components/site/carousel-hint";
import type { Product } from "@/lib/commerce/product";
import { ProductGrid } from "./product-grid";

export function ProductScroller({ products, label }: { products: Product[]; label: string }) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll();
  const [edges, setEdges] = useState({ start: true, end: true });
  const scrollable = !(edges.start && edges.end);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const start = el.scrollLeft < 1;
      const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      setEdges(previous => previous.start === start && previous.end === end ? previous : { start, end });
    };
    const onWheel = (event: WheelEvent) => {
      if (!event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey || event.deltaX || !event.deltaY) return;
      const max = el.scrollWidth - el.clientWidth;
      if (event.deltaY > 0 ? el.scrollLeft >= max - 1 : el.scrollLeft <= 1) return;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? el.clientWidth
        : event.deltaMode === WheelEvent.DOM_DELTA_LINE ? parseFloat(getComputedStyle(el).fontSize) : 1;
      event.preventDefault();
      el.scrollBy({ left: event.deltaY * unit, behavior: "instant" });
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    el.addEventListener("scroll", update);
    el.addEventListener("wheel", onWheel, { passive: false });
    update();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
    };
  }, [products]);

  const move = (direction: number) => {
    const el = track.current;
    el?.scrollBy({
      left: direction * el.clientWidth,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return (
    <div className="product-scroller">
      <button type="button" className="product-scroller-prev" aria-label={`Previous ${label}`}
        aria-controls={id} disabled={edges.start} hidden={!scrollable} onClick={() => move(-1)}>
        <ChevronLeft size={20} />
      </button>
      <ProductGrid products={products} ref={track} id={id}
        {...(scrollable ? dragScroll : {})}
        role="group" aria-label={label} />
      <button type="button" className="product-scroller-next" aria-label={`Next ${label}`}
        aria-controls={id} disabled={edges.end} hidden={!scrollable} onClick={() => move(1)}>
        <ChevronRight size={20} />
      </button>
      {scrollable && <CarouselHint />}
    </div>
  );
}
