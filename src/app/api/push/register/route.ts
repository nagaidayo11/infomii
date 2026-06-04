import { NextResponse } from "next/server";
import {
  getSupabaseAdminServerClient,
  getSupabaseAnonServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";

/**
 * POST: Register Expo push token for the authenticated user (native shell).
 * Body: { token: string, platform?: "ios" | "android" }
 */
export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!bearer) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const anon = getSupabaseAnonServerClient();
  const {
    data: { user },
    error: userError,
  } = await anon.auth.getUser(bearer);
  if (userError || !user) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  let body: { token?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
    return NextResponse.json({ error: "Invalid Expo push token" }, { status: 400 });
  }

  const platform =
    body.platform === "ios" || body.platform === "android" ? body.platform : null;

  const admin = getSupabaseAdminServerClient();
  const { error } = await admin.from("push_device_tokens").upsert(
    {
      user_id: user.id,
      expo_push_token: token,
      platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,expo_push_token" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
