import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * POST: 日本語テキストを英語・中国語・韓国語に翻訳する。
 * Body: { text: string }
 * Returns: { en: string, zh: string, ko: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 }
    );
  }
  if (text.length > 4000) {
    return NextResponse.json(
      { error: "text too long" },
      { status: 400 }
    );
  }

  const prompt = `次の日本語のテキストを、英語・中国語（簡体字）・韓国語に翻訳してください。
自然で読みやすい表現にしてください。JSONのみを返し、説明やマークダウンは含めないでください。

日本語:
${text}

出力形式（このJSONのみ、他は出力しない）:
{
  "en": "英語訳",
  "zh": "中文翻译",
  "ko": "한국어 번역"
}`;

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "Translation failed", detail: err },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = parseJsonBlock(raw);
    if (!parsed || typeof parsed.en !== "string" || typeof parsed.zh !== "string" || typeof parsed.ko !== "string") {
      return NextResponse.json(
        { error: "Invalid translation response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      en: String(parsed.en).trim(),
      zh: String(parsed.zh).trim(),
      ko: String(parsed.ko).trim(),
    });
  } catch (e) {
    console.error("translate-content error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Translation failed" },
      { status: 500 }
    );
  }
}

function parseJsonBlock(raw: string): { en?: string; zh?: string; ko?: string } | null {
  const trimmed = raw.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const str = codeBlock ? codeBlock[1].trim() : trimmed;
  try {
    return JSON.parse(str) as { en?: string; zh?: string; ko?: string };
  } catch {
    return null;
  }
}
