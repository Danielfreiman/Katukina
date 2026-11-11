"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryCarousel({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className: string;
  label: string;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [dragging, setDragging] = useState(false);
  const update = () => {
    const el = track.current;
    if (el)
      setEdges({
        start: el.scrollLeft < 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
  };
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    update();
    return () => observer.disconnect();
  }, [children]);
  const move = (direction: number) => {
    const el = track.current;
    if (el)
      el.scrollBy({
        left: direction * el.clientWidth * 0.8,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  const finishDrag = () => {
    if (drag.current?.moved) suppressClick.current = true;
    drag.current = null;
    setDragging(false);
  };
  return (
    <div className="rh-category-carousel">
      <div
        id={id}
        ref={track}
        className={`${className}${dragging ? " is-dragging" : ""}`}
        role="navigation"
        aria-label={label}
        tabIndex={0}
        onScroll={update}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          suppressClick.current = false;
          drag.current = {
            x: event.clientX,
            left: event.currentTarget.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state) return;
          const delta = event.clientX - state.x;
          if (!state.moved && Math.abs(delta) < 6) return;
          state.moved = true;
          suppressClick.current = true;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.scrollLeft = state.left - delta;
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onPointerLeave={() => {
          if (!drag.current?.moved) drag.current = null;
        }}
        onClickCapture={(event) => {
          if (suppressClick.current && event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {children}
      </div>
      {!(edges.start && edges.end) && (
        <>
          <button
            className="rh-arrow rh-prev"
            aria-label={`Previous ${label}`}
            aria-controls={id}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="rh-arrow rh-next"
            aria-label={`Next ${label}`}
            aria-controls={id}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
