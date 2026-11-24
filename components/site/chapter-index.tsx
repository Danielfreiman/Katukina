"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import styles from "./reading-page.module.css";

type Chapter = { id: string; title: string };

export function ChapterIndex({ chapters }: { chapters: Chapter[] }) {
  const [current, setCurrent] = useState<string>();

  useEffect(() => {
    const headings = chapters.map(({ id }) => document.getElementById(id));
    let frame = 0;
    function update() {
      frame = 0;
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1
      ) {
        setCurrent(chapters.at(-1)?.id);
        return;
      }
      const inset =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      const readingLine = inset + (window.innerHeight - inset) * 0.1;
      const active = headings.findLast(
        (heading) =>
          heading && heading.getBoundingClientRect().top <= readingLine,
      );
      setCurrent(active?.id ?? chapters[0]?.id);
    }
    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, [chapters]);

  const links = (
    <ul>
      {chapters.map(({ id, title }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={current === id ? "location" : undefined}
            onClick={(event) => {
              const disclosure = event.currentTarget.closest("details");
              if (
                disclosure &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.altKey
              )
                disclosure.open = false;
            }}
          >
            {title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className={styles.index} aria-label="On this page">
      <div className={styles.desktopIndex}>
        <p className={styles.indexTitle}>
          <List aria-hidden="true" size={18} />
          On this page
        </p>
        {links}
      </div>
      <details className={styles.mobileIndex}>
        <summary className={styles.indexTitle}>
          <List aria-hidden="true" size={18} />
          On this page
          <ChevronDown
            className={styles.chevron}
            aria-hidden="true"
            size={18}
          />
        </summary>
        {links}
      </details>
    </nav>
  );
}
