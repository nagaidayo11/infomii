import { getIndexNowKey } from "@/lib/server/indexnow";

export const dynamic = "force-dynamic";

export function GET() {
  const key = getIndexNowKey();
  if (!key) {
    return new Response("Not configured", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
