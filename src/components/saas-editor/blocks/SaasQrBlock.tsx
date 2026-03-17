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
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-white p-2"
      style={{
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-xs text-slate-500">
          <span className="text-2xl">▣</span>
          <span>URLを入力してQRを表示</span>
        </div>
      )}
    </div>
  );
}
