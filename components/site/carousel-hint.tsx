import { MoveHorizontal } from "lucide-react";

export function CarouselHint({ mouseDrag = true }: { mouseDrag?: boolean }) {
  return (
    <span className="carousel-hint">
      <MoveHorizontal size={16} aria-hidden="true" />
      <span className="carousel-hint-pointer">{mouseDrag ? "Drag to explore" : "Scroll to explore"}</span>
      <span className="carousel-hint-touch">Swipe to explore</span>
    </span>
  );
}
