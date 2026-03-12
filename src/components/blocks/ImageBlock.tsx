import Image from "next/image";
import type { ImageBlockData } from "./types";

export type ImageBlockProps = {
  data: ImageBlockData;
  className?: string;
  /** When true, omit render if src is empty */
  hideWhenEmpty?: boolean;
};

/**
 * Renders image from JSON: { "type": "image", "src": "https://..." }
 */
export function ImageBlock({
  data,
  className = "",
  hideWhenEmpty = true,
}: ImageBlockProps) {
  const src = data.src?.trim() ?? "";
  if (!src && hideWhenEmpty) return null;

  if (!src) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 ${className}`.trim()}
        data-block-type="image"
      >
        画像URLなし
      </div>
    );
  }

  const unoptimized = src.startsWith("http");

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 ${className}`.trim()}
      data-block-type="image"
    >
      <Image
        src={src}
        alt={data.alt ?? ""}
        fill
        className="object-cover"
        unoptimized={unoptimized}
      />
    </div>
  );
}
