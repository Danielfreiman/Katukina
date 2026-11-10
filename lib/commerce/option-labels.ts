/** Short storefront labels; source attributes and variation IDs stay unchanged. */
export function conciseOptionLabels(productName: string, labels: string[]) {
  const nameWords = new Set(productName.toLowerCase().match(/[a-z]+/g) ?? []);
  const candidates = labels.map((label) => {
    let text = label.trim();
    const prefix = text.match(/^([^,]+),\s*/);
    if (prefix) {
      const words = prefix[1].toLowerCase().match(/[a-z]+/g) ?? [];
      if (words.length && words.every((word) => nameWords.has(word))) {
        text = text.slice(prefix[0].length);
      }
    }
    text = text.replace(/(\d)\s*gr\b/gi, "$1 g");
    // A single pack is redundant only when its weight or volume is explicit.
    if (/\d\s*(?:g|kg|mg|ml|l)\b/i.test(text)) {
      text = text.replace(/\s*[-–]\s*1\s*pc\.?\s*$/i, "");
    }
    text = text.replace(/,\s*(?=\d)/g, " · ");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : label;
  });
  // Never hide a distinction between two source options.
  const counts = new Map<string, number>();
  for (const label of candidates) {
    const key = label.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return candidates.map((label, index) =>
    counts.get(label.toLowerCase())! > 1 ? labels[index] : label,
  );
}
