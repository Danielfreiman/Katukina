import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

export type HomeHeroSlide = {
  id: string;
  desktop: string | null;
  mobile: string | null;
};

async function imageUrl(url: string) {
  try {
    const file = await stat(path.join(process.cwd(), "public", url));
    return file.isFile() && file.size > 0
      ? `${url}?v=${file.mtimeMs}-${file.size}`
      : null;
  } catch (error) {
    if (
      !["ENOENT", "ENOTDIR"].includes(
        (error as NodeJS.ErrnoException).code || "",
      )
    )
      throw error;
    return null;
  }
}

export async function getHomeHeroSlides(): Promise<HomeHeroSlide[]> {
  return Promise.all(
    ["01", "02", "03"].map(async (id) => {
      const [desktop, mobile] = await Promise.all([
        imageUrl(`/images/home/hero-slider/desktop/banner-${id}.webp`),
        imageUrl(`/images/home/hero-slider/mobile/banner-${id}.webp`),
      ]);
      return { id, desktop, mobile };
    }),
  );
}
