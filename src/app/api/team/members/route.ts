import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

export type MemberRow = {
  userId: string;
  email: string | null;
  role: "owner" | "admin" | "editor" | "viewer";
  createdAt: string;
};

async function getMembers(hotelId: string, ownerUserId: string | null) {
  const admin = getSupabaseAdminServerClient();
  const { data: members, error: membersError } = await admin
    .from("hotel_memberships")
    .select("user_id, role, created_at")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: true });

  if (membersError) return null;

  const emailByUserId = new Map<string, string>();
  for (const m of members ?? []) {
    const { data: { user: authUser } } = await admin.auth.admin.getUserById(m.user_id);
    if (authUser?.email) {
      emailByUserId.set(m.user_id, authUser.email);
    }
  }

  return (members ?? []).map((m) => ({
    userId: m.user_id,
    email: emailByUserId.get(m.user_id) ?? null,
    role:
      m.user_id === ownerUserId
        ? "owner"
        : ((m.role === "admin" ? "admin" : m.role === "viewer" ? "viewer" : "editor") as
            | "admin"
            | "editor"
            | "viewer"),
    createdAt: m.created_at,
  }));
}

/**
 * GET: 現在の施設のメンバー一覧（認証必須）
 */
export async function GET(request: Request) {
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

  const admin = getSupabaseAdminServerClient();
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership?.hotel_id) {
    return NextResponse.json({ error: "施設が選択されていません" }, { status: 403 });
  }

  const hotelId = membership.hotel_id;
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", hotelId)
    .maybeSingle();
  if (sub?.plan !== "business") {
    return NextResponse.json({ error: "チーム機能はBusinessプランでご利用いただけます" }, { status: 403 });
  }

  const { data: hotel } = await admin
    .from("hotels")
    .select("owner_user_id")
    .eq("id", hotelId)
    .maybeSingle();
  const ownerUserId = hotel?.owner_user_id ?? null;

  const result = await getMembers(hotelId, ownerUserId);
  if (!result) {
    return NextResponse.json({ error: "メンバー一覧の取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ members: result });
}
