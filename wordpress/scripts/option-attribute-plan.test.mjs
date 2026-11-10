import test from "node:test";
import assert from "node:assert/strict";
import {
  splitWeightOption,
  buildAttributePlan,
} from "./option-attribute-plan.mjs";

test("separates cut, fine cut and explicit mass without inventing sizes", () => {
  assert.deepEqual(
    splitWeightOption("Emburana bark", {
      label: "bark, cut & sifted, 100 gr",
      sale_quantity: "1 pc",
    }),
    { type: "Cut & sifted", weight: "100 g" },
  );
  assert.deepEqual(
    splitWeightOption("Emburana bark", {
      label: "bark, cut & sifted, fine, 25 gr",
      sale_quantity: "1 pc",
    }),
    { type: "Cut & sifted, fine", weight: "25 g" },
  );
  assert.deepEqual(
    splitWeightOption("Resin", {
      label: "pieces, 0,5 kg",
      sale_quantity: "1 pc",
    }),
    { type: "Pieces", weight: "0.5 kg" },
  );
});
test("does not mistake volumes, dimensions, multipacks or bulk sales for pack weight", () => {
  for (const label of [
    "bottle, 100 ml",
    "beads, 10 mm",
    "mixed, 25 gr, 50 gr",
    "unknown",
  ]) {
    assert.equal(
      splitWeightOption("Item", { label, sale_quantity: "1 pc" }),
      null,
    );
  }
  assert.equal(
    splitWeightOption("Item", {
      label: "powder, 100 gr",
      sale_quantity: "5 pc",
    }),
    null,
  );
  assert.equal(
    splitWeightOption("Item", {
      label: "powder, 100 gr",
      sale_quantity: "1 gr",
    }),
    null,
  );
});
test("preserves an entire product if an option is ambiguous or combinations collide", () => {
  const plan = buildAttributePlan({
    items: [
      {
        name: "Bark",
        sku: "a",
        forms: [
          { sku: "a1", label: "cut, 25 gr", sale_quantity: "1 pc" },
          { sku: "a2", label: "whole", sale_quantity: "1 pc" },
        ],
      },
      {
        name: "Bark",
        sku: "b",
        forms: [
          { sku: "b1", label: "cut, 25 gr", sale_quantity: "1 pc" },
          { sku: "b2", label: "cut, 25 g", sale_quantity: "1 pc" },
        ],
      },
    ],
  });
  assert.equal(plan.products.length, 0);
  assert.equal(plan.skipped.length, 2);
});
