"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  setInformationStatusBySlug,
  updatePageTitle,
  PAGE_LIMIT_REACHED,
  type PageRow,
  type HotelViewMetrics,
  type PageViewAnalytics,
} from "@/lib/storage";
import type { DashboardBootstrapData } from "@/lib/storage";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import { GeneratePageFromUrl } from "@/components/ai/GeneratePageFromUrl";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";
import { UpgradeCtaBanner } from "@/components/dashboard/UpgradeCtaBanner";
import { FadeIn, ScrollReveal } from "@/components/motion";
import { PageCard } from "./PageCard";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";

export function DashboardView() {
  const router = useRouter();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(null);
  const [viewMetrics, setViewMetrics] = useState<HotelViewMetrics | null>(null);
  const [pageViewAnalytics, setPageViewAnalytics] = useState<PageViewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"owner" | "editor" | "viewer" | null>(null);
  const [cardPages, setCardPages] = useState<PageRow[]>([]);
  const createBusyRef = useRef(false);
  const deleteBusyRef = useRef(false);

  const canEdit = role === "owner" || role === "editor";

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
      if (pagesResult.ok) {
        setCardPages(pagesResult.pages);
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
    try {
      const pageId = await createBlankPage(normalizedTitle);
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
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
      setCreating(false);
      createBusyRef.current = false;
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
    <div className="mx-auto max-w-4xl space-y-8">
      <OnboardingTour />
      <FadeIn>
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {bootstrap?.hotelName ?? "施設"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">
            案内を1つ作って、QRでお客様に届けます
          </p>
        </header>
      </FadeIn>

      {/* Upgrade CTA: Free → Pro, Pro（上限接近）→ Business */}
      {!loading && bootstrap?.subscription && (
        <ScrollReveal>
          <UpgradeCtaBanner
            currentPlan={bootstrap.subscription.plan as "free" | "pro" | "business"}
            publishedCount={published.length}
            maxPublishedPages={bootstrap.subscription.maxPublishedPages}
          />
        </ScrollReveal>
      )}

      {/* Primary action: create once, deliver via QR */}
      <ScrollReveal>
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {!canEdit && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            閲覧権限のため、ページの作成・編集はできません。オーナーに編集権限の付与を依頼してください。
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          {canEdit && (
            <>
              <button
                type="button"
                onClick={handleCreatePage}
                disabled={creating}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
              >
                {creating ? "作成中…" : "ページを作成"}
              </button>
              <Link
                href="/templates"
                onClick={() => setNavigating(true)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                テンプレートから作成
              </Link>
            </>
          )}
        </div>
        {createError && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {createError}
          </div>
        )}
        {canEdit && (
        <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
          <GeneratePageFromUrl />
          <GeneratePageFromDescription />
        </div>
        )}
      </section>
      </ScrollReveal>

      {/* Analytics summary */}
      <ScrollReveal>
      <section>
        <h2 className="text-sm font-semibold text-slate-700">分析サマリー</h2>
        {loading ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsSummaryCard label="総閲覧数（7日）" value={totalViews} />
            <AnalyticsSummaryCard label="本日の閲覧" value={todayViews} />
            <AnalyticsSummaryCard
              label="公開中"
              value={published.length}
              sub={bootstrap?.subscription ? `上限 ${bootstrap.subscription.maxPublishedPages} 件` : undefined}
            />
            <AnalyticsSummaryCard label="下書き" value={items.length - published.length} />
          </div>
        )}
        {!loading && topPages.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-semibold text-slate-500">人気ページ（7日）</h3>
            <ul className="mt-2 space-y-1.5">
              {topPages.map((p, i) => (
                <li key={p.informationId} className="flex items-center justify-between text-sm">
                  <span className="truncate text-slate-700">{p.title}</span>
                  <span className="ml-2 shrink-0 text-slate-500">{p.views} 回</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      </ScrollReveal>

      {/* Recently edited */}
      <ScrollReveal>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">最近編集したページ</h2>
          <Link
            href="/dashboard/pages"
            onClick={() => setNavigating(true)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            すべて見る
          </Link>
        </div>
        {loading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-6">
              <h3 className="font-semibold text-emerald-900">テンプレートから始めましょう</h3>
              <p className="mt-1 text-sm text-emerald-800">
                館内案内・WiFi・朝食・チェックアウト・周辺観光の型が入ったテンプレートを使うと、編集するだけですぐ公開できます。
              </p>
              <Link
                href="/templates"
                onClick={() => setNavigating(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                テンプレートを選ぶ
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <p className="text-slate-600">まだ案内ページがありません</p>
              <p className="mt-1 text-sm text-slate-500">1つ作ると、QRでお客様に届けられます。「ページを作成」から始めてください。</p>
            </div>
          </div>
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
                />
              );
            })}
          </div>
        )}
      </section>
      </ScrollReveal>

      {/* Published pages */}
      {!loading && published.length > 0 && (
        <ScrollReveal>
        <section>
          <h2 className="text-sm font-semibold text-slate-700">公開中のページ</h2>
          <div className="mt-3 space-y-2">
            {published.slice(0, 5).map((item) => {
              const stat = viewMetrics?.pageStats?.find((p) => p.informationId === item.id);
              return (
                <PageCard
                  key={item.id}
                  id={item.id}
                  editHref={`/editor/${item.id}`}
                  title={item.title}
                  slug={item.slug}
                  status="published"
                  updatedAt={infoBySlug.get(item.slug)?.updatedAt ?? new Date().toISOString()}
                  views7d={stat?.views}
                  qrViews7d={stat?.qrViews}
                  onDelete={deletingId ? undefined : handleDeletePage}
                  onRename={canEdit ? handleRenamePage : undefined}
                  onTogglePublish={canEdit ? handleTogglePublish : undefined}
                  publishToggling={togglingPublishId === item.id}
                  canEdit={canEdit}
                />
              );
            })}
          </div>
          {published.length > 5 && (
            <Link
              href="/dashboard/pages"
              onClick={() => setNavigating(true)}
              className="mt-2 inline-block text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              他 {published.length - 5} 件
            </Link>
          )}
        </section>
        </ScrollReveal>
      )}
      <PlanLimitModal
        open={planLimitModalOpen}
        onClose={() => setPlanLimitModalOpen(false)}
        currentPlan={bootstrap?.subscription?.plan}
      />
      {mounted && (loading || navigating || creating) &&
        createPortal(
          <FullScreenLoadingOverlay
            title={
              creating ? "作成中…" : loading ? "読み込み中…" : "ページ遷移中…"
            }
            subtitle={
              creating
                ? "新しい案内ページを用意しています"
                : loading
                  ? "ダッシュボードを読み込んでいます"
                  : "次の画面へ移動しています"
            }
            classNameZ="z-40"
          />,
          document.body
        )}
    </div>
  );
}
