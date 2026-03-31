import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const PRIMARY_AI_MODEL = process.env.OPENAI_QUALITY_MODEL ?? "gpt-4.1";
const FALLBACK_AI_MODEL = process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4o-mini";

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

function normalizeText(value: unknown, maxLen = 300): string {
  return String(value ?? "").trim().slice(0, maxLen);
}

function sanitizeCardContent(type: string, content: Record<string, unknown>): Record<string, unknown> {
  switch (type) {
    case "welcome":
      return {
        title: normalizeText(content.title, 80) || "ようこそ",
        message: normalizeText(content.message, 400),
      };
    case "wifi":
      return {
        ssid: normalizeText(content.ssid, 80),
        password: normalizeText(content.password, 80),
        description: normalizeText(content.description, 300),
      };
    case "breakfast":
      return {
        time: normalizeText(content.time, 80),
        location: normalizeText(content.location, 120),
        menu: normalizeText(content.menu, 300),
      };
    case "checkout":
      return {
        title: normalizeText(content.title, 80) || "チェックアウト",
        time: normalizeText(content.time, 80),
        note: normalizeText(content.note, 200),
      };
    case "nearby": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80) || "周辺案内",
        items: items
          .slice(0, 6)
          .map((item) => (typeof item === "object" && item !== null ? item : {}))
          .map((item) => {
            const row = item as Record<string, unknown>;
            return {
              name: normalizeText(row.name, 80),
              description: normalizeText(row.description, 200),
              link: normalizeText(row.link, 240),
            };
          }),
      };
    }
    case "emergency":
      return {
        title: normalizeText(content.title, 80) || "緊急連絡先",
        fire: normalizeText(content.fire, 40),
        police: normalizeText(content.police, 40),
        hospital: normalizeText(content.hospital, 120),
        note: normalizeText(content.note, 200),
      };
    case "map":
      return {
        address: normalizeText(content.address, 200),
      };
    case "notice":
      return {
        title: normalizeText(content.title, 80),
        body: normalizeText(content.body, 300),
        variant: content.variant === "warning" ? "warning" : "info",
      };
    case "button":
      return {
        label: normalizeText(content.label, 60),
        href: normalizeText(content.href, 240),
      };
    case "text":
      return {
        content: normalizeText(content.content, 600),
      };
    case "image":
      return {
        src: normalizeText(content.src, 300),
        alt: normalizeText(content.alt, 120),
      };
    case "gallery": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80),
        items: items
          .slice(0, 8)
          .map((item) => (typeof item === "object" && item !== null ? item : {}))
          .map((item) => {
            const row = item as Record<string, unknown>;
            return {
              src: normalizeText(row.src, 300),
              alt: normalizeText(row.alt, 120),
            };
          }),
      };
    }
    case "divider":
      return {
        style: content.style === "dotted" ? "dotted" : "line",
      };
    case "taxi":
      return {
        title: normalizeText(content.title, 80) || "タクシー",
        phone: normalizeText(content.phone, 40),
        companyName: normalizeText(content.companyName, 80),
        note: normalizeText(content.note, 200),
      };
    default:
      return {};
  }
}

function isHotelLikeDescription(text: string): boolean {
  const s = text.toLowerCase();
  return ["ホテル", "旅館", "宿", "宿泊", "hotel", "ryokan"].some((k) => s.includes(k));
}

function ensureCoreHotelCards(
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>,
  description: string
): Array<{ type: string; content: Record<string, unknown>; order: number }> {
  if (!isHotelLikeDescription(description)) return cards;
  const existing = new Set(cards.map((c) => c.type));
  const append: Array<{ type: string; content: Record<string, unknown>; order: number }> = [];
  if (!existing.has("welcome")) append.push({ type: "welcome", content: { title: "ようこそ", message: "" }, order: 0 });
  if (!existing.has("wifi")) append.push({ type: "wifi", content: { ssid: "", password: "", description: "" }, order: 0 });
  if (!existing.has("breakfast")) append.push({ type: "breakfast", content: { time: "", location: "", menu: "" }, order: 0 });
  if (!existing.has("checkout")) append.push({ type: "checkout", content: { title: "チェックアウト", time: "", note: "" }, order: 0 });
  if (!existing.has("nearby")) append.push({ type: "nearby", content: { title: "周辺案内", items: [] }, order: 0 });
  if (!existing.has("map")) append.push({ type: "map", content: { address: "" }, order: 0 });
  return [...cards, ...append].map((c, i) => ({ ...c, order: i }));
}

