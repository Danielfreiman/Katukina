import { PageIntro } from "@/components/site/page-intro";
export const metadata = {
  title: "Our roots",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="content" className="shell page-content">
      <PageIntro title="Our roots" eyebrow="NATURE · TRADITION · CONNECTION" />
      <section className="origins">
        <div className="origins-art">
          <span className="ornament">◇</span>
          <p>
            A story that begins
            <br />
            in the forest.
          </p>
        </div>
        <div className="origins-copy">
          <h2>
            People, places
            <br />
            <em>and their stories.</em>
          </h2>
          <p>
            Katukina brings together botanicals, incense, art and objects
            connected to forest traditions.
          </p>
          <p>
            The original Katukina website shares its relationship with the Noke
            Ko’í in Acre, Brazil, and community initiatives. Visit it for the
            original accounts and project details.
          </p>
          <a
            className="text-link"
            href="https://katukina.com/"
            rel="noreferrer"
            target="_blank"
          >
            Read the original stories ↗
          </a>
        </div>
      </section>
    </main>
  );
}
