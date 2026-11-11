"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryRail({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className: string;
}) {
  const track = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
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
    const el = track.current;
    if (el) {
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer.observe(child));
    }
    update();
    return () => observer.disconnect();
  }, [children]);
  const move = (direction: number) =>
    track.current?.scrollBy({
      left: direction * track.current.clientWidth,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <div className="category-rail">
      <button
        type="button"
        className="category-rail-arrow category-rail-prev"
        aria-label={`Previous ${label}`}
        disabled={edges.start}
        hidden={edges.start && edges.end}
        onClick={() => move(-1)}
      >
        <ChevronLeft size={20} />
      </button>
      <nav
        ref={track}
        className={className}
        aria-label={label}
        onScroll={update}
      >
        {children}
      </nav>
      <button
        type="button"
        className="category-rail-arrow category-rail-next"
        aria-label={`Next ${label}`}
        disabled={edges.end}
        hidden={edges.start && edges.end}
        onClick={() => move(1)}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
