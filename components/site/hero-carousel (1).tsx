"use client";

import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { Pause, Play } from "lucide-react";

export function HeroCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduceMotion = () => { if (motion.matches) setPaused(true); };
    const visibility = () => setVisible(!document.hidden);
    reduceMotion();
    visibility();
    motion.addEventListener("change", reduceMotion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      motion.removeEventListener("change", reduceMotion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || !visible || slides.length < 2) return;
    const duration = active === 0 && window.matchMedia("(min-width: 601px)").matches ? 5000 : 6000;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % slides.length), duration);
    return () => window.clearTimeout(timer);
  }, [active, paused, hovered, visible, slides.length]);

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
    <div className="hero-carousel" role="region" aria-label="Katukina highlights" data-active-slide={active}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (!(event.target instanceof Element && event.target.closest("[data-rotation-control]"))) setPaused(true);
      }}>
      {slides.map((slide, index) => (
        <div key={index} id={`hero-panel-${index}`} role="tabpanel" aria-labelledby={`hero-tab-${index}`}
          aria-hidden={active !== index} inert={active !== index}>
          {slide}
        </div>
      ))}
      {slides.length > 1 && (
        <div className="shell hero-carousel-controls">
          <div className="hero-carousel-toolbar">
          <div role="tablist" aria-label="Choose a hero slide" onKeyDown={navigate}>
            {labels.map((label, index) => (
              <button key={index} ref={(element) => { tabs.current[index] = element; }} type="button" role="tab"
                id={`hero-tab-${index}`} aria-controls={`hero-panel-${index}`} aria-selected={active === index}
                aria-label={label} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}>
                <span className="hero-slide-indicator" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" data-rotation-control aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            title={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
