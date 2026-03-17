"use client";

import type { SaasBlock } from "../types";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export function SaasVideoBlock({ block }: { block: SaasBlock }) {
  const url = (block.content.url as string) ?? (block.content.embedUrl as string) ?? "";
  const embedUrl = getEmbedUrl(url);
  const style = block.style || {};
  return (
    <div
      className="flex h-full w-full overflow-hidden rounded-lg bg-slate-900"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Video"
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
          Add YouTube or Vimeo URL
        </div>
      )}
    </div>
  );
}
