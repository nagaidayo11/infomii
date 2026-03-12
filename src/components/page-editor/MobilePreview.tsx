"use client";

import { MobileGuestFrame, GuestPageRenderer } from "@/components/guest-page";
import { usePageEditorStore } from "./store";

/**
 * Live guest preview: blocks from Zustand update in real time as you edit.
 */
export function MobilePreview() {
  const blocks = usePageEditorStore((s) => s.blocks);

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-ds-border bg-ds-bg">
      <div className="border-b border-ds-border px-4 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-slate-500">
          プレビュー
        </h2>
        <p className="mt-0.5 text-sm font-medium text-slate-800">
          QRスキャン時のゲスト表示
        </p>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-hidden p-4">
        <MobileGuestFrame>
          <GuestPageRenderer blocks={blocks} brandLabel="インフォミー" />
        </MobileGuestFrame>
      </div>
    </aside>
  );
}
