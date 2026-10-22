import Link from "next/link";
import { PageIntro } from "./page-intro";
export function ComingSoon({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main id="content" className="shell page-content">
      <PageIntro title={title} />
      <section className="service-message">
        <h2>A new experience is taking shape.</h2>
        <p>{children}</p>
        <Link className="button primary" href="/shop">
          Explore the collection →
        </Link>
      </section>
    </main>
  );
}
