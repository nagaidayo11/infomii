import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { resolveTemplateMeta } from "@/lib/template-meta";
import type { TemplateRow } from "@/lib/storage";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const anon = getSupabaseAnonServerClient();
  const {
    data: { user },
    error: userError,
  } = await anon.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });

  const admin = getSupabaseAdminServerClient();
  const { data: tpl, error } = await admin
    .from("templates")
    .select("id,name,description,preview_image,cards,created_at,category")
    .eq("id", id)
    .maybeSingle();
  if (error || !tpl) return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });

  const meta = resolveTemplateMeta(tpl as TemplateRow);
  const reviewStatus = meta.needsReview ? "needs_review" : "ok";
  const { error: updateError } = await admin
    .from("templates")
    .update({
      review_status: reviewStatus,
      consistency_score: meta.consistencyScore,
      consistency_reason: meta.consistencyReason,
      regen_error: null,
    } as never)
    .eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    id,
    review_status: reviewStatus,
    consistency_score: meta.consistencyScore,
    consistency_reason: meta.consistencyReason,
  });
}

