export type StorySection = {
  title: string;
  paragraphs: string[];
  image?: { src: string; alt: string; width: number; height: number };
  link?: { href: string; label: string };
};

export const story = {
  title: "Our roots",
  introduction: "A story that begins in the forest.",
  cover: "/images/forest.jpg",
};

export const sections: StorySection[] = [
  {
    title: "People, places and their stories.",
    paragraphs: [
      "Katukina brings together botanicals, incense, art and objects connected to forest traditions.",
      "The original Katukina website shares its relationship with the Noke Ko’í in Acre, Brazil, and community initiatives. Visit it for the original accounts and project details.",
    ],
    link: { href: "https://katukina.com/", label: "Read the original stories" },
  },
];
