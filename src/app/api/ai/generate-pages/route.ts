import { NextResponse } from "next/server";
import type { TemplateBlock, TemplatePage } from "@/lib/multi-page-templates/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function buildPrompt(hotelName: string, location: string): string {
  return `You are a helpful assistant for a hotel guest information system (infomii). Generate content for 5 guest information pages in Japanese.

Input:
- Hotel name: ${hotelName}
- Location: ${location}

Output: Return ONLY a valid JSON array of 5 pages. No markdown, no code fence. Each page must have this exact structure:

[
  {
    "title": "館内総合案内",
    "blocks": [
      { "type": "title", "content": "館内総合案内" },
      { "type": "text", "content": "1–2 sentences for this hotel" },
      { "type": "icon", "icon": "🏨", "label": "short label" },
      { "type": "button", "label": "館内マップ", "href": "#" }
    ]
  },
  {
    "title": "WiFi",
    "blocks": [
      { "type": "title", "content": "WiFi" },
      { "type": "text", "content": "1 sentence about WiFi at this hotel" },
      { "type": "icon", "icon": "📶", "label": "SSID・パスワード" },
      { "type": "button", "label": "WiFi情報", "href": "#wifi" }
    ]
  },
  {
    "title": "朝食",
    "blocks": [
      { "type": "title", "content": "朝食" },
      { "type": "text", "content": "1 sentence about breakfast" },
      { "type": "icon", "icon": "🍽️", "label": "時間・場所" },
      { "type": "button", "label": "朝食のご案内", "href": "#breakfast" }
    ]
  },
  {
    "title": "チェックアウト",
    "blocks": [
      { "type": "title", "content": "チェックアウト" },
      { "type": "text", "content": "1 sentence about checkout" },
      { "type": "icon", "icon": "🚪", "label": "時刻・返却" },
      { "type": "button", "label": "チェックアウトのご案内", "href": "#checkout" }
    ]
  },
  {
    "title": "周辺観光",
    "blocks": [
      { "type": "title", "content": "周辺観光" },
      { "type": "text", "content": "1–2 sentences about ${location} and nearby spots" },
      { "type": "icon", "icon": "📍", "label": "アクセス・観光" },
      { "type": "button", "label": "周辺マップ", "href": "#map" }
    ]
  }
]

Rules:
- Block types are only: title, text, icon, button (no image).
- Use emoji for icon (e.g. 📶 🍽️ 🚪 📍 🏨).
- Keep text concise and suitable for hotel guests. Use ${hotelName} and ${location} where natural.
- Return only the JSON array, no other text.`;
}

function parsePages(body: string): TemplatePage[] {
  const trimmed = body.trim().replace(/^```json?\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected array");
  const result: TemplatePage[] = [];
  for (const p of parsed) {
    if (!p || typeof p !== "object" || !("title" in p)) continue;
    const page = p as { title: string; blocks?: unknown[] };
    const rawBlocks = (page.blocks ?? []).filter(
      (b): b is Record<string, unknown> => b != null && typeof b === "object" && "type" in b
    );
    const blocks: TemplateBlock[] = [];
    for (const b of rawBlocks) {
      const t = String((b as { type?: string }).type ?? "");
      if (t === "title" && "content" in b)
        blocks.push({ type: "title", content: String((b as { content?: string }).content ?? "") });
      else if (t === "text" && "content" in b)
        blocks.push({ type: "text", content: String((b as { content?: string }).content ?? "") });
      else if (t === "icon")
        blocks.push({
          type: "icon",
          icon: String((b as { icon?: string }).icon ?? "📍"),
          label: (b as { label?: string }).label != null ? String((b as { label?: string }).label) : undefined,
        });
      else if (t === "button")
        blocks.push({
          type: "button",
          label: String((b as { label?: string }).label ?? "ボタン"),
          href: (b as { href?: string }).href != null ? String((b as { href?: string }).href) : undefined,
        });
    }
    result.push({ title: String(page.title), blocks });
  }
  return result;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: { hotelName?: string; location?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const hotelName = String(body.hotelName ?? "").trim();
  const location = String(body.location ?? "").trim();
  if (!hotelName || !location) {
    return NextResponse.json(
      { error: "hotelName and location are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You output only valid JSON. No markdown, no explanation." },
          { role: "user", content: buildPrompt(hotelName, location) },
        ],
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "AI request failed", details: err.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content in AI response" },
        { status: 502 }
      );
    }

    const pages = parsePages(content);
    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Could not parse generated pages" },
        { status: 502 }
      );
    }

    return NextResponse.json({ pages });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Generation failed", details: message },
      { status: 500 }
    );
  }
}
