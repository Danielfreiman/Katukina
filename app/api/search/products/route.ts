import { getProducts } from "@/lib/commerce/catalog";
import { productName, productPrice } from "@/lib/commerce/product";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const headers = { "Cache-Control": "private, no-store" };
  if (query.length > 100) return Response.json({ error: "Search is too long." }, { status: 400, headers });
  if (query.length < 2) return Response.json({ products: [] }, { headers });
  try {
    const result = await getProducts({ search: query, per_page: 6, page: 1 });
    return Response.json({ products: result.data.map(product => ({
      id: product.id,
      name: productName(product),
      href: `/products/${product.slug}`,
      image: product.images[0]?.thumbnail || product.images[0]?.src || null,
      price: productPrice(product),
    })) }, { headers });
  } catch {
    return Response.json({ error: "Suggestions are temporarily unavailable." }, { status: 503, headers });
  }
}
