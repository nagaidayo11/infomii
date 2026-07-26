import { NextResponse } from "next/server";
import { readBearerToken, requireSessionUser } from "@/lib/server/session-auth";
import { linkCardToUser, requireStampService } from "@/lib/stamp/server";

/** POST: link this stamp card to the signed-in guest account (optional restore). */
export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const auth = await requireSessionUser(readBearerToken(request));
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { token: raw } = await context.params;
  const token = decodeURIComponent(raw ?? "");
  if (!token) return NextResponse.json({ error: "token が必要です" }, { status: 400 });

  let body: { resolve?: "current" | "existing" } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  const resolve = body.resolve === "current" || body.resolve === "existing" ? body.resolve : undefined;

  const result = await linkCardToUser({ cardToken: token, userId: auth.user.id, resolve });
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  if ("conflict" in result && result.conflict) {
    return NextResponse.json({
      conflict: true,
      current: result.current,
      existing: result.existing,
    });
  }

  return NextResponse.json({
    token: result.token,
    path: result.path,
    alreadyLinked: result.alreadyLinked ?? false,
    switchedToExisting: result.switchedToExisting ?? false,
    view: result.view,
  });
}
