type SizedOption = { id: number; optionType?: string; optionWeight?: string };

/** A unique pack volume can select the SKU directly; weight is then a fact. */
export function directVolumeOptions(options: SizedOption[]) {
  if (!options.length) return null;
  const parsed = options.map((option) => {
    const match = option.optionType?.match(
      /^(.*?),\s*(\d+(?:[.,]\d+)?)\s*(ml|l)$/i,
    );
    if (!match || !option.optionWeight) return null;
    const amount = Number(match[2].replace(",", "."));
    if (amount <= 0) return null;
    return {
      id: option.id,
      label: `${amount} ${match[3].toLowerCase()}`,
      description: match[1].trim(),
      weight: option.optionWeight,
      ml: amount * (match[3].toLowerCase() === "l" ? 1000 : 1),
    };
  });
  if (parsed.some((option) => !option)) return null;
  const rows = parsed.filter((option) => option !== null);
  if (new Set(rows.map((option) => option.ml)).size !== rows.length)
    return null;
  const sameContents =
    new Set(rows.map((option) => option.description.toLowerCase())).size === 1;
  const packagingOnly = rows.every((option) =>
    /^(bottle|pot)$/i.test(option.description),
  );
  if (!sameContents && !packagingOnly) return null;
  return rows.sort((a, b) => a.ml - b.ml);
}
