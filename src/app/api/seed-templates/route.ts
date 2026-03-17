import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type SeedTemplate = {
  name: string;
  description: string;
  preview_image: string;
  category: string | null;
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>;
};

const BASE_CARDS = [
  { type: "welcome", content: { title: "ようこそ", message: "ご宿泊ありがとうございます。" }, order: 0 },
  { type: "wifi", content: { ssid: "", password: "", description: "" }, order: 1 },
  { type: "breakfast", content: { time: "7:00–9:30", location: "1F ダイニング", menu: "" }, order: 2 },
  { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" }, order: 3 },
];

const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: "ビジネスホテル・館内案内",
    description: "チェックイン・WiFi・朝食・チェックアウトの基本カード。ビジネス宿泊向け。",
    preview_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    category: "business",
    cards: BASE_CARDS,
  },
  {
    name: "リゾートホテル・館内案内",
    description: "ウェルカム・WiFi・朝食・チェックアウト。リゾート施設向け。",
    preview_image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    category: "resort",
    cards: BASE_CARDS,
  },
  {
    name: "旅館・ご案内",
    description: "おもてなしメッセージ・WiFi・朝食・チェックアウト。旅館向け。",
    preview_image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    category: "ryokan",
    cards: BASE_CARDS,
  },
  {
    name: "Airbnb・ゲスト向け案内",
    description: "ウェルカム・WiFi・チェックアウト。民泊・ゲストハウス向け。",
    preview_image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "welcome", content: { title: "ようこそ", message: "ご滞在のご案内です。" }, order: 0 },
      { type: "wifi", content: { ssid: "", password: "", description: "" }, order: 1 },
      { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" }, order: 2 },
    ],
  },
  {
    name: "観光ガイド・スポット案内",
    description: "ウェルカム・周辺案内・地図・緊急連絡先。観光向け。",
    preview_image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    category: "guide",
    cards: [
      { type: "welcome", content: { title: "観光のご案内", message: "" }, order: 0 },
      { type: "nearby", content: { title: "周辺案内", items: [{ name: "", description: "", link: "" }] }, order: 1 },
      { type: "map", content: { address: "" }, order: 2 },
      { type: "emergency", content: { title: "緊急連絡先", fire: "119", police: "110", hospital: "", note: "" }, order: 3 },
    ],
  },
  {
    name: "チェックイン・館内案内",
    description: "チェックイン手順と館内のご案内用。WiFi・朝食・チェックアウトを含みます。",
    preview_image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    category: null,
    cards: [
      { type: "welcome", content: { title: "チェックイン・館内案内", message: "" }, order: 0 },
      ...BASE_CARDS.slice(1),
    ],
  },
];

const PREVIEW_IMAGE_BY_NAME: Record<string, string> = Object.fromEntries(
  SEED_TEMPLATES.filter((t) => t.preview_image).map((t) => [t.name, t.preview_image])
);

/**
 * GET: テンプレートが0件の場合のみシード。既存の空の preview_image は更新。
 * Categories: business, resort, ryokan, airbnb, guide.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdminServerClient();
    const { data: existing } = await supabase
      .from("templates")
      .select("id, name, preview_image")
      .limit(100);

    if (!existing || existing.length === 0) {
      const rows = SEED_TEMPLATES.map(({ name, description, preview_image, category, cards }) => ({
        name,
        description,
        preview_image,
        category,
        cards,
      }));
      const { error } = await supabase.from("templates").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ seeded: true, count: rows.length });
    }

    const toUpdate = (existing ?? []).filter(
      (t) => !t.preview_image || t.preview_image.trim() === ""
    );
    let updated = 0;
    for (const t of toUpdate) {
      const img = PREVIEW_IMAGE_BY_NAME[t.name];
      if (img) {
        const { error } = await supabase
          .from("templates")
          .update({ preview_image: img })
          .eq("id", t.id);
        if (!error) updated++;
      }
    }
    return NextResponse.json({
      seeded: false,
      message: "Already has templates",
      updated,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
