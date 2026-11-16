import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(root, "visual-versions/active.json");
const state = JSON.parse(await readFile(manifestPath, "utf8"));
const requested = process.argv[2] || "status";
const versions = ["antigo", "novo"];
if (!versions.includes(state.version) || ![...versions, "status"].includes(requested)) {
  throw new Error("Use: npm run visual:antigo | visual:novo | visual:status");
}
const files = ["app/layout.tsx", "app/page.tsx", "components/home/reference-widgets.tsx", "components/site/header.tsx", "components/site/footer.tsx"];
if (JSON.stringify(state.files) !== JSON.stringify(files)) {
  throw new Error("Lista de arquivos inesperada. Nenhum arquivo foi alterado.");
}
if (requested === "status" || requested === state.version) {
  console.log(`Visual ativo: ${state.version}.`);
  process.exit(0);
}
// Read every source before any mutation; missing snapshots cannot partially switch the site.
const entries = await Promise.all(files.map(async file => ({
  file,
  current: await readFile(path.join(root, file)),
  target: await readFile(path.join(root, "visual-versions", requested, `${file}.txt`)),
})));
async function replace(file, content) {
  const temporary = `${file}.visual-tmp`;
  await writeFile(temporary, content);
  await rename(temporary, file);
}
// Preserve the latest edits of the active version before restoring the other one.
for (const entry of entries) {
  await replace(path.join(root, "visual-versions", state.version, `${entry.file}.txt`), entry.current);
}
try {
  for (const entry of entries) await replace(path.join(root, entry.file), entry.target);
  await replace(manifestPath, `${JSON.stringify({ ...state, version: requested }, null, 2)}\n`);
} catch (error) {
  for (const entry of entries) await replace(path.join(root, entry.file), entry.current);
  throw error;
}
console.log(`Visual ${requested} ativado. Recarregue http://localhost:3001/.`);
console.log("Os ajustes da versão anterior foram salvos. Produtos e banco não foram alterados.");
console.log("Em servidor de produção, gere um novo build e reinicie para aplicar a troca.");
