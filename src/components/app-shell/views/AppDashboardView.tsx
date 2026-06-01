"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlankPage,
  getCurrentHotelViewMetrics,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPagesForHotel,
  PAGE_LIMIT_REACHED,
  type DashboardBootstrapData,
  type PageRow,
} from "@/lib/storage";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { PageCard } from "@/components/saas/PageCard";
import { AppEmptyState } from "../AppEmptyState";
import { AppOnboardingTour } from "../AppOnboardingTour";
import { AppShellLink } from "../AppShellLink";

export function AppDashboardView() {
  const router = useRouter();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(null);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [totalViews7d, setTotalViews7d] = useState(0);
  const createBusyRef = useRef(false);

  const canEdit = role === "owner" || role === "admin" || role === "editor";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, r, pageResult, metrics] = await Promise.all([
        getDashboardBootstrapData(),
        getCurrentUserHotelRole().catch(() => null),
        listPagesForHotel()
          .then((p) => ({ ok: true as const, pages: p }))
          .catch(() => ({ ok: false as const, pages: [] as PageRow[] })),
        getCurrentHotelViewMetrics().catch(() => null),
      ]);
      setBootstrap(b);
      setRole(r);
      if (pageResult.ok) setPages(pageResult.pages);
      setTotalViews7d(metrics?.totalViews7d ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreatePage() {
    if (createBusyRef.current || !canEdit) return;
    const entered = window.prompt("新しいページ名");
    if (entered == null) return;
    const title = entered.trim();
    if (!title) return;
    createBusyRef.current = true;
    setCreating(true);
    try {
      const pageId = await createBlankPage(title);
      if (pageId) router.push(`/editor/${pageId}`);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === PAGE_LIMIT_REACHED) setPlanLimitModalOpen(true);
      else alert(err.message || "作成に失敗しました");
    } finally {
      createBusyRef.current = false;
      setCreating(false);
    }
  }

  const infoBySlug = new Map((bootstrap?.informations ?? []).map((info) => [info.slug, info]));
  const recent = pages.slice(0, 4);
  const publishedCount = (bootstrap?.informations ?? []).filter((i) => i.status === "published").length;

  return (
    <div className="app-shell-page-enter mx-auto w-full max-w-lg space-y-5 pb-4">
      <AppOnboardingTour />

      <header>
        <p className="text-sm font-medium text-[var(--app-text-muted)]">
          {bootstrap?.hotelName ?? "マイワークスペース"}
        </p>
        <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--app-text)]">
          こんにちは 👋
        </h1>
        <p className="mt-2 text-base text-[var(--app-text-muted)]">
          つくって、友だちにシェア。今日からはじめましょう。
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="app-shell-skeleton h-32" />
          <div className="app-shell-skeleton h-24" />
          <div className="app-shell-skeleton h-20" />
        </div>
      ) : (
        <>
          <section className="app-shell-hero p-5">
            <p className="text-sm font-semibold text-[var(--app-accent)]">クイックスタート</p>
            <div className="mt-4 flex flex-col gap-3">
              {canEdit ? (
                <>
                  <AppShellLink
                    href="/templates"
                    className="app-touch-btn flex items-center justify-center bg-[var(--app-accent)] font-semibold text-white"
                  >
                    テンプレートから作成
                  </AppShellLink>
                  <button
                    type="button"
                    onClick={() => void handleCreatePage()}
                    disabled={creating}
                    className="app-touch-btn border border-[var(--app-border)] bg-[var(--app-surface)] font-semibold text-[var(--app-text)] disabled:opacity-50"
                  >
                    {creating ? "作成中…" : "白紙でページを作る"}
                  </button>
                </>
              ) : (
                <p className="text-sm text-[var(--app-text-muted)]">閲覧のみの権限です</p>
              )}
            </div>
          </section>

          <section className="app-shell-card p-4">
            <p className="text-sm font-semibold text-[var(--app-text-muted)]">今週のざっくり</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--app-surface-muted)] p-3">
                <p className="text-2xl font-bold text-[var(--app-text)]">{totalViews7d}</p>
                <p className="text-sm text-[var(--app-text-muted)]">閲覧（7日）</p>
              </div>
              <div className="rounded-xl bg-[var(--app-surface-muted)] p-3">
                <p className="text-2xl font-bold text-[var(--app-text)]">{publishedCount}</p>
                <p className="text-sm text-[var(--app-text-muted)]">公開中</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[var(--app-text)]">最近の作品</h2>
              <AppShellLink
                href="/dashboard/pages"
                className="text-sm font-semibold text-[var(--app-accent)]"
              >
                すべて
              </AppShellLink>
            </div>

            {recent.length === 0 ? (
              <div className="mt-3">
                <AppEmptyState
                  emoji="📄"
                  title="まだ作品がありません"
                  description="テンプレートを選ぶか、白紙から1ページ作るとここに表示されます。"
                  action={
                    <AppShellLink
                      href="/templates"
                      className="app-touch-btn flex items-center justify-center bg-[var(--app-accent)] font-semibold text-white"
                    >
                      テンプレートを見る
                    </AppShellLink>
                  }
                />
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {recent.map((item) => {
                  const info = infoBySlug.get(item.slug);
                  return (
                    <PageCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      slug={item.slug}
                      status={info?.status === "published" ? "published" : "draft"}
                      updatedAt={info?.updatedAt ?? new Date().toISOString()}
                      canEdit={canEdit}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <PlanLimitModal
        open={planLimitModalOpen}
        onClose={() => setPlanLimitModalOpen(false)}
        currentPlan={bootstrap?.subscription?.plan}
      />
    </div>
  );
}
