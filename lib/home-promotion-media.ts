import "server-only";
import { publicImageUrl } from "./public-image";

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

async function readPromotion(card: (typeof cards)[number]) {
  const image = await publicImageUrl(
    `/images/home/promotion-cards/${card.file}`,
  );
  return { ...card, image, href: `/collections/${card.slug}` };
}

export function getHomePromotionCards() {
  return Promise.all(cards.map(readPromotion));
}
