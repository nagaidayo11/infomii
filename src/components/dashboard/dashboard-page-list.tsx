"use client";

import Link from "next/link";
import { buildPublicQrUrl } from "@/lib/storage";
import { DashboardCard, DashboardCardHeader } from "./dashboard-card";
import type { Information } from "@/types/information";

export type PageListRow = {
  id: string;
  title: string;
  slug: string;
  views7d: number;
  qrViews7d: number;
  status: Information["status"];
};

type DashboardPageListProps = {
  rows: PageListRow[];
  loading?: boolean;
};

/**
 * Table-style page list: Page name | Views | QR | Edit
 * Stripe-like dense table with hover rows.
 */
export function DashboardPageList({ rows, loading }: DashboardPageListProps) {
  return (
    <DashboardCard padding="none" className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardCardHeader
          title="ページ一覧"
          description="ゲスト向け案内ページの管理"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-medium">ページ名</th>
              <th className="px-4 py-3 font-medium">閲覧（7日）</th>
              <th className="px-4 py-3 font-medium">QRコード</th>
              <th className="px-5 py-3 text-right font-medium">編集</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                  読み込み中…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                  ページがありません。新規作成から追加してください。
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50/80"
                >
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-slate-900">
                        {row.title || "名称未設定"}
                      </span>
                      <span
                        className={
                          "inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium " +
                          (row.status === "published"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800")
                        }
                      >
                        {row.status === "published" ? "公開中" : "下書き"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {row.views7d}
                    <span className="ml-1 text-xs text-slate-400">7日</span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={buildPublicQrUrl(row.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      QRコード生成
                    </a>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/editor/page/${row.id}`}
                      className="inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
