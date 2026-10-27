import { test, expect } from "@playwright/test";
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  CONSENT_MAX_AGE,
  HISTORY_KEY,
  HISTORY_MAX_AGE,
  parseConsent,
} from "../lib/privacy/consent";

test("consent records deny invalid, old, expired or future choices", () => {
  const now = Date.now();
  const valid = {
    version: CONSENT_VERSION,
    functional: true,
    savedAt: now,
    expiresAt: now + CONSENT_MAX_AGE,
  };
  expect(parseConsent(JSON.stringify(valid), now)?.functional).toBe(true);
  for (const changed of [
    { version: "old" },
    { functional: "true" },
    { savedAt: now + 1 },
    { expiresAt: now - 1 },
    { expiresAt: now + CONSENT_MAX_AGE + 1 },
  ])
    expect(
      parseConsent(JSON.stringify({ ...valid, ...changed }), now),
    ).toBeNull();
  expect(parseConsent("bad json")).toBeNull();
});

test("optional history requires consent; withdrawal clears it across tabs without clearing the bag", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (req) => {
    if (new URL(req.url()).origin !== "http://localhost:3001")
      external.push(req.url());
  });
  const products = await (
    await request.get("/wp-json/wc/store/v1/products?per_page=2")
  ).json();
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    (window as unknown as { historyReads: string[] }).historyReads = [];
    Storage.prototype.getItem = function (key) {
      if (key.includes("recent-products"))
        (window as unknown as { historyReads: string[] }).historyReads.push(
          key,
        );
      return original.call(this, key);
    };
  });
  await page.goto(`/products/${products[0].slug}`);
  const banner = page.getByRole("region", { name: "Cookie consent" });
  await expect(banner).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { historyReads: string[] }).historyReads,
    ),
  ).toEqual([]);
  await banner.getByRole("button", { name: "Choose preferences" }).click();
  const dialog = page.getByRole("dialog", { name: "Cookie preferences" });
  await expect(dialog.getByRole("checkbox")).not.toBeChecked();
  await dialog.getByRole("checkbox").check();
  await page.keyboard.press("Escape");
  await expect(
    banner.getByRole("button", { name: "Choose preferences" }),
  ).toBeFocused();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY),
  ).toBeNull();
  await banner.getByRole("button", { name: "Reject optional" }).click();
  await page.reload();
  await expect(banner).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY),
  ).toBeNull();
  await page.goto("/cart");
  await expect
    .poll(async () =>
      (await context.cookies()).some(
        (cookie) => cookie.name === "katukina_cart",
      ),
    )
    .toBe(true);
  const cartBefore = (await context.cookies()).find(
    (cookie) => cookie.name === "katukina_cart",
  )!;
  expect(cartBefore.httpOnly).toBe(true);
  expect(cartBefore.sameSite).toBe("Strict");
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Save preferences" }).click();
  await page.goto(`/products/${products[0].slug}`);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || "[]").length,
        HISTORY_KEY,
      ),
    )
    .toBe(1);
  await page.goto(`/products/${products[1].slug}`);
  await expect(
    page
      .getByRole("region", { name: "Recently viewed products" })
      .locator(`[data-product-id="${products[0].id}"]`),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("/shop");
  await expect(
    other.getByRole("region", { name: "Recently viewed products" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Reject optional" }).click();
  await expect(
    other.getByRole("region", { name: "Recently viewed products" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Recently viewed products" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY),
  ).toBeNull();
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "katukina_cart")
      ?.value,
  ).toBe(cartBefore.value);
  await other.close();
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("expired consent and legacy history are removed; policy and preferences are accessible on mobile", async ({
  page,
}) => {
  await page.addInitScript(
    ({ consentKey, historyKey, version, age }) => {
      const savedAt = Date.now() - age - 1000;
      localStorage.setItem(
        consentKey,
        JSON.stringify({
          version,
          functional: true,
          savedAt,
          expiresAt: savedAt + age,
        }),
      );
      localStorage.setItem(
        historyKey,
        JSON.stringify([{ id: 403, viewedAt: Date.now() }]),
      );
      localStorage.setItem("katukina:recent-products:v1", "[403]");
    },
    {
      consentKey: CONSENT_KEY,
      historyKey: HISTORY_KEY,
      version: CONSENT_VERSION,
      age: CONSENT_MAX_AGE,
    },
  );
  await page.goto("/cookies");
  await expect(
    page.getByRole("region", { name: "Cookie consent" }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY),
  ).toBeNull();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("katukina:recent-products:v1"),
    ),
  ).toBeNull();
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Choose preferences" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Choose preferences" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cookie policy", exact: true }),
  ).toBeVisible();
});

test("history expires per product and storage failures keep optional features off", async ({
  page,
  request,
}) => {
  const products = await (
    await request.get("/wp-json/wc/store/v1/products?per_page=1")
  ).json();
  await page.goto("/cookies");
  await page
    .getByRole("button", { name: "Accept optional", exact: true })
    .click();
  await page.evaluate(
    ({ key, age, id }) =>
      localStorage.setItem(
        key,
        JSON.stringify([{ id, viewedAt: Date.now() - age - 1000 }]),
      ),
    { key: HISTORY_KEY, age: HISTORY_MAX_AGE, id: products[0].id },
  );
  await page.goto("/shop");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY))
    .toBeNull();
  await page.evaluate(() => localStorage.clear());
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/cookies");
  await page
    .getByRole("button", { name: "Accept optional", exact: true })
    .click();
  await expect(
    page.getByText(/Your browser could not save your choice/),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY),
  ).toBeNull();
});

test("open tabs expire consent and the policy works without JavaScript", async ({
  page,
  browser,
}) => {
  await page.addInitScript(
    ({ key, version, age }) => {
      const savedAt = Date.now() - age + 2000;
      localStorage.setItem(
        key,
        JSON.stringify({
          version,
          functional: true,
          savedAt,
          expiresAt: savedAt + age,
        }),
      );
    },
    { key: CONSENT_KEY, version: CONSENT_VERSION, age: CONSENT_MAX_AGE },
  );
  await page.goto("/cookies");
  await expect(
    page.getByRole("region", { name: "Cookie consent" }),
  ).toBeVisible({ timeout: 10000 });
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY),
  ).toBeNull();
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plain = await context.newPage();
    await plain.goto("http://localhost:3001/cookies");
    await expect(
      plain.getByRole("heading", { name: "Cookie policy", exact: true }),
    ).toBeVisible();
    expect((await context.cookies()).length).toBe(0);
  } finally {
    await context.close();
  }
});
