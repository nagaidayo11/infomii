export const PHOTO_SPLIT_MAX_ITEMS = 8;

export type PhotoSplitMediaSize = "sm" | "md" | "lg";
export type PhotoSplitAlign = "left" | "center" | "right";
export type PhotoSplitVAlign = "start" | "center" | "end";
export type PhotoSplitMark = "none" | "bar" | "dots";

export type PhotoSplitItem = {
  image?: string;
  imageAlt?: string;
  title?: unknown;
  body?: unknown;
  reverse?: boolean;
  mediaSize?: PhotoSplitMediaSize;
  align?: PhotoSplitAlign;
  valign?: PhotoSplitVAlign;
  mark?: PhotoSplitMark;
};

export function isPhotoSplitMediaSize(value: unknown): value is PhotoSplitMediaSize {
  return value === "sm" || value === "md" || value === "lg";
}

export function isPhotoSplitAlign(value: unknown): value is PhotoSplitAlign {
  return value === "left" || value === "center" || value === "right";
}

export function isPhotoSplitVAlign(value: unknown): value is PhotoSplitVAlign {
  return value === "start" || value === "center" || value === "end";
}

export function isPhotoSplitMark(value: unknown): value is PhotoSplitMark {
  return value === "none" || value === "bar" || value === "dots";
}

export function createEmptyPhotoSplitItem(): PhotoSplitItem {
  return {
    image: "",
    imageAlt: "",
    title: "見出し",
    body: "説明文を入力",
    reverse: false,
    mediaSize: "md",
    align: "left",
    valign: "center",
    mark: "none",
  };
}

export function normalizePhotoSplitItems(raw: unknown): PhotoSplitItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, PHOTO_SPLIT_MAX_ITEMS).map((entry) => {
    const item = entry && typeof entry === "object" && !Array.isArray(entry)
      ? (entry as PhotoSplitItem)
      : {};
    return {
      image: typeof item.image === "string" ? item.image : "",
      imageAlt: typeof item.imageAlt === "string" ? item.imageAlt : "",
      title: item.title,
      body: item.body,
      reverse: item.reverse === true,
      mediaSize: isPhotoSplitMediaSize(item.mediaSize) ? item.mediaSize : "md",
      align: isPhotoSplitAlign(item.align) ? item.align : "left",
      valign: isPhotoSplitVAlign(item.valign) ? item.valign : "center",
      mark: isPhotoSplitMark(item.mark) ? item.mark : "none",
    };
  });
}

export function splitPhotoSplitBodyLines(body: string): string[] {
  if (!body) return [""];
  return body.split("\n");
}
