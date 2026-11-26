import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sections, story } from "./content";
import styles from "./story.module.css";

export const metadata = {
  title: story.title,
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <main id="content" className={`shell ${styles.page}`}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{story.title}</span>
      </nav>
      <header className={styles.cover}>
        <div className={styles.intro}>
          <h1>{story.title}</h1>
          <p>{story.introduction}</p>
        </div>
        <Image className={styles.photo} src={story.cover} width={1800} height={1199}
          sizes="(max-width: 700px) 100vw, 55vw" loading="eager" alt="" />
      </header>
      {sections.map(({ title, paragraphs, image, link }) => (
        <section className={styles.chapter} key={title}>
          <h2>{title}</h2>
          <div>
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {image && <Image {...image} className={styles.chapterPhoto} sizes="(max-width: 700px) 100vw, 55vw" />}
            {link && (
              <a className={styles.link} href={link.href} target="_blank" rel="noreferrer">
                {link.label} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
