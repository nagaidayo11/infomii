/**
 * JSON-serializable block payloads (id optional when loading from JSON).
 * Example:
 *   { "type": "text", "content": "館内案内" }
 */

export type TextBlockData = {
  type: "text";
  content: string;
  id?: string;
};

export type ImageBlockData = {
  type: "image";
  src: string;
  alt?: string;
  id?: string;
};

export type ButtonBlockData = {
  type: "button";
  label: string;
  href?: string;
  id?: string;
};

export type IconBlockData = {
  type: "icon";
  icon: string;
  label?: string;
  id?: string;
};

export type DividerBlockData = {
  type: "divider";
  id?: string;
};

export type MapBlockData = {
  type: "map";
  embedUrl?: string;
  address?: string;
  id?: string;
};

/** Union of the six modular block types */
export type ModularBlockData =
  | TextBlockData
  | ImageBlockData
  | ButtonBlockData
  | IconBlockData
  | DividerBlockData
  | MapBlockData;

export function isTextBlock(b: ModularBlockData): b is TextBlockData {
  return b.type === "text";
}
export function isImageBlock(b: ModularBlockData): b is ImageBlockData {
  return b.type === "image";
}
export function isButtonBlock(b: ModularBlockData): b is ButtonBlockData {
  return b.type === "button";
}
export function isIconBlock(b: ModularBlockData): b is IconBlockData {
  return b.type === "icon";
}
export function isDividerBlock(b: ModularBlockData): b is DividerBlockData {
  return b.type === "divider";
}
export function isMapBlock(b: ModularBlockData): b is MapBlockData {
  return b.type === "map";
}
