"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import {
  getCurrentHotelViewMetrics,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPagesForHotel,
  type DashboardBootstrapData,
  type PageRow,
} from "@/lib/storage";
import { formatDisplayNameWithSan } from "@/lib/user-label";
import { formatRelativeTimeJa } from "@/lib/format-relative-time";
import { useProfileDisplayName } from "@/lib/use-profile-display-name";
import { isNativeAppWebView, useNotifyNativeAppShellWhenReady } from "@/lib/native-app-bridge";
import {
  getDashboardViewCache,
  setDashboardViewCache,
} from "@/lib/session-resume-cache";
import { AppHomeContinueCard } from "../AppHomeContinueCard";
import { AppHomeStatsStrip } from "../AppHomeStatsStrip";
import { AppEmptyState } from "../AppEmptyState";
import { AppIconEmptyPages, AppIconLogo, AppIconPages } from "../icons/AppIconSet";
import { AppShellLink } from "../AppShellLink";
import { AppListRow } from "../primitives/AppListRow";
import { AppSection } from "../primitives/AppSection";
import { AppTabPage } from "../primitives/AppTabPage";
import { usePendingPublishApprovalCount } from "@/components/app/usePendingPublishApprovalCount";

function sortPagesByRecent(
  pages: PageRow[],
  infoBySlug: Map<string, { status?: string; updatedAt?: string }>,
): PageRow[] {
  return [...pages].sort((a, b) => {
    const aTime = infoBySlug.get(a.slug)?.updatedAt ?? "";
    const bTime = infoBySlug.get(b.slug)?.updatedAt ?? "";
    return bTime.localeCompare(aTime);
  });
}

