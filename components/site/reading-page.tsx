import type { ReactNode } from "react";
import { ChapterIndex } from "./chapter-index";
import styles from "./reading-page.module.css";

export type ReadingChapter = { id: string; title: string; content: ReactNode };

type Props = {
  title: string;
  chapters: ReadingChapter[];
  meta?: ReactNode;
  breadcrumb?: ReactNode;
  children?: ReactNode;
};

export function ReadingPage({
  title,
  chapters,
  meta,
  breadcrumb,
  children,
}: Props) {
  const indexed = chapters.length > 1;
  return (
    <main
      id="content"
      className={`shell ${styles.page} ${indexed ? "" : styles.single}`}
    >
      {breadcrumb}
      <header className={styles.masthead}>
        <h1>{title}</h1>
        {meta && <p>{meta}</p>}
      </header>
      <div className={styles.layout}>
        {indexed && (
          <ChapterIndex
            chapters={chapters.map(({ id, title }) => ({ id, title }))}
          />
        )}
        <article className={styles.article} aria-label={title}>
          {children}
          {chapters.map(({ id, title, content }) => (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} tabIndex={-1}>
                {title}
              </h2>
              {content}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
