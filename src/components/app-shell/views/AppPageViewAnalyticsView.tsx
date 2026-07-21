"use client";

import type { PageViewAnalytics } from "@/lib/storage";
import {
  formatAnalyticsDayLabel,
  buildAnalyticsDayBuckets,
} from "@/lib/hooks/use-analytics-dashboard";
import { AnalyticsProGate } from "@/components/dashboard/AnalyticsProGate";
import {
  AppFeatureIconAnalytics,
  AppFeatureIconCountry,
  AppFeatureIconDailyChart,
  AppFeatureIconLanguage,
  AppFeatureIconViewsTotal,
} from "../icons/AppFeatureIcons";
import { AppShellLink } from "../AppShellLink";
import { AppMetricTile } from "../primitives/AppMetricTile";
import { AppScreenSection } from "../primitives/AppScreenSection";
import { AppTabPage } from "../primitives/AppTabPage";

export type AppPageViewAnalyticsViewProps = {
  plan: "free" | "pro" | "business";
  data: PageViewAnalytics | null;
  loading: boolean;
  error: string | null;
};

function AppAnalyticsBarRow({
  label,
  count,
  maxCount,
}: {
  label: string;
  count: number;
  maxCount: number;
}) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  return (
    <div className="app-analytics-bar-row">
      <div className="app-analytics-bar-row-label">
        <span className="truncate font-medium text-[var(--app-text)]" title={label}>
          {label || "—"}
        </span>
        <span className="shrink-0 tabular-nums text-[var(--app-text-muted)]">{count}</span>
      </div>
      <div className="app-analytics-bar-track">
        <div className="app-analytics-bar-fill" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
    </div>
  );
}

export function AppPageViewAnalyticsView({ plan, data, loading, error }: AppPageViewAnalyticsViewProps) {
  const byDay = buildAnalyticsDayBuckets(data?.byDay ?? [], 30);
  const byCountry = data?.byCountry ?? [];
  const byLanguage = data?.byLanguage ?? [];
  const maxDay = Math.max(1, ...byDay.map((d) => d.count));
  const maxCountry = Math.max(1, ...byCountry.map((c) => c.count));
  const maxLanguage = Math.max(1, ...byLanguage.map((l) => l.count));

  return (
    <AnalyticsProGate plan={plan}>
      <AppTabPage
        title="詳細ビュー"
        description="直近30日のページビュー内訳"
        className="pb-8"
        contentClassName="app-analytics-page-content space-y-4"
        headerAction={
          <AppShellLink
            href="/dashboard/analytics"
            className="app-pressable rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-accent)]"
          >
            分析へ
          </AppShellLink>
        }
      >
        {error ? (
          <div className="app-shell-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <AppScreenSection title="概要" icon={<AppFeatureIconAnalytics size={22} />} card={false}>
          <div className="app-metric-grid">
            <AppMetricTile
              icon={<AppFeatureIconViewsTotal size={28} />}
              label="総ビュー"
              value={loading ? "—" : (data?.totalViews ?? 0).toLocaleString("ja-JP")}
              sub="直近30日"
            />
          </div>
        </AppScreenSection>

        <AppScreenSection title="日別" icon={<AppFeatureIconDailyChart size={22} />} subtitle="直近30日">
          <div className="app-analytics-section-inner">
            {loading ? (
              <div className="app-shell-skeleton h-36 rounded-xl" aria-hidden />
            ) : byDay.some((d) => d.count > 0) ? (
              <div className="app-analytics-day-chart">
                {byDay.map(({ date, count }) => {
                  const h = maxDay > 0 ? Math.round((count / maxDay) * 100) : 0;
                  return (
                    <div key={date} className="app-analytics-day-col" title={`${date}: ${count}`}>
                      <span className="app-analytics-day-count">{count}</span>
                      <div className="app-analytics-day-bar-wrap">
                        <div
                          className="app-analytics-day-bar"
                          style={{ height: `${Math.max(8, h)}%`, minHeight: count > 0 ? 12 : 4 }}
                        />
                      </div>
                      <span className="app-analytics-day-label">{formatAnalyticsDayLabel(date)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="app-analytics-empty">データがありません</p>
            )}
          </div>
        </AppScreenSection>

        <AppScreenSection title="国別" icon={<AppFeatureIconCountry size={22} />}>
          <div className="app-analytics-section-inner">
            {loading ? (
              <div className="app-shell-skeleton h-32 rounded-xl" aria-hidden />
            ) : byCountry.length > 0 ? (
              byCountry.slice(0, 15).map(({ country, count }) => (
                <AppAnalyticsBarRow key={country} label={country || "不明"} count={count} maxCount={maxCountry} />
              ))
            ) : (
              <p className="app-analytics-empty">データがありません</p>
            )}
          </div>
        </AppScreenSection>

        <AppScreenSection title="言語別" icon={<AppFeatureIconLanguage size={22} />}>
          <div className="app-analytics-section-inner">
            {loading ? (
              <div className="app-shell-skeleton h-32 rounded-xl" aria-hidden />
            ) : byLanguage.length > 0 ? (
              byLanguage.slice(0, 15).map(({ language, count }) => (
                <AppAnalyticsBarRow
                  key={language}
                  label={language || "不明"}
                  count={count}
                  maxCount={maxLanguage}
                />
              ))
            ) : (
              <p className="app-analytics-empty">データがありません</p>
            )}
          </div>
        </AppScreenSection>
      </AppTabPage>
    </AnalyticsProGate>
  );
}
