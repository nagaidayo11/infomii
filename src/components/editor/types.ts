/**
 * Infomii Editor 2.0 — Supabase-aligned types.
 * Table: pages (id, title, slug, user_id, created_at)
 * Table: cards (id, page_id, type, content, order, created_at)
 *
 * Card content fields may be LocalizedString (string or { ja?, en?, zh?, ko? })
 * for multilingual support. Visitor locale is detected automatically; fallback is English.
 */

export type CardType =
  | "welcome"
  | "wifi"
  | "breakfast"
  | "checkout"
  | "nearby"
  | "notice"
  | "map"
  | "restaurant"
  | "taxi"
  | "emergency"
  | "laundry"
  | "spa"
  | "text"
  | "image"
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
  welcome: "ウェルカム",
  wifi: "WiFi",
  breakfast: "朝食",
  checkout: "チェックアウト",
  nearby: "周辺案内",
  notice: "お知らせ",
  map: "地図",
  restaurant: "レストラン",
  taxi: "タクシー",
  emergency: "緊急連絡先",
  laundry: "ランドリー",
  spa: "スパ・温泉",
  text: "テキスト",
  image: "画像",
  button: "ボタン",
  schedule: "スケジュール",
  menu: "メニュー",
};

/** Hospitality-focused card library (display order). */
export const CARD_LIBRARY_ITEMS: Array<{ type: CardType; label: string; description: string }> = [
  { type: "welcome", label: "ウェルカム", description: "おもてなしメッセージ" },
  { type: "wifi", label: "WiFi", description: "SSID・パスワード・説明" },
  { type: "breakfast", label: "朝食", description: "時間・会場・メニュー" },
  { type: "checkout", label: "チェックアウト", description: "時刻・補足・リンク" },
  { type: "nearby", label: "周辺案内", description: "近隣スポット・アクセス" },
  { type: "notice", label: "お知らせ", description: "告知・注意事項" },
  { type: "map", label: "地図", description: "住所・地図" },
  { type: "restaurant", label: "レストラン", description: "営業時間・場所・メニュー" },
  { type: "taxi", label: "タクシー", description: "電話番号・会社名・備考" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院" },
  { type: "laundry", label: "ランドリー", description: "営業時間・料金・連絡先" },
  { type: "spa", label: "スパ・温泉", description: "時間・場所・説明" },
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "image", label: "画像", description: "写真" },
  { type: "button", label: "ボタン", description: "リンクボタン" },
  { type: "schedule", label: "スケジュール", description: "営業時間" },
  { type: "menu", label: "メニュー", description: "メニュー・価格" },
];

function defaultContent(type: CardType): Record<string, unknown> {
  switch (type) {
    case "welcome":
      return { title: "ようこそ", message: "ご宿泊ありがとうございます。ごゆっくりお過ごしください。" };
    case "wifi":
      return { ssid: "", password: "", description: "" };
    case "breakfast":
      return { time: "7:00–9:30", location: "1F ダイニング", menu: "" };
    case "checkout":
      return { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" };
    case "nearby":
      return { title: "周辺案内", items: [{ name: "", description: "", link: "" }] };
    case "notice":
      return { title: "お知らせ", body: "", variant: "info" };
    case "map":
      return { address: "ホテル住所" };
    case "restaurant":
      return { title: "レストラン", time: "", location: "", menu: "" };
    case "taxi":
      return { title: "タクシー", phone: "", companyName: "", note: "" };
    case "emergency":
      return { title: "緊急連絡先", fire: "119", police: "110", hospital: "", note: "" };
    case "laundry":
      return { title: "ランドリー", hours: "", priceNote: "", contact: "" };
    case "spa":
      return { title: "スパ・温泉", hours: "", location: "", description: "", note: "" };
    case "text":
      return { content: "テキストを入力" };
    case "image":
      return { src: "", alt: "" };
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
