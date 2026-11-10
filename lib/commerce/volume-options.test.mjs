import test from "node:test";
import assert from "node:assert/strict";
import { directVolumeOptions } from "./volume-options.ts";
const option = (id, type, weight = "7 g") => ({
  id,
  optionType: type,
  optionWeight: weight,
});
test("unique pack sizes directly select the original variation, preserving facts", () => {
  const result = directVolumeOptions([
    option(3, "Pot, 60 ml", "30 g"),
    option(1, "Bottle, 10 ml"),
    option(2, "Bottle, 25 ml", "15 g"),
  ]);
  assert.deepEqual(
    result.map((x) => [x.id, x.label]),
    [
      [1, "10 ml"],
      [2, "25 ml"],
      [3, "60 ml"],
    ],
  );
  assert.equal(result[2].description, "Pot");
  assert.equal(result[2].weight, "30 g");
});
test("same format in different volumes needs no extra type step", () => {
  assert.equal(
    directVolumeOptions([
      option(1, "Finely powdered, 100 ml"),
      option(2, "Finely powdered, 60 ml"),
    ])[0].label,
    "60 ml",
  );
});
test("do not conceal a different cut, origin or equal-volume alternative", () => {
  assert.equal(
    directVolumeOptions([option(1, "Cut, 60 ml"), option(2, "Fine, 60 ml")]),
    null,
  );
  assert.equal(
    directVolumeOptions([option(1, "Kenya, 60 ml"), option(2, "Kua, 100 ml")]),
    null,
  );
  assert.equal(
    directVolumeOptions([option(1, "Bottle, 1000 ml"), option(2, "Pot, 1 l")]),
    null,
  );
  assert.equal(directVolumeOptions([option(1, "Whole")]), null);
});
