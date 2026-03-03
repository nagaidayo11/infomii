import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";
import { isOpsAdminUser } from "@/lib/server/ops-auth";

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
    if (!isOpsAdminUser(user)) {
      return NextResponse.json({ message: "運用センターへのアクセス権限がありません" }, { status: 403 });
    }

    const payload = (await request.json()) as { message?: unknown };
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (!message) {
      return NextResponse.json({ message: "レポート本文が空です" }, { status: 400 });
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

    const result = await sendOpsAlert("Weekly Ops Report", `${message}\n\nsender: ${user.email ?? user.id}`);
    const ok = result.slack.ok || result.email.ok;
    await admin.from("audit_logs").insert({
      hotel_id: hotelId,
      actor_user_id: user.id,
      action: "ops.weekly_report_sent",
      target_type: "ops",
      message: ok ? "週次レポートを送信しました" : "週次レポート送信に失敗しました",
      metadata: {
        slackOk: result.slack.ok,
        emailOk: result.email.ok,
      },
    });
    return NextResponse.json({
      ok,
      message: ok ? "週次レポートを送信しました" : "週次レポート送信に失敗しました",
      channels: result,
    }, { status: ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "週次レポート送信に失敗しました" },
      { status: 500 },
    );
  }
}
