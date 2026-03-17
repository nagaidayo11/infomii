"use client";

import type { SaasBlock } from "../types";

export function SaasMapBlock({ block }: { block: SaasBlock }) {
  const address = (block.content.address as string) ?? "";
  const embedUrl = (block.content.embedUrl as string) ?? "";
  const style = block.style || {};
  const src = embedUrl || (address ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : "");
  return (
    <div
      className="flex h-full w-full overflow-hidden rounded-lg bg-slate-100"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
    >
      {src ? (
        <iframe
          src={src}
          title="Map"
          className="h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-sm text-slate-500">
          <span>📍</span>
          <span>住所または埋め込みURLを追加</span>
        </div>
      )}
    </div>
  );
}
