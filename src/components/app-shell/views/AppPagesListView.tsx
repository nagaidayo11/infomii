"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlankPage,
  getDashboardBootstrapData,
  listPagesForHotel,
  PAGE_LIMIT_REACHED,
  deletePage,
  updatePageTitle,
  setInformationStatusBySlug,
  type PageRow,
} from "@/lib/storage";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { PageCard } from "@/components/saas/PageCard";
import { AppEmptyState } from "../AppEmptyState";
import { AppShellLink } from "../AppShellLink";

export function AppPagesListView() {
  const router = useRouter();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [infoBySlug, setInfoBySlug] = useState<
    Map<string, { status?: string; updatedAt?: string }>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const createBusyRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bootstrap, list] = await Promise.all([
        getDashboardBootstrapData(),
        listPagesForHotel(),
      ]);
      setPages(list);
      setInfoBySlug(
        new Map(
          (bootstrap.informations ?? []).map((info) => [
            info.slug,
            { status: info.status, updatedAt: info.updatedAt },
          ]),
        ),
      );
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (createBusyRef.current) return;
    const entered = window.prompt("新しいページ名");
    if (entered == null) return;
    const title = entered.trim();
    if (!title) return;
    createBusyRef.current = true;
    setCreating(true);
    try {
      const id = await createBlankPage(title);
      if (id) router.push(`/editor/${id}`);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === PAGE_LIMIT_REACHED) setPlanLimitModalOpen(true);
      else alert(err.message || "作成に失敗しました");
    } finally {
      createBusyRef.current = false;
      setCreating(false);
    }
  }

  return (
    <div className="app-shell-page-enter mx-auto w-full max-w-lg pb-24">
      <header className="mb-5">
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">作成</h1>
        <p className="mt-2 text-base text-[var(--app-text-muted)]">
          あなたのページ一覧。タップして編集・公開できます。
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="app-shell-skeleton h-24" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <AppEmptyState
          emoji="🖼️"
          title="作品がまだありません"
          description="テンプレから始めるか、新規ページを作成しましょう。"
          action={
            <div className="flex flex-col gap-3">
              <AppShellLink
                href="/templates"
                className="app-touch-btn flex items-center justify-center bg-[var(--app-accent)] font-semibold text-white"
              >
                テンプレートへ
              </AppShellLink>
              <button
                type="button"
                onClick={() => void handleCreate()}
                className="app-touch-btn border border-[var(--app-border)] bg-[var(--app-surface)] font-semibold text-[var(--app-text)]"
              >
                新規作成
              </button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {pages.map((page) => {
            const info = infoBySlug.get(page.slug);
            return (
            <PageCard
              key={page.id}
              id={page.id}
              title={page.title}
              slug={page.slug}
              status={info?.status === "published" ? "published" : "draft"}
              updatedAt={info?.updatedAt ?? new Date().toISOString()}
              publishToggling={togglingId === page.id}
              onDelete={
                deletingId
                  ? undefined
                  : async (id) => {
                      setDeletingId(id);
                      try {
                        await deletePage(id);
                        setPages((prev) => prev.filter((p) => p.id !== id));
                      } finally {
                        setDeletingId(null);
                      }
                    }
              }
              onRename={async (id, nextTitle) => {
                await updatePageTitle(id, nextTitle);
                setPages((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, title: nextTitle } : p)),
                );
              }}
              onTogglePublish={async (id, nextStatus) => {
                const target = pages.find((p) => p.id === id);
                if (!target) return;
                setTogglingId(id);
                try {
                  await setInformationStatusBySlug(target.slug, nextStatus);
                  await load();
                } finally {
                  setTogglingId(null);
                }
              }}
            />
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleCreate()}
        disabled={creating}
        className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--app-accent)] text-2xl font-light text-white shadow-lg active:scale-95 disabled:opacity-60"
        style={{
          right: "1rem",
          bottom: "calc(58px + env(safe-area-inset-bottom, 0px) + 0.75rem)",
        }}
        aria-label="新規ページを作成"
      >
        +
      </button>

      <PlanLimitModal open={planLimitModalOpen} onClose={() => setPlanLimitModalOpen(false)} />
    </div>
  );
}
