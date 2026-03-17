"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  getPageViewAnalytics,
  createBlankPage,
  type HotelViewMetrics,
  type PageViewAnalytics,
} from "@/lib/storage";
import type { DashboardBootstrapData } from "@/lib/storage";
import { GeneratePageFromUrl } from "@/components/ai/GeneratePageFromUrl";
import { PageCard } from "./PageCard";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";

export function DashboardView() {
  const router = useRouter();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(null);
  const [viewMetrics, setViewMetrics] = useState<HotelViewMetrics | null>(null);
  const [pageViewAnalytics, setPageViewAnalytics] = useState<PageViewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingCardPage, setCreatingCardPage] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getDashboardBootstrapData(),
      getCurrentHotelViewMetrics().catch(() => null),
      getPageViewAnalytics().catch(() => null),
    ])
      .then(([b, v, p]) => {
        if (!mounted) return;
        setBootstrap(b);
        setViewMetrics(v);
        setPageViewAnalytics(p);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreatePage() {
    setCreateError(null);
    setCreating(true);
    try {
      const pageId = await createBlankPage("新規ページ");
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "ページの作成に失敗しました";
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateCardPage() {
    setCreateError(null);
    setCreatingCardPage(true);
    try {
      const pageId = await createBlankPage("新規ページ");
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "ページの作成に失敗しました";
      setCreateError(message);
    } finally {
      setCreatingCardPage(false);
    }
  }

  const items = bootstrap?.informations ?? [];
  const recent = items.slice(0, 5);
  const published = items.filter((i) => i.status === "published");
  const totalViews = viewMetrics?.totalViews7d ?? pageViewAnalytics?.totalViews ?? 0;
  const todayViews = viewMetrics?.totalViewsToday ?? 0;
  const topPages = viewMetrics?.pageStats?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {bootstrap?.hotelName ?? "施設"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">
          案内を1つ作って、QRでお客様に届けます
        </p>
      </header>

      {/* Primary action: create once, deliver via QR */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center gap-4">
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
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            テンプレートから作成
          </Link>
          <button
            type="button"
            onClick={() => void handleCreateCardPage()}
            disabled={creatingCardPage}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {creatingCardPage ? "作成中…" : "カードで新規ページ"}
          </button>
        </div>
        {createError && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {createError}
            <p className="mt-1 text-xs text-amber-700">
              Supabase の設定と、施設（hotels）・施設所属（hotel_memberships）が作成されているか確認してください。
            </p>
          </div>
        )}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <GeneratePageFromUrl />
        </div>
      </section>

      {/* Analytics summary */}
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

      {/* Recently edited */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">最近編集したページ</h2>
          <Link href="/dashboard/pages" className="text-xs font-medium text-slate-500 hover:text-slate-700">
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
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-slate-600">まだ案内ページがありません</p>
            <p className="mt-1 text-sm text-slate-500">1つ作ると、QRでお客様に届けられます。「ページを作成」から始めてください。</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {recent.map((item) => {
              const stat = viewMetrics?.pageStats?.find((p) => p.informationId === item.id);
              return (
                <PageCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  slug={item.slug}
                  status={item.status}
                  updatedAt={item.updatedAt}
                  views7d={stat?.views}
                  qrViews7d={stat?.qrViews}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Published pages */}
      {!loading && published.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-700">公開中のページ</h2>
          <div className="mt-3 space-y-2">
            {published.slice(0, 5).map((item) => {
              const stat = viewMetrics?.pageStats?.find((p) => p.informationId === item.id);
              return (
                <PageCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  slug={item.slug}
                  status="published"
                  updatedAt={item.updatedAt}
                  views7d={stat?.views}
                  qrViews7d={stat?.qrViews}
                />
              );
            })}
          </div>
          {published.length > 5 && (
            <Link
              href="/dashboard/pages"
              className="mt-2 inline-block text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              他 {published.length - 5} 件
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
