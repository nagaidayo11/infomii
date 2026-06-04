"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import { useAuth } from "@/components/auth-provider";
import {
  deletePage,
  getCurrentHotelViewMetrics,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPagesForHotel,
  type DashboardBootstrapData,
  type PageRow,
} from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { displayNamesEquivalent, formatDisplayNameWithSan } from "@/lib/user-label";
import { AppWorksList, AppWorksListItemMotion } from "../AppWorksList";
import { AppWorksListItem } from "../AppWorksListItem";
import { AppEmptyState } from "../AppEmptyState";
import { AppShellLink } from "../AppShellLink";
import { AppListRow } from "../primitives/AppListRow";
import { AppSection } from "../primitives/AppSection";
import { useAppToast } from "../AppToastProvider";

export function AppDashboardView() {
  const { user } = useAuth();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [totalViews7d, setTotalViews7d] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteBusyRef = useRef(false);
  const { showToast } = useAppToast();

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

  useEffect(() => {
    if (!user?.id) {
      setProfileDisplayName(null);
      setProfileLoaded(true);
      return;
    }
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setProfileLoaded(true);
      return;
    }
    let active = true;
    setProfileLoaded(false);
    void (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!active) return;
        setProfileDisplayName(data?.display_name ?? null);
      } finally {
        if (active) setProfileLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const displayName = profileDisplayName?.trim() ?? "";
  const greetingName = displayName ? formatDisplayNameWithSan(displayName) : null;
  const workspaceName = bootstrap?.hotelName?.trim();
  const showWorkspaceName =
    profileLoaded &&
    Boolean(displayName) &&
    Boolean(workspaceName) &&
    workspaceName !== "Infomii" &&
    workspaceName !== "マイワークスペース" &&
    !displayNamesEquivalent(workspaceName, displayName) &&
    !displayNamesEquivalent(workspaceName, greetingName);

  const infoBySlug = new Map((bootstrap?.informations ?? []).map((info) => [info.slug, info]));
  const recent = pages.slice(0, 4);
  const publishedCount = (bootstrap?.informations ?? []).filter((i) => i.status === "published").length;

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
    <div className="mx-auto w-full max-w-lg space-y-5 pb-4">
      {profileLoaded && greetingName ? (
        <header className="app-reveal">
          {showWorkspaceName ? (
            <p className="text-sm font-medium text-[var(--app-text-muted)]">{workspaceName}</p>
          ) : null}
          <h1
            className={
              (showWorkspaceName ? "mt-1 " : "") +
              "text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--app-text)]"
            }
          >
            {greetingName}
          </h1>
        </header>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <div className="app-shell-skeleton h-40 rounded-2xl" />
          <div className="app-shell-skeleton h-24 rounded-2xl" />
          <div className="app-shell-skeleton h-20 rounded-2xl" />
        </div>
      ) : (
        <>
          {canEdit ? (
            <AppSection revealDelay={0}>
              <div className="app-shell-hero p-4">
                <GeneratePageFromDescription variant="app" className="mb-0" />
              </div>
            </AppSection>
          ) : null}

          <AppSection revealDelay={70}>
            <section className="app-shell-card overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-[var(--app-border)]">
                <div className="p-4 text-center">
                  <p className="app-stat-value">{totalViews7d}</p>
                  <p className="app-meta mt-1">閲覧（7日）</p>
                </div>
                <div className="p-4 text-center">
                  <p className="app-stat-value">{publishedCount}</p>
                  <p className="app-meta mt-1">公開中</p>
                </div>
              </div>
              <AppListRow
                href="/dashboard/analytics"
                title="詳しい分析を見る"
                subtitle="ページ別の閲覧数とQRの状況"
              />
            </section>
          </AppSection>

          <AppSection revealDelay={140}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[var(--app-text)]">最近の作品</h2>
              <AppShellLink
                href="/dashboard/pages"
                className="app-pressable min-h-0 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--app-accent)]"
              >
                すべて
              </AppShellLink>
            </div>

            {recent.length === 0 ? (
              <div className="mt-3">
                <AppEmptyState
                  emoji="📄"
                  title="まだ作品がありません"
                  description="AIでつくるか、テンプレートタブから始めるとここに表示されます。"
                  action={
                    <AppShellLink
                      href="/templates"
                      className="app-touch-btn app-touch-btn-primary app-pressable flex items-center justify-center bg-[var(--app-accent)] font-semibold !text-white"
                    >
                      テンプレートを見る
                    </AppShellLink>
                  }
                />
              </div>
            ) : (
              <AppWorksList className="mt-3">
                {recent.map((item, index) => {
                  const info = infoBySlug.get(item.slug);
                  return (
                    <AppWorksListItemMotion key={item.id} index={index}>
                      <AppWorksListItem
                        id={item.id}
                        title={item.title}
                        slug={item.slug}
                        status={info?.status === "published" ? "published" : "draft"}
                        updatedAt={info?.updatedAt ?? new Date().toISOString()}
                        showPublishSwitch={false}
                        deleting={deletingId === item.id}
                        onDelete={canEdit ? () => void handleDelete(item) : undefined}
                      />
                    </AppWorksListItemMotion>
                  );
                })}
              </AppWorksList>
            )}
          </AppSection>
        </>
      )}
    </div>
  );
}
