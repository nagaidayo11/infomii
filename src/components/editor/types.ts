/**
 * Infomii Editor 2.0 — Supabase-aligned types.
 * Table: pages (id, title, slug, user_id, created_at)
 * Table: cards (id, page_id, type, content, order, created_at)
 */

export type CardType =
  | "text"
  | "image"
  | "wifi"
  | "breakfast"
  | "checkout"
  | "map"
  | "notice"
  | "button"
  | "schedule"
  | "menu";

export type EditorCard = {
  id: string;
  page_id?: string;
  type: CardType;
  /** Card-type-specific fields (shape depends on type). Stored as JSON in Supabase. */
  content: Record<string, unknown>;
  order: number;
  created_at?: string;
};

export type EditorPage = {
  id: string;
  title: string;
  slug: string;
  user_id: string;
  created_at: string;
};

/** カードタイプのラベル（日本語・変更しない） */
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  text: "テキスト",
  image: "画像",
  wifi: "WiFi",
  breakfast: "朝食",
  checkout: "チェックアウト",
  map: "地図",
  notice: "お知らせ",
  button: "ボタン",
  schedule: "スケジュール",
  menu: "メニュー",
};

export const CARD_LIBRARY_ITEMS: Array<{ type: CardType; label: string; description: string }> = [
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "image", label: "画像", description: "写真" },
  { type: "wifi", label: "WiFi", description: "SSID・パスワード" },
  { type: "breakfast", label: "朝食", description: "朝食時間・会場" },
  { type: "checkout", label: "チェックアウト", description: "チェックアウト案内" },
  { type: "map", label: "地図", description: "住所・地図" },
  { type: "notice", label: "お知らせ", description: "告知・注意事項" },
  { type: "button", label: "ボタン", description: "リンクボタン" },
  { type: "schedule", label: "スケジュール", description: "営業時間" },
  { type: "menu", label: "メニュー", description: "メニュー・価格" },
];

function defaultContent(type: CardType): Record<string, unknown> {
  switch (type) {
    case "text":
      return { content: "テキストを入力" };
    case "image":
      return { src: "", alt: "" };
    case "wifi":
      return { title: "WiFi", ssid: "", password: "", description: "" };
    case "breakfast":
      return { title: "朝食", time: "7:00–9:30", location: "1F ダイニング", description: "" };
    case "checkout":
      return { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" };
    case "map":
      return { address: "ホテル住所" };
    case "notice":
      return { title: "お知らせ", body: "", variant: "info" };
    case "button":
      return { label: "ボタン", href: "#" };
    case "schedule":
      return { title: "営業時間", items: [{ day: "月〜日", time: "7:00–22:00", label: "" }] };
    case "menu":
      return { title: "メニュー", items: [{ name: "", price: "", description: "" }] };
    default:
      return { content: "" };
  }
}

export function createEmptyCard(type: CardType, id: string, order: number): EditorCard {
  return {
    id,
    type,
    content: defaultContent(type),
    order,
  };
}
