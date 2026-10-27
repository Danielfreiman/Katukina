"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Session = {
  user: { name: string; email: string } | null;
  nonce: string;
  registration: boolean;
  local: boolean;
  pages?: number;
  orders: {
    id: number;
    date: string;
    status: string;
    currency: string;
    total: string;
    test: boolean;
  }[];
};
async function account(
  action: string,
  body?: unknown,
  page = 1,
): Promise<Session> {
  const response = await fetch(
    `/wp-admin/admin-ajax.php?action=katukina_customer_${action}&page=${page}`,
    {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Unable to access your account.");
  return data;
}
export function AccountView() {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [register, setRegister] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => {
    account("session", undefined, page)
      .then(setSession)
      .catch((e) => setError(e.message));
  }, [page]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await account(register ? "register" : "login", {
        email: form.get("email"),
        password: form.get("password"),
      });
      setSession(await account("session"));
      setRegister(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await account("logout", { nonce: session?.nonce });
      setSession(await account("session"));
      setRegister(false);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <p role="alert" className="commerce-error">
          {error}
        </p>
      )}
      {!session ? (
        <p role="status">Loading your account…</p>
      ) : session.user ? (
        <section>
          <div className="account-welcome">
            <div>
              <h2>Hello, {session.user.name}.</h2>
              <p>{session.user.email}</p>
            </div>
            <button
              className="button secondary"
              onClick={logout}
              disabled={busy}
            >
              Sign out
            </button>
          </div>
          <h2>Your orders</h2>
          {session.orders.length ? (
            <div className="account-orders">
              {session.orders.map((order) => (
                <article key={order.id}>
                  <strong>Order #{order.id}</strong>
                  <span>{order.date}</span>
                  <span>
                    {order.status}
                    {order.test ? " · local test" : ""}
                  </span>
                  <span>
                    {new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: order.currency,
                    }).format(Number(order.total))}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <p>No orders are linked to your account yet.</p>
          )}
          {(session.pages || 0) > 1 && (
            <div className="account-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>Page {page}</span>
              <button
                disabled={page >= (session.pages || 1)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      ) : (
        <form className="commerce-form account-form" onSubmit={submit}>
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p>
            We use your details to provide your account. Read our{" "}
            <Link href="/privacy">privacy notice</Link>.
          </p>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 12 : undefined}
              maxLength={200}
              required
            />
          </label>
          {register && (
            <p className="commerce-caption">
              Use at least 12 characters. This creates a customer account for
              your orders.
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
          </button>
          {session.registration && (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          )}
          <a href="/wp-login.php?action=lostpassword">Reset your password</a>
          {session.local && (
            <p className="commerce-caption">
              Local environment: outgoing email is disabled.
            </p>
          )}
        </form>
      )}
    </>
  );
}
