import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../app/layout.tsx", import.meta.url);
const stylesheet = 'import "./layout-refinement.css";';
const anchor = 'import "./storefront.css";';
const action = process.argv[2] ?? "status";
if (!["on", "off", "status"].includes(action)) {
  throw new Error("Use: node scripts/layout-refinement.mjs on|off|status");
}
let source = await readFile(file, "utf8");
const enabled = source.includes(stylesheet);
if (action === "off" && enabled) {
  source = source.replace(/import "\.\/layout-refinement\.css";\r?\n/, "");
  await writeFile(file, source);
} else if (action === "on" && !enabled) {
  if (!source.includes(anchor)) throw new Error("Import-base ausente; nenhum arquivo foi alterado.");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  await writeFile(file, source.replace(anchor, `${anchor}${newline}${stylesheet}`));
}
console.log(`Refinamento visual: ${(action === "status" ? enabled : action === "on") ? "ATIVADO" : "DESATIVADO"}.`);
console.log("Recarregue o site local para comparar. As demais alterações são preservadas.");
