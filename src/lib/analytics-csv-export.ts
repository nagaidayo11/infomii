import type { HotelViewMetrics, PageViewAnalytics } from "@/lib/storage";

function csvCell(v: string | number): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * 分析ダッシュボード表示データから Business 向け CSV 文字列を生成（UTF-8 BOM 付きで Excel でも開きやすい）
 */
export function buildAnalyticsCsvContent(
  metrics: HotelViewMetrics | null,
  pageViews: PageViewAnalytics | null,
): string {
  const n = (v: string | number) => String(v);
  const rows: string[][] = [];
  rows.push(["Infomii 分析データエクスポート"]);
  rows.push(["出力日時", new Date().toISOString()]);
  rows.push([]);
  rows.push(["サマリー"]);
  rows.push(["項目", "値"]);
  rows.push(["総ページビュー（直近30日）", n(pageViews?.totalViews ?? 0)]);
  rows.push(["7日間の閲覧", n(metrics?.totalViews7d ?? 0)]);
  rows.push(["本日の閲覧", n(metrics?.totalViewsToday ?? 0)]);
  rows.push(["QR経由（7日）", n(metrics?.qrViews7d ?? 0)]);
  rows.push(["QR経由（本日）", n(metrics?.qrViewsToday ?? 0)]);
  rows.push([]);
  rows.push(["日別ビュー"]);
  rows.push(["日付", "閲覧数"]);
  for (const { date, count } of pageViews?.byDay ?? []) {
    rows.push([date, n(count)]);
  }
  rows.push([]);
  rows.push(["国・地域別"]);
  rows.push(["国・地域", "閲覧数"]);
  for (const { country, count } of pageViews?.byCountry ?? []) {
    rows.push([country || "不明", n(count)]);
  }
  rows.push([]);
  rows.push(["言語別"]);
  rows.push(["言語", "閲覧数"]);
  for (const { language, count } of pageViews?.byLanguage ?? []) {
    rows.push([language || "不明", n(count)]);
  }
  rows.push([]);
  rows.push(["人気ページ（直近7日・上位）"]);
  rows.push(["順位", "タイトル", "閲覧", "QR経由"]);
  const top = [...(metrics?.pageStats ?? [])].sort((a, b) => b.views - a.views).slice(0, 50);
  top.forEach((p, i) => {
    rows.push([n(i + 1), p.title, n(p.views), n(p.qrViews)]);
  });

  const body = rows.map((line) => line.map(csvCell).join(",")).join("\r\n");
  return "\uFEFF" + body;
}

export function triggerAnalyticsCsvDownload(
  metrics: HotelViewMetrics | null,
  pageViews: PageViewAnalytics | null,
  filenamePrefix = "infomii-analytics",
): void {
  const csv = buildAnalyticsCsvContent(metrics, pageViews);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `${filenamePrefix}-${stamp}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
