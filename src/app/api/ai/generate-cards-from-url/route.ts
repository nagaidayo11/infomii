import { NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/** Strip HTML and get plain text (rough extraction for AI). */
function extractTextFromHtml(html: string): string {
  const noScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  const noStyle = noScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  const text = noStyle
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 24000); // limit token usage
}

type ExtractedHotel = {
  hotelName: string;
  address: string;
  wifiInfo: string;
  breakfastInfo: string;
  checkIn: string;
  checkOut: string;
  nearbyInfo: string;
  taxiInfo: string;
  emergencyInfo: string;
};

/** Extract structured hotel data from webpage text using AI. */
async function extractHotelData(
  apiKey: string,
  url: string,
  pageText: string
): Promise<ExtractedHotel> {
  const prompt = `次のホテル・宿泊施設のウェブサイトから取得したテキストを分析し、以下の項目を抽出してJSONで返してください。不明な項目は空文字にしてください。JSON以外は出力しないでください。

URL: ${url}

テキスト（抜粋）:
${pageText.slice(0, 12000)}

出力形式（このJSONのみ）:
{
  "hotelName": "施設名",
  "address": "住所（番地・市区町村・都道府県）",
  "wifiInfo": "WiFiのSSID・パスワードや案内",
  "breakfastInfo": "朝食の時間・場所・内容・形式",
  "checkIn": "チェックイン時刻",
  "checkOut": "チェックアウト時刻",
  "nearbyInfo": "周辺の観光地・駅・コンビニ・レストランなど",
  "taxiInfo": "タクシー会社名・電話番号・手配案内",
  "emergencyInfo": "緊急時の連絡先（火災119・警察110・病院・フロントなど）"
}`;

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
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI extraction failed: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in AI response");

  const trimmed = content.trim().replace(/^```json?\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  return {
    hotelName: String(parsed.hotelName ?? "").trim(),
    address: String(parsed.address ?? "").trim(),
    wifiInfo: String(parsed.wifiInfo ?? "").trim(),
    breakfastInfo: String(parsed.breakfastInfo ?? "").trim(),
    checkIn: String(parsed.checkIn ?? "").trim(),
    checkOut: String(parsed.checkOut ?? "").trim(),
    nearbyInfo: String(parsed.nearbyInfo ?? "").trim(),
    taxiInfo: String(parsed.taxiInfo ?? "").trim(),
    emergencyInfo: String(parsed.emergencyInfo ?? "").trim(),
  };
}

/** Parse WiFi info into SSID and password if possible (e.g. "SSID: xxx / パスワード: yyy"). */
function parseWifiInfo(wifiInfo: string): { ssid: string; password: string; description: string } {
  const d = wifiInfo.trim();
  if (!d) return { ssid: "", password: "", description: d };
  let ssid = "";
  let password = "";
  const ssidMatch = d.match(/(?:SSID|ssid|ネットワーク名)[:\s]*([^\n/]+)/i);
  if (ssidMatch) ssid = ssidMatch[1].trim();
  const pwMatch = d.match(/(?:パスワード|password|PW)[:\s]*([^\n/]+)/i);
  if (pwMatch) password = pwMatch[1].trim();
  if (!ssid && d.length < 200) ssid = d.split(/\n/)[0]?.trim() ?? d.slice(0, 40);
  return { ssid, password, description: d };
}

/** Build Infomii cards from extracted hotel data. Order: Welcome, WiFi, Breakfast, Checkout, Nearby, Taxi, Emergency, Map. */
function buildCardsFromExtracted(extracted: ExtractedHotel): Array<{ type: string; content: Record<string, unknown>; order: number }> {
  const name = extracted.hotelName || "当施設";
  const welcomeMessage = `${name}へようこそ。ご宿泊ありがとうございます。ごゆっくりお過ごしください。`;

  const wifi = parseWifiInfo(extracted.wifiInfo);
  const cards: Array<{ type: string; content: Record<string, unknown>; order: number }> = [
    { type: "welcome", content: { title: "ようこそ", message: welcomeMessage }, order: 0 },
    { type: "wifi", content: { ssid: wifi.ssid, password: wifi.password, description: wifi.description || undefined }, order: 1 },
    {
      type: "breakfast",
      content: {
        time: extracted.breakfastInfo ? extracted.breakfastInfo.split(/[。\n]/)[0]?.trim().slice(0, 80) ?? "" : "",
        location: "",
        menu: extracted.breakfastInfo || "",
      },
      order: 2,
    },
    {
      type: "checkout",
      content: {
        title: "チェックアウト",
        time: extracted.checkOut || "11:00",
        note: extracted.checkIn ? `チェックイン: ${extracted.checkIn}` : "",
        linkUrl: "",
        linkLabel: "詳細",
      },
      order: 3,
    },
    {
      type: "nearby",
      content: {
        title: "周辺案内",
        items: extracted.nearbyInfo
          ? [{ name: "周辺情報", description: extracted.nearbyInfo.slice(0, 300), link: "" }]
          : [{ name: "", description: "", link: "" }],
      },
      order: 4,
    },
    {
      type: "taxi",
      content: {
        title: "タクシー",
        phone: extracted.taxiInfo.replace(/[^\d\-+]/g, "").slice(0, 20) || "",
        companyName: extracted.taxiInfo ? extracted.taxiInfo.split(/[\n\d]/)[0]?.trim().slice(0, 60) || "" : "",
        note: extracted.taxiInfo || "",
      },
      order: 5,
    },
    {
      type: "emergency",
      content: {
        title: "緊急連絡先",
        fire: "119",
        police: "110",
        hospital: extracted.emergencyInfo ? extracted.emergencyInfo.slice(0, 120) : "",
        note: extracted.emergencyInfo || "",
      },
      order: 6,
    },
    { type: "map", content: { address: extracted.address || "住所を入力してください" }, order: 7 },
  ];
  return cards;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: { url?: string; page_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const url = String(body.url ?? "").trim();
  const pageId = typeof body.page_id === "string" ? body.page_id.trim() : undefined;
  if (!url) {
    return NextResponse.json(
      { error: "url is required" },
      { status: 400 }
    );
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 }
    );
  }

  try {
    const fetchRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Infomii/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!fetchRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${fetchRes.status}` },
        { status: 502 }
      );
    }
    const html = await fetchRes.text();
    const pageText = extractTextFromHtml(html);
    if (!pageText || pageText.length < 50) {
      return NextResponse.json(
        { error: "ページから十分なテキストを取得できませんでした" },
        { status: 422 }
      );
    }

    const extracted = await extractHotelData(apiKey, url, pageText);
    const cards = buildCardsFromExtracted(extracted);

    if (cards.length === 0) {
      return NextResponse.json(
        { error: "カードを生成できませんでした" },
        { status: 502 }
      );
    }

    const payload = cards.map((c, i) => ({
      type: c.type,
      content: c.content,
      order: i,
    }));

    const supabase = getSupabaseAdminServerClient();
    let targetPageId = pageId;

    if (!targetPageId) {
      const authHeader = request.headers.get("authorization") ?? "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
      if (!token) {
        return NextResponse.json({
          cards: payload,
          extracted: { hotelName: extracted.hotelName, address: extracted.address },
          message: "page_id を指定するか、Authorization Bearer でログインして新しいページを自動作成してください",
        });
      }
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
        .select("max_published_pages")
        .eq("hotel_id", membership.hotel_id)
        .maybeSingle();
      const maxPages = sub?.max_published_pages ?? 1;
      const { count } = await supabase
        .from("pages")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", membership.hotel_id);
      if ((count ?? 0) >= maxPages) {
        return NextResponse.json(
          { error: `ページ数の上限に達しました（${maxPages}件）。Proプランで5ページまで作成できます。` },
          { status: 403 }
        );
      }
      const title = extracted.hotelName ? `${extracted.hotelName} 館内案内` : "館内案内";
      const slug = `${createSlug(extracted.hotelName || "info")}-${Date.now().toString(36)}`;
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
      targetPageId = newPage.id as string;
    }

    try {
      const { data: inserted, error: insertError } = await supabase
        .from("cards")
        .insert(
          payload.map((p, i) => ({
            page_id: targetPageId,
            type: p.type,
            content: p.content,
            order: i,
          }))
        )
        .select("id,order");
      if (insertError) {
        return NextResponse.json({
          cards: payload,
          page_id: targetPageId,
          extracted: { hotelName: extracted.hotelName, address: extracted.address },
          dbError: insertError.message,
        });
      }
      return NextResponse.json({
        cards: payload,
        inserted: inserted?.length ?? 0,
        page_id: targetPageId,
        pageId: targetPageId,
        extracted: { hotelName: extracted.hotelName, address: extracted.address },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown";
      return NextResponse.json({
        cards: payload,
        page_id: targetPageId,
        extracted: { hotelName: extracted.hotelName, address: extracted.address },
        dbError: msg,
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Generation failed", details: message },
      { status: 500 }
    );
  }
}
