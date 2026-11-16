import { getHomeCategoryMedia } from "@/lib/home-category-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getHomeCategoryMedia(), {
    headers: { "Cache-Control": "no-store" },
  });
}
