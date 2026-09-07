import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { composeInfomiiPage } from "@/lib/server/ai-page-composer";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { pageQuotaForbiddenPayload, resolveHotelPageQuota } from "@/lib/server/resolve-hotel-page-quota";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません" }, { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const anon = getSupabaseAnonServerClient();
  const supabase = getSupabaseAdminServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  const { data: membership, error: memberError } = await supabase
    .from("hotel_memberships").select("hotel_id").eq("user_id", user.id).maybeSingle();
  if (memberError || !membership?.hotel_id) return NextResponse.json({ error: "施設が選択されていません" }, { status: 403 });

  const quota = await resolveHotelPageQuota({ admin: supabase, hotelId: membership.hotel_id, user });
  if (!quota.allowed) return NextResponse.json(pageQuotaForbiddenPayload(quota), { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "PDFを読み取れませんでした" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "PDFを選択してください" }, { status: 400 });
  if (file.size < 5 || file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "PDFは15MB以下にしてください" }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const hasPdfSignature = new TextDecoder("ascii").decode(bytes.slice(0, 5)) === "%PDF-";
  if (!hasPdfSignature) return NextResponse.json({ error: "PDF形式のファイルを選択してください" }, { status: 400 });

  try {
    const safeFilename = file.name.replace(/[\r\n]/g, " ").slice(0, 160) || "information.pdf";
    const slug = `${createSlug(safeFilename.replace(/\.pdf$/i, ""))}-${Date.now().toString(36)}`;
    const generated = await composeInfomiiPage({
      apiKey,
      sourceText: `取り込み元PDF: ${safeFilename}`,
      sourceKind: "pdf",
      pageSlug: slug,
      pdf: { filename: safeFilename, base64: Buffer.from(bytes).toString("base64") },
    });
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .insert({ hotel_id: membership.hotel_id, title: generated.title, slug, guest_shell: generated.guestShell })
      .select("id")
      .single();
    if (pageError || !page?.id) {
      return NextResponse.json({ error: "ページの作成に失敗しました", details: pageError?.message }, { status: 500 });
    }
    const payload = generated.cards.map((card, order) => ({ type: card.type, content: card.content, order }));
    const { error: insertError } = await supabase.from("cards").insert(
      payload.map((card) => ({ page_id: page.id, ...card })),
    );
    if (insertError) {
      await supabase.from("pages").delete().eq("id", page.id).eq("hotel_id", membership.hotel_id);
      return NextResponse.json({ error: "カードの保存に失敗しました", details: insertError.message }, { status: 500 });
    }
    return NextResponse.json({
      page_id: page.id,
      pageId: page.id,
      cards: payload.length,
      source: { filename: safeFilename, imagesImported: false, originalStored: false },
      composition: generated.design,
      ai: { modelUsed: generated.modelUsed, fallbackUsed: generated.fallbackUsed, mode: "structured_composition" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "PDFの取り込みに失敗しました", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
