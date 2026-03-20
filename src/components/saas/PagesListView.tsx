"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildPublicUrlV,
  createBlankPage,
  getDashboardBootstrapData,
  listPageConnectionSetsForHotel,
  PAGE_LIMIT_REACHED,
  type PageConnectionSet,
  type PageRow,
  deletePage,
} from "@/lib/storage";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import { GeneratePageFromUrl } from "@/components/ai/GeneratePageFromUrl";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { UpgradeCtaBanner } from "@/components/dashboard/UpgradeCtaBanner";

function modeLabel(mode: PageConnectionSet["mode"]): string {
  return mode === "linked" ? "ページ連携" : "単発";
}

export function PagesListView() {
  const router = useRouter();
  const [sets, setSets] = useState<PageConnectionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: "free" | "pro" | "business";
    maxPublishedPages: number;
  } | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [bootstrap, connectionSets] = await Promise.all([
      getDashboardBootstrapData(),
      listPageConnectionSetsForHotel().catch(() => []),
    ]);
    setSubscription(
      bootstrap.subscription
        ? {
            plan: bootstrap.subscription.plan,
            maxPublishedPages: bootstrap.subscription.maxPublishedPages,
          }
        : null
    );
    setPublishedCount((bootstrap.informations ?? []).filter((i) => i.status === "published").length);
    setSets(connectionSets);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  async function handleDeleteCardPage(page: PageRow) {
    if (
      !window.confirm(
        `${page.title?.trim() ? `「${page.title}」を` : "このページを"}削除しますか？\nページ連携に含まれている場合は構成が変わります。`
      )
    ) {
      return;
    }
    setDeletingPageId(page.id);
    try {
      await deletePage(page.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingPageId(null);
    }
  }

  const linkedCount = useMemo(() => sets.filter((set) => set.mode === "linked").length, [sets]);
  const singleCount = useMemo(() => sets.filter((set) => set.mode === "single").length, [sets]);
  const pageCount = useMemo(() => sets.reduce((acc, set) => acc + set.pageCount, 0), [sets]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">ページ</h1>
          <p className="mt-1 text-sm text-slate-500">
            単発ページとページ連携をセット単位で管理できます。
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
            publishedCount={publishedCount}
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="text-slate-600">まだページがありません</p>
          <p className="mt-1 text-sm text-slate-500">ページを作成すると、ここで単発/ページ連携として管理できます。</p>
        </div>
      ) : (
        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">セット {sets.length}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">ページ連携 {linkedCount}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">単発 {singleCount}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">総ページ {pageCount}</span>
          </div>

          {sets.map((set) => (
            <article key={set.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{set.name}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {set.pageCount}ページ · ルート {set.pages.find((p) => p.id === set.rootPageId)?.title || ""}
                  </p>
                </div>
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-medium " +
                    (set.mode === "linked" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")
                  }
                >
                  {modeLabel(set.mode)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-2 text-xs font-semibold text-slate-600">ページ名</th>
                      <th className="px-4 py-2 text-xs font-semibold text-slate-600">役割</th>
                      <th className="px-4 py-2 text-xs font-semibold text-slate-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {set.pages.map((page) => (
                      <tr key={page.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-slate-900">{page.title || "(無題)"}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {page.id === set.rootPageId ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">ルート</span>
                          ) : (
                            <span className="text-slate-500">子ページ</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`/editor/${page.id}`}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                            >
                              編集
                            </a>
                            <a
                              href={buildPublicUrlV(page.slug)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              公開ページ
                            </a>
                            <button
                              type="button"
                              disabled={deletingPageId === page.id}
                              onClick={() => void handleDeleteCardPage(page)}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingPageId === page.id ? "削除中…" : "削除"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
