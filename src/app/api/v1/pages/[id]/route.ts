import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { canUseDevBusinessOverride } from "@/lib/dev-business-override";

async function resolveHotelId(token: string): Promise<{ hotelId: string; plan: string } | null> {
  const anon = getSupabaseAnonServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) return null;

  const admin = getSupabaseAdminServerClient();
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership?.hotel_id) return null;

  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", membership.hotel_id)
    .maybeSingle();
  const isBusinessAccessible = sub?.plan === "business" || canUseDevBusinessOverride(user);
  if (!isBusinessAccessible) return null;

  return { hotelId: membership.hotel_id, plan: sub.plan };
}

/**
 * GET /api/v1/pages/[id] — ページ詳細（カード含む）（Business プランのみ）
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const resolved = await resolveHotelId(token);
  if (!resolved) {
    return NextResponse.json(
      { error: "認証に失敗しました。Business プランでご利用ください。" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const admin = getSupabaseAdminServerClient();

  const { data: page, error: pageError } = await admin
    .from("pages")
    .select("id, title, slug, created_at")
    .eq("id", id)
    .eq("hotel_id", resolved.hotelId)
    .maybeSingle();

  if (pageError || !page) {
    return NextResponse.json({ error: "ページが見つかりません" }, { status: 404 });
  }

  const { data: cards } = await admin
    .from("cards")
    .select("id, type, content, order")
    .eq("page_id", id)
    .order("order", { ascending: true });

  return NextResponse.json({
    id: page.id,
    title: page.title,
    slug: page.slug,
    createdAt: page.created_at,
    cards: (cards ?? []).map((c) => ({
      id: c.id,
      type: c.type,
      content: c.content,
      order: c.order,
    })),
  });
}

/**
 * PATCH /api/v1/pages/[id] — ページ更新（Business プランのみ）
 * Body: { title?: string, cards?: Array<{ type, content, order }> }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const resolved = await resolveHotelId(token);
  if (!resolved) {
    return NextResponse.json(
      { error: "認証に失敗しました。Business プランでご利用ください。" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const admin = getSupabaseAdminServerClient();

  const { data: page, error: pageError } = await admin
    .from("pages")
    .select("id")
    .eq("id", id)
    .eq("hotel_id", resolved.hotelId)
    .maybeSingle();

  if (pageError || !page) {
    return NextResponse.json({ error: "ページが見つかりません" }, { status: 404 });
  }

  let body: { title?: string; cards?: Array<{ type: string; content?: Record<string, unknown>; order?: number }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.title !== undefined) {
    const { error: updateError } = await admin
      .from("pages")
      .update({ title: String(body.title).trim() || "" })
      .eq("id", id);
    if (updateError) {
      return NextResponse.json({ error: "タイトルの更新に失敗しました" }, { status: 500 });
    }
  }

  if (Array.isArray(body.cards) && body.cards.length > 0) {
    const { error: deleteError } = await admin.from("cards").delete().eq("page_id", id);
    if (deleteError) {
      return NextResponse.json({ error: "カードの更新に失敗しました" }, { status: 500 });
    }
    const rows = body.cards.map((c, i) => ({
      page_id: id,
      type: c.type ?? "text",
      content: c.content ?? {},
      order: c.order ?? i,
    }));
    const { error: insertError } = await admin.from("cards").insert(rows);
    if (insertError) {
      return NextResponse.json({ error: "カードの保存に失敗しました" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
