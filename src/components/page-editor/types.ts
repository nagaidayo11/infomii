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
  | "gallery";

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

export type PageBlock =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | IconBlock
  | DividerBlock
  | MapBlock
  | GalleryBlock;

/**
 * 左サイドバー — Notion風ブロックライブラリ（7種）
 * 日本語ラベルは現場スタッフ向けに統一
 */
export const BLOCK_LIBRARY_ITEMS: Array<{
  type: PageBlockType;
  label: string;
  description: string;
}> = [
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "image", label: "画像", description: "写真のURL" },
  { type: "button", label: "ボタン", description: "リンクボタン" },
  { type: "icon", label: "アイコン", description: "絵文字＋ラベル" },
  { type: "divider", label: "区切り線", description: "セクションの区切り" },
  { type: "map", label: "地図", description: "住所・地図エリア" },
  { type: "gallery", label: "ギャラリー", description: "複数画像を並べる" },
];

/** ドラッグオーバーレイ等で型→ラベル解決（ギャラリー含む） */
export const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  text: "テキスト",
  image: "画像",
  button: "ボタン",
  icon: "アイコン",
  divider: "区切り線",
  map: "地図",
  gallery: "ギャラリー",
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
    default:
      return { id, type: "text", content: "" };
  }
}
