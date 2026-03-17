"use client";

import type { SaasBlock } from "../types";

export function SaasMapBlock({ block }: { block: SaasBlock }) {
  const address = (block.content.address as string) ?? "";
  const embedUrl = (block.content.embedUrl as string) ?? "";
  const buttonLabel = (block.content.buttonLabel as string) ?? "地図を開く";
  const style = block.style || {};
  const mapSrc =
    embedUrl ||
    (address
      ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : "");
  const openUrl =
    address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : embedUrl || "#";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-slate-200/80 bg-white"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[16px] bg-slate-100">
        {mapSrc ? (
          <iframe
            src={mapSrc}
            title="地図"
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500"
            style={{ margin: 8 }}
          >
            <span className="text-4xl">📍</span>
            <span className="text-sm font-medium">住所または埋め込みURLを追加</span>
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/90 px-6 py-4">
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-slate-800 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-700"
          style={{ boxShadow: "0 4px 14px rgba(15,23,42,0.2)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}
