"use client";
import { useState } from "react";
import Link from "next/link";
export function AddToCart({
  id,
  available,
  simple,
}: {
  id: number;
  available: boolean;
  simple: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  async function add() {
    setPending(true);
    setMessage("");
    setAdded(false);
    try {
      const response = await fetch("/api/commerce/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: 1 }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to add this item.");
      setAdded(true);
      setMessage("Added to your bag.");
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="purchase-actions">
      <button
        className="button primary"
        type="button"
        disabled={pending || !available || !simple}
        onClick={add}
      >
        {pending
          ? "Adding…"
          : !simple
            ? "Choose a presentation"
            : available
              ? "Add to bag"
              : "Currently unavailable"}
      </button>
      <p role="status">
        {message} {added && <Link href="/cart">View your bag →</Link>}
      </p>
    </div>
  );
}
