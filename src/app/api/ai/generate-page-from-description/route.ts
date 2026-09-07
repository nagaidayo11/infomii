import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { composeInfomiiPage } from "@/lib/server/ai-page-composer";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { pageQuotaForbiddenPayload, resolveHotelPageQuota } from "@/lib/server/resolve-hotel-page-quota";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません" }, { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  let body: { description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const description = String(body.description ?? "").trim();
  if (!description) return NextResponse.json({ error: "説明文を入力してください" }, { status: 400 });

  const supabase = getSupabaseAdminServerClient();
  const anon = getSupabaseAnonServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });

  const { data: membership, error: memberError } = await supabase
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (memberError || !membership?.hotel_id) {
    return NextResponse.json({ error: "施設が選択されていません" }, { status: 403 });
  }

  const quota = await resolveHotelPageQuota({ admin: supabase, hotelId: membership.hotel_id, user });
  if (!quota.allowed) return NextResponse.json(pageQuotaForbiddenPayload(quota), { status: 403 });

  try {
    const slug = `${createSlug(description.slice(0, 30))}-${Date.now().toString(36)}`;
    const generated = await composeInfomiiPage({ apiKey, sourceText: description, sourceKind: "description", pageSlug: slug });
    const pageRow = { hotel_id: membership.hotel_id, title: generated.title, slug, guest_shell: generated.guestShell };
    let pageId: string;
    const { data: newPage, error: pageError } = await supabase.from("pages").insert(pageRow).select("id").single();
    if (newPage?.id) {
      pageId = newPage.id as string;
    } else {
      const missingGuestShell = pageError?.message?.includes("guest_shell") &&
        (pageError.message.includes("schema cache") || pageError.message.includes("column"));
      if (!missingGuestShell) {
        return NextResponse.json({ error: "ページの作成に失敗しました", details: pageError?.message }, { status: 500 });
      }
      const { data: fallback, error: fallbackError } = await supabase
        .from("pages")
        .insert({ hotel_id: membership.hotel_id, title: generated.title, slug })
        .select("id")
        .single();
      if (fallbackError || !fallback?.id) {
        return NextResponse.json({ error: "ページの作成に失敗しました", details: fallbackError?.message }, { status: 500 });
      }
      pageId = fallback.id as string;
    }

    const payload = generated.cards.map((card, order) => ({ type: card.type, content: card.content, order }));
    const { error: insertError } = await supabase.from("cards").insert(
      payload.map((card) => ({ page_id: pageId, ...card })),
    );
    if (insertError) {
      await supabase.from("pages").delete().eq("id", pageId).eq("hotel_id", membership.hotel_id);
      return NextResponse.json({ error: "カードの保存に失敗しました", details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      page_id: pageId,
      pageId,
      cards: payload.length,
      composition: generated.design,
      ai: { modelUsed: generated.modelUsed, fallbackUsed: generated.fallbackUsed, mode: "structured_composition" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "生成に失敗しました", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
