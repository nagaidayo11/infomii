import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!token) {
      return NextResponse.json({ message: "認証トークンがありません" }, { status: 401 });
    }

    const anon = getSupabaseAnonServerClient();
    const {
      data: { user },
      error: userError,
    } = await anon.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ message: "認証に失敗しました" }, { status: 401 });
    }
    const admin = getSupabaseAdminServerClient();
    const { data: membership } = await admin
      .from("hotel_memberships")
      .select("hotel_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const hotelId = membership?.hotel_id ?? null;
    if (!hotelId) {
      return NextResponse.json({ message: "施設所属情報が見つかりません" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const result = await sendOpsAlert(
      "Ops Alert Test",
      `通知テストを実行しました\nuser: ${user.email ?? user.id}\ntime: ${now}\nstatus: test`,
    );
    const ok = result.slack.ok || result.email.ok;
    return NextResponse.json({
      ok,
      message: ok
        ? "通知テストを送信しました"
        : "通知テストは失敗しました",
      channels: result,
    }, { status: ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "通知テストに失敗しました" },
      { status: 500 },
    );
  }
}
