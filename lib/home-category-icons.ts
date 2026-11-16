import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

const files = {
  rape: "01-rape",
  "sacred-incense": "02-sacred-incense",
  "beauty-and-body": "03-beauty-body",
  "herbal-teas": "04-herbal-teas",
  giftshop: "05-giftshop",
  "shamanic-tools": "06-shamanic-tools",
  "kuripe-and-tepi": "07-kuripe-tepi",
  aromatics: "08-aromatics",
};

export async function getHomeCategoryIcons(): Promise<Record<string, string>> {
  const icons: Record<string, string> = {};
  await Promise.all(Object.entries(files).map(async ([slug, name]) => {
    const names = new Set([name, name.replace(/^\d+-/, ""), slug]);
    let latestModified = -1;
    for (const basename of names) {
      for (const extension of ["svg", "png", "webp"]) {
        const url = `/images/icons/categories/custom/${basename}.${extension}`;
        try {
          const file = await stat(path.join(process.cwd(), "public", url));
          if (!file.isFile() || !file.size || file.mtimeMs <= latestModified) continue;
          latestModified = file.mtimeMs;
          icons[slug] = `${url}?v=${file.mtimeMs}-${file.size}`;
        } catch (error) {
          if (!["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code || "")) throw error;
        }
      }
    }
  }));
  return icons;
}
