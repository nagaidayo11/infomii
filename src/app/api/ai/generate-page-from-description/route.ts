import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { finalizeAiPageCards, type AiGeneratedCard } from "@/lib/ai-page-content-enrichment";
import {
  AI_GENERATED_PAGE_TITLE,
  gallerySlotSrc,
  getAiPageDefaultImages,
  inferAiPageImageTheme,
  isHotelLikeDescription,
  isPersonalDailyDescription,
  normalizeGeneratedImageSrc,
  type AiPageImageDefaults,
} from "@/lib/ai-page-theme-images";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { normalizeMaxPublishedPages } from "@/lib/plan-limits";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const PRIMARY_AI_MODEL = process.env.OPENAI_QUALITY_MODEL ?? "gpt-4.1";
const FALLBACK_AI_MODEL = process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4o-mini";

const ALLOWED_TYPES = [
  "hero",
  "hero_slider",
  "welcome",
  "heading_body",
  "highlight",
  "notice",
  "schedule",
  "steps",
  "checklist",
  "faq",
  "map",
  "nearby",
  "button",
  "pageLinks",
  "image",
  "text",
  "gallery",
  "divider",
  "wifi",
  "breakfast",
  "checkout",
  "emergency",
  "taxi",
] as const;

const CARD_SCHEMAS: Record<string, string> = {
  hero: '{"title":"string","subtitle":"string"}',
  hero_slider: '{"title":"string","slides":[{"caption":"string","alt":"string"}]}',
  welcome: '{"title":"string","message":"string"}',
  heading_body: '{"title":"string","body":"string"}',
  highlight: '{"title":"string","body":"string","accent":"amber|rose"}',
  notice: '{"title":"string","body":"string","variant":"info|warning"}',
  schedule: '{"title":"string","items":[{"day":"string","time":"string","label":"string"}]}',
  steps: '{"title":"string","items":[{"title":"string","description":"string"}]}',
  checklist: '{"title":"string","items":[{"text":"string","checked":boolean}]}',
  faq: '{"title":"string","items":[{"q":"string","a":"string"}]}',
  map: '{"address":"string"}',
  nearby: '{"title":"string","items":[{"name":"string","description":"string","link":"string"}]}',
  button: '{"label":"string","href":"string"}',
  pageLinks: '{"title":"string","items":[{"label":"string","icon":"string"}]}',
  image: '{"src":"string","alt":"string"}',
  text: '{"content":"string"}',
  gallery: '{"title":"string","items":[{"src":"string","alt":"string"}]}',
  divider: '{"style":"line|dotted"}',
  wifi: '{"ssid":"string","password":"string","description":"string"}',
  breakfast: '{"time":"string","location":"string","menu":"string"}',
  checkout: '{"title":"string","time":"string","note":"string"}',
  emergency: '{"title":"string","fire":"string","police":"string","hospital":"string","note":"string"}',
  taxi: '{"title":"string","phone":"string","companyName":"string","note":"string"}',
};

function normalizeText(value: unknown, maxLen = 300): string {
  return String(value ?? "").trim().slice(0, maxLen);
}