async function requestOpenAIContent(
  apiKey: string,
  prompt: string
): Promise<{ content: string; modelUsed: string; fallbackUsed: boolean }> {
  const models = PRIMARY_AI_MODEL === FALLBACK_AI_MODEL
    ? [PRIMARY_AI_MODEL]
    : [PRIMARY_AI_MODEL, FALLBACK_AI_MODEL];
  let lastError = "AI request failed";

  for (const [idx, model] of models.entries()) {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You output only a valid JSON array. No markdown, no explanation." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (content) return { content, modelUsed: model, fallbackUsed: idx > 0 };
      lastError = `No content in AI response (${model})`;
      continue;
    }

    const err = await res.text();
    lastError = `AI request failed (${model}): ${err.slice(0, 200)}`;
  }

  throw new Error(lastError);
}

type QualityReport = {
  score: number;
  missingCoreCards: string[];
  suggestions: string[];
};

function buildDescriptionQualityReport(
  cards: Array<{ type: string; content: Record<string, unknown> }>
): QualityReport {
  const coreTypes = ["welcome", "wifi", "breakfast", "checkout", "nearby", "map"] as const;
  const existing = new Set(cards.map((c) => c.type));
  const missingCoreCards = coreTypes.filter((t) => !existing.has(t));

  const suggestions: string[] = [];
  if (cards.length < 6) suggestions.push("カード数が少ないため、案内項目をもう少し追加してください。");
  if (!existing.has("emergency")) suggestions.push("緊急連絡先カードを追加すると運用品質が上がります。");

  const base = 100 - missingCoreCards.length * 15 - (cards.length < 6 ? 10 : 0);
  const score = Math.max(0, Math.min(100, base));
  return { score, missingCoreCards, suggestions };
}

/** Generate cards from a natural-language description using AI. */
async function generateCardsFromDescription(
  apiKey: string,
  description: string
): Promise<{
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>;
  modelUsed: string;
  fallbackUsed: boolean;
}> {
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

  const aiResult = await requestOpenAIContent(apiKey, prompt);
  const content = aiResult.content;

  const trimmed = content.trim().replace(/^```json?\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as Array<{ type?: string; content?: Record<string, unknown>; order?: number }>;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI did not return a non-empty array");
  }

  const cards = parsed
    .filter((c) => c && typeof c.type === "string" && ALLOWED_TYPES.includes(c.type as (typeof ALLOWED_TYPES)[number]))
    .map((c, i) => ({
      type: c.type as string,
      content: sanitizeCardContent(
        c.type as string,
        typeof c.content === "object" && c.content !== null ? (c.content as Record<string, unknown>) : {}
      ),
      order: typeof c.order === "number" ? c.order : i,
    }));

  if (cards.length === 0) {
    throw new Error("No valid cards in AI response");
  }

  const ordered = cards.sort((a, b) => a.order - b.order).map((c, i) => ({ ...c, order: i }));
  const completed = ensureCoreHotelCards(ordered, description);
  return { cards: completed, modelUsed: aiResult.modelUsed, fallbackUsed: aiResult.fallbackUsed };
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
    const generated = await generateCardsFromDescription(apiKey, description);
    const cards = generated.cards;
    const quality = buildDescriptionQualityReport(cards);
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
      quality,
      ai: {
        modelUsed: generated.modelUsed,
        fallbackUsed: generated.fallbackUsed,
        mode: "quality_first",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "生成に失敗しました", details: message },
      { status: 500 }
    );
  }
}
