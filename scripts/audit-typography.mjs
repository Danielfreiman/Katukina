import { readdir, readFile, writeFile } from "node:fs/promises";

// Source inventory, not a CSS cascade resolver. Keep responsive/selector context.
const properties = /^(font(?:-family|-size|-weight|-style|-variant-numeric)?|line-height|letter-spacing|text-wrap|max-width)$/;
const rows = [];
const failures = [];
const files = (await readdir("app")).filter((file) => file.endsWith(".css")).sort();
for (const file of files) {
  const source = await readFile(`app/${file}`, "utf8");
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
  const stack = [];
  let cursor = 0;
  for (const match of clean.matchAll(/[{}]/g)) {
    const fragment = clean.slice(cursor, match.index).trim();
    if (match[0] === "{") stack.push(fragment);
    else {
      const selector = stack.pop();
      const declarations = Object.fromEntries(fragment.split(";").map((declaration) => {
        const colon = declaration.indexOf(":");
        return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
      }).filter(([property]) => properties.test(property)));
      if (Object.keys(declarations).length && !selector.startsWith("@")) {
        const line = clean.slice(0, cursor).split("\n").length;
        rows.push({ file: `app/${file}`, line, context: stack.join(" / ") || "base", selector, ...declarations });
        if (declarations["font-family"] && !/^var\(--font-(?:body|display)\)/.test(declarations["font-family"])) failures.push(`${file}:${line} unofficial font family`);
        if (/\b\d+(?:\.\d+)?px\b/.test(declarations["font-size"] || "")) failures.push(`${file}:${line} fixed pixel font size`);
        if (/^-?(?:0?\.)?\d+em$/.test(declarations["letter-spacing"] || "") && parseFloat(declarations["letter-spacing"]) < -.04) failures.push(`${file}:${line} over-tight tracking`);
      }
    }
    cursor = match.index + 1;
  }
}
const pkg = JSON.parse(await readFile("package.json", "utf8"));
for (const name of Object.keys(pkg.dependencies)) if (name.startsWith("@fontsource")) failures.push(`Unused legacy font dependency: ${name}`);
const layout = await readFile("app/layout.tsx", "utf8");
if (!layout.includes("Sora(") || !layout.includes("Source_Sans_3(")) failures.push("Official font loaders missing");
if (process.argv.includes("--write")) {
  const escape = (value) => String(value || "inherit / see cascade").replaceAll("|", "\\|").replaceAll("\n", " ");
  const lines = ["# Inventário tipográfico por seletor", "", "Gerado por `node scripts/audit-typography.mjs --write`. Fonte: CSS local; não substitui os estilos computados em navegador. Valores ausentes são herdados ou definidos por outra regra. Regras posteriores e especificidade determinam o resultado final. Inclui folhas históricas para evitar reintroduzir estilos antigos.", "", "Sistema e critérios: [TYPOGRAPHY.md](TYPOGRAPHY.md).", ""];
  for (const file of files) {
    lines.push(`## app/${file}`, "", "| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |", "| --- | --- | --- | --- | --- | --- |");
    for (const row of rows.filter((row) => row.file === `app/${file}`)) lines.push(`| ${escape(row.selector)} · ${escape(row.context)} | ${escape(row["font-family"] || row.font)} | ${escape(row["font-size"])} | ${escape(row["font-weight"])} | ${escape(row["line-height"])} | ${escape(row["letter-spacing"])} |`);
    lines.push("");
  }
  await writeFile("docs/katukina/TYPOGRAPHY-INVENTORY.md", lines.join("\n"));
  await writeFile("output/typography-inventory.json", JSON.stringify(rows, null, 2));
}
console.log(JSON.stringify({ stylesheets: files.length, rules: rows.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
