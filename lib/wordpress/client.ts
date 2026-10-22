import "server-only";
const origin = process.env.WORDPRESS_INTERNAL_URL || "http://127.0.0.1:8888";
export async function wordpressGet<T>(
  path: string,
  query: Record<string, string | number> = {},
) {
  if (!path.startsWith("/wp-json/"))
    throw new Error("Invalid WordPress API path");
  const url = new URL(path, origin);
  Object.entries(query).forEach(([key, value]) =>
    url.searchParams.set(key, String(value)),
  );
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
    redirect: "error",
  });
  if (!response.ok)
    throw new Error(`WordPress API unavailable (${response.status})`);
  return {
    data: (await response.json()) as T,
    total: Number(response.headers.get("x-wp-total") || 0),
    pages: Number(response.headers.get("x-wp-totalpages") || 0),
  };
}
