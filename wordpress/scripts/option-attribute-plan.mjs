// Parse only an explicit, final mass value. Never infer shipping/net weights.
export function splitWeightOption(name, form) {
  if (form.sale_quantity !== "1 pc") return null;
  const match = form.label.match(
    /^(.*?),\s*(\d+(?:[.,]\d+)?)\s*(gr|g|kg|mg)\s*$/i,
  );
  if (!match || Number(match[2].replace(",", ".")) <= 0) return null;
  let type = match[1].trim();
  if (/\d\s*(?:gr|g|kg|mg)\b/i.test(type)) return null;
  const words = new Set(name.toLowerCase().match(/[a-z]+/g) ?? []);
  const prefix = type.match(/^([^,]+),\s*/);
  if (
    prefix &&
    prefix[1]
      .toLowerCase()
      .split(/\s+/)
      .every((word) => words.has(word))
  ) {
    type = type.slice(prefix[0].length);
  }
  if (!type) return null;
  type = type.charAt(0).toUpperCase() + type.slice(1);
  const unit = match[3].toLowerCase() === "gr" ? "g" : match[3].toLowerCase();
  return { type, weight: `${Number(match[2].replace(",", "."))} ${unit}` };
}

export function buildAttributePlan(manifest) {
  const products = [],
    skipped = [];
  for (const item of manifest.items) {
    const rows = item.forms.map((form) => ({
      sku: form.sku,
      original: `${form.label} - ${form.sale_quantity}`,
      attributes: splitWeightOption(item.name, form),
    }));
    const labels = rows.map((row) => row.original);
    for (const row of rows) {
      if (labels.filter((label) => label === row.original).length > 1)
        row.original += ` (${row.sku})`;
    }
    const keys = rows.map((row) =>
      JSON.stringify(row.attributes).toLowerCase(),
    );
    if (
      rows.some((row) => !row.attributes) ||
      new Set(keys).size !== rows.length
    ) {
      skipped.push({
        sku: item.sku,
        reason: rows.some((row) => !row.attributes)
          ? "No unambiguous weight for every option"
          : "Duplicate type/weight combination",
      });
      continue;
    }
    products.push({ sku: item.sku, name: item.name, rows });
  }
  return { version: 1, products, skipped };
}
