/**
 * Page builder block model — serializes to JSON for persistence.
 * Example:
 * [
 *   { "id": "1", "type": "text", "content": "館内案内" },
 *   { "id": "2", "type": "image", "src": "/hotel.jpg" },
 *   { "id": "3", "type": "button", "label": "WiFiを見る" }
 * ]
 */

export type PageBlockType =
  | "text"
  | "image"
  | "button"
  | "icon"
  | "divider"
  | "map"
  | "gallery"
  | "wifi"
  | "schedule"
  | "menu"
  | "breakfast"
  | "checkout"
  | "notice";

export type TextBlock = {
  id: string;
  type: "text";
  content: string;
};

export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt?: string;
};

export type ButtonBlock = {
  id: string;
  type: "button";
  label: string;
  href?: string;
};

export type IconBlock = {
  id: string;
  type: "icon";
  /** LineIcon トークン（`normalizeIconToken` と同一セット） */
  icon: string;
  label?: string;
  /** 施設カードの「アイコン」ブロックと同様の補足文 */
  description?: string;
};

export type DividerBlock = {
  id: string;
  type: "divider";
};

export type MapBlock = {
  id: string;
  type: "map";
  embedUrl?: string;
  address?: string;
};

export type GalleryBlock = {
  id: string;
  type: "gallery";
  items: Array<{ id: string; src: string; caption?: string }>;
};

export type WifiBlock = {
  id: string;
  type: "wifi";
  ssid?: string;
  password?: string;
  label?: string;
};

export type ScheduleItem = { id?: string; day?: string; time?: string; label?: string };
export type ScheduleBlock = {
  id: string;
  type: "schedule";
  title?: string;
  items: ScheduleItem[];
};

export type MenuItem = { id?: string; name?: string; price?: string; description?: string };
export type MenuBlock = {
  id: string;
  type: "menu";
  title?: string;
  items: MenuItem[];
};

export type BreakfastBlock = {
  id: string;
  type: "breakfast";
  title?: string;
  time?: string;
  place?: string;
  note?: string;
};

export type CheckoutBlock = {
  id: string;
  type: "checkout";
  title?: string;
  time?: string;
  note?: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type NoticeBlock = {
  id: string;
  type: "notice";
  title?: string;
  body?: string;
  variant?: "info" | "warning";
};

export type PageBlock =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | IconBlock
  | DividerBlock
  | MapBlock
  | GalleryBlock
  | WifiBlock
  | ScheduleBlock
  | MenuBlock
  | BreakfastBlock
  | CheckoutBlock
  | NoticeBlock;

/**
 * 左サイドバー — カードタイプ（ホテル向け）
 * WiFi, Breakfast, Checkout, Map, Text, Image, Button, Schedule, Notice
 */
export const BLOCK_LIBRARY_ITEMS: Array<{
  type: PageBlockType;
  label: string;
  description: string;
}> = [
  { type: "wifi", label: "WiFi", description: "SSID・パスワード" },
  { type: "breakfast", label: "朝食", description: "朝食時間・会場" },
  { type: "checkout", label: "チェックアウト", description: "チェックアウト案内" },
  { type: "map", label: "地図", description: "住所・地図" },
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "image", label: "画像", description: "写真" },
  { type: "button", label: "ボタン", description: "リンクボタン" },
  { type: "schedule", label: "スケジュール", description: "営業時間" },
  { type: "notice", label: "お知らせ", description: "告知・注意事項" },
  { type: "menu", label: "メニュー", description: "メニュー・価格" },
  { type: "icon", label: "アイコン", description: "SVGアイコン・ラベル・補足" },
  { type: "divider", label: "区切り線", description: "セクションの区切り" },
  { type: "gallery", label: "ギャラリー", description: "複数画像" },
];

/** 型→ラベル（ドラッグオーバーレイ・設定パネル用） */
export const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  text: "テキスト",
  image: "画像",
  button: "ボタン",
  icon: "アイコン",
  divider: "区切り線",
  map: "地図",
  gallery: "ギャラリー",
  wifi: "WiFi",
  schedule: "スケジュール",
  menu: "メニュー",
  breakfast: "朝食",
  checkout: "チェックアウト",
  notice: "お知らせ",
};

export function createEmptyBlock(type: PageBlockType, id: string): PageBlock {
  switch (type) {
    case "text":
      return { id, type: "text", content: "テキストを入力" };
    case "image":
      return { id, type: "image", src: "", alt: "" };
    case "button":
      return { id, type: "button", label: "ボタン", href: "#" };
    case "icon":
      return { id, type: "icon", icon: "info", label: "ラベル", description: "" };
    case "divider":
      return { id, type: "divider" };
    case "map":
      return { id, type: "map", address: "ホテル住所" };
    case "gallery":
      return {
        id,
        type: "gallery",
        items: [{ id: `${id}-g0`, src: "", caption: "" }],
      };
    case "wifi":
      return { id, type: "wifi", ssid: "", password: "", label: "WiFi" };
    case "schedule":
      return {
        id,
        type: "schedule",
        title: "営業時間",
        items: [{ id: `${id}-s0`, day: "月〜日", time: "7:00–22:00", label: "" }],
      };
    case "menu":
      return {
        id,
        type: "menu",
        title: "メニュー",
        items: [{ id: `${id}-m0`, name: "", price: "", description: "" }],
      };
    case "breakfast":
      return { id, type: "breakfast", title: "朝食", time: "7:00–9:30", place: "1F ダイニング", note: "" };
    case "checkout":
      return { id, type: "checkout", title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" };
    case "notice":
      return { id, type: "notice", title: "お知らせ", body: "", variant: "info" };
    default:
      return { id, type: "text", content: "" };
  }
}
