import { getHomeCategoryIcons } from "@/lib/home-category-icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getHomeCategoryIcons(), {
    headers: { "Cache-Control": "no-store" },
  });
}
