import { readFile, mkdir, writeFile, access } from "node:fs/promises";

const fixtures = new URL("../tools/fixtures/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("catalog-samples.json", fixtures), "utf8"));
await mkdir(new URL("images/", fixtures), { recursive: true });
for (const product of manifest.products) {
  const target = new URL(`images/${product.image_file}`, fixtures);
  if (!/^[\d_-]+\.jpg$/.test(product.image_file)) throw new Error("Invalid image filename");
  try { await access(target); continue; } catch {}
  const source = new URL(product.image_url);
  if (source.origin !== "https://katukina.com" || !source.pathname.startsWith("/images/")) {
    throw new Error("Unexpected source origin");
  }
  const response = await fetch(source, { signal: AbortSignal.timeout(30000), redirect: "error" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/jpeg")) {
    throw new Error(`Invalid image response for ${product.sku}: ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100 || bytes.length > 10_000_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error(`Invalid JPEG for ${product.sku}`);
  }
  await writeFile(target, bytes);
  console.log(`${product.image_file}: ${bytes.length} bytes`);
}
