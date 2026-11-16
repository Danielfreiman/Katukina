"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cart, CommerceConfig, formatMoney } from "@/lib/commerce/types";
import { plainText } from "@/lib/wordpress/text";
export async function commerceRequest<T>(
  action: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/commerce/${action}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      plainText(data.message || "The shop could not complete this request."),
    );
  if (Array.isArray(data.items))
    data.items = data.items.map((item: { name: string }) => ({
      ...item,
      name: plainText(item.name),
    }));
  return data as T;
}
export function Totals({ cart }: { cart: Cart }) {
  const t = cart.totals;
  const money = (amount: string) =>
    formatMoney(amount || "0", t.currency_code, t.currency_minor_unit);
  return (
    <dl className="commerce-totals">
      <div>
        <dt>Items</dt>
        <dd>{money(t.total_items)}</dd>
      </div>
      {Number(t.total_discount) > 0 && (
        <div>
          <dt>Discount</dt>
          <dd>−{money(t.total_discount)}</dd>
        </div>
      )}
      <div>
        <dt>Delivery</dt>
        <dd>
          {cart.needs_shipping &&
          !cart.shipping_rates.some((p) =>
            p.shipping_rates.some((r) => r.selected),
          )
            ? "Select destination"
            : money(t.total_shipping)}
        </dd>
      </div>
      <div>
        <dt>Tax</dt>
        <dd>{money(t.total_tax)}</dd>
      </div>
      <div className="commerce-grand-total">
        <dt>Total · {t.currency_code}</dt>
        <dd>{money(t.total_price)}</dd>
      </div>
    </dl>
  );
}
export function CartView() {
  const [cart, setCart] = useState<Cart>();
  const [config, setConfig] = useState<CommerceConfig>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [country, setCountry] = useState("");
  const [postcode, setPostcode] = useState("");
  useEffect(() => {
    Promise.all([
      commerceRequest<Cart>("cart"),
      commerceRequest<CommerceConfig>("config"),
    ])
      .then(([c, settings]) => {
        setCart(c);
        setConfig(settings);
        setCountry(
          settings.countries[c.shipping_address?.country]
            ? c.shipping_address.country
            : Object.keys(settings.countries)[0] || "",
        );
        setPostcode(c.shipping_address?.postcode || "");
      })
      .catch((e) => setError(e.message));
  }, []);
  async function change(action: string, body: unknown) {
    setBusy(true);
    setError("");
    try {
      setCart(await commerceRequest<Cart>(action, body));
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (!cart)
    return (
      <p role={error ? "alert" : "status"}>{error || "Loading your bag…"}</p>
    );
  return (
    <>
      <p className="commerce-notice">
        {config?.local_checkout
          ? "Local preview. Orders are for testing; no payment or dispatch takes place."
          : "Prices and availability are confirmed by the shop at checkout."}
      </p>
      {error && (
        <p role="alert" className="commerce-error">
          {error}
        </p>
      )}
      {!cart.items.length ? (
        <div className="commerce-empty">
          <h2>Your bag is empty.</h2>
          <Link href="/shop" className="button primary">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="commerce-layout">
          <section aria-label="Bag items">
            {cart.items.map((item) => (
              <article className="cart-line" key={item.key}>
                {item.images[0] && (
                  <img
                    src={item.images[0].src}
                    alt={item.images[0].alt || item.name}
                    width={100}
                    height={100}
                  />
                )}
                <div>
                  <h2>{item.name}</h2>
                  <p>
                    {formatMoney(
                      item.totals.line_total,
                      item.totals.currency_code,
                      item.totals.currency_minor_unit,
                    )}
                  </p>
                  <div className="quantity-control">
                    <button
                      type="button"
                      disabled={busy || item.quantity <= 1}
                      aria-label={`Decrease ${item.name}`}
                      onClick={() =>
                        change("update", {
                          key: item.key,
                          quantity: item.quantity - 1,
                        })
                      }
                    >
                      −
                    </button>
                    <span aria-label="Quantity">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={
                        busy || item.quantity >= item.quantity_limits.maximum
                      }
                      aria-label={`Increase ${item.name}`}
                      onClick={() =>
                        change("update", {
                          key: item.key,
                          quantity: item.quantity + 1,
                        })
                      }
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="text-link"
                      disabled={busy}
                      onClick={() => change("remove", { key: item.key })}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="commerce-summary">
            <h2>Order summary</h2>
            <form
              className="commerce-form"
              onSubmit={(event) => {
                event.preventDefault();
                change("address", {
                  shipping_address: { country, postcode },
                  billing_address: { country, postcode },
                });
              }}
            >
              <label>
                Delivery country
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  {Object.entries(config?.countries || {}).map(
                    ([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Postcode
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  autoComplete="postal-code"
                />
              </label>
              <button className="button secondary" disabled={busy}>
                Update delivery estimate
              </button>
            </form>
            {config?.notices[country]?.note && (
              <p>{config.notices[country].note}</p>
            )}
            {cart.shipping_rates.map((pack) => (
              <fieldset className="shipping-options" key={pack.package_id}>
                <legend>Delivery options</legend>
                {pack.shipping_rates.length ? (
                  pack.shipping_rates.map((rate) => (
                    <label key={rate.rate_id}>
                      <input
                        type="radio"
                        name={`shipping-${pack.package_id}`}
                        checked={rate.selected}
                        disabled={busy}
                        onChange={() =>
                          change("shipping", {
                            package_id: pack.package_id,
                            rate_id: rate.rate_id,
                          })
                        }
                      />
                      {rate.name} ·{" "}
                      {formatMoney(
                        rate.price,
                        rate.currency_code,
                        rate.currency_minor_unit,
                      )}
                    </label>
                  ))
                ) : (
                  <p>{!postcode || cart.shipping_address.country !== country ? 'Enter your postcode and update the delivery estimate.' : 'No delivery service is available for this address.'}</p>
                )}
              </fieldset>
            ))}
            <Totals cart={cart} />
            <form
              className="coupon-form"
              onSubmit={(event) => {
                event.preventDefault();
                change("coupon", { code: coupon });
              }}
            >
              <label className="sr-only" htmlFor="coupon">
                Coupon code
              </label>
              <input
                id="coupon"
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                required
              />
              <button className="button secondary" disabled={busy}>
                Apply
              </button>
            </form>
            {cart.coupons.map((c) => (
              <p key={c.code}>
                {c.code}{" "}
                <button
                  className="text-link"
                  disabled={busy}
                  onClick={() => change("remove-coupon", { code: c.code })}
                >
                  Remove coupon
                </button>
              </p>
            ))}
            <Link className="button primary" href="/checkout">
              Review and checkout
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
