import { test, expect, Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

async function login(page: Page) {
  const access = JSON.parse(
    readFileSync("wordpress/.local-access.json", "utf8"),
  );
  await page.goto("/wp-login.php");
  await page.locator("#user_login").fill(access.username);
  await page.locator("#user_pass").fill(access.password);
  await Promise.all([
    page.waitForURL(/\/wp-admin\//),
    page.locator("#wp-submit").click(),
  ]);
  await page.goto("/wp-admin/admin.php?page=katukina");
  await expect(
    page.getByRole("heading", { name: "Products", exact: true }),
  ).toBeVisible();
  return page.evaluate(
    () =>
      (window as unknown as { wpApiSettings: { nonce: string } }).wpApiSettings
        .nonce,
  );
}

test("operational admin forms, permissions and concurrent reservation of the last unit", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const nonce = await login(page);
  const headers = { "X-WP-Nonce": nonce };
  const prefix = `browserops-${Date.now()}`;
  const post = async (path: string, data: unknown) =>
    page.request.post(`/wp-json/katukina/v1/${path}`, { headers, data });
  const record = async (kind: string, suffix: string, data: object) => {
    const response = await post(`records/${kind}`, {
      key: randomUUID(),
      code: `${prefix}-${suffix}`,
      data: { active: true, ...data },
    });
    expect(response.status(), await response.text()).toBe(200);
    return response.json();
  };
  const command = async (action: string, data: object) =>
    post(`command/${action}`, { key: randomUUID(), ...data });
  const createdRecords: {
    id: number;
    kind: string;
    code: string;
    version: number;
    data: Record<string, unknown>;
  }[] = [];
  const orders: number[] = [];
  let productId = 0;
  let lotId = 0;
  let reservationId = 0;
  try {
    expect([401, 403]).toContain(
      (await request.get("/wp-json/katukina/v1/report/lots")).status(),
    );
    await page.goto(
      "/wp-admin/edit.php?post_type=product&page=katukina-suppliers",
    );
    await expect(page.locator("#kat-code")).toHaveCount(0);
    await page.getByRole("link", { name: "Add new", exact: true }).click();
    await page.getByLabel("Reference code").fill(`${prefix}-supplier`);
    await page
      .getByLabel("Name", { exact: true })
      .fill("Browser integration supplier");
    await page.getByRole("button", { name: "Add new", exact: true }).click();
    await expect(page.locator(".notice-success")).toContainText(
      "Record saved.",
    );
    const supplier = (
      await (
        await page.request.get(
          `/wp-json/katukina/v1/records/supplier?search=${prefix}`,
          { headers },
        )
      ).json()
    ).rows[0];
    createdRecords.push(supplier);
    expect(
      (
        await post("records/supplier", {
          key: randomUUID(),
          id: supplier.id,
          version: 99,
          code: supplier.code,
          data: supplier.data,
        })
      ).status(),
    ).toBe(409);
    const channels = (
      await (
        await page.request.get("/wp-json/katukina/v1/records/channel", {
          headers,
        })
      ).json()
    ).rows;
    const channel = channels.find(
      (r: { code: string }) => r.code === "LOCAL-DEMO",
    );
    expect(channel).toBeTruthy();
    const productResponse = await page.request.post("/wp-json/wc/v3/products", {
      headers,
      data: {
        name: prefix,
        type: "simple",
        status: "draft",
        regular_price: "10",
        manage_stock: false,
      },
    });
    expect(productResponse.status()).toBe(201);
    productId = (await productResponse.json()).id;
    const nativeProduct = await (
      await page.request.get(`/wp-json/wc/v3/products/${productId}`, {
        headers,
      })
    ).json();
    const form = {
      id: nativeProduct.meta_data.find(
        (m: { key: string }) => m.key === "_kat_form_record_id",
      ).value,
    };
    expect(
      (
        await post("records/form", {
          key: randomUUID(),
          code: prefix,
          data: { name: "Duplicate" },
        })
      ).status(),
    ).toBe(410);
    const receipt = await command("receive", {
      code: `${prefix}-lot`,
      form_id: form.id,
      warehouse_id: channel.data.warehouse_id,
      quantity: "1",
      reason: "Browser concurrency fixture",
    });
    expect(receipt.status(), await receipt.text()).toBe(200);
    lotId = Number((await receipt.json()).id);
    const lines: number[] = [];
    for (let index = 0; index < 2; index++) {
      const response = await page.request.post("/wp-json/wc/v3/orders", {
        headers,
        data: {
          currency: "USD",
          line_items: [{ product_id: productId, quantity: 1 }],
        },
      });
      expect(response.status()).toBe(201);
      const order = await response.json();
      orders.push(order.id);
      lines.push(order.line_items[0].id);
      expect(
        (
          await command("assign-order", {
            order_id: order.id,
            channel_id: channel.id,
            reason: "Test allocation",
          })
        ).status(),
      ).toBe(200);
    }
    const reservations = await Promise.all(
      orders.map((order_id, i) =>
        command("reserve", {
          order_id,
          line_id: lines[i],
          lot_id: lotId,
          quantity: "1",
          expires_at: new Date(Date.now() + 3600000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
          reason: "Simultaneous final unit test",
        }),
      ),
    );
    expect(reservations.map((r) => r.status()).sort()).toEqual([200, 409]);
    reservationId = Number((await reservations.find((r) => r.ok())!.json()).id);
    const lot = (
      await (
        await page.request.get("/wp-json/katukina/v1/report/lots", { headers })
      ).json()
    ).rows.find((r: { id: string }) => Number(r.id) === lotId);
    expect(Number(lot.balance)).toBe(1000);
    expect(Number(lot.reserved)).toBe(1000);
    expect(
      (
        await (
          await page.request.get("/wp-json/katukina/v1/report/reconciliation", {
            headers,
          })
        ).json()
      ).rows,
    ).toEqual([]);
    await page.goto("/wp-admin/edit.php?post_type=product&page=katukina-lots");
    await expect(
      page.getByRole("heading", { name: "Lots and repacking", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: "artifacts/operations-admin-preview.png",
      fullPage: true,
    });
  } finally {
    if (reservationId)
      await command("release", {
        reservation_id: reservationId,
        reason: "Remove browser test reservation",
      });
    if (lotId)
      await command("adjust", {
        lot_id: lotId,
        quantity: "-1",
        reference: prefix,
        reason: "Close temporary browser fixture; zero physical stock",
      });
    for (const r of createdRecords.reverse()) {
      await post(`records/${r.kind}`, {
        key: randomUUID(),
        id: r.id,
        version: r.version,
        code: r.code,
        data: { ...r.data, active: false },
      });
    }
    for (const id of orders)
      await page.request.delete(`/wp-json/wc/v3/orders/${id}?force=true`, {
        headers,
      });
    if (productId)
      await page.request.delete(
        `/wp-json/wc/v3/products/${productId}?force=true`,
        { headers },
      );
  }
});

test("headless cart, destination quote, local checkout retry and customer privacy", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  const other = await browser.newContext({ baseURL: "http://localhost:3001" });
  try {
    const productResponse = await page.request.get(
      "/wp-json/wc/store/v1/products?slug=sacred-incense-palo-santo",
    );
    expect(productResponse.ok()).toBe(true);
    const products = await productResponse.json();
    const fixture = products.find(
      (product: { sku: string }) => product.sku === "1809-4055",
    );
    expect(
      fixture,
      "Import the local catalogue fixtures before testing.",
    ).toBeTruthy();
    await page.goto("/products/sacred-incense-palo-santo");
    await page.getByRole("button", { name: "Add to bag", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Added to your bag.");
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: "Order summary" }),
    ).toBeVisible();
    await expect(page.locator(".cart-line")).toHaveCount(1);
    expect(
      (await (await other.request.get("/api/commerce/cart")).json())
        .items_count,
    ).toBe(0);
    expect(
      (
        await page.request.post("/api/commerce/add", {
          data: { id: fixture.id, quantity: 1 },
          headers: { Origin: "https://untrusted.example" },
        })
      ).status(),
    ).toBe(403);
    const tokenCookie = (await page.context().cookies()).find(
      (c) => c.name === "katukina_cart",
    );
    expect(tokenCookie?.httpOnly).toBe(true);
    await page.getByRole("button", { name: /Increase/ }).click();
    await expect(page.locator('[aria-label="Quantity"]')).toHaveText("2");
    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Contact and delivery" }),
    ).toBeVisible();
    await page
      .getByLabel("Email", { exact: true })
      .fill("checkout-test@example.invalid");
    await page.getByLabel("First name", { exact: true }).fill("Local");
    await page.getByLabel("Last name", { exact: true }).fill("Test");
    await page
      .getByLabel("Street address", { exact: true })
      .fill("1 Test Street");
    await page.getByLabel("City", { exact: true }).fill("London");
    await page.getByLabel("Postcode", { exact: true }).fill("SW1A 1AA");
    await page
      .getByRole("combobox", { name: "Country", exact: true })
      .selectOption("GB");
    await page
      .getByRole("button", { name: "Review address and totals", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Place local test order — no payment",
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      page.getByRole("group", { name: "Delivery", exact: true }),
    ).toContainText("Local test delivery");
    await expect(
      page.getByRole("group", { name: "Payment", exact: true }),
    ).toContainText("Local test");
    let checkoutBody: object | undefined;
    page.on("request", (req) => {
      if (req.url().endsWith("/api/commerce/checkout"))
        checkoutBody = req.postDataJSON();
    });
    await page
      .getByRole("button", {
        name: "Place local test order — no payment",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: /Order #\d+ is recorded/ }),
    ).toBeVisible({ timeout: 60000 });
    const title = await page
      .getByRole("heading", { name: /Order #\d+ is recorded/ })
      .innerText();
    const id = Number(title.match(/#(\d+)/)![1]);
    const replay = await page.request.post("/api/commerce/checkout", {
      headers: { Origin: "http://localhost:3001" },
      data: checkoutBody,
    });
    expect(replay.status(), await replay.text()).toBe(200);
    expect((await replay.json()).order_id).toBe(id);
    const nonce = await login(page);
    const response = await page.request.get(`/wp-json/wc/v3/orders/${id}`, {
      headers: { "X-WP-Nonce": nonce },
    });
    const order = await response.json();
    expect(order.status).toBe("on-hold");
    expect(order.date_paid).toBeNull();
    expect(order.payment_method).toBe("katukina_local_test");
    await page.request.delete(`/wp-json/wc/v3/orders/${id}?force=true`, {
      headers: { "X-WP-Nonce": nonce },
    });
    const anonSession = await other.request.get(
      "/wp-admin/admin-ajax.php?action=katukina_customer_session",
    );
    expect((await anonSession.json()).user).toBeNull();
  } finally {
    await other.close();
  }
});

test("customer registration, native session, logout and private order history", async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const email = `account-test-${Date.now()}@example.invalid`;
  const password = `Test-${randomUUID()}`;
  const admin = await browser.newContext({ baseURL: "http://localhost:3001" });
  let customerId = 0;
  try {
    await page.goto("/account");
    await page
      .getByRole("button", { name: "New here? Create an account" })
      .click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your orders", exact: true }),
    ).toBeVisible();
    expect(
      (
        await page.request.get(
          "/wp-admin/admin-ajax.php?action=katukina_customer_session",
        )
      ).headers()["cache-control"],
    ).toContain("no-store");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your orders", exact: true }),
    ).toBeVisible();
    const adminPage = await admin.newPage();
    const nonce = await login(adminPage);
    const customers = await admin.request.get(
      `/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { "X-WP-Nonce": nonce } },
    );
    customerId = (await customers.json())[0].id;
    expect([401, 403]).toContain(
      (await page.request.get("/wp-json/katukina/v1/report/money")).status(),
    );
    const own = await page.request.get(
      "/wp-admin/admin-ajax.php?action=katukina_customer_session&customer_id=1",
    );
    expect((await own.json()).orders).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await admin.request.delete(
      `/wp-json/wc/v3/customers/${customerId}?force=true`,
      { headers: { "X-WP-Nonce": nonce } },
    );
    customerId = 0;
  } finally {
    await admin.close();
  }
});
