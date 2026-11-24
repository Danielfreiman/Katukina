import type { Category } from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";

type BannerCopy = {
  heading: string;
  description: string;
};

const collections: Record<string, BannerCopy> = {
  "aromatherapy-pendants": {
    heading: "Essential oil pendants",
    description:
      "Choose a bronze steampunk aromatherapy pendant or a steel pendant with a sunflower, star or snowflake design.",
  },
  aromatics: {
    heading: "Aromatic herbs, bark & seeds",
    description:
      "From vanilla and tonka beans to Cretan sage and emburana bark, find botanicals by their scent and form.",
  },
  ashes: {
    heading: "Ashes by plant variety",
    description:
      "Compare cacao, cumaru, murici and oak ashes in small bottles and larger pots.",
  },
  "beauty-and-body": {
    heading: "Body oils & beaded jewellery",
    description:
      "Choose a coconut or hazelnut massage oil, or browse glass bead bracelets and gemstone pendants.",
  },
  "essential-oils": {
    heading: "Palo santo & other essential oils",
    description:
      "Compare palo santo, muna and red pepper essential oils, then choose an aromatherapy pendant to wear with your oil.",
  },
  "exclusive-sale": {
    heading: "The Katukina sale",
    description:
      "Browse the sale selection for purple clay tea sets, Tibetan incense, gemstone pendants and miniature singing bowls.",
  },
  "floral-waters": {
    heading: "Agua Floresta floral waters",
    description:
      "Choose Agua Floresta Florida Water or try one of the floral waters scented with palo santo, patchouli or thyme.",
  },
  giftshop: {
    heading: "Gifts for tea, music & meditation",
    description:
      "Find a Chinese tea gift set for a tea lover, a mini kalimba for a musician or a singing bowl for a meditation space.",
  },
  "herbal-teas": {
    heading: "Loose herbs for tea",
    description:
      "Browse blue lotus as whole flowers or loose petals, alongside chaga mushroom, mulungu bark and sarsaparilla.",
  },
  "incense-herbs": {
    heading: "Loose incense herbs & woods",
    description:
      "Choose palo santo chips or sticks, fragrant rosemary and Cretan sage. Charcoal discs and incense burners are here too.",
  },
  "incense-smudge": {
    heading: "Sage & cedar smudge bundles",
    description:
      "Compare blue sage, cedar and juniper bundles with braided sweetgrass and palo santo sticks.",
  },
  "incense-sticks": {
    heading: "Incense sticks & holders",
    description:
      "Choose from Shoyeido, Druk Bhutanese and Tibetan incense sticks, with wooden and porcelain holders to match.",
  },
  "jambu-and-chilcuague": {
    heading: "Jambu tincture & chilcuague root",
    description:
      "Find jambu as a 2:1 tincture and chilcuague as finely powdered root or bottled Chilcuague Original spray.",
  },
  kambo: {
    heading: "Kambo sticks & Matsés Nunu",
    description:
      "Browse Kambo sticks alongside Matsés Nunu and dragon’s blood latex, with sizes listed for each product.",
  },
  "kuripe-and-tepi": {
    heading: "Kuripe & tepi rapé applicators",
    description:
      "Compare bamboo, brass and resin applicators, from a simple kuripe with a cord to a serpent-shaped tepi.",
  },
  "life-tonics": {
    heading: "Mumijo by Life Tonics",
    description:
      "Life Tonics Mumijo comes in two pack sizes. Choose the smaller 10 g pack or the larger 25 g option.",
  },
  "mapacho-and-rape-juice": {
    heading: "Mapacho & rapé juice blends",
    description:
      "Compare bottled suco blends including Suco de Menta, Suco de Muna and Suco de Rustica.",
  },
  music: {
    heading: "Instruments & music on CD",
    description:
      "Browse ocarina flutes, seed shakers and singing bowls, or pick up a CD by Shaneihu Yawanawa or Freedom Café.",
  },
  packaging: {
    heading: "Bottles, bags & containers",
    description:
      "Choose pipette bottles in Miron glass, PET spray bottles or cotton drawstring bags for storing smaller items.",
  },
  "plant-extracts": {
    heading: "Plant resins & liquid extracts",
    description:
      "Compare blue lotus resin extract, dragon’s blood latex and mulungu liquid extract by plant and form.",
  },
  "pouches-and-purses": {
    heading: "Woven purses & drawstring pouches",
    description:
      "Find a Pococo handwoven purse, an embroidered Thai purse or a drawstring pouch in a Peruvian design.",
  },
  "puer-tea-accessories": {
    heading: "Teaware for pu-erh tea",
    description:
      "Choose a purple clay tea set for the table, a portable ceramic set for travel or a pu-erh tea knife for compressed tea.",
  },
  "puer-teas": {
    heading: "Yunnan & clementine pu-erh tea",
    description:
      "Taste two takes on pu-erh with Yunnan Puer Gold from 2003 and tea packed inside a clementine.",
  },
  rape: {
    heading: "Rapé blends by variety",
    description:
      "Compare Yawanawa Tonka, Katukina Cumaru and Apurina Awiry rapé blends and find the sizes each comes in.",
  },
  "rape-kits-and-sets": {
    heading: "Rapé gift sets & wooden boxes",
    description:
      "Choose the Rapé Wooden Box Set or compare the Feminine and Grounding rapé gift sets.",
  },
  "raw-tabaco": {
    heading: "Raw tobacco varieties",
    description:
      "Choose raw Mapacho, Arapiraca, Moi or Sabia tobacco and compare pack weights across the four varieties.",
  },
  "sacred-incense": {
    heading: "Incense resins & blends",
    description:
      "Browse myrrh and dammar resins alongside white sage, palo santo and the Prayer incense blend.",
  },
  sananga: {
    heading: "Sananga drops & root bark",
    description:
      "Compare Matsés and Katukina sananga drops, or find sananga root bark and accessories in the same collection.",
  },
  "shamanic-tools": {
    heading: "Ceremonial tools & instruments",
    description:
      "Browse painted maracas, brass bells and mala prayer beads alongside cedar bundles and abalone shells.",
  },
  "shipibo-art": {
    heading: "Shipibo embroidery & jewellery",
    description:
      "Choose a Shipibo embroidered textile by size, or find a Shipibo necklace or bracelet to wear.",
  },
  "snuff-bottles-and-spoons": {
    heading: "Snuff bottles, flasks & spoons",
    description:
      "Compare a brass snuff bottle with a steel flask, or choose a bottle or spoon that doubles as a pendant.",
  },
  specials: {
    heading: "Botanical & textile highlights",
    description:
      "Find whole blue lotus flowers, Shipibo embroidery and garnet pendants among Katukina’s featured pieces.",
  },
  superfoods: {
    heading: "Chaga, cat’s claw & Mumijo",
    description:
      "Browse the superfoods collection for chaga mushroom, cat’s claw and Life Tonics Mumijo in a choice of pack sizes.",
  },
  "tabaco-powders": {
    heading: "Mapacho & other tobacco powders",
    description:
      "Compare Mapacho and Rustica tobacco powders with Arapiraca, Moi, Perique and Sabia varieties.",
  },
  tinctures: {
    heading: "Botanical tinctures & sprays",
    description:
      "Compare a 30 ml bottle of jambu 2:1 tincture with Chilcuague Original in an 11 ml or 22 ml spray.",
  },
  tools: {
    heading: "Measuring tools & incense burners",
    description:
      "Find measuring spoons, steel funnels and sieves for preparation, or choose a lotus or elephant incense burner.",
  },
  "visionary-art": {
    heading: "Shipibo art stickers & textiles",
    description:
      "Choose Shipibo designs as matte art stickers in square formats or as embroidery in a range of textile sizes.",
  },
};

export function getCollectionBannerCopy(category: Category): BannerCopy {
  if (!category.count) {
    return {
      heading: "More from Katukina",
      description:
        "This collection has no products yet. Browse our incense, botanicals and gifts in the full catalogue.",
    };
  }
  if (Object.hasOwn(collections, category.slug))
    return collections[category.slug];

  const name = plainText(category.name);
  return {
    heading: name,
    description:
      plainText(category.description) ||
      `Browse the products in our ${name} collection and compare available sizes and prices.`,
  };
}
