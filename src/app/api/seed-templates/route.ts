import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

const SEED_TEMPLATE = {
  name: "チェックイン・館内案内",
  description: "チェックイン手順と館内のご案内用テンプレートです。WiFi・朝食・チェックアウトなどのカードを含みます。",
  preview_image: "",
  cards: [
    { type: "text", content: { content: "チェックイン・館内案内" }, order: 0 },
    { type: "wifi", content: { ssid: "", password: "", description: "" }, order: 1 },
    { type: "breakfast", content: { time: "7:00–9:30", location: "1F ダイニング", menu: "" }, order: 2 },
    { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" }, order: 3 },
  ],
};

/**
 * GET: テンプレートが0件の場合のみ1件シードする。認証必須想定（呼び出し元でガード）。
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdminServerClient();
    const { count } = await supabase.from("templates").select("id", { count: "exact", head: true });
    if (count && count > 0) {
      return NextResponse.json({ seeded: false, message: "Already has templates" });
    }
    const { error } = await supabase.from("templates").insert(SEED_TEMPLATE);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ seeded: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
