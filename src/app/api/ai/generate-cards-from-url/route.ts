import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { composeInfomiiPage, createCompositionGuestShell } from "@/lib/server/ai-page-composer";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { pageQuotaForbiddenPayload, resolveHotelPageQuota } from "@/lib/server/resolve-hotel-page-quota";

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24000);
}

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) return true;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168);
}

async function assertPublicUrl(value: string): Promise<URL> {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("URLは http(s) のみ指定できます");
  if (url.username || url.password) throw new Error("認証情報を含むURLは指定できません");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("公開サイトのURLを指定してください");
  }
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("公開サイトのURLを指定してください");
  }
  return url;
}

async function fetchOfficialPage(input: string): Promise<{ finalUrl: URL; text: string }> {
  let url = await assertPublicUrl(input);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Infomii/1.0; +https://www.infomii.com)" },
      signal: AbortSignal.timeout(15000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("サイトのリダイレクトを確認できませんでした");
      url = await assertPublicUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`公式サイトを取得できませんでした（${response.status}）`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) throw new Error("HTMLページのURLを指定してください");
    const text = extractTextFromHtml(await response.text());
    if (text.length < 50) throw new Error("ページから十分な案内文を取得できませんでした");
    return { finalUrl: url, text };
  }
  throw new Error("公式サイトを取得できませんでした");
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません" }, { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  let body: { url?: string; page_id?: string; create_page?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const inputUrl = String(body.url ?? "").trim();
  const requestedPageId = String(body.page_id ?? "").trim();
  if (!inputUrl) return NextResponse.json({ error: "公式サイトのURLを入力してください" }, { status: 400 });

  const supabase = getSupabaseAdminServerClient();
  const anon = getSupabaseAnonServerClient();
  const { data: { user }, error: userError } = await anon.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  const { data: membership, error: memberError } = await supabase
    .from("hotel_memberships").select("hotel_id").eq("user_id", user.id).maybeSingle();
  if (memberError || !membership?.hotel_id) return NextResponse.json({ error: "施設が選択されていません" }, { status: 403 });

  try {
    const fetched = await fetchOfficialPage(inputUrl);
    const slug = `${createSlug(fetched.finalUrl.hostname.replace(/^www\./, ""))}-${Date.now().toString(36)}`;
    const sourceText = `公式サイトURL: ${fetched.finalUrl.toString()}\n\n公式サイト本文:\n${fetched.text}`;
    const generated = await composeInfomiiPage({ apiKey, sourceText, sourceKind: "official_website", pageSlug: slug });
    const payload = generated.cards.map((card, order) => ({ type: card.type, content: card.content, order }));
    let pageId = requestedPageId;

    if (!pageId && body.create_page !== true) {
      return NextResponse.json({
        cards: payload,
        source: { url: fetched.finalUrl.toString(), imagesImported: false },
        composition: generated.design,
        ai: { modelUsed: generated.modelUsed, fallbackUsed: generated.fallbackUsed, mode: "structured_composition" },
      });
    }

    if (pageId) {
      const { data: existing } = await supabase.from("pages").select("id,slug").eq("id", pageId).eq("hotel_id", membership.hotel_id).maybeSingle();
      if (!existing?.id) return NextResponse.json({ error: "対象ページが見つかりません" }, { status: 404 });
      const shell = createCompositionGuestShell(generated.design.navigationStyle, generated.cards, existing.slug as string);
      await supabase.from("pages").update({ guest_shell: shell }).eq("id", pageId).eq("hotel_id", membership.hotel_id);
    } else {
      const quota = await resolveHotelPageQuota({ admin: supabase, hotelId: membership.hotel_id, user });
      if (!quota.allowed) return NextResponse.json(pageQuotaForbiddenPayload(quota), { status: 403 });
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({ hotel_id: membership.hotel_id, title: generated.title, slug, guest_shell: generated.guestShell })
        .select("id")
        .single();
      if (pageError || !page?.id) return NextResponse.json({ error: "ページの作成に失敗しました", details: pageError?.message }, { status: 500 });
      pageId = page.id as string;
    }

    const { data: inserted, error: insertError } = await supabase.from("cards").insert(
      payload.map((card) => ({ page_id: pageId, ...card })),
    ).select("id");
    if (insertError) return NextResponse.json({ error: "カードの保存に失敗しました", details: insertError.message }, { status: 500 });

    return NextResponse.json({
      cards: payload,
      inserted: inserted?.length ?? 0,
      page_id: pageId,
      pageId,
      source: { url: fetched.finalUrl.toString(), imagesImported: false },
      composition: generated.design,
      ai: { modelUsed: generated.modelUsed, fallbackUsed: generated.fallbackUsed, mode: "structured_composition" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "取り込みに失敗しました", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
