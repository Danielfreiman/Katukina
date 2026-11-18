import type { Category } from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";

type BannerCopy = {
  heading: string;
  description: string;
  mobileDescription: string;
  action: string;
};

const collections: Record<string, BannerCopy> = {
  "aromatherapy-pendants": {
    mobileDescription: "Bronze and steel pendants in a choice of designs.",
    heading: "Essential oil pendants",
    description:
      "Choose a bronze steampunk aromatherapy pendant or a steel pendant with a sunflower, star or snowflake design.",
    action: "Shop pendants",
  },
  aromatics: {
    mobileDescription: "Vanilla, tonka beans, sage and aromatic bark.",
    heading: "Aromatic herbs, bark & seeds",
    description:
      "From vanilla and tonka beans to Cretan sage and emburana bark, find botanicals by their scent and form.",
    action: "Shop aromatics",
  },
  ashes: {
    mobileDescription: "Cacao, cumaru, murici and oak ash varieties.",
    heading: "Ashes by plant variety",
    description:
      "Compare cacao, cumaru, murici and oak ashes in small bottles and larger pots.",
    action: "Shop plant ashes",
  },
  "beauty-and-body": {
    mobileDescription: "Massage oils, bracelets and gemstone pendants.",
    heading: "Body oils & beaded jewellery",
    description:
      "Choose a coconut or hazelnut massage oil, or browse glass bead bracelets and gemstone pendants.",
    action: "Shop body & beauty",
  },
  "essential-oils": {
    mobileDescription: "Palo santo, muna and red pepper essential oils.",
    heading: "Palo santo & other essential oils",
    description:
      "Compare palo santo, muna and red pepper essential oils, then choose an aromatherapy pendant to wear with your oil.",
    action: "Shop essential oils",
  },
  "exclusive-sale": {
    mobileDescription: "Tea sets, incense and jewellery from our sale.",
    heading: "The Katukina sale",
    description:
      "Browse the sale selection for purple clay tea sets, Tibetan incense, gemstone pendants and miniature singing bowls.",
    action: "Browse the sale",
  },
  "floral-waters": {
    mobileDescription: "Florida Water, palo santo, patchouli and thyme.",
    heading: "Agua Floresta floral waters",
    description:
      "Choose Agua Floresta Florida Water or try one of the floral waters scented with palo santo, patchouli or thyme.",
    action: "Shop floral waters",
  },
  giftshop: {
    mobileDescription: "Tea gift sets, mini kalimbas and singing bowls.",
    heading: "Gifts for tea, music & meditation",
    description:
      "Find a Chinese tea gift set for a tea lover, a mini kalimba for a musician or a singing bowl for a meditation space.",
    action: "Shop gifts",
  },
  "herbal-teas": {
    mobileDescription: "Blue lotus, chaga, mulungu and sarsaparilla.",
    heading: "Loose herbs for tea",
    description:
      "Browse blue lotus as whole flowers or loose petals, alongside chaga mushroom, mulungu bark and sarsaparilla.",
    action: "Shop herbal teas",
  },
  "incense-herbs": {
    mobileDescription: "Palo santo, rosemary, sage and incense burners.",
    heading: "Loose incense herbs & woods",
    description:
      "Choose palo santo chips or sticks, fragrant rosemary and Cretan sage. Charcoal discs and incense burners are here too.",
    action: "Shop incense herbs",
  },
  "incense-smudge": {
    mobileDescription: "Sage, cedar and juniper bundles, plus sweetgrass.",
    heading: "Sage & cedar smudge bundles",
    description:
      "Compare blue sage, cedar and juniper bundles with braided sweetgrass and palo santo sticks.",
    action: "Shop smudge bundles",
  },
  "incense-sticks": {
    mobileDescription: "Shoyeido, Bhutanese and Tibetan incense.",
    heading: "Incense sticks & holders",
    description:
      "Choose from Shoyeido, Druk Bhutanese and Tibetan incense sticks, with wooden and porcelain holders to match.",
    action: "Shop incense sticks",
  },
  "jambu-and-chilcuague": {
    mobileDescription: "Jambu tincture, powdered root and bottled sprays.",
    heading: "Jambu tincture & chilcuague root",
    description:
      "Find jambu as a 2:1 tincture and chilcuague as finely powdered root or bottled Chilcuague Original spray.",
    action: "View both botanicals",
  },
  kambo: {
    mobileDescription: "Kambo sticks, Matsés Nunu and dragon’s blood.",
    heading: "Kambo sticks & Matsés Nunu",
    description:
      "Browse Kambo sticks alongside Matsés Nunu and dragon’s blood latex, with sizes listed for each product.",
    action: "View Kambo collection",
  },
  "kuripe-and-tepi": {
    mobileDescription: "Bamboo, brass and resin rapé applicators.",
    heading: "Kuripe & tepi rapé applicators",
    description:
      "Compare bamboo, brass and resin applicators, from a simple kuripe with a cord to a serpent-shaped tepi.",
    action: "Shop applicators",
  },
  "life-tonics": {
    mobileDescription: "Choose Mumijo in a 10 g or 25 g pack.",
    heading: "Mumijo by Life Tonics",
    description:
      "Life Tonics Mumijo comes in two pack sizes. Choose the smaller 10 g pack or the larger 25 g option.",
    action: "View Mumijo sizes",
  },
  "mapacho-and-rape-juice": {
    mobileDescription: "Compare Menta, Muna and Rustica suco blends.",
    heading: "Mapacho & rapé juice blends",
    description:
      "Compare bottled suco blends including Suco de Menta, Suco de Muna and Suco de Rustica.",
    action: "View suco blends",
  },
  music: {
    mobileDescription: "Flutes, shakers, singing bowls and music on CD.",
    heading: "Instruments & music on CD",
    description:
      "Browse ocarina flutes, seed shakers and singing bowls, or pick up a CD by Shaneihu Yawanawa or Freedom Café.",
    action: "Shop music",
  },
  packaging: {
    mobileDescription: "Glass bottles, spray bottles and drawstring bags.",
    heading: "Bottles, bags & containers",
    description:
      "Choose pipette bottles in Miron glass, PET spray bottles or cotton drawstring bags for storing smaller items.",
    action: "Shop packaging",
  },
  "plant-extracts": {
    mobileDescription: "Blue lotus, dragon’s blood and mulungu extracts.",
    heading: "Plant resins & liquid extracts",
    description:
      "Compare blue lotus resin extract, dragon’s blood latex and mulungu liquid extract by plant and form.",
    action: "Shop plant extracts",
  },
  "pouches-and-purses": {
    mobileDescription: "Woven purses, embroidery and drawstring pouches.",
    heading: "Woven purses & drawstring pouches",
    description:
      "Find a Pococo handwoven purse, an embroidered Thai purse or a drawstring pouch in a Peruvian design.",
    action: "Shop pouches & purses",
  },
  "puer-tea-accessories": {
    mobileDescription: "Purple clay and portable ceramic tea sets.",
    heading: "Teaware for pu-erh tea",
    description:
      "Choose a purple clay tea set for the table, a portable ceramic set for travel or a pu-erh tea knife for compressed tea.",
    action: "Shop teaware",
  },
  "puer-teas": {
    mobileDescription: "Yunnan Puer Gold and tea packed in clementines.",
    heading: "Yunnan & clementine pu-erh tea",
    description:
      "Taste two takes on pu-erh with Yunnan Puer Gold from 2003 and tea packed inside a clementine.",
    action: "Shop pu-erh teas",
  },
  rape: {
    mobileDescription: "Compare rapé varieties and choose your size.",
    heading: "Rapé blends by variety",
    description:
      "Compare Yawanawa Tonka, Katukina Cumaru and Apurina Awiry rapé blends and find the sizes each comes in.",
    action: "Shop rapé blends",
  },
  "rape-kits-and-sets": {
    mobileDescription: "Wooden box sets and rapé gift selections.",
    heading: "Rapé gift sets & wooden boxes",
    description:
      "Choose the Rapé Wooden Box Set or compare the Feminine and Grounding rapé gift sets.",
    action: "Shop rapé sets",
  },
  "raw-tabaco": {
    mobileDescription: "Mapacho, Arapiraca, Moi and Sabia tobacco.",
    heading: "Raw tobacco varieties",
    description:
      "Choose raw Mapacho, Arapiraca, Moi or Sabia tobacco and compare pack weights across the four varieties.",
    action: "View raw tobacco",
  },
  "sacred-incense": {
    mobileDescription: "Myrrh, dammar, palo santo and incense blends.",
    heading: "Incense resins & blends",
    description:
      "Browse myrrh and dammar resins alongside white sage, palo santo and the Prayer incense blend.",
    action: "Shop sacred incense",
  },
  sananga: {
    mobileDescription: "Matsés and Katukina drops, plus sananga root bark.",
    heading: "Sananga drops & root bark",
    description:
      "Compare Matsés and Katukina sananga drops, or find sananga root bark and accessories in the same collection.",
    action: "View sananga",
  },
  "shamanic-tools": {
    mobileDescription: "Maracas, bells, mala beads and abalone shells.",
    heading: "Ceremonial tools & instruments",
    description:
      "Browse painted maracas, brass bells and mala prayer beads alongside cedar bundles and abalone shells.",
    action: "Shop ceremonial tools",
  },
  "shipibo-art": {
    mobileDescription: "Embroidered textiles, necklaces and bracelets.",
    heading: "Shipibo embroidery & jewellery",
    description:
      "Choose a Shipibo embroidered textile by size, or find a Shipibo necklace or bracelet to wear.",
    action: "Shop Shipibo art",
  },
  "snuff-bottles-and-spoons": {
    mobileDescription: "Brass bottles, steel flasks and spoon pendants.",
    heading: "Snuff bottles, flasks & spoons",
    description:
      "Compare a brass snuff bottle with a steel flask, or choose a bottle or spoon that doubles as a pendant.",
    action: "Shop bottles & spoons",
  },
  specials: {
    mobileDescription: "Blue lotus, Shipibo textiles and gemstone pendants.",
    heading: "Botanical & textile highlights",
    description:
      "Find whole blue lotus flowers, Shipibo embroidery and garnet pendants among Katukina’s featured pieces.",
    action: "Browse specials",
  },
  superfoods: {
    mobileDescription: "Chaga mushroom, cat’s claw and Mumijo.",
    heading: "Chaga, cat’s claw & Mumijo",
    description:
      "Browse the superfoods collection for chaga mushroom, cat’s claw and Life Tonics Mumijo in a choice of pack sizes.",
    action: "View superfoods",
  },
  "tabaco-powders": {
    mobileDescription: "Mapacho, Rustica, Arapiraca and other varieties.",
    heading: "Mapacho & other tobacco powders",
    description:
      "Compare Mapacho and Rustica tobacco powders with Arapiraca, Moi, Perique and Sabia varieties.",
    action: "View tobacco powders",
  },
  tinctures: {
    mobileDescription: "Jambu tincture and Chilcuague Original sprays.",
    heading: "Botanical tinctures & sprays",
    description:
      "Compare a 30 ml bottle of jambu 2:1 tincture with Chilcuague Original in an 11 ml or 22 ml spray.",
    action: "View tinctures",
  },
  tools: {
    mobileDescription: "Measuring spoons, funnels, sieves and burners.",
    heading: "Measuring tools & incense burners",
    description:
      "Find measuring spoons, steel funnels and sieves for preparation, or choose a lotus or elephant incense burner.",
    action: "Shop tools",
  },
  "visionary-art": {
    mobileDescription: "Shipibo designs on art stickers and textiles.",
    heading: "Shipibo art stickers & textiles",
    description:
      "Choose Shipibo designs as matte art stickers in square formats or as embroidery in a range of textile sizes.",
    action: "Shop visionary art",
  },
};

export function getCollectionBannerCopy(category: Category): BannerCopy {
  if (!category.count) {
    return {
      heading: "More from Katukina",
      mobileDescription: "Browse incense, botanicals and gifts in our shop.",
      description:
        "This collection has no products yet. Browse our incense, botanicals and gifts in the full catalogue.",
      action: "Browse the shop",
    };
  }
  if (Object.hasOwn(collections, category.slug))
    return collections[category.slug];

  const name = plainText(category.name);
  return {
    heading: name,
    mobileDescription: "Compare products and available sizes.",
    description:
      plainText(category.description) ||
      `Browse the products in our ${name} collection and compare available sizes and prices.`,
    action: "View products",
  };
}
