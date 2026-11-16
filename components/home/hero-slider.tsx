"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { HomeHeroSlide } from "@/lib/home-hero-media";

export function HomeHeroSlider({
  slides,
  children,
  contentBySlide,
}: {
  slides: HomeHeroSlide[];
  children: ReactNode;
  contentBySlide?: Record<string, ReactNode>;
}) {
  const [liveSlides, setLiveSlides] = useState(slides);
  const available = liveSlides.filter((slide) => slide.desktop || slide.mobile);
  const count = available.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const rotationBeforePointer = useRef<boolean | null>(null);
  const current = count ? active % count : 0;

  useEffect(() => {
    setLiveSlides(slides);
  }, [slides]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const controller = new AbortController();
    const events = new EventSource("/api/home-hero-media/events");
    events.onmessage = (event) => {
      try {
        const next: HomeHeroSlide[] = JSON.parse(event.data);
        if (Array.isArray(next))
          setLiveSlides((previous) =>
            JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
          );
      } catch {
        /* Keep the last valid banners. */
      }
    };
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        if (!document.hidden) {
          const response = await fetch("/api/home-hero-media", {
            cache: "no-store",
            signal: controller.signal,
          });
          if (response.ok) {
            const next: HomeHeroSlide[] = await response.json();
            if (Array.isArray(next) && !controller.signal.aborted) {
              setLiveSlides((previous) =>
                JSON.stringify(previous) === JSON.stringify(next)
                  ? previous
                  : next,
              );
            }
          }
        }
      } catch {
        // Retain the current banners during a temporary connection failure.
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 2000);
      }
    };
    void refresh();
    return () => {
      controller.abort();
      events.close();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || hovered || reducedMotion) return;
    const timer = setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % count);
    }, 6500);
    return () => clearInterval(timer);
  }, [count, paused, hovered, reducedMotion]);

  const move = (direction: number) => {
    if (count < 2) return;
    setPaused(true);
    setActive((index) => (index + direction + count) % count);
  };

  return (
    <section
      className="mh-hero mh-hero-slider"
      aria-label="Katukina highlights"
      aria-roledescription="carousel"
      data-active-slide={available[current]?.id || "none"}
      data-has-images={count > 0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPaused(true)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onPointerDown={(event) => {
        if (
          event.pointerType === "mouse" ||
          (event.target as HTMLElement).closest("a,button")
        )
          return;
        touch.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerCancel={() => {
        touch.current = null;
      }}
      onPointerUp={(event) => {
        const start = touch.current;
        touch.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        if (
          Math.abs(dx) > 50 &&
          Math.abs(dx) > Math.abs(event.clientY - start.y)
        )
          move(dx < 0 ? 1 : -1);
      }}
    >
      <div className="mh-hero-slides" aria-hidden="true">
        {available.map((slide, index) => (
          <picture
            key={`${slide.id}:${slide.desktop}:${slide.mobile}`}
            className="mh-hero-slide"
            data-active={index === current}
          >
            {slide.mobile && (
              <source media="(max-width: 640px)" srcSet={slide.mobile} />
            )}
            <img
              src={(slide.desktop || slide.mobile)!}
              alt=""
              width={2400}
              height={900}
              fetchPriority={index === 0 ? "high" : "low"}
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </picture>
        ))}
      </div>
      {contentBySlide?.[available[current]?.id] ?? children}
      {count > 1 && (
        <div className="mh-hero-controls" aria-label="Banner controls">
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => move(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          {available.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className="mh-hero-dot"
              aria-label={`Show banner ${Number(slide.id)}`}
              aria-pressed={index === current}
              onClick={() => {
                setPaused(true);
                setActive(index);
              }}
            >
              <span />
            </button>
          ))}
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => move(1)}
          >
            <ChevronRight size={18} />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              aria-label={paused ? "Play banners" : "Pause banners"}
              onPointerDown={() => {
                rotationBeforePointer.current = paused;
              }}
              onClick={() => {
                setPaused(!(rotationBeforePointer.current ?? paused));
                rotationBeforePointer.current = null;
              }}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
          <span
            className="sr-only"
            aria-live={paused || reducedMotion ? "polite" : "off"}
          >
            Banner {current + 1} of {count}
          </span>
        </div>
      )}
    </section>
  );
}
