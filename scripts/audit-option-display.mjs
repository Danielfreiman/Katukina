import fs from "node:fs";
import assert from "node:assert/strict";
import { describeOptions } from "../lib/commerce/option-display.ts";
import { directVolumeOptions } from "../lib/commerce/volume-options.ts";
import { plainText } from "../lib/wordpress/text.ts";
const base =
  "http://localhost:3001/wp-json/wc/store/v1/products?type=variable&per_page=100";
const first = await fetch(base + "&page=1");
assert(first.ok);
const products = await first.json();
for (
  let page = 2;
  page <= Number(first.headers.get("x-wp-totalpages"));
  page++
) {
  const response = await fetch(base + "&page=" + page);
  assert(response.ok);
  products.push(...(await response.json()));
}
const report = products.map((product) => {
  const variations = product.variations;
  const grouped =
    variations.length > 0 &&
    variations.every(
      (v) =>
        v.attributes.length === 2 &&
        v.attributes.every((a) =>
          ["type", "weight"].includes(a.name.toLowerCase()),
        ),
    );
  const original = variations.map((v) =>
    v.attributes
      .map(
        (a) =>
          (v.attributes.length > 1 && !grouped ? a.name + ": " : "") + a.value,
      )
      .join(grouped ? " · " : " / "),
  );
  original.forEach((label, index) => (original[index] = plainText(label)));
  const display = describeOptions(plainText(product.name), original);
  assert.equal(display.labels.length, variations.length);
  assert.equal(
    new Set(display.labels.map((s) => s.toLowerCase())).size,
    new Set(original.map((s) => s.toLowerCase())).size,
  );
  assert(
    !display.labels.some((label) => /^[·/&-]|[·/&-]$/.test(label)),
    product.name,
  );
  for (let index = 0; index < original.length; index++) {
    if (display.labels[index] === "Single option") continue;
    const source = original[index].replace(/\s+[-–]\s+1 pc$/i, "");
    const displayed = [
      display.labels[index],
      ...display.shared,
      plainText(product.name),
    ].join(" ");
    for (const number of source.match(/\d+(?:[.,]\d+)?/g) ?? [])
      assert(
        displayed.includes(number),
        product.name + ": missing quantity " + number,
      );
  }
  const types = grouped
    ? [
        ...new Set(
          variations.map(
            (v) =>
              v.attributes.find((a) => a.name.toLowerCase() === "type").value,
          ),
        ),
      ]
    : [];
  const volumeOptions = grouped ? directVolumeOptions(variations.map(v => ({
    id: v.id,
    optionType: plainText(v.attributes.find(a => a.name.toLowerCase() === "type").value),
    optionWeight: plainText(v.attributes.find(a => a.name.toLowerCase() === "weight").value),
  }))) : null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    grouped,
    volumeOptions,
    singleType: grouped && types.length === 1,
    original,
    ...display,
    ids: variations.map((v) => v.id),
  };
});
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync(
  "artifacts/option-display-audit.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify({
    products: report.length,
    variations: report.reduce((n, p) => n + p.ids.length, 0),
    simplifiedUngrouped: report.filter(
      (p) => !p.grouped && p.original.some((s, i) => s !== p.labels[i]),
    ).length,
    sharedUngrouped: report.filter((p) => !p.grouped && p.shared.length).length,
    singleType: report.filter((p) => p.singleType).length,
    directVolume: report.filter((p) => p.volumeOptions).length,
  }),
);
if (process.argv.includes("--details"))
  for (const p of report.filter(
    (p) =>
      !p.grouped &&
      p.labels.length > 1 &&
      p.original.some((s, i) => s !== p.labels[i]),
  ))
    console.log(
      p.name +
        " => " +
        p.labels.join(" | ") +
        " [shared: " +
        p.shared.join("; ") +
        "]",
    );
