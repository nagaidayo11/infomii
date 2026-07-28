"use client";

import type { ReactNode } from "react";
import { StampCardFace, type StampRewardCopy } from "@/components/stamp/StampCardFace";
import { StampEarnPop } from "@/components/stamp/StampEarnPop";
import { StampUseConfirmPop } from "@/components/stamp/StampUseConfirmPop";
import { type StampRewardTier, type StampStyleId } from "@/lib/stamp/styles";
import "@/styles/stamp.css";

export type StampGuestScreenProps = {
  title: string;
  description: string;
  reward5: StampRewardCopy;
  reward10: StampRewardCopy;
  accent: string;
  styleId: StampStyleId;
  stampCount: number;
  statusLabel?: string;
  cooldownLabel?: string | null;
  animateLatest?: boolean;
  earnPopOpen?: boolean;
  onEarnPopClose?: () => void;
  useConfirmTier?: StampRewardTier | null;
  useConfirmBusy?: boolean;
  onUseReward?: (tier: StampRewardTier) => void;
  onCancelUse?: () => void;
  onConfirmUse?: () => void;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  footerNote?: string;
  compact?: boolean;
};

/** Shared guest layout used by real card page and Live preview. */
export function StampGuestScreen({
  title,
  description,
  reward5,
  reward10,
  accent,
  styleId,
  stampCount,
  statusLabel,
  cooldownLabel = null,
  animateLatest = false,
  earnPopOpen = false,
  onEarnPopClose,
  useConfirmTier = null,
  useConfirmBusy = false,
  onUseReward,
  onCancelUse,
  onConfirmUse,
  primaryAction,
  secondaryActions,
  footerNote,
  compact = false,
}: StampGuestScreenProps) {
  const confirmTitle =
    useConfirmTier === 5
      ? reward5.title || "5個特典"
      : useConfirmTier === 10
        ? reward10.title || "10個特典"
        : "";

  return (
    <div
      className={`stamp-surface relative bg-[#f6f8fa] ${compact ? "px-3 pb-6 pt-3" : "px-4 pb-8 pt-5"}`}
      style={{ ["--stamp-accent" as string]: accent }}
    >
      <StampEarnPop
        open={earnPopOpen}
        accent={accent}
        styleId={styleId}
        stampCount={stampCount}
        onClose={() => onEarnPopClose?.()}
      />
      <StampUseConfirmPop
        open={useConfirmTier !== null}
        tier={useConfirmTier}
        rewardTitle={confirmTitle}
        accent={accent}
        busy={useConfirmBusy}
        onCancel={() => onCancelUse?.()}
        onConfirm={() => onConfirmUse?.()}
      />

      <StampCardFace
        title={title}
        description={description}
        reward5={reward5}
        reward10={reward10}
        accent={accent}
        styleId={styleId}
        stampCount={stampCount}
        statusLabel={statusLabel}
        cooldownLabel={cooldownLabel}
        animateLatest={animateLatest}
        onUseReward={onUseReward}
        useBusy={useConfirmBusy}
      />

      {(primaryAction || secondaryActions) && (
        <div className="mt-4 space-y-2.5">
          {primaryAction ? <div className="stamp-actions-panel">{primaryAction}</div> : null}
          {secondaryActions}
        </div>
      )}

      {footerNote ? (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">{footerNote}</p>
      ) : null}
    </div>
  );
}
