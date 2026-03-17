"use client";

import Link from "next/link";
import { buildPublicQrUrl } from "@/lib/storage";
import type { Information } from "@/types/information";

export type DashboardPageTableRow = {
  id: string;
  title: string;
  slug: string;
  /** 直近7日の閲覧数（ページ別） */
  views7d: number;
  status: Information["status"];
};

type DashboardPageTableProps = {
  rows: DashboardPageTableRow[];
  loading?: boolean;
};

/**
 * ページ一覧テーブル
 * 列: ページ名 / 閲覧数 / QRコード / 編集
 */
export function DashboardPageTable({ rows, loading }: DashboardPageTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-ds-border bg-ds-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
      <div className="border-b border-ds-border px-5 py-4">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
          ページ一覧
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          案内ページの閲覧状況とQR・編集へ
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ds-border bg-slate-50/80">
              <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                ページ名
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                閲覧数
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                QRコード
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600">
                編集
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  読み込み中…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  ページがありません。「ページ作成」から追加できます。
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3">
                    <span className="font-medium text-slate-900">
                      {row.title || ""}
                    </span>
                    <span
                      className={
                        "ml-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium " +
                        (row.status === "published"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800")
                      }
                    >
                      {row.status === "published" ? "公開" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {row.views7d}
                    <span className="ml-1 text-xs text-slate-400">（7日）</span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={buildPublicQrUrl(row.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg border border-ds-border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      QRコード生成
                    </a>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/editor/${row.id}`}
                      className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