function sanitizeCardContent(type: string, content: Record<string, unknown>, img: AiPageImageDefaults): Record<string, unknown> {
  switch (type) {
    case "hero":
      return {
        title: normalizeText(content.title, 80),
        subtitle: normalizeText(content.subtitle, 120),
        image: normalizeGeneratedImageSrc(content.image, img.primary),
      };
    case "hero_slider": {
      const slides = Array.isArray(content.slides) ? content.slides : [];
      return {
        title: normalizeText(content.title, 80),
        slides: slides.slice(0, 5).map((item, index) => {
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            caption: normalizeText(row.caption, 80),
            alt: normalizeText(row.alt, 80),
            src: normalizeGeneratedImageSrc(row.src, gallerySlotSrc(index, img)),
          };
        }),
      };
    }
    case "heading_body":
      return {
        title: normalizeText(content.title, 80),
        body: normalizeText(content.body, 600),
        dividerEnabled: false,
        dividerStyle: "solid",
      };
    case "highlight":
      return {
        title: normalizeText(content.title, 80),
        body: normalizeText(content.body, 400),
        accent: content.accent === "rose" ? "rose" : "amber",
      };
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
        src: normalizeGeneratedImageSrc(content.src, img.primary),
        alt: normalizeText(content.alt, 120) || "施設イメージ",
      };
    case "gallery": {
      const items = Array.isArray(content.items) ? content.items : [];
      const normalizedItems = items
        .slice(0, 8)
        .map((item) => (typeof item === "object" && item !== null ? item : {}))
        .map((item, index) => {
          const row = item as Record<string, unknown>;
          return {
            src: normalizeGeneratedImageSrc(row.src, gallerySlotSrc(index, img)),
            alt: normalizeText(row.alt, 120) || `gallery-${index + 1}`,
          };
        });
      return {
        title: normalizeText(content.title, 80),
        items:
          normalizedItems.length > 0
            ? normalizedItems
            : [
                { src: gallerySlotSrc(0, img), alt: "gallery-1" },
                { src: gallerySlotSrc(1, img), alt: "gallery-2" },
              ],
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
    case "schedule": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80) || "スケジュール",
        items: items.slice(0, 8).map((item) => {
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            day: normalizeText(row.day, 40),
            time: normalizeText(row.time, 40),
            label: normalizeText(row.label, 120),
          };
        }),
      };
    }
    case "steps": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80) || "流れ",
        items: items.slice(0, 6).map((item) => {
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            title: normalizeText(row.title, 80),
            description: normalizeText(row.description, 200),
          };
        }),
      };
    }
    case "checklist": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80) || "チェックリスト",
        items: items.slice(0, 12).map((item) => {
          if (typeof item === "string") return { text: normalizeText(item, 120), checked: false };
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            text: normalizeText(row.text, 120),
            checked: Boolean(row.checked),
          };
        }),
      };
    }
    case "faq": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80) || "よくある質問",
        items: items.slice(0, 8).map((item) => {
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            q: normalizeText(row.q, 120),
            a: normalizeText(row.a, 300),
          };
        }),
      };
    }
    case "pageLinks": {
      const items = Array.isArray(content.items) ? content.items : [];
      return {
        title: normalizeText(content.title, 80) || "リンク",
        columns: 2,
        iconSize: "md",
        styleVariant: "tile",
        items: items.slice(0, 10).map((item) => {
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            label: normalizeText(row.label, 60),
            icon: normalizeText(row.icon, 24) || "link",
          };
        }),
      };
    }
    default:
      return {};
  }
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
  cards: Array<{ type: string; content: Record<string, unknown> }>,
  description: string
): QualityReport {
  const personal = isPersonalDailyDescription(description);
  const coreTypes = personal
    ? (["welcome", "schedule", "map", "notice", "faq"] as const)
    : (["welcome", "wifi", "breakfast", "checkout", "nearby", "map"] as const);
  const existing = new Set(cards.map((c) => c.type));
  const missingCoreCards = coreTypes.filter((t) => !existing.has(t));

  const suggestions: string[] = [];
  if (cards.length < 5) {
    suggestions.push(personal ? "カードが少なめです。日程・持ち物・リンクを足すと伝わりやすいです。" : "案内項目をもう少し追加してください。");
  }
  if (!personal && !existing.has("emergency")) {
    suggestions.push("緊急連絡先カードを追加すると運用品質が上がります。");
  }

  const base = 100 - missingCoreCards.length * 12 - (cards.length < 5 ? 10 : 0);
  const score = Math.max(0, Math.min(100, base));
  return { score, missingCoreCards, suggestions };
}

