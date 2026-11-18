"use client";

import { useRef, type HTMLAttributes } from "react";

export function useDragScroll(): HTMLAttributes<HTMLDivElement> {
  const drag = useRef({ id: -1, x: 0, left: 0, moved: false });
  return {
    tabIndex: 0,
    onDragStart: (event) => event.preventDefault(),
    onPointerDown(event) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
    },
    onPointerMove(event) {
      const state = drag.current;
      if (state.id !== event.pointerId || !(event.buttons & 1)) return;
      const delta = event.clientX - state.x;
      if (!state.moved && Math.abs(delta) < 6) return;
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.scrollLeft = state.left - delta;
      event.preventDefault();
    },
    onPointerUp(event) {
      drag.current.id = -1;
      delete event.currentTarget.dataset.dragging;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel(event) {
      drag.current.id = -1;
      drag.current.moved = false;
      delete event.currentTarget.dataset.dragging;
    },
    onLostPointerCapture(event) {
      drag.current.id = -1;
      delete event.currentTarget.dataset.dragging;
    },
    onClickCapture(event) {
      if (drag.current.moved && event.detail > 0) {
        event.preventDefault();
        event.stopPropagation();
        drag.current.moved = false;
      }
    },
    onKeyDown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const el = event.currentTarget;
      const step = el.clientWidth * 0.8;
      const positions: Record<string, number> = {
        ArrowLeft: el.scrollLeft - step, ArrowRight: el.scrollLeft + step,
        Home: 0, End: el.scrollWidth,
      };
      if (!(event.key in positions)) return;
      event.preventDefault();
      el.scrollTo({ left: positions[event.key], behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    },
  };
}
