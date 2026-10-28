import { NextRequest, NextResponse } from "next/server";
const backend = process.env.WORDPRESS_INTERNAL_URL || "http://127.0.0.1:8888";
const publicOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
).origin;
const cookieName = "katukina_cart";
const actions: Record<string, { path: string; method: string }> = {
  cart: { path: "wc/store/v1/cart", method: "GET" },
  config: { path: "katukina/v1/commerce/config", method: "GET" },
  currency: { path: "katukina/v1/commerce/config", method: "POST" },
  subscribe: { path: "katukina/v1/commerce/subscriptions", method: "POST" },
  add: { path: "wc/store/v1/cart/add-item", method: "POST" },
  update: { path: "wc/store/v1/cart/update-item", method: "POST" },
  remove: { path: "wc/store/v1/cart/remove-item", method: "POST" },
  coupon: { path: "wc/store/v1/cart/apply-coupon", method: "POST" },
  "remove-coupon": { path: "wc/store/v1/cart/remove-coupon", method: "POST" },
  address: { path: "wc/store/v1/cart/update-customer", method: "POST" },
  shipping: { path: "wc/store/v1/cart/select-shipping-rate", method: "POST" },
  checkout: { path: "wc/store/v1/checkout", method: "POST" },
};
type Context = { params: Promise<{ action: string }> };
async function handle(request: NextRequest, context: Context) {
  const { action } = await context.params;
  const target = actions[action];
  const reply = (data: unknown, status = 200) =>
    NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
    });
  if (!target || target.method !== request.method)
    return reply({ message: "Unsupported operation." }, 405);
  if (
    request.method !== "GET" &&
    (request.headers.get("origin") !== publicOrigin ||
      !request.headers.get("content-type")?.startsWith("application/json"))
  )
    return reply({ message: "Invalid request origin." }, 403);
  let token = request.cookies.get(cookieName)?.value;
  let destination = request.cookies.get("katukina_destination")?.value || "";
  let currency = request.cookies.get("katukina_currency")?.value || "";
  const loginCookies = request.cookies
    .getAll()
    .filter((c) => /^wordpress_logged_in_[a-f0-9]+$/.test(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  try {
    let body: string | undefined;
    let checkoutKey: string | undefined;
    if (request.method === "POST") {
      body = await request.text();
      if (Buffer.byteLength(body) > 24000)
        return reply({ message: "Request is too large." }, 413);
      const data = JSON.parse(body);
      if (!data || typeof data !== "object" || Array.isArray(data))
        return reply({ message: "Invalid request." }, 400);
      if (action === "currency") {
        if (!/^[A-Z]{3}$/.test(data.currency || ""))
          return reply({ message: "Invalid currency." }, 400);
        if (token) {
          const existing = await fetch(`${backend}/wp-json/wc/store/v1/cart`, {
            headers: {
              "Cart-Token": token,
              "X-Katukina-Channel": process.env.KATUKINA_CHANNEL || "",
              "X-Katukina-Currency": currency,
            },
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(45000),
          });
          if (!existing.ok || (await existing.json()).items_count)
            return reply(
              { message: "Empty your bag before changing currency." },
              409,
            );
        }
        currency = data.currency;
        body = undefined;
      }
      if (
        action === "address" &&
        /^[A-Z]{2}$/.test(data.shipping_address?.country || "")
      )
        destination = data.shipping_address.country;
      if (
        action === "checkout" &&
        !/^\d+$/.test(String(data.expected_total ?? ""))
      )
        return reply(
          { message: "Review your order total before placing the order." },
          400,
        );
      if (action === "checkout") {
        checkoutKey = data.request_key;
        if (!checkoutKey || !/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey))
          return reply({ message: "Invalid checkout request key." }, 400);
        delete data.request_key;
        body = JSON.stringify(data);
      }
    }
    if (
      !token &&
      target.method === "POST" &&
      !["currency", "subscribe"].includes(action)
    ) {
      const initial = await fetch(`${backend}/wp-json/wc/store/v1/cart`, {
        headers: {
          "X-Katukina-Channel": process.env.KATUKINA_CHANNEL || "",
          "X-Katukina-Destination": destination,
          "X-Katukina-Currency": currency,
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      token = initial.headers.get("cart-token") || undefined;
      if (!initial.ok || !token)
        return reply(
          { message: "Could not start your bag. Please try again." },
          502,
        );
    }
    const response = await fetch(`${backend}/wp-json/${target.path}`, {
      method: action === "currency" ? "GET" : target.method,
      headers: {
        Accept: "application/json",
        "X-Katukina-Channel": process.env.KATUKINA_CHANNEL || "",
        "X-Katukina-Destination": destination,
        "X-Katukina-Currency": currency,
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { "Cart-Token": token } : {}),
        ...(checkoutKey ? { "X-Katukina-Request": checkoutKey } : {}),
        ...(loginCookies ? { Cookie: loginCookies } : {}),
      },
      body,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(45000),
    });
    const data = await response.json();
    const result = reply(data, response.status);
    if (response.ok && action === "currency")
      result.cookies.set("katukina_currency", currency, {
        httpOnly: true,
        secure: publicOrigin.startsWith("https:"),
        sameSite: "lax",
        path: "/",
        maxAge: 1209600,
      });
    if (response.ok && action === "address" && destination)
      result.cookies.set("katukina_destination", destination, {
        httpOnly: true,
        secure: publicOrigin.startsWith("https:"),
        sameSite: "lax",
        path: "/",
        maxAge: 1209600,
      });
    const nextToken = response.headers.get("cart-token") || token;
    if (nextToken && action !== "config")
      result.cookies.set(cookieName, nextToken, {
        httpOnly: true,
        secure: publicOrigin.startsWith("https:"),
        sameSite: "strict",
        path: "/api/commerce",
        maxAge: 172800,
      });
    return result;
  } catch (error) {
    return reply(
      {
        message:
          error instanceof SyntaxError
            ? "Invalid JSON request."
            : "The shop could not respond. Please try again.",
      },
      error instanceof SyntaxError ? 400 : 502,
    );
  }
}
export const GET = handle;
export const POST = handle;
