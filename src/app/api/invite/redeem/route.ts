import { NextResponse } from "next/server";
import { redeemHotelInviteRpc } from "@/lib/server/private-supabase-rpc";
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

  let body: { code?: string } = {};
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return NextResponse.json({ error: "招待コードを入力してください" }, { status: 400 });
  }

  try {
    const hotelId = await redeemHotelInviteRpc(auth.user.id, code);
    return NextResponse.json({ hotel_id: hotelId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "招待コードの適用に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
