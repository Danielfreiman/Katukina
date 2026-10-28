"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

export function DestinationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [refreshing, startRefresh] = useTransition();
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [country, setCountry] = useState("");
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currency, setCurrency] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (pathname === "/checkout") return;
    const abort = new AbortController();
    fetch("/api/commerce/config", {
      signal: abort.signal,
      headers: { "X-Katukina-View": "destination" },
    })
      .then(async (response) => {
        if (!response.ok) return;
        const config = await response.json();
        setCountries(config.countries || {});
        setCountry(config.destination || "");
        setCurrencies(config.currencies || []);
        setCurrency(config.currency || "");
      })
      .catch(() => {});
    return () => abort.abort();
  }, [pathname]);
  async function select(value: string) {
    if (!value) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/commerce/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: {
            country: value,
            state: "",
            postcode: "",
            city: "",
          },
          billing_address: {
            country: value,
            state: "",
            postcode: "",
            city: "",
          },
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Destination could not be updated.");
      setCountry(value);
      startRefresh(() => router.refresh());
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (pathname === "/checkout" || !Object.keys(countries).length) return null;
  async function selectCurrency(value: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/commerce/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: value }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Currency could not be changed.");
      setCurrency(value);
      startRefresh(() => router.refresh());
      window.dispatchEvent(new Event("katukina-cart-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="destination-selector">
      <label>
        Ship to{" "}
        <select
          aria-label="Shopping destination"
          value={country}
          disabled={busy || refreshing}
          onChange={(event) => select(event.target.value)}
        >
          <option value="">Choose country</option>
          {Object.entries(countries).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {currencies.length > 1 && (
        <label>
          {" "}
          Currency{" "}
          <select
            aria-label="Shopping currency"
            value={currency}
            disabled={busy || refreshing}
            onChange={(event) => selectCurrency(event.target.value)}
          >
            {currencies.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
      )}
      {message && <span role="alert"> {message}</span>}
    </span>
  );
}
