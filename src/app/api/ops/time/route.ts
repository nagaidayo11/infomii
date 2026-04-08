import { NextResponse } from "next/server";

export async function GET() {
  const now = Date.now();
  return NextResponse.json(
    {
      serverNowIso: new Date(now).toISOString(),
      serverNowMs: now,
      timezone: "Asia/Tokyo",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

