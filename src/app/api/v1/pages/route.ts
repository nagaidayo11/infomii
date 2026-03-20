import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { canUseDevBusinessOverride } from "@/lib/dev-business-override";

/**
 * GET /api/v1/pages — 施設のページ一覧（Business プランのみ）
 * Authorization: Bearer <session_token>
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

  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", membership.hotel_id)
    .maybeSingle();
  const isBusinessAccessible = sub?.plan === "business" || canUseDevBusinessOverride(user);
  if (!isBusinessAccessible) {
    return NextResponse.json(
      { error: "API は Business プランでご利用いただけます" },
      { status: 403 }
    );
  }

  const { data: pages, error } = await admin
    .from("pages")
    .select("id, title, slug, created_at")
    .eq("hotel_id", membership.hotel_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "ページ一覧の取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({
    pages: (pages ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      createdAt: p.created_at,
    })),
  });
}
