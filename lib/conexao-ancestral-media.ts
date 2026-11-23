import "server-only";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { publicImageUrl } from "./public-image";

const base = "/images/home/conexao-ancestral";
const photoTypes = /\.(?:avif|jpe?g|png|webp)$/i;

async function ifPresent<T>(operation: Promise<T>) {
  try {
    return await operation;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return undefined;
    throw error;
  }
}

async function readSlot(
  folder: string,
  fileTypes: RegExp,
  preview: { src: string; alt: string },
) {
  const directory = path.join(process.cwd(), "public", base, folder);
  const entries = await ifPresent(readdir(directory, { withFileTypes: true }));
  const files = (entries ?? []).filter(
    (entry) => entry.isFile() && !entry.name.startsWith(".") && fileTypes.test(entry.name),
  );
  const candidates = await Promise.all(files.map(async ({ name }) => {
    const file = await ifPresent(stat(path.join(directory, name)));
    return file?.size ? { name, mtimeMs: file.mtimeMs, size: file.size } : undefined;
  }));
  const [image] = candidates.filter((file) => file !== undefined)
    .sort((a, b) => b.mtimeMs - a.mtimeMs || a.name.localeCompare(b.name));
  if (!image) return { src: `${base}/previa/${preview.src}`, alt: preview.alt };

  const alt = folder === "logo"
    ? preview.alt
    : (await ifPresent(readFile(path.join(directory, "descricao.txt"), "utf8")))?.trim() ?? "";
  return {
    src: `${base}/${folder}/${encodeURIComponent(image.name)}?v=${image.mtimeMs}-${image.size}`,
    alt,
  };
}

export function getConexaoAncestralMedia() {
  return Promise.all([
    readSlot("logo", /\.(?:svg|png|webp|jpe?g|avif)$/i, {
      src: "logo.svg",
      alt: "Conexão Ancestral",
    }),
    readSlot("foto-principal", photoTypes, {
      src: "values-03.webp",
      alt: "Two men in Conexão Ancestral shirts at a construction site.",
    }),
    readSlot("foto-secundaria", photoTypes, {
      src: "values-02.webp",
      alt: "A community member planting a sapling.",
    }),
    readSlot("foto-03", photoTypes, {
      src: "values-01.webp",
      alt: "Community members working together around a wooden mortar.",
    }),
    readSlot("foto-04", photoTypes, {
      src: "values-04.webp",
      alt: "Portrait of a man with body paint beside a tree.",
    }),
    publicImageUrl(`${base}/fundo/fundo-conexao-ancestral.webp`),
  ]);
}
