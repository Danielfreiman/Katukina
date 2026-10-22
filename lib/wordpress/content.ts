import "server-only";
import { cache } from "react";
import { wordpressGet } from "./client";
export type Editorial = {
  id: number;
  slug: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
};
export const getEditorial = cache(
  async (type: "posts" | "pages", slug: string) => {
    const { data } = await wordpressGet<Editorial[]>(`/wp-json/wp/v2/${type}`, {
      slug,
      status: "publish",
      per_page: 1,
    });
    return data[0] ?? null;
  },
);
export function getArticles(page = 1, per_page = 12) {
  return wordpressGet<Editorial[]>("/wp-json/wp/v2/posts", {
    status: "publish",
    page,
    per_page,
  });
}
