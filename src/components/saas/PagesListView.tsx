"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  updatePageTitle,
} from "@/lib/storage";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { UpgradeCtaBanner } from "@/components/dashboard/UpgradeCtaBanner";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";

function modeLabel(mode: PageConnectionSet["mode"]): string {
  return mode === "linked" ? "ページ連携" : "単発";
}

export function PagesListView() {
  const router = useRouter();
  const [sets, setSets] = useState<PageConnectionSet[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "nodes">("nodes");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: "free" | "pro" | "business";
    maxPublishedPages: number;
  } | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const createBusyRef = useRef(false);
  const deleteBusyRef = useRef(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleCreatePage() {
    if (createBusyRef.current) return;
    const entered = window.prompt("新規ページ名を入力してください");
    if (entered == null) return;
    const normalizedTitle = entered.trim();
    if (!normalizedTitle) {
      alert("ページ名を入力してください。");
      return;
    }
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
      if (err.code === PAGE_LIMIT_REACHED) setPlanLimitModalOpen(true);
    } finally {
      createBusyRef.current = false;
      if (!navigated) setCreating(false);
    }
  }

  async function handleDeleteCardPage(page: PageRow) {
    if (deleteBusyRef.current) return;
    if (
      !window.confirm(
        `${page.title?.trim() ? `「${page.title}」を` : "このページを"}削除しますか？\nページ連携に含まれている場合は構成が変わります。`
      )
    ) {
      return;
    }
    deleteBusyRef.current = true;
    setDeletingPageId(page.id);
    try {
      await deletePage(page.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingPageId(null);
      deleteBusyRef.current = false;
    }
  }

  async function handleRenamePage(page: PageRow) {
    const current = page.title ?? "";
    const next = window.prompt("ページ名を入力してください", current);
    if (next == null) return;
    const normalized = next.trim();
    if (normalized === current.trim()) return;
    try {
      await updatePageTitle(page.id, normalized);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "ページ名の更新に失敗しました");
    }
  }

  const linkedCount = useMemo(() => sets.filter((set) => set.mode === "linked").length, [sets]);
  const singleCount = useMemo(() => sets.filter((set) => set.mode === "single").length, [sets]);
  const pageCount = useMemo(() => sets.reduce((acc, set) => acc + set.pageCount, 0), [sets]);

  function renderNodeSet(set: PageConnectionSet) {
    const root = set.pages.find((page) => page.id === set.rootPageId) ?? set.pages[0];
    const children = set.pages.filter((page) => page.id !== root?.id);
    const childCols = Math.min(3, Math.max(1, children.length));
    const childRows = children.length > 0 ? Math.ceil(children.length / childCols) : 0;
    const canvasHeight = children.length === 0 ? 140 : 180 + childRows * 88;

    const rootNode = { x: 50, y: 18 };
    const childNodes = children.map((page, index) => {
      const col = index % childCols;
      const row = Math.floor(index / childCols);
      const x = childCols === 1 ? 50 : 16 + (col * 68) / Math.max(1, childCols - 1);
      const y = 52 + row * 30;
      return { page, x, y };
    });

    return (
      <article key={set.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-900">{set.name}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{set.pageCount}ページ</p>
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

        <div className="px-4 py-4">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <div
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50"
            style={{ height: `${canvasHeight}px`, minWidth: "min(100%, 520px)" }}
          >
            <svg className="absolute inset-0 h-full w-full" aria-hidden>
              {root &&
                childNodes.map((node) => (
                  <line
                    key={`${root.id}-${node.page.id}`}
                    x1={`${rootNode.x}%`}
                    y1={`${rootNode.y + 10}%`}
                    x2={`${node.x}%`}
                    y2={`${node.y - 6}%`}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                  />
                ))}
            </svg>

            {root && (
              <button
                type="button"
                onClick={() => router.push(`/editor/${root.id}`)}
                className="absolute max-w-[min(180px,45vw)] -translate-x-1/2 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-left text-[11px] shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-[170px] sm:max-w-none sm:px-3 sm:text-xs"
                style={{ left: `${rootNode.x}%`, top: `${rootNode.y}%` }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">ルート</div>
                <div className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-900">
                  {root.title || "(無題)"}
                </div>
              </button>
            )}

            {childNodes.map((node) => (
              <button
                key={node.page.id}
                type="button"
                onClick={() => router.push(`/editor/${node.page.id}`)}
                className="absolute max-w-[min(160px,42vw)] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-[150px] sm:max-w-none sm:px-3 sm:text-xs"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">子ページ</div>
                <div className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-800">
                  {node.page.title || "(無題)"}
                </div>
              </button>
            ))}
          </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {set.pages.map((page) => (
              <div
                key={`${set.id}-${page.id}-actions`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1"
              >
                <span className="max-w-[200px] truncate text-xs text-slate-700">{page.title || "(無題)"}</span>
                <button
                  type="button"
                  onClick={() => router.push(`/editor/${page.id}`)}
                  className="rounded px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => void handleRenamePage(page)}
                  className="rounded px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  名前変更
                </button>
                <button
                  type="button"
                  disabled={deletingPageId === page.id}
                  onClick={() => void handleDeleteCardPage(page)}
                  className="rounded px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">ページ</h1>
          <p className="mt-1 text-sm text-slate-500">
            単発ページとページ連携をセット単位で管理できます。
          </p>
        </div>
        <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:items-center">
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creating}
            className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto sm:min-h-0"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-lg leading-none">
              +
            </span>
            ページを作成
          </button>
        </div>
      </header>

      <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setViewMode("nodes")}
          className={
            "min-h-[44px] rounded-md px-4 py-2 text-xs font-medium transition sm:min-h-0 sm:px-3 sm:py-1.5 " +
            (viewMode === "nodes" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")
          }
        >
          ノード表示
        </button>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={
            "min-h-[44px] rounded-md px-4 py-2 text-xs font-medium transition sm:min-h-0 sm:px-3 sm:py-1.5 " +
            (viewMode === "table" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")
          }
        >
          テーブル表示
        </button>
      </div>

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
      ) : viewMode === "nodes" ? (
        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">セット {sets.length}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">ページ連携 {linkedCount}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">単発 {singleCount}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">総ページ {pageCount}</span>
          </div>
          {sets.map((set) => renderNodeSet(set))}
        </section>
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
                            <button
                              type="button"
                              onClick={() => void handleRenamePage(page)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              名前変更
                            </button>
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

      {mounted &&
        creating &&
        createPortal(
          <FullScreenLoadingOverlay
            title="作成中…"
            subtitle="新しい案内ページを用意しています"
            classNameZ="z-[90]"
          />,
          document.body
        )}
    </div>
  );
}
