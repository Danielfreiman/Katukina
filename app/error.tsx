"use client";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main id="content" className="shell empty-page">
      <h1>A little pause.</h1>
      <p>This page is temporarily unavailable. Please try again.</p>
      <button className="button primary" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
