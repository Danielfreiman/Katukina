"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, X, Trash2, ShoppingBag } from "lucide-react";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { Cart, formatMoney } from "@/lib/commerce/types";
import { commerceRequest, Totals } from "./cart";
import { plainText } from "@/lib/wordpress/text";

export function SideCart({ onOpen }: { onOpen: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const changing = useRef(false);
  const generation = useRef(0);
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Cart>();
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const refresh = useCallback(async () => {
    if (changing.current) return;
    const current = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const next = await commerceRequest<Cart>("cart");
      if (current === generation.current) {
        setCart(next);
        setUncertain(false);
      }
    } catch {
      if (current === generation.current) {
        setError("We could not load your bag. Please try again.");
        setUncertain(true);
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  const show = useCallback(() => {
    onOpen();
    dialog.current?.showModal();
    setOpen(true);
    void refresh();
  }, [onOpen, refresh]);
  useEffect(() => {
    const added = (event: Event) => {
      const confirmed = (event as CustomEvent<Cart>).detail;
      if (!confirmed || !Array.isArray(confirmed.items) || !confirmed.totals) {
        show();
        return;
      }
      // The successful add response already contains the authoritative cart.
      // Invalidate any older read instead of immediately fetching it again.
      ++generation.current;
      setCart(confirmed);
      setLoading(false);
      setUncertain(false);
      setError("");
      onOpen();
      dialog.current?.showModal();
      setOpen(true);
    };
    window.addEventListener("katukina-cart-open", added);
    return () => window.removeEventListener("katukina-cart-open", added);
  }, [show, onOpen]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const updated = () => {
      void refresh();
    };
    window.addEventListener("katukina-cart-updated", updated);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("katukina-cart-updated", updated);
    };
  }, [open, refresh]);
  const close = () => dialog.current?.close();
  async function change(action: "update" | "remove", body: object) {
    if (changing.current || loading || uncertain) return;
    changing.current = true;
    ++generation.current;
    setBusy(true);
    setError("");
    try {
      setCart(await commerceRequest<Cart>(action, body));
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not confirm the update.",
      );
      // Read the authoritative cart after an uncertain response; never replay a mutation.
      try {
        setCart(await commerceRequest<Cart>("cart"));
      } catch {
        setUncertain(true);
      }
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } finally {
      changing.current = false;
      setBusy(false);
    }
  }
  const disabled = busy || loading || uncertain;
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="icon-button bag-trigger"
        aria-label="Your bag"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="side-cart"
        onClick={show}
      >
        <ShoppingBag size={22} strokeWidth={1.5} />
        <span className="header-action-label">Bag</span>
      </button>
      <dialog
        ref={dialog}
        id="side-cart"
        className="side-cart"
        aria-labelledby="side-cart-title"
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              close();
          }
        }}
      >
        <div className="side-cart-heading">
          <div>
            <ShoppingBag size={28} strokeWidth={1.5} />
            <h2 id="side-cart-title">Your bag</h2>
            {cart && <span>{cart.items_count} items</span>}
          </div>
          <button
            type="button"
            className="side-cart-close"
            aria-label="Close bag"
            onClick={close}
            autoFocus
          >
            <X size={22} />
          </button>
        </div>
        <div className="side-cart-body" aria-busy={busy || loading}>
          {loading && <p role="status">Updating your bag…</p>}
          {error && (
            <div className="side-cart-error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                disabled={busy || loading}
                onClick={() => void refresh()}
              >
                Refresh bag
              </button>
            </div>
          )}
          {cart?.errors?.map((notice, index) => (
            <p key={index} role="alert">
              {notice.message}
            </p>
          ))}
          {cart && !cart.items.length && (
            <div className="side-cart-empty">
              <ShoppingBag size={64} strokeWidth={1.5} />
              <h3>Your bag is empty.</h3>
              <p>Find something that speaks to your curiosity.</p>
              <Link href="/shop" className="button primary" onClick={close}>
                Explore the collection
              </Link>
            </div>
          )}
          {!!cart?.items.length && (
            <section aria-label="Bag items">
              {cart.items.map((item) => (
                <article className="side-cart-item" key={item.key}>
                  {item.images[0] && (
                    <CatalogImage
                      src={item.images[0].src}
                      alt={item.images[0].alt || item.name}
                      width={88}
                      height={88}
                    />
                  )}
                  <div>
                    <h3>{item.name}</h3>
                    {!!item.variation?.length && (
                      <p className="side-cart-variation">
                        {item.variation
                          .map(
                            (option) =>
                              `${plainText(option.attribute)}: ${plainText(option.value)}`,
                          )
                          .join(" · ")}
                      </p>
                    )}
                    <p>
                      {formatMoney(
                        item.totals.line_total,
                        item.totals.currency_code,
                        item.totals.currency_minor_unit,
                      )}
                    </p>
                    <div className="side-cart-item-actions">
                      <div className="side-cart-quantity">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name}`}
                          disabled={
                            disabled ||
                            item.quantity -
                              (item.quantity_limits.multiple_of || 1) <
                              item.quantity_limits.minimum
                          }
                          onClick={() =>
                            void change("update", {
                              key: item.key,
                              quantity:
                                item.quantity -
                                (item.quantity_limits.multiple_of || 1),
                            })
                          }
                        >
                          <Minus size={16} />
                        </button>
                        <span aria-label={`Quantity of ${item.name}`}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name}`}
                          disabled={
                            disabled ||
                            item.quantity +
                              (item.quantity_limits.multiple_of || 1) >
                              item.quantity_limits.maximum
                          }
                          onClick={() =>
                            void change("update", {
                              key: item.key,
                              quantity:
                                item.quantity +
                                (item.quantity_limits.multiple_of || 1),
                            })
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="side-cart-remove"
                        aria-label={`Remove ${item.name}`}
                        disabled={disabled}
                        onClick={() => void change("remove", { key: item.key })}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
        {!!cart?.items.length && (
          <div className="side-cart-summary">
            <Totals cart={cart} />
            <p>Delivery and availability are confirmed at checkout.</p>
            {disabled ? (
              <button className="button primary" disabled>
                Review and checkout
              </button>
            ) : (
              <Link href="/checkout" className="button primary" onClick={close}>
                Review and checkout
              </Link>
            )}
            <Link href="/cart" className="side-cart-full" onClick={close}>
              View bag &amp; delivery options
            </Link>
          </div>
        )}
      </dialog>
    </>
  );
}
