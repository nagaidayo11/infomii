import { NextResponse } from "next/server";
import { issueCardForProgram, loadProgramByPageSlug, requireStampService } from "@/lib/stamp/server";
import type { StampProgramRow } from "@/lib/stamp/types";
import { buildStampCardPath } from "@/lib/stamp/types";

/** POST: issue a personal stamp card from entry page slug (no guest auth). */
export async function POST(request: Request) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  let body: { slug?: string } = {};
  try {
    body = (await request.json()) as { slug?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug が必要です" }, { status: 400 });

  const loaded = await loadProgramByPageSlug(slug);
  if (!loaded || loaded.publishStatus !== "published" || loaded.program.status !== "published") {
    return NextResponse.json({ error: "スタンプカードが見つからないか、未公開です" }, { status: 404 });
  }

  // Guests have no session, so Dev Business override cannot be checked here.
  // Create / publish is already gated to Business (or override). Re-checking
  // subscriptions.plan alone incorrectly blocks published override hotels.

  try {
    const card = await issueCardForProgram(loaded.program as StampProgramRow);
    return NextResponse.json({
      token: card.token,
      path: buildStampCardPath(card.token),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "カード発行に失敗しました" },
      { status: 500 },
    );
  }
}
