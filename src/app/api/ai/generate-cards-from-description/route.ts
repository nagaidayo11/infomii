import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const ALLOWED_TYPES = ["wifi", "breakfast", "notice", "map", "button", "image", "text", "gallery", "divider"] as const;

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
};

/** Generate cards from a natural-language description using AI. */
async function generateCardsFromDescription(
  apiKey: string,
  description: string
): Promise<Array<{ type: string; content: Record<string, unknown>; order: number }>> {
  const schemas = ALLOWED_TYPES.map((t) => `${t}: ${CARD_SCHEMAS[t]}`).join("\n");

  const prompt = `あなたは宿泊施設・店舗向けのモバイル案内ページを生成するAIです。ユーザーの説明に基づいて、適切なカードを生成してください。

ユーザーの説明: "${description.slice(0, 800)}"

以下のカードタイプのみ使用: ${ALLOWED_TYPES.join(", ")}. 各カードは type, content（下記スキーマ）, order（0始まり）を含める。

スキーマ:
${schemas}

出力例: ホテル→text(welcome), wifi, breakfast, notice, map, button / レストラン→text(タイトル), notice(営業時間), text(メニュー), map, button

JSON配列のみ出力。マークダウン・説明禁止。`;

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
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
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
      { error: "description is required" },
      { status: 400 }
    );
  }

  try {
    const cards = await generateCardsFromDescription(apiKey, description);
    return NextResponse.json({ cards });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Generation failed", details: message },
      { status: 500 }
    );
  }
}
