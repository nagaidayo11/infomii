/**
 * SaaS Editor — Notion + Canva style.
 * Block schema: id, type, content, style, position { x, y }, optional size.
 */

export type SaasBlockType = "text" | "image" | "button" | "video" | "map" | "menu";

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
  /** Display order in sidebar / z-index hint */
  order: number;
};

export const BLOCK_TYPE_LABELS: Record<SaasBlockType, string> = {
  text: "Text",
  image: "Image",
  button: "Button",
  video: "Video",
  map: "Map",
  menu: "Menu",
};

export const BLOCK_LIBRARY: Array<{ type: SaasBlockType; label: string; icon: string }> = [
  { type: "text", label: "Text", icon: "T" },
  { type: "image", label: "Image", icon: "🖼" },
  { type: "button", label: "Button", icon: "▢" },
  { type: "video", label: "Video", icon: "▶" },
  { type: "map", label: "Map", icon: "📍" },
  { type: "menu", label: "Menu", icon: "☰" },
];

const defaultContent: Record<SaasBlockType, Record<string, unknown>> = {
  text: { content: "Type here..." },
  image: { src: "", alt: "" },
  button: { label: "Button", href: "#" },
  video: { url: "", embedUrl: "" },
  map: { address: "", embedUrl: "" },
  menu: {
    title: "Menu",
    items: [{ id: "1", name: "Item", price: "", description: "" }],
  },
};

export function createEmptyBlock(
  type: SaasBlockType,
  id: string,
  position: BlockPosition,
  order: number
): SaasBlock {
  const size = type === "text" ? { width: 280, height: 80 } : { width: 320, height: 180 };
  return {
    id,
    type,
    content: { ...defaultContent[type] },
    style: {},
    position,
    size,
    order,
  };
}
