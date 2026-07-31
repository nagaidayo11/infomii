"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlankPage,
  createStampPage,
  deletePage,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPageConnectionSetsForHotel,
  PAGE_LIMIT_REACHED,
  setInformationStatusBySlug,
  publishStampProgram,
  type PageConnectionSet,
  type PageRow,
} from "@/lib/storage";
import { planHasStampCards, resolvePlanTierFromSubscription } from "@/lib/plan-limits";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { AppPageSetsList } from "../AppPageSetsList";
import { APP_PAGES_TAB_LABEL } from "@/lib/app-branding";
import { AppEmptyState } from "../AppEmptyState";
import { AppIconEmptyPages } from "../icons/AppIconSet";
import { AppShellLink } from "../AppShellLink";
import { AppTabPage } from "../primitives/AppTabPage";
import { useAppToast } from "../AppToastProvider";
import { useAppDialog } from "../AppDialogProvider";
import { AppFabPortal } from "../AppFabPortal";
import { APP_SCROLL_WITH_FAB_PADDING } from "../app-tab-metrics";
import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";
import {
  getPagesListViewCache,
  setPagesListViewCache,
} from "@/lib/session-resume-cache";

const APP_PAGES_LOAD_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function AppPagesListView() {
  const router = useRouter();
  const initialCache = getPagesListViewCache();
  const [sets, setSets] = useState<PageConnectionSet[]>(initialCache?.sets ?? []);
  const [infoBySlug, setInfoBySlug] = useState<
    Map<string, { status?: string; updatedAt?: string }>
  >(initialCache?.infoBySlug ?? new Map());
  const [loading, setLoading] = useState(!initialCache);
  const [creating, setCreating] = useState(false);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "pro" | "business" | null>(
    null,
  );
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(
    initialCache?.role ?? null,
  );
  const createBusyRef = useRef(false);
  const deleteBusyRef = useRef(false);
  const { showToast } = useAppToast();
  const { confirm, prompt } = useAppDialog();

  const canEdit = role === "owner" || role === "admin" || role === "editor";
  const pageCount = sets.reduce((acc, set) => acc + set.pageCount, 0);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const hasCache = Boolean(getPagesListViewCache());
    if (!opts?.silent && !hasCache) {
      setLoading(true);
    }
    try {
      const [bootstrap, connectionSets, r] = await withTimeout(
        Promise.all([
          getDashboardBootstrapData(),
          listPageConnectionSetsForHotel().catch(() => []),
          getCurrentUserHotelRole().catch(() => null),
        ]),
        APP_PAGES_LOAD_TIMEOUT_MS,
      );
      const nextInfoBySlug = new Map(
        (bootstrap.informations ?? []).map((info) => [
          info.slug,
          { status: info.status, updatedAt: info.updatedAt },
        ]),
      );
      setRole(r);
      setSubscriptionPlan(
        bootstrap.subscription
          ? resolvePlanTierFromSubscription(bootstrap.subscription.plan)
          : null,
      );
      setSets(connectionSets);
      setInfoBySlug(nextInfoBySlug);
      setPagesListViewCache({
        sets: connectionSets,
        infoBySlug: nextInfoBySlug,
        role: r,
      });
    } catch {
      if (!getPagesListViewCache()) {
        setSets([]);
        setInfoBySlug(new Map());
        setRole(null);
        setSubscriptionPlan(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  async function handleCreate() {
    if (createBusyRef.current) return;
    const entered = await prompt({
      title: "新しい作品",
      message: "作りたい作品の名前を入力してください",
      placeholder: "例: 京都2泊3日のしおり",
      confirmLabel: "作成",
    });
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
      else showToast(err.message || "作成に失敗しました", "error");
    } finally {
      createBusyRef.current = false;
      setCreating(false);
    }
  }

  async function handleCreateStamp() {
    if (createBusyRef.current) return;
    if (subscriptionPlan && !planHasStampCards(subscriptionPlan)) {
      showToast("スタンプカードはBusinessプランでご利用いただけます", "error");
      return;
    }
    const entered = await prompt({
      title: "スタンプカード",
      message: "カード名を入力してください",
      placeholder: "例: リピートスタンプ",
      confirmLabel: "作成",
      defaultValue: "スタンプカード",
    });
    if (entered == null) return;
    const title = entered.trim() || "スタンプカード";
    createBusyRef.current = true;
    setCreating(true);
    try {
      const id = await createStampPage(title);
      if (id) router.push(`/editor/stamp/${id}`);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === PAGE_LIMIT_REACHED) setPlanLimitModalOpen(true);
      else showToast(err.message || "作成に失敗しました", "error");
    } finally {
      createBusyRef.current = false;
      setCreating(false);
    }
  }

  async function handleTogglePublish(id: string, nextStatus: "draft" | "published") {
    const target = sets.flatMap((s) => s.pages).find((p) => p.id === id);
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
      if (target.kind === "stamp") {
        await publishStampProgram(target.id, nextStatus === "published");
      } else {
        await setInformationStatusBySlug(target.slug, nextStatus);
      }
      showToast(
        nextStatus === "published" ? "公開しました" : "下書きに戻しました",
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
    const ok = await confirm({
      title: "作品を削除",
      message: `${page.title?.trim() ? `「${page.title}」を` : "この作品を"}削除しますか？\n削除すると元に戻せません。`,
      confirmLabel: "削除",
      destructive: true,
    });
    if (!ok) return;
    deleteBusyRef.current = true;
    setDeletingId(page.id);
    try {
      await deletePage(page.id);
      await load();
      showToast("削除しました", "success");
    } catch (e) {
      showToast((e as Error).message || "削除に失敗しました", "error");
    } finally {
      setDeletingId(null);
      deleteBusyRef.current = false;
    }
  }

  return (
    <AppTabPage
      title={APP_PAGES_TAB_LABEL}
      description={loading ? undefined : `${pageCount}件`}
      className="app-pages-tab"
      contentClassName="app-reveal"
      style={{ paddingBottom: APP_SCROLL_WITH_FAB_PADDING }}
      headerAction={
        <div className="flex items-center gap-2">
          {!loading && pageCount > 0 ? (
            <button
              type="button"
              onClick={() => void load({ silent: true })}
              className="app-pressable ui-pop-tap rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-text)]"
              aria-label="一覧を更新"
            >
              更新
            </button>
          ) : null}
          <PageHelp
            title={PAGE_HELP.pages.title}
            description={PAGE_HELP.pages.description}
            items={[...PAGE_HELP.pages.items]}
          />
        </div>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="app-shell-skeleton h-[5.5rem] rounded-2xl" />
          ))}
        </div>
      ) : pageCount === 0 ? (
        <AppEmptyState
          icon={<AppIconEmptyPages />}
          title="作品がまだありません"
          description="AIで作るか、テンプレートから始めると、ここに並びます。"
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
                空の作品から作る
              </button>
              <button
                type="button"
                onClick={() => void handleCreateStamp()}
                className="app-touch-btn app-pressable border border-teal-200 bg-teal-50 font-semibold text-teal-900"
              >
                スタンプカードを作成
              </button>
            </div>
          }
        />
      ) : (
        <AppPageSetsList
          sets={sets}
          infoBySlug={infoBySlug}
          togglingId={togglingId}
          deletingId={deletingId}
          canEdit={canEdit}
          onTogglePublish={handleTogglePublish}
          onDelete={(page) => void handleDelete(page)}
        />
      )}

      <AppFabPortal onClick={() => void handleCreate()} disabled={creating} />

      <PlanLimitModal open={planLimitModalOpen} onClose={() => setPlanLimitModalOpen(false)} />
    </AppTabPage>
  );
}