export function AppDashboardView() {
  const initialCache = getDashboardViewCache();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(
    initialCache?.bootstrap ?? null,
  );
  const { displayName: profileDisplayName, loaded: profileLoaded } = useProfileDisplayName();
  const [pages, setPages] = useState<PageRow[]>(initialCache?.pages ?? []);
  const [loading, setLoading] = useState(!initialCache);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(
    initialCache?.role ?? null,
  );
  const [totalViews7d, setTotalViews7d] = useState(initialCache?.totalViews7d ?? 0);

  const canEdit = role === "owner" || role === "admin" || role === "editor";
  const teamPendingApprovals = usePendingPublishApprovalCount();

  useNotifyNativeAppShellWhenReady(!loading && profileLoaded);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const hasCache = Boolean(getDashboardViewCache());
    if (!opts?.silent && !hasCache) {
      setLoading(true);
    }
    try {
      const [b, r, pageResult, metrics] = await Promise.all([
        getDashboardBootstrapData(),
        getCurrentUserHotelRole().catch(() => null),
        listPagesForHotel()
          .then((p) => ({ ok: true as const, pages: p }))
          .catch(() => ({ ok: false as const, pages: [] as PageRow[] })),
        getCurrentHotelViewMetrics().catch(() => null),
      ]);
      const nextPages = pageResult.ok ? pageResult.pages : [];
      const nextViews = metrics?.totalViews7d ?? 0;
      setBootstrap(b);
      setRole(r);
      if (pageResult.ok) {
        setPages(nextPages);
      }
      setTotalViews7d(nextViews);
      setDashboardViewCache({
        bootstrap: b,
        pages: nextPages,
        role: r,
        totalViews7d: nextViews,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const displayName = profileDisplayName?.trim() ?? "";
  const greetingName = displayName ? formatDisplayNameWithSan(displayName) : null;

  const infoBySlug = useMemo(
    () => new Map((bootstrap?.informations ?? []).map((info) => [info.slug, info])),
    [bootstrap?.informations],
  );

  const sortedPages = useMemo(
    () => sortPagesByRecent(pages, infoBySlug),
    [pages, infoBySlug],
  );
  const continuePage = sortedPages[0] ?? null;
  const otherRecent = sortedPages.slice(1, 3);
  const publishedCount = (bootstrap?.informations ?? []).filter((i) => i.status === "published").length;
  const pageCount = pages.length;

  return (
    <AppTabPage
      title={greetingName ?? "Infomii"}
      description={pageCount > 0 ? "続きから、すぐ編集。" : "好きな案内を、1ページに。"}
      className="pb-4"
      contentClassName="space-y-4"
      headerAction={
        <AppShellLink
          href="/settings"
          className="app-home-avatar app-pressable"
          aria-label="設定を開く"
        >
          <AppIconLogo size={28} />
        </AppShellLink>
      }
    >
      {loading ? (
        isNativeAppWebView() ? null : (
          <div className="space-y-3">
            <div className="app-shell-skeleton app-home-skeleton h-32 rounded-2xl" />
            <div className="app-shell-skeleton app-home-skeleton h-24 rounded-2xl" />
            <div className="app-shell-skeleton app-home-skeleton h-11 rounded-full" />
          </div>
        )
      ) : (
        <>
          {teamPendingApprovals > 0 ? (
            <AppSection revealDelay={0}>
              <AppShellLink
                href="/dashboard/team"
                className="block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              >
                <span className="font-semibold">公開の承認待ちが {teamPendingApprovals} 件</span>
                <span className="mt-0.5 block text-xs text-amber-800/90">チーム画面で確認できます</span>
              </AppShellLink>
            </AppSection>
          ) : null}

          {canEdit ? (
            <AppSection revealDelay={0}>
              <div id="app-ai-create" className="app-home-compose">
                <GeneratePageFromDescription variant="app" className="mb-0" />
              </div>
            </AppSection>
          ) : null}

          {continuePage ? (
            <AppSection revealDelay={60}>
              <AppHomeContinueCard
                pageId={continuePage.id}
                title={continuePage.title}
                status={infoBySlug.get(continuePage.slug)?.status === "published" ? "published" : "draft"}
                updatedAt={infoBySlug.get(continuePage.slug)?.updatedAt ?? new Date().toISOString()}
              />
            </AppSection>
          ) : (
            <AppSection revealDelay={60}>
              <AppEmptyState
                icon={<AppIconEmptyPages />}
                title="まだページがありません"
                description="AIでつくるか、テンプレートから始めてみましょう。"
                action={
                  <AppShellLink
                    href="/templates"
                    className="app-touch-btn app-touch-btn-primary app-pressable flex items-center justify-center bg-[var(--app-accent)] font-semibold !text-white"
                  >
                    テンプレートを選ぶ
                  </AppShellLink>
                }
              />
            </AppSection>
          )}

          {pageCount > 0 ? (
            <AppSection revealDelay={100}>
              <AppHomeStatsStrip
                pageCount={pageCount}
                publishedCount={publishedCount}
                totalViews7d={totalViews7d}
              />
            </AppSection>
          ) : null}

          {otherRecent.length > 0 ? (
            <AppSection revealDelay={130}>
              <div className="app-shell-card overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--app-border)] px-4 py-3">
                  <h2 className="text-sm font-bold text-[var(--app-text)]">ほかのページ</h2>
                  <AppShellLink
                    href="/dashboard/pages"
                    className="app-pressable min-h-0 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--app-accent)]"
                  >
                    すべて
                  </AppShellLink>
                </div>
                {otherRecent.map((item) => {
                  const info = infoBySlug.get(item.slug);
                  const published = info?.status === "published";
                  return (
                    <AppListRow
                      key={item.id}
                      href={`/editor/${item.id}`}
                      title={item.title.trim() || "（無題）"}
                      subtitle={`${published ? "公開中" : "下書き"} · ${formatRelativeTimeJa(info?.updatedAt ?? new Date().toISOString())}`}
                      leading={<AppIconPages size={22} />}
                    />
                  );
                })}
              </div>
            </AppSection>
          ) : null}
        </>
      )}
    </AppTabPage>
  );
}
