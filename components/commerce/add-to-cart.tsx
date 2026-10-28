"use client";
import { useRef, useState } from "react";
import Link from "next/link";
export function AddToCart({
  id,
  available,
  simple,
  quantity = 1,
  variation = [],
  onPendingChange,
}: {
  id: number;
  available: boolean;
  simple: boolean;
  quantity?: number;
  variation?: { attribute: string; value: string }[];
  onPendingChange?: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const inFlight = useRef(false);
  async function add() {
    if (
      inFlight.current ||
      uncertain ||
      !available ||
      !simple ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    )
      return;
    inFlight.current = true;
    setPending(true);
    onPendingChange?.(true);
    setMessage("");
    setAdded(false);
    try {
      const response = await fetch("/api/commerce/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          quantity,
          ...(variation.length ? { variation } : {}),
        }),
        signal: AbortSignal.timeout(65000),
      });
      if (response.status >= 500) throw new Error("Uncertain cart response");
      const data = await response.json();
      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to add this item. Please review its availability.",
        );
        return;
      }
      setAdded(true);
      setMessage("Added to your bag.");
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch {
      setUncertain(true);
      setMessage(
        "We could not confirm the update. Check your bag before adding this item again.",
      );
      // A timed-out POST may have succeeded. Read the current cart, never replay the addition.
      await fetch("/api/commerce/cart", {
        signal: AbortSignal.timeout(15000),
      }).catch(() => undefined);
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } finally {
      setPending(false);
      inFlight.current = false;
      onPendingChange?.(false);
    }
  }
  return (
    <div className="purchase-actions">
      <button
        className="button primary"
        type="button"
        disabled={pending || uncertain || !available || !simple}
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
        {message}{" "}
        {(added || uncertain) && <Link href="/cart">View your bag →</Link>}
      </p>
    </div>
  );
}
