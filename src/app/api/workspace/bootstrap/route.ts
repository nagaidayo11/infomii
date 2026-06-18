import { NextResponse } from "next/server";
import { bootstrapUserWorkspaceRpc } from "@/lib/server/private-supabase-rpc";
import { readBearerToken, requireSessionUser } from "@/lib/server/session-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/server/supabase-server";

export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  const auth = await requireSessionUser(readBearerToken(request));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: { default_name?: string | null } = {};
  try {
    body = (await request.json()) as { default_name?: string | null };
  } catch {
    // optional body
  }

  const defaultName =
    typeof body.default_name === "string" && body.default_name.trim()
      ? body.default_name.trim()
      : null;

  try {
    const hotelId = await bootstrapUserWorkspaceRpc(auth.user.id, defaultName);
    return NextResponse.json({ hotel_id: hotelId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ワークスペースの作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
