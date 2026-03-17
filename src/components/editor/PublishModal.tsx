"use client";

import { useState } from "react";
import { qrCodeImageUrl } from "@/lib/storage";

type PublishModalProps = {
  publicUrl: string;
  pageTitle: string;
  slug: string;
  onClose: () => void;
};

const QR_SIZE = 256;

export function PublishModal({ publicUrl, pageTitle, slug, onClose }: PublishModalProps) {
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
      a.download = `qr-${slug || "page"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="publish-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success header — the reward moment */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-emerald-50/80 to-white px-6 py-5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 id="publish-modal-title" className="text-xl font-semibold text-slate-900">
            公開しました
          </h2>
          <p className="mt-1 text-sm text-slate-500">{pageTitle}</p>
        </div>

        <div className="space-y-5 p-6">
          {/* QR as hero */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">QRコード</p>
            <div className="flex shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt=""
                width={QR_SIZE}
                height={QR_SIZE}
                className="h-44 w-44 object-contain sm:h-52 sm:w-52"
              />
            </div>
          </div>

          {/* Primary actions: Copy link + Download QR */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {copyUrlStatus === "ok" ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  コピーしました
                </>
              ) : copyUrlStatus === "fail" ? (
                "失敗"
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  リンクをコピー
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              QRをダウンロード
            </button>
          </div>

          {/* Public URL with one-click copy */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">公開URL</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
                aria-label="Public page URL"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50"
                title="Copy link"
                aria-label="Copy link"
              >
                {copyUrlStatus === "ok" ? (
                  <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyQrImage}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {copyImageStatus === "ok" ? "QR画像をコピーしました" : copyImageStatus === "fail" ? "コピーに失敗しました" : "QR画像をコピー"}
            </button>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl border border-slate-200 bg-slate-50/50 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            ページを開く
          </a>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
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
