import { NextResponse } from "next/server";
import { readBearerToken, requireSessionUser } from "@/lib/server/session-auth";
import { findLinkedCardForUser, requireStampService } from "@/lib/stamp/server";

/** GET ?slug= — restore linked stamp card for the signed-in guest. */
export async function GET(request: Request) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const auth = await requireSessionUser(readBearerToken(request));
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) return NextResponse.json({ error: "slug が必要です" }, { status: 400 });

  const result = await findLinkedCardForUser({ userId: auth.user.id, slug });
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  if (!result.linked) {
    return NextResponse.json({ linked: false });
  }

  return NextResponse.json({
    linked: true,
    token: result.token,
    path: result.path,
  });
}
