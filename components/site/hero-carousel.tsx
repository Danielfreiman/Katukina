"use client";

import { useRef, useState, type ReactNode, type KeyboardEvent } from "react";

export function HeroCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % slides.length;
    else if (event.key === "ArrowLeft") next = (active - 1 + slides.length) % slides.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = slides.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="hero-carousel" role="region" aria-label="Katukina highlights">
      {slides.map((slide, index) => (
        <div key={index} id={`hero-panel-${index}`} role="tabpanel" aria-labelledby={`hero-tab-${index}`} hidden={active !== index}>
          {slide}
        </div>
      ))}
      {slides.length > 1 && (
        <div className="shell hero-carousel-controls">
          <div role="tablist" aria-label="Choose a hero slide" onKeyDown={navigate}>
            {labels.map((label, index) => (
              <button key={index} ref={(element) => { tabs.current[index] = element; }} type="button" role="tab"
                id={`hero-tab-${index}`} aria-controls={`hero-panel-${index}`} aria-selected={active === index}
                aria-label={label} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}>
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
