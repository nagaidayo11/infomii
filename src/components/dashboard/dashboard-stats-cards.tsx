"use client";

/**
 * ダッシュボード上部の統計カード（3枚）
 * 今週QRスキャン / 公開ページ数 / 今日の閲覧数
 */
type DashboardStatsCardsProps = {
  qrScansWeek: number;
  publishedCount: number;
  viewsToday: number;
  loading?: boolean;
};

export function DashboardStatsCards({
  qrScansWeek,
  publishedCount,
  viewsToday,
  loading,
}: DashboardStatsCardsProps) {
  const cards = [
    {
      label: "今週QRスキャン",
      value: qrScansWeek,
      sub: "直近7日のQR経由アクセス",
    },
    {
      label: "公開ページ数",
      value: publishedCount,
      sub: "ゲストに公開中のページ",
    },
    {
      label: "今日の閲覧数",
      value: viewsToday,
      sub: "本日の全ページ合計",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-ds-border bg-ds-card px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          {loading ? (
            <div className="mt-2 h-9 w-16 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
              {card.value}
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
