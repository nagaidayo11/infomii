"use client";

import { triggerAnalyticsCsvDownload } from "@/lib/analytics-csv-export";
import { AnalyticsProGate } from "@/components/dashboard/AnalyticsProGate";
import {
  formatAnalyticsDayLabel,
  ANALYTICS_DAY_RANGE_OPTIONS,
  type AnalyticsDayRange,
  type useAnalyticsDashboard,
} from "@/lib/hooks/use-analytics-dashboard";
import { AppShellLink } from "../AppShellLink";
import {
  AppFeatureIconAnalytics,
  AppFeatureIconCountry,
  AppFeatureIconDailyChart,
  AppFeatureIconLanguage,
  AppFeatureIconQr,
  AppFeatureIconTopPages,
  AppFeatureIconViewsToday,
  AppFeatureIconViewsTotal,
  AppFeatureIconViewsWeek,
} from "../icons/AppFeatureIcons";
import { AppIconPages } from "../icons/AppIconSet";
import { AppListRow } from "../primitives/AppListRow";
import { AppMetricTile } from "../primitives/AppMetricTile";
import { AppScreenSection } from "../primitives/AppScreenSection";
import { AppSegmentedControl } from "../primitives/AppSegmentedControl";
import { AppTabPage } from "../primitives/AppTabPage";

export type AppAnalyticsViewProps = ReturnType<typeof useAnalyticsDashboard>;

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

export function AppAnalyticsView({
  metrics,
  pageViews,
  dayRange,
  setDayRange,
  loading,
  error,
  plan,
  totalViews,
  todayViews,
  topPages,
  byDay,
  byCountry,
  byLanguage,
  maxDay,
  hasDayData,
  maxCountry,
  maxLanguage,
}: AppAnalyticsViewProps) {

  const headerAction =
    plan === "business" && !loading ? (
      <button
        type="button"
        onClick={() => triggerAnalyticsCsvDownload(metrics, pageViews)}
        className="app-pressable rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)]"
      >
        CSV
      </button>
    ) : null;

  return (
    <AnalyticsProGate plan={plan ?? "free"}>
      <AppTabPage
        title="分析"
        description="ゲストの閲覧の様子を、ざっくり把握できます。"
        className="pb-8"
        contentClassName="app-analytics-page-content space-y-4"
        headerAction={headerAction}
      >
        {error ? (
          <div className="app-shell-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <AppScreenSection
          title="概要"
          icon={<AppFeatureIconAnalytics size={22} />}
          subtitle="直近の閲覧数"
          card={false}
          revealDelay={0}
        >
          <div className="app-metric-grid">
            <AppMetricTile
              icon={<AppFeatureIconViewsTotal size={28} />}
              label="総ビュー"
              value={loading ? "—" : totalViews.toLocaleString("ja-JP")}
              sub="直近30日"
            />
            <AppMetricTile
              icon={<AppFeatureIconViewsToday size={28} />}
              label="本日"
              value={loading ? "—" : todayViews.toLocaleString("ja-JP")}
              sub="今日"
            />
            <AppMetricTile
              icon={<AppFeatureIconViewsWeek size={28} />}
              label="7日間"
              value={loading ? "—" : (metrics?.totalViews7d ?? 0).toLocaleString("ja-JP")}
              sub="直近7日"
            />
            <AppMetricTile
              icon={<AppFeatureIconQr size={28} />}
              label="QR経由"
              value={loading ? "—" : (metrics?.qrViews7d ?? 0).toLocaleString("ja-JP")}
              sub="7日間"
            />
          </div>
        </AppScreenSection>

        <AppScreenSection
          title="日別ビュー"
          icon={<AppFeatureIconDailyChart size={22} />}
          subtitle={`直近${dayRange}日`}
          revealDelay={40}
        >
          <div className="app-analytics-section-inner">
            <AppSegmentedControl
              options={ANALYTICS_DAY_RANGE_OPTIONS.map((days) => ({
                id: String(days),
                label: `${days}日`,
              }))}
              value={String(dayRange)}
              onChange={(id) => setDayRange(Number(id) as AnalyticsDayRange)}
              ariaLabel="表示期間"
              className="mb-3"
            />
            {loading ? (
              <div className="app-shell-skeleton h-36 rounded-xl" aria-hidden />
            ) : hasDayData ? (
              <div className="app-analytics-day-chart">
                {byDay.map(({ date, count }) => {
                  const h = maxDay > 0 ? Math.round((count / maxDay) * 100) : 0;
                  return (
                    <div key={date} className="app-analytics-day-col" title={`${date}: ${count} 回`}>
                      <span className="app-analytics-day-count">{count}</span>
                      <div className="app-analytics-day-bar-wrap">
                        <div
                          className="app-analytics-day-bar"
                          style={{
                            height: `${Math.max(8, h)}%`,
                            minHeight: count > 0 ? 12 : 4,
                          }}
                        />
                      </div>
                      <span className="app-analytics-day-label">{formatAnalyticsDayLabel(date)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="app-analytics-empty">まだデータがありません</p>
            )}
          </div>
        </AppScreenSection>

        <AppScreenSection
          title="国別"
          icon={<AppFeatureIconCountry size={22} />}
          subtitle="アクセス元の国・地域"
          revealDelay={80}
        >
          <div className="app-analytics-section-inner">
            {loading ? (
              <div className="app-shell-skeleton h-32 rounded-xl" aria-hidden />
            ) : byCountry.length > 0 ? (
              byCountry.slice(0, 10).map(({ country, count }) => (
                <AppAnalyticsBarRow key={country} label={country || "不明"} count={count} maxCount={maxCountry} />
              ))
            ) : (
              <p className="app-analytics-empty">データがありません</p>
            )}
          </div>
        </AppScreenSection>

        <AppScreenSection
          title="言語別"
          icon={<AppFeatureIconLanguage size={22} />}
          subtitle="ブラウザの言語設定"
          revealDelay={120}
        >
          <div className="app-analytics-section-inner">
            {loading ? (
              <div className="app-shell-skeleton h-32 rounded-xl" aria-hidden />
            ) : byLanguage.length > 0 ? (
              byLanguage.slice(0, 10).map(({ language, count }) => (
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

        <AppScreenSection
          title="人気ページ"
          icon={<AppFeatureIconTopPages size={22} />}
          subtitle="閲覧数が多いページ（直近7日）"
          revealDelay={160}
        >
          {loading ? (
            <div className="app-analytics-section-inner">
              <div className="app-shell-skeleton h-14 rounded-xl" aria-hidden />
            </div>
          ) : topPages.length > 0 ? (
            <div>
              {topPages.map((page, index) => (
                <AppListRow
                  key={page.informationId}
                  href={`/editor/${page.informationId}`}
                  title={page.title}
                  subtitle={`${page.views.toLocaleString("ja-JP")} 回 · ${index + 1}位`}
                  leading={<AppIconPages size={22} />}
                />
              ))}
              <div className="border-t border-[var(--app-border)] px-4 py-3">
                <AppShellLink
                  href="/dashboard/pages"
                  className="app-pressable text-sm font-semibold text-[var(--app-accent)]"
                >
                  ページ一覧を見る
                </AppShellLink>
              </div>
            </div>
          ) : (
            <div className="app-analytics-section-inner">
              <p className="app-analytics-empty">まだデータがありません</p>
            </div>
          )}
        </AppScreenSection>
      </AppTabPage>
    </AnalyticsProGate>
  );
}
