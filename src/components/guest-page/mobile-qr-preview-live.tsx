"use client";

import { usePageEditorStore } from "@/components/page-editor/store";
import { MobileQrPreview } from "./mobile-qr-preview";

export type MobileQrPreviewLiveProps = {
  brandLabel?: string;
  className?: string;
  caption?: string;
};

/**
 * Same as MobileQrPreview but subscribes to the page editor store.
 * Preview updates in real time as blocks are edited/reordered.
 *
 * Use inside the editor shell only (requires Zustand provider context
 * is just the store module — no extra provider needed).
 */
export function MobileQrPreviewLive({
  brandLabel = "インフォミー",
  className = "",
  caption = "QRスキャン時のゲスト表示",
}: MobileQrPreviewLiveProps) {
  const blocks = usePageEditorStore((s) => s.blocks);

  return (
    <MobileQrPreview
      blocks={blocks}
      brandLabel={brandLabel}
      className={className}
      caption={caption}
    />
  );
}
