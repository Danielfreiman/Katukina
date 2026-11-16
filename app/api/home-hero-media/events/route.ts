import { watch, type FSWatcher } from "node:fs";
import path from "node:path";
import { getHomeHeroSlides } from "@/lib/home-hero-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 404 });
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const watchers: FSWatcher[] = [];
      let closed = false;
      let timer: ReturnType<typeof setTimeout>;
      let generation = 0;
      const publish = async () => {
        const current = ++generation;
        try {
          const slides = await getHomeHeroSlides();
          if (!closed && current === generation)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(slides)}\n\n`),
            );
        } catch {
          /* The polling fallback retains the last available images. */
        }
      };
      const heartbeat = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 20000);
      cleanup = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        clearInterval(heartbeat);
        watchers.forEach((watcher) => watcher.close());
        request.signal.removeEventListener("abort", cleanup);
        try { controller.close(); } catch { /* The reader may already have cancelled. */ }
      };
      request.signal.addEventListener("abort", cleanup, { once: true });
      for (const folder of ["desktop", "mobile"]) {
        try {
          const watcher = watch(
            path.join(process.cwd(), "public/images/home/hero-slider", folder),
            () => {
              clearTimeout(timer);
              timer = setTimeout(() => void publish(), 120);
            },
          );
          watcher.on("error", () => watcher.close());
          watchers.push(watcher);
        } catch {
          /* Polling also handles a temporarily missing directory. */
        }
      }
      if (request.signal.aborted) cleanup();
      else void publish();
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
