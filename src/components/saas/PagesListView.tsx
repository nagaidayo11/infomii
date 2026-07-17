"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
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
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppPagesListView } from "@/components/app-shell/views/AppPagesListView";
import { PageConnectionSetCard } from "@/components/saas/PageConnectionSetCard";
import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export function PagesListView() {
  const { isAppShell } = useClientShell();
  return isAppShell ? <AppPagesListView /> : <PagesListViewWeb />;
}

function PagesListViewWeb() {
  const router = useRouter();
  const [sets, setSets] = useState<PageConnectionSet[]>([]);
  const [pageFilter, setPageFilter] = useState<"all" | "linked" | "single">("all");
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

  useRouteProgressLoading(loading);

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
    setPublishedCount(
      typeof bootstrap.publishedPageCount === "number"
        ? bootstrap.publishedPageCount
        : (bootstrap.informations ?? []).filter((i) => i.status === "published").length
    );
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
  const visibleSets = useMemo(() => {
    if (pageFilter === "linked") return sets.filter((set) => set.mode === "linked");
    if (pageFilter === "single") return sets.filter((set) => set.mode === "single");
    return sets;
  }, [pageFilter, sets]);

  return (
    <div className="app-main-container space-y-6">
      <header className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="app-page-title">ページ</h1>
          <p className="app-page-subtitle">
            宿泊者向けの案内ページを、連携セットまたは単体ページとして管理します。
          </p>
          {subscription ? (
            <p className="mt-2 text-sm text-slate-500 tabular-nums">
              公開中{" "}
              <span className="font-semibold text-slate-800">
                {publishedCount}/{subscription.plan === "business" ? "∞" : subscription.maxPublishedPages}
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:items-center">
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creating}
            className="app-button-native inline-flex min-h-[40px] w-full shrink-0 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium !text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
          >
            <span className="text-base leading-none">+</span>
            ページを作成
          </button>
          <PageHelp
            className="shrink-0 self-center"
            title={PAGE_HELP.pages.title}
            description={PAGE_HELP.pages.description}
            items={[...PAGE_HELP.pages.items]}
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-[#e6e8eb] bg-white p-0.5">
          {(
            [
              { id: "all", label: "すべて" },
              { id: "linked", label: "宿泊者向け（連携）" },
              { id: "single", label: "単体ページ" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPageFilter(option.id)}
              className={
                "app-button-native min-h-[36px] rounded px-3 py-1.5 text-xs transition " +
                (pageFilter === option.id
                  ? "bg-slate-900 !text-white font-medium"
                  : "text-slate-600 hover:bg-slate-50 font-medium")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <PlanLimitModal
        open={planLimitModalOpen}
        onClose={() => setPlanLimitModalOpen(false)}
        currentPlan={subscription?.plan}
      />

      {!loading && subscription ? (
        <UpgradeCtaBanner
          currentPlan={subscription.plan}
          publishedCount={publishedCount}
          maxPublishedPages={subscription.maxPublishedPages}
        />
      ) : null}

      <GeneratePageFromDescription />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          title="まだページがありません"
          description="テンプレートから始めるか、空白ページを作成すると、ここに連携セットまたは単体ページとして並びます。"
          action={
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
                {creating ? "作成中…" : "空白ページを作成"}
              </button>
            </>
          }
        />
      ) : visibleSets.length === 0 ? (
        <EmptyState
          compact
          title="該当するページがありません"
          description="フィルタを変えるか、新しいページを作成してください。"
          action={
            <button
              type="button"
              onClick={() => setPageFilter("all")}
              className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              すべてを表示
            </button>
          }
        />
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">セット {visibleSets.length}</span>
            <span className="rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
              宿泊者向け・連携 {linkedCount}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">単体 {singleCount}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">総ページ {pageCount}</span>
          </div>
          {visibleSets.map((set) => (
            <PageConnectionSetCard
              key={set.id}
              set={set}
              deletingPageId={deletingPageId}
              onEdit={(page) => router.push(`/editor/${page.id}`)}
              onRename={(page) => void handleRenamePage(page)}
              onDelete={(page) => void handleDeleteCardPage(page)}
            />
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
