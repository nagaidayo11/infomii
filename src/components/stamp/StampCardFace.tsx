"use client";

import { StampSlotGrid } from "@/components/stamp/StampSlotGrid";
import { STAMP_CAPACITY, type StampRewardTier, type StampStyleId } from "@/lib/stamp/styles";
import "@/styles/stamp.css";

export type StampRewardCopy = {
  title: string;
  description: string;
};

export type StampCardFaceProps = {
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
  onUseReward?: (tier: StampRewardTier) => void;
  useBusy?: boolean;
};

export function StampCardFace({
  title,
  description,
  reward5,
  reward10,
  accent,
  styleId,
  stampCount,
  statusLabel,
  cooldownLabel,
  animateLatest = false,
  onUseReward,
  useBusy = false,
}: StampCardFaceProps) {
  const progress = Math.min(1, stampCount / STAMP_CAPACITY);
  const shortDescription =
    description.length > 72 ? `${description.slice(0, 70).trimEnd()}…` : description;

  return (
    <div
      className="stamp-surface stamp-card-shell"
      style={{ ["--stamp-accent" as string]: accent }}
    >
      <header
        className="stamp-card-header"
        style={{ backgroundColor: accent }}
      >
        <div className="relative z-[1] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="relative z-[1] text-[1.35rem] font-bold leading-snug tracking-tight text-white">
              {title || "スタンプカード"}
            </h2>
            {shortDescription ? (
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/75">{shortDescription}</p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white ring-1 ring-white/25 backdrop-blur-sm">
            {stampCount}
            <span className="text-white/55">/{STAMP_CAPACITY}</span>
          </div>
        </div>
        <div className="stamp-progress-rail relative z-[1] mt-3.5 bg-white/20">
          <div
            className="stamp-progress-fill bg-white"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {cooldownLabel ? (
          <p className="relative z-[1] mt-2.5 text-[11px] font-medium text-white/80">
            {cooldownLabel}
          </p>
        ) : null}
      </header>

      <div className="relative px-4 pb-4 pt-3.5">
        <div className="rounded-[1.2rem] bg-white/55 px-3 py-3.5 ring-1 ring-black/[0.04]">
          <StampSlotGrid
            filled={stampCount}
            accent={accent}
            styleId={styleId}
            animateLatest={animateLatest}
            size="sm"
          />
        </div>

        <div className="mt-3 grid gap-2">
          <RewardRow
            tier={5}
            copy={reward5}
            accent={accent}
            stampCount={stampCount}
            onUse={onUseReward ? () => onUseReward(5) : undefined}
            useBusy={useBusy}
          />
          <RewardRow
            tier={10}
            copy={reward10}
            accent={accent}
            stampCount={stampCount}
            onUse={onUseReward ? () => onUseReward(10) : undefined}
            useBusy={useBusy}
          />
        </div>

        {statusLabel ? (
          <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-[color:var(--stamp-muted)]">
            {statusLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RewardRow({
  tier,
  copy,
  accent,
  stampCount,
  onUse,
  useBusy,
}: {
  tier: StampRewardTier;
  copy: StampRewardCopy;
  accent: string;
  stampCount: number;
  onUse?: () => void;
  useBusy?: boolean;
}) {
  const reached = stampCount >= tier;
  const remain = Math.max(0, tier - stampCount);
  const hint = !reached
    ? remain > 0
      ? `あと${remain}個`
      : null
    : tier === 5 && stampCount < 10
      ? `10個特典まであと${10 - stampCount}個`
      : null;

  return (
    <div
      className="stamp-reward-row"
      data-reached={reached ? "true" : "false"}
      data-active="false"
      style={{ ["--stamp-accent" as string]: accent }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold text-[color:var(--stamp-muted)]">{tier}個特典</p>
        {reached ? (
          <span className="text-[10px] font-semibold" style={{ color: accent }}>
            利用可
          </span>
        ) : hint ? (
          <span className="text-[10px] font-semibold text-[color:var(--stamp-muted)]">{hint}</span>
        ) : null}
      </div>
      <p
        className="mt-0.5 text-[15px] font-bold leading-snug"
        style={{ color: reached ? accent : "var(--stamp-ink)" }}
      >
        {copy.title || `${tier}個特典`}
      </p>
      {reached && copy.description ? (
        <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--stamp-muted)]">
          {copy.description}
        </p>
      ) : null}
      {reached && hint ? (
        <p className="mt-1 text-[11px] text-[color:var(--stamp-muted)]">{hint}</p>
      ) : null}
      {reached && onUse ? (
        <button
          type="button"
          disabled={useBusy}
          onClick={onUse}
          className="mt-2.5 flex min-h-10 w-full items-center justify-center rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background: accent }}
        >
          スタッフ確認のうえ利用
        </button>
      ) : null}
    </div>
  );
}
