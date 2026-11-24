import Link from "next/link";
export default function NotFound() {
  return (
    <main id="content" className="not-found-page">
      <h1>
        <span className="not-found-code">404</span>{" "}
        Back to our roots?
      </h1>
      <p>We could not find this page.</p>
      <Link className="button primary" href="/">
        Back to home
      </Link>
    </main>
  );
}
