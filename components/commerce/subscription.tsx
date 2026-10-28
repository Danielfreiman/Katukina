"use client";
import { useState } from "react";
import { commerceRequest } from "./cart";

export function SubscriptionForm({ productId }: { productId?: number }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await commerceRequest("subscribe", {
        email,
        consent,
        purpose: productId ? "back_in_stock" : "marketing",
        ...(productId ? { product_id: productId } : {}),
      });
      setMessage(
        "Check your email to confirm your subscription. You can unsubscribe at any time.",
      );
    } catch {
      setMessage(
        "Email updates are unavailable at the moment. Please try again later.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="commerce-form" onSubmit={submit}>
      <h2>{productId ? "Notify me when available" : "Email updates"}</h2>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="commerce-check">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        I agree to receive{" "}
        {productId
          ? "an availability update for this product"
          : "Katukina news and offers"}{" "}
        by email. I can unsubscribe at any time.
      </label>
      <button className="button primary" disabled={busy || !consent}>
        {busy ? "Sending request…" : "Request email confirmation"}
      </button>
      {message && <p aria-live="polite">{message}</p>}
    </form>
  );
}
