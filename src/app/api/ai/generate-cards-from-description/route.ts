import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { composeInfomiiPage } from "@/lib/server/ai-page-composer";
import { getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません" }, { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  const anon = getSupabaseAnonServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });

  let body: { description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const description = String(body.description ?? "").trim();
  if (!description) return NextResponse.json({ error: "説明文を入力してください" }, { status: 400 });

  try {
    const pageSlug = `${createSlug(description.slice(0, 30))}-preview`;
    const generated = await composeInfomiiPage({ apiKey, sourceText: description, sourceKind: "description", pageSlug });
    return NextResponse.json({
      cards: generated.cards,
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
