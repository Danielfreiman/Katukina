/** Simplify sibling labels without discarding their shared product information. */
export function describeOptions(productName: string, originals: string[]) {
  const normalize = (text: string) =>
    text.trim().replace(/(\d)\s*(?:gr|gram)\b/gi, "$1 g");
  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  const nameWords = new Set(
    productName.toLowerCase().match(/[\p{L}\d]+/gu) ?? [],
  );
  const repeatsName = (text: string) => {
    const words = text.toLowerCase().match(/[\p{L}\d]+/gu) ?? [];
    return words.length > 0 && words.every((word) => nameWords.has(word));
  };
  const labels = originals.map(normalize);
  if (!labels.length) return { labels: [], shared: [], heading: "Option" };
  if (labels.length === 1 && /^Form \d+-\d+\s+[-–]\s+1 pc$/i.test(labels[0])) {
    return { labels: ["Single option"], shared: [], heading: "Option" };
  }
  const shared: string[] = [];
  // Do not split hyphens inside a colour or model name.
  const sale = labels.map((label) =>
    label.match(
      /\s+[-–]\s+(\d+(?:[.,]\d+)?\s+(?:pcs?|packets?|bottles?|g))\s*$/i,
    ),
  );
  const commonSale = sale.every(
    (match) => match && match[1].toLowerCase() === sale[0]?.[1].toLowerCase(),
  );
  const bodies = labels.map((label, index) =>
    commonSale ? label.slice(0, sale[index]!.index).trim() : label,
  );
  if (commonSale && !/^1 pc$/i.test(sale[0]![1])) shared.push(sale[0]![1]);
  // A comma between digits is a decimal separator, not a field boundary.
  let parts = bodies.map((label) =>
    label
      .split(/(?<!\d),|,(?!\d)/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
  if (labels.length > 1) {
    const common = parts[0].filter((part) =>
      parts.every((row) =>
        row.some((value) => value.toLowerCase() === part.toLowerCase()),
      ),
    );
    const differing = parts.map((row) =>
      row.filter(
        (part) =>
          !common.some((value) => value.toLowerCase() === part.toLowerCase()),
      ),
    );
    if (differing.every((row) => row.length)) {
      parts = differing;
      shared.unshift(...common.filter((part) => !repeatsName(part)));
    }
  }
  let candidates = parts.map((row) => row.join(" · "));
  // Identical edge phrases can be shown once. Never remove numeric tokens/units.
  if (candidates.length > 1) {
    for (const edge of ["start", "end"] as const) {
      const words = candidates.map((label) => label.split(/\s+/));
      const removed: string[] = [];
      while (words.every((row) => row.length > 1)) {
        const token = edge === "start" ? words[0][0] : words[0].at(-1)!;
        const crossesSeparator = words.some((row) =>
          /^[·/\-&]$/.test(edge === "start" ? row[1] : row.at(-2)!),
        );
        if (
          crossesSeparator &&
          !(
            edge === "start" &&
            repeatsName(token) &&
            words.every(
              (row) =>
                !/^[·/\-&]$/.test(row[1]) || (row[1] === "·" && row.length > 2),
            )
          )
        )
          break;
        if (
          !/^[\p{L}][\p{L}'’-]*$/u.test(token) ||
          /^(?:g|kg|mg|ml|l|mm|cm|beads|pcs?|packets?|bottles?)$/i.test(
            token,
          ) ||
          !words.every(
            (row) =>
              (edge === "start" ? row[0] : row.at(-1))?.toLowerCase() ===
              token.toLowerCase(),
          )
        )
          break;
        if (edge === "start") {
          removed.push(token);
          words.forEach((row) => {
            row.shift();
            if (row[0] === "·") row.shift();
          });
        } else {
          removed.unshift(token);
          words.forEach((row) => row.pop());
        }
      }
      if (removed.length) {
        const phrase = removed.join(" ");
        if (repeatsName(phrase) || phrase.toLowerCase() === "wood") {
          if (!repeatsName(phrase)) shared.push(phrase);
          candidates = words.map((row) => row.join(" "));
        }
      }
    }
  }
  candidates = candidates.map(capitalize);
  // Keep the full source wording if simplification would conceal a distinction.
  if (
    new Set(candidates.map((label) => label.toLowerCase())).size !==
      candidates.length ||
    candidates.some((label) => !label || /^[·/&-]|[·/&-]$/.test(label))
  ) {
    return { labels: [...originals], shared: [], heading: "Option" };
  }
  const every = (pattern: RegExp) =>
    candidates.every((label) => pattern.test(label));
  const intensity = every(/^intensity \d+ of \d+$/i);
  const heading = intensity
    ? "Intensity"
    : every(/^\d+(?:[.,]\d+)?\s*(?:g|kg|mg)$/i)
      ? "Weight"
      : every(/^\d+(?:[.,]\d+)?\s*(?:ml|l)$/i)
        ? "Volume"
        : every(/^\d+\s+beads$/i)
          ? "Beads per pack"
          : every(/^\d.*\s(?:mm|cm)$/i)
            ? "Size"
            : "Option";
  return {
    labels: intensity
      ? candidates.map((label) => label.replace(/^intensity /i, ""))
      : candidates,
    shared: [...new Set(shared.map(capitalize))],
    heading,
  };
}
