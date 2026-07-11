import { NextResponse } from "next/server";

const BUNDLE_ID = "com.infomii.app";

function buildAasa(teamId: string) {
  return {
    applinks: {
      apps: [] as string[],
      details: [
        {
          appID: `${teamId}.${BUNDLE_ID}`,
          // Guest public pages must open in the browser (QR / share), not the app.
          // Do not list /v/*, /p/*, /qr/*, or /go/* here.
          paths: [
            "/dashboard*",
            "/dashboard/pages*",
            "/templates*",
            "/settings*",
            "/editor/*",
            "/login*",
            "/onboarding*",
            "NOT /v/*",
            "NOT /p/*",
            "NOT /qr/*",
            "NOT /go/*",
          ],
        },
      ],
    },
  };
}

export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId || teamId.includes("REPLACE")) {
    return NextResponse.json(
      {
        error:
          "APPLE_TEAM_ID is not configured. Set it in Vercel / .env.local (10-character Apple Team ID).",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(buildAasa(teamId), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
