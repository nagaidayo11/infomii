"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readAndClearDashboardInviteError, readAndClearDashboardInviteSuccess } from "@/lib/invite-pending";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  getPageViewAnalytics,
  createBlankPage,
  deletePage,
  listPagesForHotel,
  listCurrentHotelAuditLogs,
  setInformationStatusBySlug,
  updatePageTitle,
  PAGE_LIMIT_REACHED,
  type PageRow,
  type HotelViewMetrics,
  type PageViewAnalytics,
} from "@/lib/storage";
import type { DashboardBootstrapData } from "@/lib/storage";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
import { UpgradeCtaBanner } from "@/components/dashboard/UpgradeCtaBanner";
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppDashboardView } from "@/components/app-shell/views/AppDashboardView";
import { PageCard } from "./PageCard";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";
import {
  buildPageUpdateActivity,
  RecentFacilityActivity,
  type FacilityActivityItem,
} from "./RecentFacilityActivity";
import { useProfileDisplayName } from "@/lib/use-profile-display-name";
import { formatDisplayNameWithSan } from "@/lib/user-label";
import { listLiveOpsKeysByPageIds, type LiveOpsKey } from "@/lib/editor/live-ops";
import { LiveOpsDashboardHelp } from "@/components/ops/LiveOpsDashboardHelp";
import { usePendingPublishApprovalCount } from "@/components/app/usePendingPublishApprovalCount";
import { EmptyState } from "@/components/ui/EmptyState";
import { dispatchHotelNameUpdated } from "@/lib/use-hotel-name";

export function DashboardView() {
  const { isAppShell } = useClientShell();
  return isAppShell ? <AppDashboardView /> : <DashboardViewWeb />;
}

