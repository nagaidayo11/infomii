"use client";

import { useState } from "react";
import { qrCodeImageUrl } from "@/lib/storage";

type PublishModalProps = {
  publicUrl: string;
  pageTitle: string;
  onClose: () => void;
};

const QR_SIZE = 256;

export function PublishModal({ publicUrl, pageTitle, onClose }: PublishModalProps) {
  const [copyUrlStatus, setCopyUrlStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [copyImageStatus, setCopyImageStatus] = useState<"idle" | "ok" | "fail">("idle");

  const qrImageUrl = qrCodeImageUrl(publicUrl, QR_SIZE);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyUrlStatus("ok");
      setTimeout(() => setCopyUrlStatus("idle"), 2000);
    } catch {
      setCopyUrlStatus("fail");
      setTimeout(() => setCopyUrlStatus("idle"), 2000);
    }
  };

  const handleCopyQrImage = async () => {
    setCopyImageStatus("idle");
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopyImageStatus("ok");
      setTimeout(() => setCopyImageStatus("idle"), 2000);
    } catch {
      setCopyImageStatus("fail");
      setTimeout(() => setCopyImageStatus("idle"), 2000);
    }
  };

  const handleDownloadQr = async () => {
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="publish-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id="publish-modal-title" className="text-lg font-semibold text-slate-900">
            公開URL・QRコード
          </h2>
          <p className="mt-1 text-sm text-slate-500">{pageTitle}</p>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">公開ページURL</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {copyUrlStatus === "ok" ? "コピーしました" : copyUrlStatus === "fail" ? "失敗" : "URLをコピー"}
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">QRコード</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt=""
                  width={QR_SIZE}
                  height={QR_SIZE}
                  className="h-40 w-40 object-contain sm:h-48 sm:w-48"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyQrImage}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copyImageStatus === "ok"
                    ? "コピーしました"
                    : copyImageStatus === "fail"
                      ? "コピーに失敗しました"
                      : "QR画像をコピー"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  QRをダウンロード
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  ページを開く
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