/** Generate cards from a natural-language description using AI. */
async function generateCardsFromDescription(
  apiKey: string,
  description: string,
  imageDefaults: AiPageImageDefaults
): Promise<{
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>;
  modelUsed: string;
  fallbackUsed: boolean;
}> {
  const schemas = ALLOWED_TYPES.map((t) => `${t}: ${CARD_SCHEMAS[t] ?? "{}"}`).join("\n");

  const hotelLike = isHotelLikeDescription(description);
  const personalLike = isPersonalDailyDescription(description);

  const toneGuide = personalLike
    ? "友達にLINEで送るような、くだけた日本語で書く。説教やホテルフロント口調は避ける。"
    : "ゲスト向け案内として分かりやすい日本語。";

  const scenarioGuide = hotelLike
    ? "宿泊施設向け: wifi, breakfast, checkout, nearby などを必要に応じて含める。"
    : personalLike
      ? "個人向け（旅行・推し活・おでかけ・イベント）: schedule, steps, checklist, faq, map, pageLinks, notice を優先。wifi/checkout/emergency は説明に無い限り使わない。"
      : "説明に合うカードを選ぶ。宿泊・店舗・イベントのいずれにも対応可。";

  const imageGuide =
    "画像URL（src）は一切出力しない。hero は title/subtitle のみ。hero_slider は caption と alt のみ。image/gallery は alt のみ（src はサーバーがローカル素材を割り当てる）。";

  const prompt = `あなたはスマホ1ページの案内カードを組み立てるAIです。ユーザーの説明に書かれた固有名詞・日時・場所・人数を必ず本文に反映してください。汎用の挨拶文だけのカードは避けてください。

ユーザーの説明: "${description.slice(0, 800)}"

文体: ${toneGuide}
方針: ${scenarioGuide}
画像: ${imageGuide}

以下のカードタイプのみ使用: ${ALLOWED_TYPES.join(", ")}.
各カードは type, content（下記スキーマ）, order（0始まり）を含める。

スキーマ:
${schemas}

出力例:
- 旅行しおり → hero, hero_slider, welcome, schedule, checklist, map, notice, pageLinks, faq
- ライブ当日 → hero, hero_slider, welcome, schedule, notice, checklist, faq, map
- デートプラン → hero, heading_body, schedule, map, notice, pageLinks
- ホテル案内（説明に宿泊がある場合のみ）→ hero, welcome, wifi, breakfast, checkout, nearby, map

JSON配列のみ。マークダウンや説明は含めない。`;

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
        typeof c.content === "object" && c.content !== null ? (c.content as Record<string, unknown>) : {},
        imageDefaults
      ),
      order: typeof c.order === "number" ? c.order : i,
    }));

  if (cards.length === 0) {
    throw new Error("No valid cards in AI response");
  }

  const ordered = cards.sort((a, b) => a.order - b.order).map((c, i) => ({ ...c, order: i }));
  const completed = ensureCoreHotelCards(ordered as AiGeneratedCard[], description);
  const finalized = finalizeAiPageCards(completed, description);
  return { cards: finalized, modelUsed: aiResult.modelUsed, fallbackUsed: aiResult.fallbackUsed };
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
    .select("max_published_pages,plan")
    .eq("hotel_id", membership.hotel_id)
    .maybeSingle();
  const maxPages = sub
    ? normalizeMaxPublishedPages(sub.plan as "free" | "pro" | "business", sub.max_published_pages)
    : 3;
  const { count } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("hotel_id", membership.hotel_id);
  if ((count ?? 0) >= maxPages) {
    return NextResponse.json(
      { error: `ページ数の上限に達しました（${maxPages}件）。Proプランで10ページまで作成できます。` },
      { status: 403 }
    );
  }

  try {
    const imageDefaults = getAiPageDefaultImages(inferAiPageImageTheme(description));
    const generated = await generateCardsFromDescription(apiKey, description, imageDefaults);
    const cards = generated.cards;
    const quality = buildDescriptionQualityReport(cards, description);
    const title = AI_GENERATED_PAGE_TITLE;
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
