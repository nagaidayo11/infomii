"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { shouldUseUnoptimizedImage } from "@/lib/static-image";

type EditorCoverImageProps = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
};

/**
 * Cover image for editor cards. Local / public assets use native `<img>` so
 * library previews and Expo WebView (LAN dev) render reliably.
 */
export function EditorCoverImage({
  src,
  alt = "",
  className = "object-cover object-center",
  sizes = "(max-width: 480px) 100vw, 420px",
  priority = false,
  style,
}: EditorCoverImageProps) {
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (shouldUseUnoptimizedImage(trimmed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- WebView + preview layout
      <img
        src={trimmed}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
        style={style}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <Image
      src={trimmed}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      style={style}
    />
  );
}
