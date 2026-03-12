"use client";

import type { PageBlock } from "@/components/page-editor/types";
import { MobileGuestFrame } from "./mobile-guest-frame";
import { GuestPageRenderer } from "./guest-page-renderer";
import { normalizeBlocksForPreview } from "./normalize-blocks";

export type MobileQrPreviewProps = {
  /**
   * Block list from JSON (same shape as persisted page).
   * May omit `id` — ids are filled for stable keys.
   */
  blocks: PageBlock[] | unknown;
  /** Shown in sticky header — e.g. hotel name or 「インフォミー」 */
  brandLabel?: string;
  className?: string;
  /** Optional caption above frame (editor chrome) */
  caption?: string;
};

/**
 * Mobile preview simulating what guests see after scanning a QR code.
 *
 * - iPhone-style frame (MobileGuestFrame)
 * - Mobile-first layout + large readable type (GuestPageRenderer)
 * - Hotel-style UI: warm neutrals, clear hierarchy, primary CTA
 *
 * **Real time:** pass `blocks` from Zustand (or any state) — when the
 * array reference updates, this component re-renders immediately.
 *
 * @example
 * const blocks = usePageEditorStore(s => s.blocks);
 * <MobileQrPreview blocks={blocks} brandLabel="○○ホテル" />
 */
export function MobileQrPreview({
  blocks,
  brandLabel = "案内",
  className = "",
  caption,
}: MobileQrPreviewProps) {
  const normalized = normalizeBlocksForPreview(blocks);

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      {caption != null && caption !== "" && (
        <p className="mb-3 text-center text-xs font-medium text-slate-500">
          {caption}
        </p>
      )}
      <div className="flex justify-center">
        <MobileGuestFrame>
          <GuestPageRenderer blocks={normalized} brandLabel={brandLabel} />
        </MobileGuestFrame>
      </div>
    </div>
  );
}
