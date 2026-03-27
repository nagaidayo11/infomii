import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const IS_DEV = process.env.NODE_ENV !== "production";
const MODEL_CANDIDATES = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1-nano"] as const;

function logTranslateError(stage: string, payload: Record<string, unknown>) {
  const base = {
    scope: "api/ai/translate-content",
    stage,
    at: new Date().toISOString(),
  };
  const safePayload = {
    requestId: payload.requestId,
    model: payload.model,
    status: payload.status,
    statusText: payload.statusText,
    openaiCode: payload.openaiCode,
    openaiType: payload.openaiType,
    openaiMessage: payload.openaiMessage,
  };
  // Keep verbose details in dev only, but always include safe summary in production.
  if (IS_DEV) {
    console.error("[translate-content]", { ...base, ...payload });
    return;
  }
  console.error("[translate-content]", { ...base, ...safePayload });
}

function parseOpenAiError(raw: string): { code?: string; message?: string; type?: string } {
  try {
    const parsed = JSON.parse(raw) as { error?: { code?: string; message?: string; type?: string } };
    return {
      code: parsed?.error?.code,
      message: parsed?.error?.message,
      type: parsed?.error?.type,
    };
  } catch {
    return {};
  }
}

/**
 * POST: 日本語テキストを英語・中国語・韓国語に翻訳する。
 * Body: { text: string }
 * Returns: { en: string, zh: string, ko: string }
 */
export async function POST(request: Request) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logTranslateError("missing_api_key", { requestId });
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: { text?: string; texts?: string[] };
  try {
    body = await request.json();
  } catch (e) {
    logTranslateError("invalid_json_body", {
      requestId,
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const texts =
    Array.isArray(body.texts)
      ? body.texts.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean)
      : [];
  if (!text && texts.length === 0) {
    logTranslateError("missing_text", { requestId });
    return NextResponse.json(
      { error: "text or texts is required" },
      { status: 400 }
    );
  }
  if (text.length > 4000) {
    logTranslateError("text_too_long", { requestId, textLength: text.length });
    return NextResponse.json(
      { error: "text too long" },
      { status: 400 }
    );
  }
  const totalTextsLength = texts.reduce((acc, t) => acc + t.length, 0);
  if (texts.length > 120 || totalTextsLength > 12000) {
    logTranslateError("texts_too_large", { requestId, count: texts.length, totalTextsLength });
    return NextResponse.json(
      { error: "texts too large" },
      { status: 400 }
    );
  }

  const singlePrompt = `次の日本語のテキストを、英語・中国語（簡体字）・韓国語に翻訳してください。
自然で読みやすい表現にしてください。JSONのみを返し、説明やマークダウンは含めないでください。

日本語:
${text}

出力形式（このJSONのみ、他は出力しない）:
{
  "en": "英語訳",
  "zh": "中文翻译",
  "ko": "한국어 번역"
}`;

  const batchPrompt = `次の日本語テキスト一覧を、英語・中国語（簡体字）・韓国語に翻訳してください。
自然で読みやすい表現にしてください。必ずJSONのみを返し、説明やマークダウンは出力しないでください。
入力のiをそのまま維持し、件数を減らしたり並びを変えたりしないでください。

入力:
${JSON.stringify(texts.map((t, i) => ({ i, ja: t })))}

出力形式（このJSONのみ）:
{
  "items": [
    { "i": 0, "en": "English", "zh": "中文", "ko": "한국어" }
  ]
}`;

  try {
    let data: { choices?: Array<{ message?: { content?: string } }> } | null = null;
    let lastError: {
      status?: number;
      statusText?: string;
      detail?: string;
      model?: string;
      openaiCode?: string;
      openaiType?: string;
      openaiMessage?: string;
    } | null = null;

    for (const model of MODEL_CANDIDATES) {
      const res = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: texts.length > 0 ? batchPrompt : singlePrompt }],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        const parsedErr = parseOpenAiError(err);
        logTranslateError("openai_non_200", {
          requestId,
          model,
          status: res.status,
          statusText: res.statusText,
          openaiCode: parsedErr.code,
          openaiType: parsedErr.type,
          openaiMessage: parsedErr.message?.slice(0, 300),
          detailPreview: err.slice(0, 600),
        });
        lastError = {
          status: res.status,
          statusText: res.statusText,
          detail: err,
          model,
          openaiCode: parsedErr.code,
          openaiType: parsedErr.type,
          openaiMessage: parsedErr.message,
        };
        continue;
      }

      data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      lastError = null;
      break;
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Translation failed",
          reason: "openai_non_200",
          model: lastError?.model,
          status: lastError?.status,
          openaiCode: lastError?.openaiCode,
          openaiType: lastError?.openaiType,
          openaiMessage: lastError?.openaiMessage,
        },
        { status: 502 }
      );
    }

    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (texts.length > 0) {
      const parsed = parseJsonBlock(raw) as { items?: Array<{ i?: number; en?: string; zh?: string; ko?: string }> } | null;
      const items = Array.isArray(parsed?.items) ? parsed!.items : [];
      const normalized = items
        .filter((it) => typeof it.i === "number" && typeof it.en === "string" && typeof it.zh === "string" && typeof it.ko === "string")
        .map((it) => ({
          i: Number(it.i),
          en: String(it.en).trim(),
          zh: String(it.zh).trim(),
          ko: String(it.ko).trim(),
        }));
      if (normalized.length !== texts.length) {
        logTranslateError("invalid_batch_translation_response", {
          requestId,
          expected: texts.length,
          actual: normalized.length,
          rawPreview: raw.slice(0, 1000),
        });
        return NextResponse.json(
          { error: "Invalid batch translation response" },
          { status: 502 }
        );
      }
      return NextResponse.json({ items: normalized });
    }

    const parsed = parseJsonBlock(raw);
    if (!parsed || typeof parsed.en !== "string" || typeof parsed.zh !== "string" || typeof parsed.ko !== "string") {
      logTranslateError("invalid_translation_response", {
        requestId,
        hasChoices: Array.isArray(data.choices),
        rawPreview: raw.slice(0, 1000),
      });
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
    logTranslateError("unexpected_exception", {
      requestId,
      message: e instanceof Error ? e.message : "unknown",
      stack: e instanceof Error ? e.stack : undefined,
    });
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
