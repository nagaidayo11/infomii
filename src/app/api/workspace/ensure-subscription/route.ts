import { NextResponse } from "next/server";
import { ensureHotelSubscriptionRpc } from "@/lib/server/private-supabase-rpc";
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

  let body: { hotel_id?: string } = {};
  try {
    body = (await request.json()) as { hotel_id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hotelId = typeof body.hotel_id === "string" ? body.hotel_id.trim() : "";
  if (!hotelId) {
    return NextResponse.json({ error: "hotel_id が必要です" }, { status: 400 });
  }

  try {
    await ensureHotelSubscriptionRpc(hotelId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "サブスクリプションの確認に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
