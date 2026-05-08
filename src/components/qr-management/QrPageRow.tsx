"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  buildPublicUrl,
  buildPublicQrUrl,
  qrCodeImageUrl,
} from "@/lib/storage";
import {
  canUseAdvancedPrintTemplate,
} from "@/lib/qr-print-options";

type QrPageRowProps = {
  title: string;
  slug: string;
  qrScans7d: number;
  plan: "free" | "pro" | "business" | null;
};

export function QrPageRow({ title, slug, qrScans7d, plan }: QrPageRowProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = buildPublicUrl(slug);
  const qrUrl = buildPublicQrUrl(slug);
  const qrImageSrc = qrCodeImageUrl(qrUrl, 160);
  const canUseTemplate = canUseAdvancedPrintTemplate(plan);
  const printHref = `/print/a4-qr?title=${encodeURIComponent(title)}&url=${encodeURIComponent(publicUrl)}&qr=${encodeURIComponent(qrUrl)}&pro=${canUseTemplate ? "1" : "0"}`;

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageSrc, { cache: "no-store" });
      if (!response.ok) throw new Error(`QR download failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `infomii-qr-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: still attempt browser-level download behavior.
      const a = document.createElement("a");
      a.href = qrImageSrc;
      a.download = `infomii-qr-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-4">
        <div className="overflow-hidden rounded-lg border border-slate-100 bg-white p-1">
          <Image
            src={qrImageSrc}
            alt=""
            width={160}
            height={160}
            className="h-28 w-28 object-contain sm:h-36 sm:w-36"
            unoptimized
          />
        </div>
        <div className="min-w-0 sm:hidden">
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">QR 7日: {qrScans7d}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="hidden font-semibold text-slate-900 sm:block">{title}</p>
        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
          QRスキャン（7日）: <span className="font-medium">{qrScans7d}</span>
        </p>
        <p className="mt-2 truncate text-xs text-slate-400" title={qrUrl}>
          {qrUrl}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleDownload()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            ダウンロード
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => void handleCopyUrl()}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              URLをコピー
            </button>
            {copied && (
              <div className="ui-pop-in pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-md">
                URLをコピーしました
              </div>
            )}
          </div>
          <a
            href={printHref}
            target="_blank"
            rel="noreferrer"
            className="app-button-native inline-flex min-h-[36px] items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold !text-white shadow-sm transition hover:bg-slate-800 sm:ml-auto"
          >
            印刷設定
          </a>
        </div>
        {!canUseTemplate ? (
          <p className="mt-2 text-[11px] text-slate-500">
            印刷テンプレートはProプラン以上で利用できます（印刷設定画面で選択）。
          </p>
        ) : null}
      </div>
    </div>
  );
}
