import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read names only: never inspect runtime, credentials, databases or customer exports.
const root = fileURLToPath(new URL("../", import.meta.url));
const excluded = new Set([
  ".git", ".next", "node_modules", ".runtime", "backups", ".imports",
  "output", "artifacts", "test-results", "playwright-report", ".playwright-cli",
  "__pycache__", ".impeccable",
]);
const folders = [];
const documents = [];
async function walk(relative = "") {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory() && !excluded.has(entry.name)) {
      folders.push(name);
      await walk(name);
    } else if (entry.isFile() && /\.(md|txt)$/i.test(entry.name)) {
      if (name.startsWith("docs/") || name.startsWith("skills/") ||
          name.startsWith("public/") || !relative ||
          /(^|\/)README\.(md|txt)$/i.test(name)) documents.push(name);
    }
  }
}
await walk();
const target = "docs/PROJECT_INVENTORY.md";
if (!documents.includes(target)) documents.push(target);
documents.sort();
const link = (name) => `[${name}](<${path.posix.relative("docs", name)}>)`;
const text = `# Inventário de pastas e documentos

Gerado por \`node scripts/document-project.mjs\`. Não editar manualmente.
O inventário cobre nomes de pastas de código/conteúdo e documentos de orientação,
não o conteúdo integral de arquivos, nem dependências, runtime, segredos, backups ou evidências de execução.
Pastas excluídas: ${[...excluded].map((name) => `\`${name}/\``).join(", ")}.
Pastas externas de criação/fotos estão no [mapa de responsabilidades](PROJECT_STRUCTURE.md).
O [guia geral](PROJECT_GUIDE.md) explica o que consultar para cada tarefa.

## Pastas do repositório (${folders.length})

${folders.map((name) => `- \`${name}/\``).join("\n")}

## Documentos e instruções (${documents.length})

${documents.map((name) => `- ${link(name)}`).join("\n")}
`;
await writeFile(path.join(root, target), text, "utf8");
console.log(`Updated ${target}: ${folders.length} folders, ${documents.length} documents.`);
