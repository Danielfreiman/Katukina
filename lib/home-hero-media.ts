import "server-only";
import { publicImageUrl } from "./public-image";

export type HomeHeroSlide = {
  id: string;
  desktop: string | null;
  mobile: string | null;
};

export async function getHomeHeroSlides(): Promise<HomeHeroSlide[]> {
  return Promise.all(
    ["01", "02", "03"].map(async (id) => {
      const [desktop, mobile, legacyMobile] = await Promise.all([
        publicImageUrl(`/images/home/hero-slider/desktop/banner-${id}.webp`),
        publicImageUrl(
          `/images/home/hero-slider/mobile/banner-${id}-mobile.webp`,
        ),
        publicImageUrl(`/images/home/hero-slider/mobile/banner-${id}.webp`),
      ]);
      return { id, desktop, mobile: mobile || legacyMobile };
    }),
  );
}
