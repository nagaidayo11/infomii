"use client";

import type { HotelViewMetrics, QrScanDayBucket, SubscriptionPlan } from "@/lib/storage";
import type { Information } from "@/types/information";
import { QrCharts } from "@/components/qr-management/QrCharts";
import { QrPageRow } from "@/components/qr-management/QrPageRow";
import { AppFeatureIconQr, AppFeatureIconTopPages } from "../icons/AppFeatureIcons";
import { AppShellLink } from "../AppShellLink";
import { AppMetricTile } from "../primitives/AppMetricTile";
import { AppScreenSection } from "../primitives/AppScreenSection";
import { AppTabPage } from "../primitives/AppTabPage";
import { AppEmptyState } from "../AppEmptyState";
import { AppIconEmptyPages } from "../icons/AppIconSet";

export type AppQrManagementViewProps = {
  informations: Information[];
  metrics: HotelViewMetrics | null;
  daily: QrScanDayBucket[];
  plan: SubscriptionPlan | null;
  loading: boolean;
  error: string | null;
};

export function AppQrManagementView({
  informations,
  metrics,
  daily,
  plan,
  loading,
  error,
}: AppQrManagementViewProps) {
  const pageStatsMap = new Map((metrics?.pageStats ?? []).map((p) => [p.informationId, p]));
  const topQrPage = (metrics?.pageStats ?? [])
    .filter((p) => p.qrViews > 0)
    .sort((a, b) => b.qrViews - a.qrViews)[0];

  return (
    <AppTabPage
      title="QR"
      description="ゲストページ用 QR の発行とスキャン分析"
      className="pb-8"
      contentClassName="app-qr-page-content space-y-4"
      headerAction={
        <AppShellLink
          href="/dashboard/qr-generator"
          className="app-pressable rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-accent)]"
        >
          作成・印刷
        </AppShellLink>
      }
    >
      {error ? (
        <div className="app-shell-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {!loading ? (
        <AppScreenSection title="概要" icon={<AppFeatureIconQr size={22} />} card={false}>
          <div className="app-metric-grid">
            <AppMetricTile
              icon={<AppFeatureIconQr size={28} />}
              label="QRスキャン"
              value={(metrics?.qrViews7d ?? 0).toLocaleString("ja-JP")}
              sub="直近7日"
            />
            <AppMetricTile
              icon={<AppFeatureIconTopPages size={28} />}
              label="最多ページ"
              value={topQrPage?.qrViews ?? 0}
              sub={topQrPage?.title?.trim() || "—"}
            />
          </div>
        </AppScreenSection>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <div className="app-shell-skeleton h-40 rounded-2xl" aria-hidden />
          <div className="app-shell-skeleton h-32 rounded-2xl" aria-hidden />
        </div>
      ) : (
        <>
          <AppScreenSection title="スキャン推移" icon={<AppFeatureIconQr size={22} />} subtitle="直近7日">
            <div className="app-analytics-section-inner">
              <QrCharts
                daily={daily}
                qrScans7d={metrics?.qrViews7d ?? 0}
                mostViewedTitle={topQrPage?.title ?? null}
                mostViewedQrCount={topQrPage?.qrViews ?? 0}
                chartOnly
              />
            </div>
          </AppScreenSection>

          <AppScreenSection
            title="ページ別 QR"
            icon={<AppFeatureIconTopPages size={22} />}
            subtitle="表示 · PNG保存 · 印刷 · URLコピー"
          >
            {informations.length === 0 ? (
              <AppEmptyState
                icon={<AppIconEmptyPages />}
                title="ページがありません"
                description="ホームやテンプレートから案内ページを作成してください。"
                action={
                  <AppShellLink href="/dashboard" className="app-touch-btn-primary app-pressable font-semibold !text-white">
                    ホームへ
                  </AppShellLink>
                }
              />
            ) : (
              <div className="app-qr-page-list app-analytics-section-inner space-y-3">
                {informations.map((info) => {
                  const stat = pageStatsMap.get(info.id);
                  return (
                    <QrPageRow
                      key={info.id}
                      title={stat?.title || info.title}
                      slug={info.slug}
                      qrScans7d={stat?.qrViews ?? 0}
                      plan={plan}
                    />
                  );
                })}
              </div>
            )}
          </AppScreenSection>
        </>
      )}
    </AppTabPage>
  );
}
