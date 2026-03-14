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
  | "menu";

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
  icon: string; // emoji or short name e.g. "wifi"
  label?: string;
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
  | MenuBlock;

/**
 * 左サイドバー — カードタイプ（ホテル向け）
 * 要件: Text, Image, Map, Button, WiFi info, Schedule, Menu
 */
export const BLOCK_LIBRARY_ITEMS: Array<{
  type: PageBlockType;
  label: string;
  description: string;
}> = [
  { type: "text", label: "Text", description: "見出し・本文" },
  { type: "image", label: "Image", description: "写真" },
  { type: "map", label: "Map", description: "住所・地図" },
  { type: "button", label: "Button", description: "リンクボタン" },
  { type: "wifi", label: "WiFi info", description: "SSID・パスワード" },
  { type: "schedule", label: "Schedule", description: "営業時間・スケジュール" },
  { type: "menu", label: "Menu", description: "メニュー・価格" },
  { type: "icon", label: "アイコン", description: "絵文字＋ラベル" },
  { type: "divider", label: "区切り線", description: "セクションの区切り" },
  { type: "gallery", label: "ギャラリー", description: "複数画像" },
];

/** 型→ラベル（ドラッグオーバーレイ・設定パネル用） */
export const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  text: "Text",
  image: "Image",
  button: "Button",
  icon: "アイコン",
  divider: "区切り線",
  map: "Map",
  gallery: "ギャラリー",
  wifi: "WiFi info",
  schedule: "Schedule",
  menu: "Menu",
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
      return { id, type: "icon", icon: "📍", label: "ラベル" };
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
    default:
      return { id, type: "text", content: "" };
  }
}
