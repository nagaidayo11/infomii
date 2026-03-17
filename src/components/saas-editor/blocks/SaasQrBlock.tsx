"use client";

import Image from "next/image";
import type { SaasBlock } from "../types";

export function SaasQrBlock({ block }: { block: SaasBlock }) {
  const url = (block.content.url as string) ?? "";
  const alt = (block.content.alt as string) ?? "QRコード";
  const style = block.style || {};

  const qrImageUrl = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    : "";

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[16px] border border-slate-200/80 bg-white p-5"
      style={{
        backgroundColor: style.backgroundColor ?? undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {qrImageUrl ? (
        <div className="relative h-full w-full min-h-0">
          <Image
            src={qrImageUrl}
            alt={alt}
            fill
            className="object-contain"
            unoptimized
            sizes="160px"
          />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500" style={{ margin: 8 }}>
          <span className="text-3xl">▣</span>
          <span>URLを入力してQRを表示</span>
        </div>
      )}
    </div>
  );
}
