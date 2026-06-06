import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `あなたはホテル・宿泊施設の案内ページに表示されている内容に基づいて、お客様の質問に答えるアシスタントです。

ルール:
- 以下の「ページの内容」に書かれている情報だけを使って答えてください。書かれていないことは「このページには記載がありません。フロントまたはスタッフへお問い合わせください」と伝えてください。
- 回答は日本語で、丁寧で分かりやすく、簡潔に書いてください。
- 推測や事実でない情報は述べないでください。
- お客様が施設のルールや時間・場所などを尋ねた場合は、ページの内容から該当する部分を要約して答えてください。`;

/**
 * POST: Chat with AI assistant that answers based on page content.
 * Body: { messages: { role: "user" | "assistant", content: string }[], context: string }
 * Returns: { reply: string } or { error: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEYが設定されていません" },
      { status: 503 }
    );
  }

  let body: { messages?: { role: string; content: string }[]; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 }
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const context = typeof body.context === "string" ? body.context.trim() : "";

  const validMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role as "user" | "assistant", content: (m.content as string).slice(0, 2000) }));

  if (validMessages.length === 0) {
    return NextResponse.json(
      { error: "メッセージを送信してください" },
      { status: 400 }
    );
  }

  const contextBlock = context
    ? `【ページの内容】\n${context.slice(0, 8000)}\n\n上記の内容に基づいて質問に答えてください。`
    : "ページの内容が提供されていません。その旨をお伝えし、スタッフへお問い合わせいただくよう案内してください。";

  const openaiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextBlock },
    ...validMessages,
  ];

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "回答の取得に失敗しました", detail: err.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("info-chat error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "エラーが発生しました" },
      { status: 500 }
    );
  }
}
