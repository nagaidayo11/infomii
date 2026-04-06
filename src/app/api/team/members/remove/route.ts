import { NextResponse } from "next/server";
import {
  getSupabaseAdminServerClient,
  getSupabaseAnonServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";

/**
 * POST: メンバーを施設から削除（オーナーのみ）
 * Body: { userId: string }
 */
export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "サーバー設定不足: SUPABASE_SERVICE_ROLE_KEY を設定してください" },
      { status: 503 },
    );
  }
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const anon = getSupabaseAnonServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const targetUserId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!targetUserId) {
    return NextResponse.json({ error: "userId が必要です" }, { status: 400 });
  }

  const admin = getSupabaseAdminServerClient();
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership?.hotel_id) {
    return NextResponse.json({ error: "施設が選択されていません" }, { status: 403 });
  }
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", membership.hotel_id)
    .maybeSingle();
  if (sub?.plan !== "business") {
    return NextResponse.json({ error: "チーム機能はBusinessプランでご利用いただけます" }, { status: 403 });
  }

  const { data: hotel } = await admin
    .from("hotels")
    .select("owner_user_id")
    .eq("id", membership.hotel_id)
    .maybeSingle();
  const { data: actorMembership } = await admin
    .from("hotel_memberships")
    .select("role")
    .eq("hotel_id", membership.hotel_id)
    .eq("user_id", user.id)
    .maybeSingle();
  const isOwner = hotel?.owner_user_id === user.id;
  const isAdmin = actorMembership?.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "オーナー/管理者のみメンバーを削除できます" }, { status: 403 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: "自分自身を削除することはできません" }, { status: 400 });
  }
  if (targetUserId === hotel?.owner_user_id) {
    return NextResponse.json({ error: "オーナーは削除できません" }, { status: 400 });
  }
  if (isAdmin) {
    const { data: targetMembership } = await admin
      .from("hotel_memberships")
      .select("role")
      .eq("hotel_id", membership.hotel_id)
      .eq("user_id", targetUserId)
      .maybeSingle();
    if (targetMembership?.role === "admin") {
      return NextResponse.json({ error: "管理者同士の削除はオーナーのみ実行できます" }, { status: 403 });
    }
  }

  const { error } = await admin
    .from("hotel_memberships")
    .delete()
    .eq("hotel_id", membership.hotel_id)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json({ error: "メンバーの削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
