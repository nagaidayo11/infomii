"use client";

import Image from "next/image";
import {
  buildPublicUrl,
  buildPublicQrUrl,
  qrCodeImageUrl,
} from "@/lib/storage";

type QrPageRowProps = {
  title: string;
  slug: string;
  qrScans7d: number;
};

export function QrPageRow({ title, slug, qrScans7d }: QrPageRowProps) {
  const publicUrl = buildPublicUrl(slug);
  const qrUrl = buildPublicQrUrl(slug);
  const qrImageSrc = qrCodeImageUrl(qrUrl, 160);
  const printHref = `/print/a4-qr?title=${encodeURIComponent(title)}&url=${encodeURIComponent(publicUrl)}&qr=${encodeURIComponent(qrUrl)}`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrImageSrc;
    a.download = `infomii-qr-${slug}.png`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={qrImageSrc}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            QRコード生成
          </a>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            ダウンロード
          </button>
          <a
            href={printHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            印刷用A4
          </a>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(qrUrl)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            URLをコピー
          </button>
        </div>
      </div>
    </div>
  );
}
