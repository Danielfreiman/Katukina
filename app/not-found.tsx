import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-page">
      <p className="eyebrow">404 · A DIFFERENT PATH</p>
      <h1>Back to our roots?</h1>
      <p>We could not find this page.</p>
      <Link className="button primary" href="/">
        Back to home →
      </Link>
    </main>
  );
}
