import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

const files: Record<string, string> = {
  rape: "01-rape",
  "sacred-incense": "02-sacred-incense",
  "beauty-and-body": "03-beauty-body",
  "herbal-teas": "04-herbal-teas",
  giftshop: "05-giftshop",
  "shamanic-tools": "06-shamanic-tools",
  "kuripe-and-tepi": "07-kuripe-tepi",
  aromatics: "08-aromatics",
};

async function readCategoryFiles(
  slugs: string[],
  folder: string,
  extensions: string[],
) {
  const media: Record<string, string> = {};
  await Promise.all(
    slugs.map(async (slug) => {
      const name = files[slug];
      const names = new Set([name, name.replace(/^\d+-/, ""), slug]);
      let latestModified = -1;
      for (const basename of names) {
        for (const extension of extensions) {
          const url = `${folder}/${basename}.${extension}`;
          try {
            const file = await stat(path.join(process.cwd(), "public", url));
            if (!file.isFile() || !file.size || file.mtimeMs <= latestModified)
              continue;
            latestModified = file.mtimeMs;
            media[slug] = `${url}?v=${file.mtimeMs}-${file.size}`;
          } catch (error) {
            if (
              !["ENOENT", "ENOTDIR"].includes(
                (error as NodeJS.ErrnoException).code || "",
              )
            )
              throw error;
          }
        }
      }
    }),
  );
  return media;
}

export async function getHomeCategoryMedia() {
  const [icons, photos] = await Promise.all([
    readCategoryFiles(Object.keys(files), "/images/icons/categories/custom", [
      "svg",
      "png",
      "webp",
    ]),
    readCategoryFiles(Object.keys(files), "/images/home/category-circles", [
      "webp",
      "jpg",
      "jpeg",
      "png",
      "avif",
    ]),
  ]);
  return { icons, photos };
}
