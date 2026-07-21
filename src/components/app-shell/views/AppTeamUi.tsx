"use client";

import type { ReactNode } from "react";
import { AppShellLink } from "../AppShellLink";
import { AppFeatureIconApproval, AppFeatureIconBusinessLock, AppFeatureIconInvite, AppFeatureIconMembers, AppFeatureIconTeam } from "../icons/AppFeatureIcons";
import { AppMetricTile } from "../primitives/AppMetricTile";
import { AppScreenSection } from "../primitives/AppScreenSection";
import { AppTabPage } from "../primitives/AppTabPage";

type AppTeamUpgradeCardProps = {
  upgradeHref: string;
};

export function AppTeamUpgradeCard({ upgradeHref }: AppTeamUpgradeCardProps) {
  return (
    <AppScreenSection
      title="Businessプラン限定"
      icon={<AppFeatureIconBusinessLock size={22} />}
      subtitle="チーム招待と公開申請の承認フロー"
    >
      <div className="app-team-upgrade-body">
        <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">
          チーム招待・公開申請の承認フローは Business プランでご利用いただけます。現在のプランではこの画面の操作はできません。
        </p>
        <AppShellLink href={upgradeHref} className="app-plan-cta-primary app-pressable ui-pop-tap mt-4 inline-flex w-full items-center justify-center">
          Business プランを申し込む
        </AppShellLink>
      </div>
    </AppScreenSection>
  );
}

type AppTeamSummaryStripProps = {
  memberCount: number;
  memberMax: number;
  pendingApprovals: number;
  activeInvites: number;
};

export function AppTeamSummaryStrip({
  memberCount,
  memberMax,
  pendingApprovals,
  activeInvites,
}: AppTeamSummaryStripProps) {
  return (
    <AppScreenSection title="概要" icon={<AppFeatureIconTeam size={22} />} card={false}>
      <div className="app-metric-grid app-metric-grid--3">
        <AppMetricTile
          icon={<AppFeatureIconMembers size={28} />}
          label="メンバー"
          value={`${memberCount}/${memberMax}`}
          sub="オーナー含む"
          href="#team-members"
        />
        <AppMetricTile
          icon={<AppFeatureIconApproval size={28} />}
          label="承認待ち"
          value={pendingApprovals}
          sub={pendingApprovals > 0 ? "要対応" : "なし"}
          href="#team-approvals"
        />
        <AppMetricTile
          icon={<AppFeatureIconInvite size={28} />}
          label="有効な招待"
          value={activeInvites}
          sub="未使用コード"
          href="#team-invite-issue"
        />
      </div>
      <div className="app-team-member-meter mt-3">
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--app-text-muted)]">
          <span>メンバー枠</span>
          <span className="tabular-nums">
            {memberCount}/{memberMax}
          </span>
        </div>
        <div
          className="app-team-member-meter-bar"
          role="progressbar"
          aria-valuenow={memberCount}
          aria-valuemin={0}
          aria-valuemax={memberMax}
          aria-label="メンバー枠の使用状況"
        >
          <div
            className="app-team-member-meter-fill"
            style={{ width: `${Math.min(100, (memberCount / memberMax) * 100)}%` }}
          />
        </div>
      </div>
    </AppScreenSection>
  );
}

type AppTeamDetailsSummaryProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  alertDot?: boolean;
};

export function AppTeamDetailsSummary({
  icon,
  title,
  subtitle,
  badge,
  alertDot,
}: AppTeamDetailsSummaryProps) {
  return (
    <summary className="app-team-details-summary">
      <span className="app-team-details-summary-icon">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative inline-flex items-center gap-2">
            {alertDot ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-sm ring-2 ring-white"
                aria-hidden
              />
            ) : null}
            <span className="app-team-details-summary-title">{title}</span>
          </span>
          {badge}
        </div>
        {subtitle ? <p className="app-team-details-summary-sub">{subtitle}</p> : null}
      </div>
      <span className="app-team-details-chevron" aria-hidden>
        ›
      </span>
    </summary>
  );
}

type AppTeamPageShellProps = {
  title: string;
  description: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function AppTeamPageShell({ title, description, headerAction, children }: AppTeamPageShellProps) {
  return (
    <AppTabPage
      title={title}
      description={description}
      className="pb-8"
      contentClassName="app-team-page-content space-y-4"
      headerAction={headerAction}
    >
      {children}
    </AppTabPage>
  );
}
