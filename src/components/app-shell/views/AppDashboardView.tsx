"use client";

import { useCallback, useEffect, useState } from "react";
import { GeneratePageFromDescription } from "@/components/ai/GeneratePageFromDescription";
import { useAuth } from "@/components/auth-provider";
import {
  getCurrentHotelViewMetrics,
  getCurrentUserHotelRole,
  getDashboardBootstrapData,
  listPagesForHotel,
  type DashboardBootstrapData,
  type PageRow,
} from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { displayNamesEquivalent, formatDisplayNameWithSan } from "@/lib/user-label";
import { PageCard } from "@/components/saas/PageCard";
import { AppEmptyState } from "../AppEmptyState";
import { AppOnboardingTour } from "../AppOnboardingTour";
import { AppShellLink } from "../AppShellLink";

export function AppDashboardView() {
  const { user } = useAuth();
  const [bootstrap, setBootstrap] = useState<DashboardBootstrapData | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [totalViews7d, setTotalViews7d] = useState(0);

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
      return;
    }
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;
    let active = true;
    void supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfileDisplayName(data?.display_name ?? null);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const userNameBase = profileDisplayName ?? user?.email?.split("@")[0] ?? null;
  const greetingName = formatDisplayNameWithSan(userNameBase);
  const workspaceName = bootstrap?.hotelName?.trim();
  const showWorkspaceName =
    Boolean(workspaceName) &&
    workspaceName !== "Infomii" &&
    workspaceName !== "マイワークスペース" &&
    !displayNamesEquivalent(workspaceName, userNameBase) &&
    !displayNamesEquivalent(workspaceName, greetingName);

  const infoBySlug = new Map((bootstrap?.informations ?? []).map((info) => [info.slug, info]));
  const recent = pages.slice(0, 4);
  const publishedCount = (bootstrap?.informations ?? []).filter((i) => i.status === "published").length;

  return (
    <div className="app-shell-page-enter mx-auto w-full max-w-lg space-y-5 pb-4">
      <AppOnboardingTour />

      <header>
        {showWorkspaceName && (
          <p className="text-sm font-medium text-[var(--app-text-muted)]">{workspaceName}</p>
        )}
        <h1
          className={
            (showWorkspaceName ? "mt-1 " : "") +
            "text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--app-text)]"
          }
        >
          {greetingName}
        </h1>
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="app-shell-skeleton h-32" />
          <div className="app-shell-skeleton h-24" />
          <div className="app-shell-skeleton h-20" />
        </div>
      ) : (
        <>
          {canEdit && <GeneratePageFromDescription variant="app" />}

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
                  description="AIでつくるか、テンプレートタブから始めるとここに表示されます。"
                  action={
                    <AppShellLink
                      href="/templates"
                      className="app-touch-btn app-touch-btn-primary flex items-center justify-center bg-[var(--app-accent)] font-semibold !text-white"
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
    </div>
  );
}