function DashboardViewWeb() {
  const router = useRouter();
  const { displayName, loaded: profileLoaded } = useProfileDisplayName();
  const greetingName = displayName ? formatDisplayNameWithSan(displayName) : null;
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(null);
  const [viewMetrics, setViewMetrics] = useState<HotelViewMetrics | null>(null);
  const [pageViewAnalytics, setPageViewAnalytics] = useState<PageViewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [cardPages, setCardPages] = useState<PageRow[]>([]);
  const [liveOpsByPageId, setLiveOpsByPageId] = useState<Record<string, LiveOpsKey[]>>({});
  const [activityItems, setActivityItems] = useState<FacilityActivityItem[]>([]);
  const createBusyRef = useRef(false);
  const deleteBusyRef = useRef(false);
  const [inviteNotice, setInviteNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const canEdit = role === "owner" || role === "admin" || role === "editor";
  const teamPendingApprovals = usePendingPublishApprovalCount();

  useRouteProgressLoading(loading);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (readAndClearDashboardInviteSuccess()) {
      setInviteNotice({ type: "ok", text: "招待先に参加しました。" });
    }
    const err = readAndClearDashboardInviteError();
    if (err) {
      setInviteNotice({ type: "err", text: err });
    }
  }, []);

  const loadBootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const [b, v, p, r, pagesResult] = await Promise.all([
        getDashboardBootstrapData(),
        getCurrentHotelViewMetrics().catch(() => null),
        getPageViewAnalytics().catch(() => null),
        getCurrentUserHotelRole().catch(() => null),
        listPagesForHotel()
          .then((pages) => ({ ok: true as const, pages }))
          .catch(() => ({ ok: false as const, pages: [] as PageRow[] })),
      ]);
      setBootstrap(b);
      setViewMetrics(v);
      setPageViewAnalytics(p);
      setRole(r);
      if (b?.hotelName) {
        dispatchHotelNameUpdated(b.hotelName);
      }
      const pageActivity = buildPageUpdateActivity(
        (b?.informations ?? []).map((info) => ({
          id: info.id,
          title: info.title,
          updatedAt: info.updatedAt,
        })),
        5,
      );
      if (b?.subscription?.plan === "business") {
        const logs = await listCurrentHotelAuditLogs(8).catch(() => []);
        if (logs.length > 0) {
          setActivityItems(
            logs.map((log) => ({
              id: log.id,
              message: log.message,
              createdAt: log.createdAt,
            })),
          );
        } else {
          setActivityItems(pageActivity);
        }
      } else {
        setActivityItems(pageActivity);
      }
      if (pagesResult.ok) {
        setCardPages(pagesResult.pages);
        const ops = await listLiveOpsKeysByPageIds(pagesResult.pages.map((p) => p.id)).catch(
          () => ({}) as Record<string, LiveOpsKey[]>,
        );
        setLiveOpsByPageId(ops);
      } else {
        setLiveOpsByPageId({});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDeletePage(id: string) {
    if (deleteBusyRef.current) return;
    deleteBusyRef.current = true;
    setDeletingId(id);
    try {
      await deletePage(id);
      setCardPages((prev) => prev.filter((p) => p.id !== id));
      await loadBootstrap();
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
      deleteBusyRef.current = false;
    }
  }

  async function handleRenamePage(id: string, nextTitle: string) {
    try {
      await updatePageTitle(id, nextTitle);
      setCardPages((prev) =>
        prev.map((page) => (page.id === id ? { ...page, title: nextTitle } : page))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "ページ名の更新に失敗しました");
    }
  }

  async function handleTogglePublish(id: string, nextStatus: "draft" | "published") {
    const target = cardPages.find((p) => p.id === id);
    if (!target) return;
    setTogglingPublishId(id);
    try {
      await setInformationStatusBySlug(target.slug, nextStatus);
      await loadBootstrap();
    } catch (e) {
      alert(e instanceof Error ? e.message : "公開状態の変更に失敗しました");
    } finally {
      setTogglingPublishId(null);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  async function handleCreatePage() {
    if (createBusyRef.current) return;
    const entered = window.prompt("新規ページ名を入力してください");
    if (entered == null) return;
    const normalizedTitle = entered.trim();
    if (!normalizedTitle) {
      setCreateError("タイトルを入力して下さい。");
      return;
    }
    setCreateError(null);
    createBusyRef.current = true;
    setCreating(true);
    let navigated = false;
    try {
      const pageId = await createBlankPage(normalizedTitle);
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
        navigated = true;
      }
    } catch (e) {
      const err = e as Error & { code?: string };
      const message = err instanceof Error ? err.message : "ページの作成に失敗しました";
      if (err.code === PAGE_LIMIT_REACHED) {
        setPlanLimitModalOpen(true);
        setCreateError(null);
      } else {
        setCreateError(message);
      }
    } finally {
      createBusyRef.current = false;
      if (!navigated) setCreating(false);
    }
  }

  const items = cardPages;
  const recent = items.slice(0, 5);
  const infoBySlug = new Map((bootstrap?.informations ?? []).map((info) => [info.slug, info]));
  const published = items.filter((i) => infoBySlug.get(i.slug)?.status === "published");
  const totalViews = viewMetrics?.totalViews7d ?? pageViewAnalytics?.totalViews ?? 0;
  const todayViews = viewMetrics?.totalViewsToday ?? 0;
  const topPages = viewMetrics?.pageStats?.slice(0, 5) ?? [];

  return (
    <div className="app-main-container space-y-6">
      {inviteNotice ? (
        <div
          className={
            "rounded-lg border px-4 py-3 text-sm " +
            (inviteNotice.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900")
          }
        >
          {inviteNotice.text}
        </div>
      ) : null}

      <header className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {!loading && bootstrap?.hotelName ? (
            <p className="truncate text-sm font-medium text-slate-600" title={bootstrap.hotelName}>
              {bootstrap.hotelName}
            </p>
          ) : profileLoaded && greetingName ? (
            <p className="text-sm text-slate-500">{greetingName}</p>
          ) : null}
          <div className="flex items-start gap-2">
            <h1
              className={
                (!loading && bootstrap?.hotelName) || (profileLoaded && greetingName)
                  ? "mt-1 app-page-title"
                  : "app-page-title"
              }
            >
              ダッシュボード
            </h1>
            <LiveOpsDashboardHelp className="mt-1 shrink-0" />
          </div>
          <p className="app-page-subtitle">
            {greetingName && bootstrap?.hotelName
              ? `${greetingName} — 案内ページの作成・公開・QR運用をここから進めます`
              : "案内ページの作成・公開・QR運用をここから進めます"}
          </p>
        </div>
        {!loading && canEdit ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCreatePage}
              disabled={creating}
              className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium !text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? "作成中…" : "ページを作成"}
            </button>
            <Link
              href="/templates"
              className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              テンプレート
            </Link>
          </div>
        ) : null}
      </header>

      {role === "viewer" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          閲覧権限のため、ページの作成・編集はできません。オーナーに編集権限の付与を依頼してください。
        </p>
      )}

      {teamPendingApprovals > 0 ? (
        <Link
          href="/dashboard/team"
          className="block rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 transition hover:bg-amber-100/80"
        >
          <span className="font-semibold">公開の承認待ちが {teamPendingApprovals} 件あります</span>
          <span className="mt-0.5 block text-xs text-amber-800/90">チーム画面で内容を確認し、承認または却下できます。</span>
        </Link>
      ) : null}

      {createError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {createError}
        </div>
      )}

      {!loading && bootstrap?.subscription ? (
        <UpgradeCtaBanner
          currentPlan={bootstrap.subscription.plan as "free" | "pro" | "business"}
          publishedCount={published.length}
          maxPublishedPages={bootstrap.subscription.maxPublishedPages}
        />
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="app-section-title">概要</h2>
          <Link href="/dashboard/analytics" className="text-xs font-medium text-slate-500 hover:text-slate-800">
            分析へ
          </Link>
        </div>
        {loading ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsSummaryCard
              label="閲覧（7日）"
              value={totalViews}
              href="/dashboard/analytics"
            />
            <AnalyticsSummaryCard label="本日" value={todayViews} href="/dashboard/analytics" />
            <AnalyticsSummaryCard
              label="公開中"
              value={published.length}
              sub={bootstrap?.subscription ? `上限 ${bootstrap.subscription.maxPublishedPages}` : undefined}
              href="/dashboard/pages"
            />
            <AnalyticsSummaryCard
              label="下書き"
              value={items.length - published.length}
              href="/dashboard/pages"
            />
          </div>
        )}
        {!loading && topPages.length > 0 ? (
          <div className="app-panel mt-3">
            <div className="flex items-center justify-between border-b border-[#e6e8eb] px-4 py-2.5">
              <h3 className="text-xs font-medium text-slate-500">人気ページ（7日）</h3>
              <Link href="/dashboard/analytics" className="text-xs font-medium text-slate-500 hover:text-slate-800">
                詳細
              </Link>
            </div>
            <ul className="divide-y divide-[#e6e8eb]">
              {topPages.map((p) => (
                <li key={p.informationId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="truncate text-slate-700">{p.title}</span>
                  <span className="ml-3 shrink-0 tabular-nums text-slate-500">
                    {p.views}
                    <span className="ml-1 text-xs font-normal">閲覧</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <RecentFacilityActivity
        items={activityItems}
        loading={loading}
        moreHref={bootstrap?.subscription?.plan === "business" ? "/dashboard/team" : "/settings"}
        moreLabel={bootstrap?.subscription?.plan === "business" ? "チーム・履歴へ" : "設定へ"}
        emptyHint="ページを編集すると、ここに最近の活動が表示されます"
      />

      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="app-section-title">最近のページ</h2>
          <Link href="/dashboard/pages" className="text-xs font-medium text-slate-500 hover:text-slate-800">
            すべて見る
          </Link>
        </div>
        {loading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            className="mt-3"
            compact
            title="まだ案内ページがありません"
            description="テンプレートから始めるか、空白ページを作成すると、ここに最近のページが表示されます。"
            action={
              canEdit ? (
                <>
                  <Link
                    href="/templates"
                    className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-800"
                  >
                    テンプレートを選ぶ
                  </Link>
                  <button
                    type="button"
                    onClick={handleCreatePage}
                    disabled={creating}
                    className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    空白から作成
                  </button>
                </>
              ) : undefined
            }
          />
        ) : (
          <div className="mt-3 space-y-2">
            {recent.map((item) => {
              const stat = viewMetrics?.pageStats?.find((p) => p.informationId === item.id);
              return (
                <PageCard
                  key={item.id}
                  id={item.id}
                  editHref={`/editor/${item.id}`}
                  title={item.title}
                  slug={item.slug}
                  status={infoBySlug.get(item.slug)?.status === "published" ? "published" : "draft"}
                  updatedAt={infoBySlug.get(item.slug)?.updatedAt ?? new Date().toISOString()}
                  views7d={stat?.views}
                  qrViews7d={stat?.qrViews}
                  onDelete={deletingId ? undefined : handleDeletePage}
                  onRename={canEdit ? handleRenamePage : undefined}
                  onTogglePublish={canEdit ? handleTogglePublish : undefined}
                  publishToggling={togglingPublishId === item.id}
                  canEdit={canEdit}
                  liveOpsKeys={liveOpsByPageId[item.id] ?? []}
                />
              );
            })}
          </div>
        )}
      </section>

      <PlanLimitModal
        open={planLimitModalOpen}
        onClose={() => setPlanLimitModalOpen(false)}
        currentPlan={bootstrap?.subscription?.plan}
      />
      {mounted && creating &&
        createPortal(
          <FullScreenLoadingOverlay
            title="作成中…"
            subtitle="新しい案内ページを用意しています"
            classNameZ="z-40"
          />,
          document.body
        )}
    </div>
  );
}
