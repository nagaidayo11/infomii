"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import {
  deletePage,
  getCurrentHotelViewMetrics,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPagesForHotel,
  type DashboardBootstrapData,
  type PageRow,
} from "@/lib/storage";
import { formatDisplayNameWithSan } from "@/lib/user-label";
import { useProfileDisplayName } from "@/lib/use-profile-display-name";
import { isNativeAppWebView, useNotifyNativeAppShellWhenReady } from "@/lib/native-app-bridge";
import {
  getDashboardViewCache,
  setDashboardViewCache,
} from "@/lib/session-resume-cache";
import { AppWorksList, AppWorksListItemMotion } from "../AppWorksList";
import { AppWorksListItem } from "../AppWorksListItem";
import { AppEmptyState } from "../AppEmptyState";
import { AppShellLink } from "../AppShellLink";
import { AppListRow } from "../primitives/AppListRow";
import { AppSection } from "../primitives/AppSection";
import { AppTabPage } from "../primitives/AppTabPage";
import { useAppToast } from "../AppToastProvider";
import { listLiveOpsKeysByPageIds, type LiveOpsKey } from "@/lib/editor/live-ops";
import { LiveOpsDashboardHelp } from "@/components/ops/LiveOpsDashboardHelp";
import { usePendingPublishApprovalCount } from "@/components/app/usePendingPublishApprovalCount";
import { LiveOpsPageRowActions } from "@/components/ops/LiveOpsPageRowActions";

export function AppDashboardView() {
  const initialCache = getDashboardViewCache();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(
    initialCache?.bootstrap ?? null,
  );
  const { displayName: profileDisplayName, loaded: profileLoaded } = useProfileDisplayName();
  const [pages, setPages] = useState<PageRow[]>(initialCache?.pages ?? []);
  const [liveOpsByPageId, setLiveOpsByPageId] = useState<Record<string, LiveOpsKey[]>>({});
  const [loading, setLoading] = useState(!initialCache);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(
    initialCache?.role ?? null,
  );
  const [totalViews7d, setTotalViews7d] = useState(initialCache?.totalViews7d ?? 0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteBusyRef = useRef(false);
  const { showToast } = useAppToast();

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
        const ops = await listLiveOpsKeysByPageIds(nextPages.map((p) => p.id)).catch(
          () => ({}) as Record<string, LiveOpsKey[]>,
        );
        setLiveOpsByPageId(ops);
      } else {
        setLiveOpsByPageId({});
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

  const infoBySlug = new Map((bootstrap?.informations ?? []).map((info) => [info.slug, info]));
  const recent = pages.slice(0, 4);
  const publishedCount = (bootstrap?.informations ?? []).filter((i) => i.status === "published").length;
  const pageCount = pages.length;

  async function handleDelete(page: PageRow) {
    if (!canEdit || deleteBusyRef.current) return;
    if (
      !window.confirm(
        `${page.title?.trim() ? `「${page.title}」を` : "このページを"}削除しますか？\n削除すると元に戻せません。`,
      )
    ) {
      return;
    }
    deleteBusyRef.current = true;
    setDeletingId(page.id);
    try {
      await deletePage(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      await load();
      showToast("削除しました", "success");
    } catch (e) {
      showToast((e as Error).message || "削除に失敗しました", "error");
    } finally {
      setDeletingId(null);
      deleteBusyRef.current = false;
    }
  }

  return (
    <AppTabPage
      title={greetingName ?? "Infomii"}
      description="好きな情報を、見やすい1ページに。"
      className="pb-4"
      contentClassName="space-y-5"
      headerAction={
        <AppShellLink
          href="/settings"
          className="app-home-avatar app-pressable"
          aria-label="設定を開く"
        >
          I
        </AppShellLink>
      }
    >
      {loading ? (
        isNativeAppWebView() ? null : (
          <div className="space-y-3">
            <div className="app-shell-skeleton app-home-skeleton h-36 rounded-2xl" />
            <div className="app-shell-skeleton app-home-skeleton h-28 rounded-2xl" />
            <div className="app-shell-skeleton app-home-skeleton h-24 rounded-2xl" />
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

          <AppSection revealDelay={90}>
            <section className="app-home-stats overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-white/35">
                <div className="p-4 text-center">
                  <p className="app-stat-value">{pageCount}</p>
                  <p className="app-meta mt-1">作成ページ</p>
                </div>
                <div className="p-4 text-center">
                  <p className="app-stat-value">{publishedCount}</p>
                  <p className="app-meta mt-1">公開中</p>
                </div>
                <div className="p-4 text-center">
                  <p className="app-stat-value">{totalViews7d}</p>
                  <p className="app-meta mt-1">7日閲覧</p>
                </div>
              </div>
              <AppListRow
                href="/dashboard/analytics"
                title="ページの反応を見る"
                subtitle="閲覧数とQRの状況を確認"
              />
            </section>
          </AppSection>

          <AppSection revealDelay={130}>
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[var(--app-text)]">最近のページ</h2>
                <div className="flex items-center gap-1.5">
                  {canEdit ? <LiveOpsDashboardHelp /> : null}
                  <AppShellLink
                    href="/dashboard/pages"
                    className="app-pressable min-h-0 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--app-accent)]"
                  >
                    すべて
                  </AppShellLink>
                </div>
              </div>

              {recent.length === 0 ? (
                <div className="mt-3">
                  <AppEmptyState
                    title="まだページがありません"
                    description="テンプレートから始めるか、新しいページを作成してください。"
                    action={
                      <AppShellLink
                        href="/templates"
                        className="app-touch-btn app-touch-btn-primary app-pressable flex items-center justify-center bg-[var(--app-accent)] font-semibold !text-white"
                      >
                        テンプレートを選ぶ
                      </AppShellLink>
                    }
                  />
                </div>
              ) : (
                <AppWorksList className="mt-3">
                  {recent.map((item, index) => {
                    const info = infoBySlug.get(item.slug);
                    return (
                      <AppWorksListItemMotion key={item.id} index={index}>
                        <AppWorksListItem
                          id={item.id}
                          title={item.title}
                          slug={item.slug}
                          status={info?.status === "published" ? "published" : "draft"}
                          updatedAt={info?.updatedAt ?? new Date().toISOString()}
                          showPublishSwitch={false}
                          deleting={deletingId === item.id}
                          onDelete={canEdit ? () => void handleDelete(item) : undefined}
                          liveOpsKeys={canEdit ? liveOpsByPageId[item.id] ?? [] : []}
                        />
                      </AppWorksListItemMotion>
                    );
                  })}
                </AppWorksList>
              )}
            </div>
          </AppSection>
        </>
      )}
    </AppTabPage>
  );
}
