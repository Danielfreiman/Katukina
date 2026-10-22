"use client";
import { useState } from "react";
import Link from "next/link";
import { Cart, CommerceConfig, formatMoney } from "@/lib/commerce/types";
import { commerceRequest } from "./cart";
export function ShippingCalculator({ config }: { config: CommerceConfig }) {
  const [country, setCountry] = useState(
    Object.keys(config.countries)[0] || "",
  );
  const [postcode, setPostcode] = useState("");
  const [cart, setCart] = useState<Cart>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function estimate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const current = await commerceRequest<Cart>("cart");
      if (!current.items.length)
        throw new Error(
          "Add an item to your bag to calculate delivery for its weight and destination.",
        );
      setCart(
        await commerceRequest<Cart>("address", {
          shipping_address: { country, postcode },
          billing_address: { country, postcode },
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="commerce-layout">
      <form className="commerce-form" onSubmit={estimate}>
        <h2>Estimate delivery for your bag</h2>
        <label>
          Country
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            {Object.entries(config.countries).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Postcode
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            required
          />
        </label>
        <button className="button primary" disabled={busy || !country}>
          {busy ? "Calculating…" : "Calculate delivery"}
        </button>
        {error && (
          <p role="alert" className="commerce-error">
            {error}
          </p>
        )}
        <Link href="/shop" className="text-link">
          Explore the collection
        </Link>
      </form>
      <section className="commerce-summary">
        <h2>Delivery options</h2>
        {config.local_checkout && (
          <p className="commerce-notice">
            Local preview. The test delivery service does not dispatch goods.
          </p>
        )}
        {config.notices[country]?.note && <p>{config.notices[country].note}</p>}
        {cart ? (
          cart.shipping_rates.map((pack) =>
            pack.shipping_rates.length ? (
              pack.shipping_rates.map((rate) => (
                <p key={rate.rate_id}>
                  {rate.name} ·{" "}
                  {formatMoney(
                    rate.price,
                    rate.currency_code,
                    rate.currency_minor_unit,
                  )}
                </p>
              ))
            ) : (
              <p key={pack.package_id}>
                No service is available for this address.
              </p>
            ),
          )
        ) : (
          <p>
            Select your destination to see the available services for the items
            in your bag.
          </p>
        )}
        <Link href="/cart" className="text-link">
          Review your bag
        </Link>
      </section>
    </div>
  );
}
