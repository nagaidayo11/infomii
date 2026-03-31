/**
 * Visual SaaS Editor — Canva-style blocks with distinct visuals.
 * Block schema: id, type, content, style, position { x, y }. Size from react-rnd for resize.
 */

export type SaasBlockType =
  | "hero"
  | "highlight"
  | "info"
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
  hero: "ヒーロー",
  highlight: "ハイライト",
  info: "情報",
  text: "テキスト",
  image: "画像",
  button: "ボタン",
  map: "地図",
  gallery: "ギャラリー",
  notice: "お知らせ",
  coupon: "クーポン",
  qr: "QRコード",
};

export const BLOCK_LIBRARY: Array<{ type: SaasBlockType; label: string }> = [
  { type: "hero", label: "ヒーロー" },
  { type: "highlight", label: "ハイライト" },
  { type: "info", label: "情報" },
  { type: "text", label: "テキスト" },
  { type: "image", label: "画像" },
  { type: "button", label: "ボタン" },
  { type: "map", label: "地図" },
  { type: "gallery", label: "ギャラリー" },
  { type: "notice", label: "お知らせ" },
  { type: "coupon", label: "クーポン" },
  { type: "qr", label: "QRコード" },
];

const defaultContent: Record<SaasBlockType, Record<string, unknown>> = {
  hero: {
    imageSrc: "/preset-hero-sample.png",
    title: "タイトル",
    subtitle: "",
    overlay: true,
  },
  highlight: {
    icon: "info",
    title: "重要なお知らせ",
    body: "ここに強調したい内容を入力します。",
    accent: "amber",
  },
  info: {
    icon: "wifi",
    title: "Wi-Fi",
    rows: [
      { label: "ネットワーク名", value: "Hotel_Guest" },
      { label: "パスワード", value: "guest1234" },
    ],
  },
  text: { content: "ここに入力...", variant: "body" },
  image: { src: "", alt: "", caption: "" },
  button: { label: "ボタン", href: "#" },
  map: { address: "", embedUrl: "", buttonLabel: "地図を開く" },
  gallery: {
    title: "",
    items: [{ id: "1", src: "", alt: "", caption: "" }],
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
    case "hero":
      return { width: 520, height: 280 };
    case "highlight":
      return { width: 320, height: 140 };
    case "info":
      return { width: 300, height: 160 };
    case "text":
      return { width: 280, height: 80 };
    case "button":
      return { width: 280, height: 56 };
    case "coupon":
    case "notice":
      return { width: 280, height: 140 };
    case "qr":
      return { width: 160, height: 160 };
    case "map":
      return { width: 340, height: 220 };
    case "gallery":
      return { width: 380, height: 260 };
    case "image":
      return { width: 320, height: 200 };
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
