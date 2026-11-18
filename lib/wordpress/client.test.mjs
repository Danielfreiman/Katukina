import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const stubs = {
      "server-only": "export {};",
      "next/headers": `export async function cookies() {
        return { get(name) { return { value: name === "katukina_currency" ? "GBP" : "GB" }; } };
      }`,
    };
    if (Object.hasOwn(stubs, specifier)) {
      return {
        url: `data:text/javascript,${encodeURIComponent(stubs[specifier])}`,
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});
const { wordpressGet } = await import("./client.ts");
hooks.deregister();

test("recovers from transient 503 and 502 responses with the same request context", async (t) => {
  const statuses = [503, 502, 200];
  const requests = [];
  const failedBodies = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url: url.href, options });
    const status = statuses.shift();
    const response = new Response(
      status === 200 ? '[{"id":17}]' : "Unavailable",
      {
        status,
        headers: { "x-wp-total": "29", "x-wp-totalpages": "3" },
      },
    );
    if (status !== 200) failedBodies.push(response);
    return response;
  });
  const result = await wordpressGet("/wp-json/wc/store/v1/products", {
    category: 17,
  });
  assert.deepEqual(result, { data: [{ id: 17 }], total: 29, pages: 3 });
  assert.equal(requests.length, 3);
  assert(failedBodies.every((response) => response.bodyUsed));
  for (const request of requests) {
    assert.equal(new URL(request.url).searchParams.get("category"), "17");
    assert.strictEqual(request.options.signal, requests[0].options.signal);
    assert.equal(request.options.headers["X-Katukina-Destination"], "GB");
    assert.equal(request.options.headers["X-Katukina-Currency"], "GBP");
    assert.equal(request.options.cache, "no-store");
  }
});

test("persistent 503 stops after three attempts", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("Unavailable", { status: 503 }),
  );
  await assert.rejects(
    wordpressGet("/wp-json/wc/store/v1/products"),
    /unavailable \(503\)/,
  );
  assert.equal(fetch.mock.callCount(), 3);
});

test("404 and successful responses are not retried", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("Missing", { status: 404 }),
  );
  await assert.rejects(
    wordpressGet("/wp-json/wc/store/v1/products"),
    /unavailable \(404\)/,
  );
  assert.equal(fetch.mock.callCount(), 1);
  fetch.mock.mockImplementation(async () => new Response("[]"));
  assert.deepEqual(await wordpressGet("/wp-json/wc/store/v1/products"), {
    data: [],
    total: 0,
    pages: 0,
  });
  assert.equal(fetch.mock.callCount(), 2);
});
