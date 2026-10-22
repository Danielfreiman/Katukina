"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Address,
  Cart,
  CommerceConfig,
  formatMoney,
} from "@/lib/commerce/types";
import { commerceRequest, Totals } from "./cart";
const empty: Address = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  email: "",
  phone: "",
};
export function CheckoutView() {
  const [cart, setCart] = useState<Cart>();
  const [config, setConfig] = useState<CommerceConfig>();
  const [address, setAddress] = useState<Address>(empty);
  const [billing, setBilling] = useState<Address>(empty);
  const [separate, setSeparate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<number>();
  const requestKey = useRef("");
  useEffect(() => {
    let active = true;
    Promise.all([
      commerceRequest<Cart>("cart"),
      commerceRequest<CommerceConfig>("config"),
    ])
      .then(([c, settings]) => {
        // Strict Mode can replay this effect. A discarded request must not
        // replace the customer's edits after the active request finishes.
        if (!active) return;
        setCart(c);
        setConfig(settings);
        const country = settings.countries[c.shipping_address?.country]
          ? c.shipping_address.country
          : Object.keys(settings.countries)[0] || "";
        setAddress({
          ...empty,
          ...c.shipping_address,
          country,
          state: c.shipping_address?.country === country ? c.shipping_address.state : "",
          email: c.billing_address?.email || "",
        });
        setBilling({ ...empty, ...c.billing_address, country, state: c.billing_address?.country === country ? c.billing_address.state : "" });
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const notice = config?.notices[address.country];
  function update(field: keyof Address, value: string, isBilling = false) {
    (isBilling ? setBilling : setAddress)((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'country' && value !== prev.country ? { state: '' } : {}),
    }));
    setReviewed(false);
    setAccepted(false);
    requestKey.current = "";
  }
  async function review(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await commerceRequest<Cart>("address", {
        shipping_address: address,
        billing_address: {
          ...(separate ? billing : address),
          email: address.email,
        },
      });
      setCart(data);
      setReviewed(true);
      requestKey.current = crypto.randomUUID();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function place() {
    if (!cart || !config) return;
    setBusy(true);
    setError("");
    try {
      const result = await commerceRequest<{
        order_id: number;
        status: string;
      }>("checkout", {
        request_key: requestKey.current,
        billing_address: {
          ...(separate ? billing : address),
          email: address.email,
        },
        shipping_address: address,
        payment_method: config.payment_method,
        payment_data: [],
        expected_total: cart.totals.total_price,
        extensions: notice?.requires_acceptance
          ? {
              katukina: {
                acceptance: {
                  id: notice.id,
                  version: notice.version,
                  accepted,
                },
              },
            }
          : {},
      });
      setOrder(result.order_id);
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function shipping(packageId: number, rateId: string) {
    setBusy(true);
    try {
      setCart(
        await commerceRequest<Cart>("shipping", {
          package_id: packageId,
          rate_id: rateId,
        }),
      );
      requestKey.current = crypto.randomUUID();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function fields(data: Address, isBilling = false) {
    return (
      <div className="address-grid">
        {(
          [
            ["first_name", "First name"],
            ["last_name", "Last name"],
            ["address_1", "Street address"],
            ["address_2", "Apartment / suite (optional)"],
            ["city", "City"],
            ["state", "State / county (if required)"],
            ["postcode", "Postcode"],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={data[key] || ""}
              onChange={(e) => update(key, e.target.value, isBilling)}
              required={!["address_2", "state"].includes(key)}
              autoComplete={`${isBilling ? "billing" : "shipping"} ${key === "first_name" ? "given-name" : key === "last_name" ? "family-name" : key === "address_1" ? "address-line1" : key === "address_2" ? "address-line2" : key === "city" ? "address-level2" : key === "state" ? "address-level1" : "postal-code"}`}
            />
          </label>
        ))}
        <label>
          Country
          <select
            value={data.country}
            onChange={(e) => update("country", e.target.value, isBilling)}
            required
          >
            {Object.entries(config?.countries || {}).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }
  if (order)
    return (
      <section className="commerce-success">
        <p className="eyebrow">LOCAL TEST COMPLETE</p>
        <h2>Order #{order} is recorded.</h2>
        <p>
          No payment was collected. This order is on hold in WooCommerce and
          will not be dispatched.
        </p>
        <Link href="/shop" className="button primary">
          Back to the collection
        </Link>
      </section>
    );
  if (!cart || !config)
    return (
      <p role={error ? "alert" : "status"}>{error || "Preparing checkout…"}</p>
    );
  if (!cart.items.length)
    return (
      <p>
        Your bag is empty. <Link href="/shop">Explore the collection.</Link>
      </p>
    );
  return (
    <>
      <p className="commerce-notice">
        {config.local_checkout
          ? "Local test checkout. Use test details. No payment, tax validation or dispatch takes place."
          : "Review your address, delivery service and total before placing your order."}
      </p>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
      <div className="commerce-layout">
        <form className="commerce-form" onSubmit={review}>
          <h2>Contact and delivery</h2>
          <label>
            Email
            <input
              type="email"
              value={address.email || ""}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          {fields(address)}
          <label className="commerce-check">
            <input
              type="checkbox"
              checked={separate}
              onChange={(e) => {
                setSeparate(e.target.checked);
                setReviewed(false);
              }}
            />
            Use a different billing address
          </label>
          {separate && (
            <>
              <h2>Billing address</h2>
              {fields(billing, true)}
            </>
          )}
          {notice?.note && <p>{notice.note}</p>}
          {notice?.warning && (
            <p className="commerce-notice">{notice.warning}</p>
          )}
          <button className="button secondary" disabled={busy}>
            {busy ? "Updating…" : "Review address and totals"}
          </button>
        </form>
        <aside className="commerce-summary">
          <h2>Your order</h2>
          {cart.items.map((item) => (
            <div className="checkout-line" key={item.key}>
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>
                {formatMoney(
                  item.totals.line_total,
                  item.totals.currency_code,
                  item.totals.currency_minor_unit,
                )}
              </span>
            </div>
          ))}
          {reviewed &&
            cart.shipping_rates.map((pack) => (
              <fieldset className="shipping-options" key={pack.package_id}>
                <legend>Delivery</legend>
                {pack.shipping_rates.length ? (
                  pack.shipping_rates.map((rate) => (
                    <label key={rate.rate_id}>
                      <input
                        type="radio"
                        name={`delivery-${pack.package_id}`}
                        checked={rate.selected}
                        disabled={busy}
                        onChange={() => shipping(pack.package_id, rate.rate_id)}
                      />
                      {rate.name}
                    </label>
                  ))
                ) : (
                  <p>No delivery service is available for this address.</p>
                )}
              </fieldset>
            ))}
          <Totals cart={cart} />
          {reviewed && (
            <p className="reviewed-address">
              Deliver to: {address.first_name} {address.last_name},{" "}
              {address.address_1}, {address.city}, {address.postcode},{" "}
              {config.countries[address.country]}.
            </p>
          )}
          {notice?.requires_acceptance && (
            <label className="commerce-check">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => {
                  setAccepted(e.target.checked);
                  requestKey.current = crypto.randomUUID();
                }}
              />
              I have read and accept the destination notice above.
            </label>
          )}
          <button
            className="button primary"
            type="button"
            onClick={place}
            disabled={
              busy ||
              !reviewed ||
              !config.local_checkout ||
              (!!notice?.requires_acceptance && !accepted) ||
              (cart.needs_shipping &&
                !cart.shipping_rates.every((p) =>
                  p.shipping_rates.some((r) => r.selected),
                ))
            }
          >
            {busy
              ? "Processing…"
              : config.local_checkout
                ? "Place local test order — no payment"
                : "Payments are not configured"}
          </button>
          {!reviewed && (
            <p className="commerce-caption">
              Review your address to confirm the final total.
            </p>
          )}
          <Link href="/cart" className="text-link">
            Edit your bag
          </Link>
        </aside>
      </div>
    </>
  );
}
