/**
 * Visual SaaS Editor — Notion + Canva style.
 * Block schema: id, type, content, style, position { x, y }. Size from react-rnd for resize.
 */

export type SaasBlockType =
  | "text"
  | "image"
  | "button"
  | "map"
  | "gallery"
  | "notice"
  | "coupon"
  | "qr";

export type BlockPosition = { x: number; y: number };
export type BlockSize = { width: number; height: number };
export type BlockStyle = {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  borderRadius?: number;
  padding?: number;
  [key: string]: unknown;
};

export type SaasBlock = {
  id: string;
  type: SaasBlockType;
  content: Record<string, unknown>;
  style: BlockStyle;
  position: BlockPosition;
  size?: BlockSize;
  order: number;
};

export const BLOCK_TYPE_LABELS: Record<SaasBlockType, string> = {
  text: "テキスト",
  image: "画像",
  button: "ボタン",
  map: "地図",
  gallery: "ギャラリー",
  notice: "お知らせ",
  coupon: "クーポン",
  qr: "QRコード",
};

export const BLOCK_LIBRARY: Array<{ type: SaasBlockType; label: string; icon: string }> = [
  { type: "text", label: "テキスト", icon: "T" },
  { type: "image", label: "画像", icon: "🖼" },
  { type: "button", label: "ボタン", icon: "▢" },
  { type: "map", label: "地図", icon: "📍" },
  { type: "gallery", label: "ギャラリー", icon: "🖼️" },
  { type: "notice", label: "お知らせ", icon: "📢" },
  { type: "coupon", label: "クーポン", icon: "🎫" },
  { type: "qr", label: "QRコード", icon: "▣" },
];

const defaultContent: Record<SaasBlockType, Record<string, unknown>> = {
  text: { content: "ここに入力..." },
  image: { src: "", alt: "" },
  button: { label: "ボタン", href: "#" },
  map: { address: "", embedUrl: "" },
  gallery: {
    title: "",
    items: [{ id: "1", src: "", alt: "" }],
  },
  notice: {
    title: "お知らせ",
    body: "",
    variant: "info",
  },
  coupon: {
    title: "クーポン",
    code: "COUPON-123",
    description: "",
    validUntil: "",
  },
  qr: {
    url: "",
    alt: "QRコード",
  },
};

function getDefaultSize(type: SaasBlockType): BlockSize {
  switch (type) {
    case "text":
      return { width: 280, height: 80 };
    case "button":
    case "coupon":
    case "notice":
      return { width: 280, height: 120 };
    case "qr":
      return { width: 160, height: 160 };
    default:
      return { width: 320, height: 180 };
  }
}

export function createEmptyBlock(
  type: SaasBlockType,
  id: string,
  position: BlockPosition,
  order: number
): SaasBlock {
  return {
    id,
    type,
    content: { ...defaultContent[type] },
    style: {},
    position,
    size: getDefaultSize(type),
    order,
  };
}
