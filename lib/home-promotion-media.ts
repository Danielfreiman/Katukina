import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

const cards = [
  {
    title: "Rapé",
    description: "Rapé blends in a range of varieties and sizes.",
    slug: "rape",
    file: "01-rape.webp",
  },
  {
    title: "Kuripe & Tepi",
    description: "Kuripe and tepi applicators for your rapé ritual.",
    slug: "kuripe-and-tepi",
    file: "02-kuripe-tepi.webp",
  },
  {
    title: "Herbal Teas",
    description: "Herbal teas and botanicals for your daily cup.",
    slug: "herbal-teas",
    file: "03-herbal-teas.webp",
  },
];

export async function getHomePromotionCards() {
  return Promise.all(
    cards.map(async (card) => {
      const url = `/images/home/promotion-cards/${card.file}`;
      let image: string | null = null;
      try {
        const file = await stat(path.join(process.cwd(), "public", url));
        if (file.isFile() && file.size > 0)
          image = `${url}?v=${file.mtimeMs}-${file.size}`;
      } catch (error) {
        if (
          !["ENOENT", "ENOTDIR"].includes(
            (error as NodeJS.ErrnoException).code || "",
          )
        )
          throw error;
      }
      return { ...card, image, href: `/collections/${card.slug}` };
    }),
  );
}
