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
    preview_image: "",
    category: "business",
    cards: BASE_CARDS,
  },
  {
    name: "リゾートホテル・館内案内",
    description: "ウェルカム・WiFi・朝食・チェックアウト。リゾート施設向け。",
    preview_image: "",
    category: "resort",
    cards: BASE_CARDS,
  },
  {
    name: "旅館・ご案内",
    description: "おもてなしメッセージ・WiFi・朝食・チェックアウト。旅館向け。",
    preview_image: "",
    category: "ryokan",
    cards: BASE_CARDS,
  },
  {
    name: "Airbnb・ゲスト向け案内",
    description: "ウェルカム・WiFi・チェックアウト。民泊・ゲストハウス向け。",
    preview_image: "",
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
    preview_image: "",
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
    preview_image: "",
    category: null,
    cards: [
      { type: "welcome", content: { title: "チェックイン・館内案内", message: "" }, order: 0 },
      ...BASE_CARDS.slice(1),
    ],
  },
];

/**
 * GET: テンプレートが0件の場合のみシードする。認証必須想定（呼び出し元でガード）。
 * Categories: business, resort, ryokan, airbnb, guide.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdminServerClient();
    const { count } = await supabase.from("templates").select("id", { count: "exact", head: true });
    if (count && count > 0) {
      return NextResponse.json({ seeded: false, message: "Already has templates" });
    }
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
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
