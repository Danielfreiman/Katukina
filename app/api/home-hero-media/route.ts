import { getHomeHeroSlides } from "@/lib/home-hero-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getHomeHeroSlides(), {
    headers: { "Cache-Control": "no-store" },
  });
}
