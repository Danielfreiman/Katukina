"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="content" className="shell empty-page">
      <h1>A little pause.</h1>
      <p>This page is temporarily unavailable. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
