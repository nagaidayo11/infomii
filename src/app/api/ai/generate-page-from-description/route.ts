import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const ALLOWED_TYPES = ["wifi", "breakfast", "notice", "map", "button", "image", "text", "gallery", "divider", "welcome", "checkout", "nearby", "emergency", "taxi"] as const;

const CARD_SCHEMAS: Record<string, string> = {
  wifi: '{"ssid":"string","password":"string","description":"string"}',
  breakfast: '{"time":"string","location":"string","menu":"string"}',
  notice: '{"title":"string","body":"string","variant":"info|warning"}',
  map: '{"address":"string"}',
  button: '{"label":"string","href":"string"}',
  image: '{"src":"string","alt":"string"}',
  text: '{"content":"string"}',
  gallery: '{"title":"string","items":[{"src":"string","alt":"string"}]}',
  divider: '{"style":"line|dotted"}',
  welcome: '{"title":"string","message":"string"}',
  checkout: '{"title":"string","time":"string","note":"string"}',
  nearby: '{"title":"string","items":[{"name":"string","description":"string","link":"string"}]}',
  emergency: '{"title":"string","fire":"string","police":"string","hospital":"string","note":"string"}',
  taxi: '{"title":"string","phone":"string","companyName":"string","note":"string"}',
};

/** Generate cards from a natural-language description using AI. */
async function generateCardsFromDescription(
  apiKey: string,
  description: string
): Promise<Array<{ type: string; content: Record<string, unknown>; order: number }>> {
  const schemas = ALLOWED_TYPES.map((t) => `${t}: ${CARD_SCHEMAS[t] ?? "{}"}`).join("\n");

  const prompt = `あなたは宿泊施設・店舗向けのモバイル案内ページを生成するAIです。ユーザーの説明に基づいて、適切なカードを生成してください。

ユーザーの説明: "${description.slice(0, 800)}"

以下のカードタイプのみ使用してください: ${ALLOWED_TYPES.join(", ")}.
各カードは type, content（下記スキーマに準拠）, order（0始まり）を含めてください。

スキーマ:
${schemas}

出力例:
- ホテル案内 → welcome, wifi, breakfast, checkout, nearby, map
- レストラン → text（タイトル）, notice（営業時間）, text（メニュー）, map, button（予約リンク）
- イベント案内 → text, notice, image, button

JSON配列のみを出力してください。マークダウンや説明は含めないでください。`;

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You output only a valid JSON array. No markdown, no explanation." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI request failed: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in AI response");

  const trimmed = content.trim().replace(/^```json?\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as Array<{ type?: string; content?: Record<string, unknown>; order?: number }>;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI did not return a non-empty array");
  }

  const cards = parsed
    .filter((c) => c && typeof c.type === "string" && ALLOWED_TYPES.includes(c.type as (typeof ALLOWED_TYPES)[number]))
    .map((c, i) => ({
      type: c.type as string,
      content: typeof c.content === "object" && c.content !== null ? (c.content as Record<string, unknown>) : {},
      order: typeof c.order === "number" ? c.order : i,
    }));

  if (cards.length === 0) {
    throw new Error("No valid cards in AI response");
  }

  return cards.sort((a, b) => a.order - b.order).map((c, i) => ({ ...c, order: i }));
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  let body: { description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const description = String(body.description ?? "").trim();
  if (!description) {
    return NextResponse.json(
      { error: "説明文を入力してください" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminServerClient();
  const anon = getSupabaseAnonServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  const { data: membership, error: memberError } = await supabase
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (memberError || !membership?.hotel_id) {
    return NextResponse.json({ error: "施設が選択されていません" }, { status: 403 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("max_published_pages")
    .eq("hotel_id", membership.hotel_id)
    .maybeSingle();
  const maxPages = sub?.max_published_pages ?? 1;
  const { count } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("hotel_id", membership.hotel_id);
  if ((count ?? 0) >= maxPages) {
    return NextResponse.json(
      { error: `ページ数の上限に達しました（${maxPages}件）。Proプランで5ページまで作成できます。` },
      { status: 403 }
    );
  }

  try {
    const cards = await generateCardsFromDescription(apiKey, description);
    const title = cards[0]?.content?.content
      ? String(cards[0].content.content).slice(0, 40) + (String(cards[0].content.content).length > 40 ? "…" : "")
      : "AIで作成したページ";
    const slug = `${createSlug(description.slice(0, 30))}-${Date.now().toString(36)}`;

    const { data: newPage, error: pageError } = await supabase
      .from("pages")
      .insert({ hotel_id: membership.hotel_id, title, slug })
      .select("id")
      .single();
    if (pageError || !newPage?.id) {
      return NextResponse.json(
        { error: "ページの作成に失敗しました", details: pageError?.message },
        { status: 500 }
      );
    }

    const payload = cards.map((c, i) => ({
      type: c.type,
      content: c.content,
      order: i,
    }));

    const { error: insertError } = await supabase
      .from("cards")
      .insert(
        payload.map((p, i) => ({
          page_id: newPage.id,
          type: p.type,
          content: p.content,
          order: i,
        }))
      );
    if (insertError) {
      return NextResponse.json(
        { error: "カードの保存に失敗しました", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      page_id: newPage.id,
      pageId: newPage.id,
      cards: payload.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "生成に失敗しました", details: message },
      { status: 500 }
    );
  }
}
