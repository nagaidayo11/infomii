"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlankPage,
  deletePage,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPagesForHotel,
  PAGE_LIMIT_REACHED,
  setInformationStatusBySlug,
  type PageRow,
} from "@/lib/storage";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { AppWorksList, AppWorksListItemMotion } from "../AppWorksList";
import { AppWorksListItem } from "../AppWorksListItem";
import { AppEmptyState } from "../AppEmptyState";
import { AppShellLink } from "../AppShellLink";
import { useAppToast } from "../AppToastProvider";
import { AppFabPortal } from "../AppFabPortal";
import { APP_SCROLL_WITH_FAB_PADDING } from "../app-tab-metrics";

export function AppPagesListView() {
  const router = useRouter();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [infoBySlug, setInfoBySlug] = useState<
    Map<string, { status?: string; updatedAt?: string }>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const createBusyRef = useRef(false);
  const deleteBusyRef = useRef(false);
  const { showToast } = useAppToast();

  const canEdit = role === "owner" || role === "admin" || role === "editor";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bootstrap, list, r] = await Promise.all([
        getDashboardBootstrapData(),
        listPagesForHotel(),
        getCurrentUserHotelRole().catch(() => null),
      ]);
      setRole(r);
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

  async function handleTogglePublish(id: string, nextStatus: "draft" | "published") {
    const target = pages.find((p) => p.id === id);
    if (!target) return;

    const prev = infoBySlug.get(target.slug);
    setInfoBySlug((map) => {
      const next = new Map(map);
      next.set(target.slug, {
        ...prev,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
      return next;
    });
    setTogglingId(id);

    try {
      await setInformationStatusBySlug(target.slug, nextStatus);
      showToast(
        nextStatus === "published" ? "ゲストに公開しました" : "非公開にしました",
        "success",
      );
    } catch (e) {
      setInfoBySlug((map) => {
        const next = new Map(map);
        if (prev) next.set(target.slug, prev);
        else next.delete(target.slug);
        return next;
      });
      showToast((e as Error).message || "公開状態の変更に失敗しました", "error");
    } finally {
      setTogglingId(null);
    }
  }

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
      setInfoBySlug((map) => {
        const next = new Map(map);
        next.delete(page.slug);
        return next;
      });
      showToast("削除しました", "success");
    } catch (e) {
      showToast((e as Error).message || "削除に失敗しました", "error");
    } finally {
      setDeletingId(null);
      deleteBusyRef.current = false;
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg" style={{ paddingBottom: APP_SCROLL_WITH_FAB_PADDING }}>
      <header className="app-screen-header app-reveal">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">作品</h1>
            <p className="app-screen-header-desc text-base text-[var(--app-text-muted)]">
              カードをタップで編集。公開スイッチでゲストへの表示を切り替えられます。
            </p>
          </div>
          {!loading && pages.length > 0 ? (
            <button
              type="button"
              onClick={() => void load()}
              className="app-pressable ui-pop-tap shrink-0 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-text)]"
              aria-label="一覧を更新"
            >
              更新
            </button>
          ) : null}
        </div>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="app-shell-skeleton h-[7.25rem] rounded-2xl" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <AppEmptyState
          title="作品がまだありません"
          description="ホームのAIやテンプレートタブから作ると、ここに並びます。"
          action={
            <div className="flex flex-col gap-3">
              <AppShellLink
                href="/templates"
                className="app-touch-btn app-touch-btn-primary app-pressable flex items-center justify-center bg-[var(--app-accent)] font-semibold !text-white no-underline hover:!text-white"
              >
                テンプレートへ
              </AppShellLink>
              <button
                type="button"
                onClick={() => void handleCreate()}
                className="app-touch-btn app-pressable border border-[var(--app-border)] bg-[var(--app-surface)] font-semibold text-[var(--app-text)]"
              >
                新規作成
              </button>
            </div>
          }
        />
      ) : (
        <AppWorksList>
          {pages.map((page, index) => {
            const info = infoBySlug.get(page.slug);
            return (
              <AppWorksListItemMotion key={page.id} index={index}>
                <AppWorksListItem
                  id={page.id}
                  title={page.title}
                  slug={page.slug}
                  status={info?.status === "published" ? "published" : "draft"}
                  updatedAt={info?.updatedAt ?? new Date().toISOString()}
                  publishToggling={togglingId === page.id}
                  deleting={deletingId === page.id}
                  onTogglePublish={canEdit ? handleTogglePublish : undefined}
                  onDelete={canEdit ? () => void handleDelete(page) : undefined}
                />
              </AppWorksListItemMotion>
            );
          })}
        </AppWorksList>
      )}

      <AppFabPortal onClick={() => void handleCreate()} disabled={creating} />

      <PlanLimitModal open={planLimitModalOpen} onClose={() => setPlanLimitModalOpen(false)} />
    </div>
  );
}
