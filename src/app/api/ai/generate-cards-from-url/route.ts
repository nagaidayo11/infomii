import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

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

/** Extract structured hotel data from webpage text using AI. */
async function extractHotelData(
  apiKey: string,
  url: string,
  pageText: string
): Promise<{
  hotelName: string;
  address: string;
  wifiInfo: string;
  breakfastInfo: string;
  checkIn: string;
  checkOut: string;
}> {
  const prompt = `次のホテル・宿泊施設のウェブサイトから取得したテキストを分析し、以下の項目を抽出してJSONで返してください。不明な項目は空文字にしてください。JSON以外は出力しないでください。

URL: ${url}

テキスト（抜粋）:
${pageText.slice(0, 12000)}

出力形式（このJSONのみ）:
{
  "hotelName": "施設名",
  "address": "住所",
  "wifiInfo": "WiFiのSSID・パスワードや案内",
  "breakfastInfo": "朝食の時間・場所・内容",
  "checkIn": "チェックイン時刻",
  "checkOut": "チェックアウト時刻"
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
  };
}

/** Convert extracted hotel data into Infomii card format using AI. */
async function dataToCards(
  apiKey: string,
  extracted: {
    hotelName: string;
    address: string;
    wifiInfo: string;
    breakfastInfo: string;
    checkIn: string;
    checkOut: string;
  }
): Promise<Array<{ type: string; content: Record<string, unknown>; order: number }>> {
  const prompt = `以下のホテル情報を、Infomiiのカード形式に変換してください。ゲスト向け案内ページ用です。日本語で出力してください。

施設名: ${extracted.hotelName}
住所: ${extracted.address}
WiFi: ${extracted.wifiInfo}
朝食: ${extracted.breakfastInfo}
チェックイン: ${extracted.checkIn}
チェックアウト: ${extracted.checkOut}

出力: 以下のJSON配列のみを返してください。他は何も書かないでください。
[
  { "type": "text", "content": { "content": "ウェルカムメッセージ（施設名と短い挨拶）" }, "order": 0 },
  { "type": "wifi", "content": { "title": "WiFi", "ssid": "", "password": "", "description": "" }, "order": 1 },
  { "type": "breakfast", "content": { "title": "朝食", "time": "", "location": "", "description": "" }, "order": 2 },
  { "type": "checkout", "content": { "title": "チェックアウト", "time": "", "note": "" }, "order": 3 },
  { "type": "map", "content": { "address": "" }, "order": 4 },
  { "type": "notice", "content": { "title": "お知らせ", "body": "", "variant": "info" }, "order": 5 }
]

ルール:
- type は text, wifi, breakfast, checkout, map, notice のいずれか。
- 各 content のフィールドは上記の形式に合わせ、抽出した情報を埋めてください。
- order は 0 から順に。
- 不明な項目は空文字または適切な既定値で。
- JSON配列のみ出力。`;

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
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI cards failed: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in AI response");

  const trimmed = content.trim().replace(/^```json?\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected array");

  const cards: Array<{ type: string; content: Record<string, unknown>; order: number }> = [];
  const allowed = ["text", "wifi", "breakfast", "checkout", "map", "notice"];
  for (const item of parsed) {
    if (!item || typeof item !== "object" || !("type" in item) || !("content" in item)) continue;
    const type = String((item as { type?: string }).type ?? "text");
    if (!allowed.includes(type)) continue;
    const contentObj = (item as { content?: unknown }).content;
    const order = Number((item as { order?: number }).order ?? cards.length);
    cards.push({
      type,
      content: typeof contentObj === "object" && contentObj !== null ? (contentObj as Record<string, unknown>) : {},
      order,
    });
  }
  return cards.sort((a, b) => a.order - b.order);
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
    const cards = await dataToCards(apiKey, extracted);

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

    if (pageId) {
      try {
        const supabase = getSupabaseAdminServerClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cards table not in generated types yet
        const { data: inserted, error: insertError } = await (supabase as any)
          .from("cards")
          .insert(
            payload.map((p) => ({
              page_id: pageId,
              type: p.type,
              content: p.content,
              order: p.order,
            }))
          )
          .select("id,order");
        if (insertError) {
          return NextResponse.json({
            cards: payload,
            extracted: { hotelName: extracted.hotelName, address: extracted.address },
            dbError: "cards テーブルへの保存に失敗しました（テーブルが存在するか確認してください）",
          });
        }
        return NextResponse.json({
          cards: payload,
          inserted: inserted?.length ?? 0,
          page_id: pageId,
          extracted: { hotelName: extracted.hotelName, address: extracted.address },
        });
      } catch {
        return NextResponse.json({
          cards: payload,
          extracted: { hotelName: extracted.hotelName, address: extracted.address },
          dbError: "データベース保存をスキップしました",
        });
      }
    }

    return NextResponse.json({
      cards: payload,
      extracted: {
        hotelName: extracted.hotelName,
        address: extracted.address,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Generation failed", details: message },
      { status: 500 }
    );
  }
}
