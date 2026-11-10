import test from "node:test";
import assert from "node:assert/strict";
import { describeOptions } from "./option-display.ts";
test("bead count is the choice; diameter and packet remain shared", () => {
  const d = describeOptions(
    "Palo Santo beads",
    [25, 50, 100].map((n) => `wood, beads, 9 mm, ${n} beads - 1 packet`),
  );
  assert.deepEqual(d.labels, ["25 beads", "50 beads", "100 beads"]);
  assert(d.shared.includes("9 mm"));
  assert(d.shared.includes("1 packet"));
  assert.equal(d.heading, "Beads per pack");
});
test("fixed packaging, material and finish move out of dimensions", () => {
  const d = describeOptions("Shipibo Sticker", [
    "sticker, 135 x 135 mm, polyester, matte - 1 pc",
    "sticker, 190 x 190 mm, polyester, matte - 1 pc",
  ]);
  assert.deepEqual(d.labels, ["135 x 135 mm", "190 x 190 mm"]);
  assert.deepEqual(d.shared, ["Polyester", "Matte"]);
  assert.equal(d.heading, "Size");
});
test("different packaging, decimal sizes, intensity and sale units stay distinct", () => {
  assert.deepEqual(
    describeOptions("Spray", [
      "bottle with sprayer, 11 ml - 1 pc",
      "bottle, 22 ml - 1 pc",
    ]).labels,
    ["Bottle with sprayer · 11 ml", "Bottle · 22 ml"],
  );
  assert.equal(
    describeOptions("Spoons", ["0,5 ml - 1 pc", "1 ml - 1 pc"]).labels[0],
    "0,5 ml",
  );
  const d = describeOptions("Drops", [
    "intensity 3 of 10, 5 ml - 1 pc",
    "intensity 9 of 10, 5 ml - 1 pc",
  ]);
  assert.deepEqual(d.labels, ["3 of 10", "9 of 10"]);
  assert(d.shared.includes("5 ml"));
  assert.equal(d.heading, "Intensity");
  const units = describeOptions("Item", ["powder - 1 g", "powder - 1 bottle"]);
  assert(units.labels[0].includes("1 g"));
  assert(units.labels[1].includes("1 bottle"));
});
test("keeps named ranges, useful qualifiers and measuring units intact", () => {
  assert.deepEqual(
    describeOptions("Blue Lotus flower petals", [
      "Petals & Stamen · 10 g",
      "Petals & Stamen · 25 g",
    ]).labels,
    ["Petals & Stamen · 10 g", "Petals & Stamen · 25 g"],
  );
  assert.deepEqual(
    describeOptions("Massage oil", [
      "Flowers of Life, 125 ml - 1 pc",
      "Seeds of Life, 125 ml - 1 pc",
    ]).labels,
    ["Flowers of Life", "Seeds of Life"],
  );
  assert.deepEqual(
    describeOptions("Metal sieve", [
      "100 mesh / 150 micron, diameter 200 mm - 1 pc",
      "65 mesh / 250 micron, diameter 200 mm - 1 pc",
    ]).labels,
    ["100 mesh / 150 micron", "65 mesh / 250 micron"],
  );
  assert.deepEqual(
    describeOptions("Seed Shaker", ["with cord - 1 pc", "with handle - 1 pc"])
      .labels,
    ["With cord", "With handle"],
  );
  assert.deepEqual(
    describeOptions("Sagebrush smudge bundle", [
      "leaves, bundle extra large - 1 pc",
      "leaves, bundle, small - 1 pc",
    ]).labels,
    ["Extra large", "Small"],
  );
});
test("single options remain meaningful and collisions fall back to source", () => {
  assert.deepEqual(
    describeOptions("Necklace", ["Form 2268-5525 - 1 pc"]).labels,
    ["Single option"],
  );
  assert.deepEqual(describeOptions("Shell", ["Shell - 1 pc"]).labels, [
    "Shell",
  ]);
  const original = ["25 gr - 1 pc", "25 g - 1 pc"];
  assert.deepEqual(describeOptions("Powder", original).labels, original);
});
