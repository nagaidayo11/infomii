"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildPublicUrlV,
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  createBlankPage,
  deleteInformation,
  deletePage,
  listPagesForHotel,
  PAGE_LIMIT_REACHED,
} from "@/lib/storage";
import type { PageRow } from "@/lib/storage";
import type { Information } from "@/types/information";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import { GeneratePageFromUrl } from "@/components/ai/GeneratePageFromUrl";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { UpgradeCtaBanner } from "@/components/dashboard/UpgradeCtaBanner";
import { PageCard } from "./PageCard";

export function PagesListView() {
  const router = useRouter();
  const [items, setItems] = useState<Information[]>([]);
  const [cardPages, setCardPages] = useState<PageRow[]>([]);
  const [pageStats, setPageStats] = useState<
    Array<{ informationId: string; views: number; qrViews: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: "free" | "pro" | "business";
    maxPublishedPages: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingCardPageId, setDeletingCardPageId] = useState<string | null>(null);
  const cardPageIdBySlug = new Map(cardPages.map((p) => [p.slug, p.id]));

  const load = useCallback(async () => {
    setLoading(true);
    const [bootstrap, metrics, cards] = await Promise.all([
      getDashboardBootstrapData(),
      getCurrentHotelViewMetrics().catch(() => null),
      listPagesForHotel(),
    ]);
    setItems(bootstrap.informations ?? []);
    setCardPages(cards);
    setSubscription(
      bootstrap.subscription
        ? {
            plan: bootstrap.subscription.plan,
            maxPublishedPages: bootstrap.subscription.maxPublishedPages,
          }
        : null
    );
    setPageStats(metrics?.pageStats ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;
    load().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [load]);

  async function handleDeletePage(id: string) {
    setDeletingId(id);
    try {
      await deleteInformation(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteCardPage(page: PageRow) {
    if (
      !window.confirm(
        `${page.title?.trim() ? `「${page.title}」を` : "このページを"}削除しますか？\nQRで表示されているページが消え、取り消しはできません。`
      )
    )
      return;
    setDeletingCardPageId(page.id);
    try {
      await deletePage(page.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingCardPageId(null);
    }
  }

  async function handleCreatePage() {
    setCreating(true);
    try {
      const pageId = await createBlankPage();
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
      }
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === PAGE_LIMIT_REACHED) setPlanLimitModalOpen(true);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">ページ</h1>
          <p className="mt-1 text-sm text-slate-500">
            案内ページの一覧。編集または公開ページを開けます。
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreatePage}
          disabled={creating}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-lg leading-none">
            +
          </span>
          ページを作成
        </button>
      </header>

      <PlanLimitModal
        open={planLimitModalOpen}
        onClose={() => setPlanLimitModalOpen(false)}
        currentPlan={subscription?.plan}
      />

      {!loading && subscription && (
        <div className="mt-6">
          <UpgradeCtaBanner
            currentPlan={subscription.plan}
            publishedCount={items.filter((i) => i.status === "published").length}
            maxPublishedPages={subscription.maxPublishedPages}
          />
        </div>
      )}

      <div className="mt-6 space-y-6">
        <GeneratePageFromUrl />
        <GeneratePageFromDescription />
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 sm:h-28" />
          ))}
        </div>
      ) : items.length === 0 && cardPages.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="text-slate-600">まだページがありません</p>
          <p className="mt-1 text-sm text-slate-500">
            下のボタンから1つ作成してください。
          </p>
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creating}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-lg leading-none">
              +
            </span>
            ページを作成
          </button>
        </div>
      ) : (
        <>
          {items.length > 0 && (
          <ul className="mt-8 grid gap-3 sm:grid-cols-1">
            {items.map((item) => {
              const stat = pageStats.find((p) => p.informationId === item.id);
              return (
                <li key={item.id}>
                  <PageCard
                    id={item.id}
                    editHref={cardPageIdBySlug.get(item.slug) ? `/editor/${cardPageIdBySlug.get(item.slug)}` : null}
                    title={item.title}
                    slug={item.slug}
                    status={item.status}
                    updatedAt={item.updatedAt}
                    views7d={stat?.views}
                    qrViews7d={stat?.qrViews}
                    onDelete={deletingId ? undefined : handleDeletePage}
                  />
                </li>
              );
            })}
          </ul>
          )}

          {/* カードで作ったページ（QR読み取り後に表示される /v/ のページ） */}
          {cardPages.length > 0 && (
            <div className="mt-10 border-t border-slate-200 pt-10">
              <h2 className="text-lg font-semibold text-slate-900">
                カードで作ったページ
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                QRコード読み取り後に表示されるページです
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-1">
                {cardPages.map((page) => (
                  <li
                    key={page.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <span className="font-medium text-slate-900">
                      {page.title?.trim() || ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={buildPublicUrlV(page.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        公開ページを開く
                      </a>
                      <a
                        href={`/editor/${page.id}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                      >
                        編集
                      </a>
                      <button
                        type="button"
                        disabled={deletingCardPageId === page.id}
                        onClick={() => void handleDeleteCardPage(page)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingCardPageId === page.id ? "削除中…" : "削除"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
