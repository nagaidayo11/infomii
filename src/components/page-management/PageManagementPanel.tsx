"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import {
  buildPublicQrUrl,
  createBlankInformation,
  deleteInformation,
  getDashboardBootstrapData,
} from "@/lib/storage";
import type { Information } from "@/types/information";
import { TemplateGallery } from "@/components/template-gallery-ui";
import { AIPageGenerator } from "@/components/ai-page-generator";

/**
 * ページ管理 — ゲスト向け案内ページの一覧・新規・削除
 * UIは日本語のみ
 */
export function PageManagementPanel() {
  const router = useRouter();
  const [items, setItems] = useState<Information[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boot = await getDashboardBootstrapData();
      setItems(boot.informations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onNewPage() {
    setCreating(true);
    setError(null);
    try {
      const id = await createBlankInformation("新規ページ");
      await load();
      router.push(`/editor/page/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "新規作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(item: Information) {
    const ok = window.confirm(
      `「${item.title || "名称未設定"}」を削除しますか？\n取り消しはできません。`
    );
    if (!ok) return;
    setDeletingId(item.id);
    setError(null);
    try {
      await deleteInformation(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-ds-bg px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* ヘッダー + 新規 */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ページ管理
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                ゲスト向け案内ページの一覧と操作
              </p>
            </div>
            <button
              type="button"
              disabled={creating}
              onClick={() => void onNewPage()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              <span className="text-lg leading-none">+</span>
              新規ページ
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mb-10">
            <AIPageGenerator onCreated={() => void load()} />
          </div>
          <div className="mb-10">
            <TemplateGallery
              title="テンプレートギャラリー"
              description="テンプレートを選ぶと、館内案内・WiFi・朝食・チェックアウト・アクセスの5ページが自動作成されます。"
              onCreated={() => void load()}
            />
          </div>

          {/* カード内テーブル — 一覧しやすい1枚カード */}
          <div className="overflow-hidden rounded-xl border border-ds-border bg-ds-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="border-b border-ds-border px-5 py-4">
              <h2 className="text-[15px] font-semibold text-slate-900">
                ページ一覧
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                公開状態・QR・編集・削除がここから行えます
              </p>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                読み込み中…
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm text-slate-600">
                  まだページがありません
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  右上の「+ 新規ページ」から作成できます
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ds-border bg-slate-50/80">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                        ページ名
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                        公開状態
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                        QRコード
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                        編集
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600">
                        削除
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-slate-900">
                            {item.title?.trim() || "名称未設定"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                              (item.status === "published"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-amber-50 text-amber-800")
                            }
                          >
                            {item.status === "published"
                              ? "公開中"
                              : "下書き"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={buildPublicQrUrl(item.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-lg border border-ds-border bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            QRコード
                          </a>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/editor/page/${item.id}`}
                            className="inline-flex rounded-lg border border-ds-border bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                          >
                            編集
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => void onDelete(item)}
                            className="inline-flex rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === item.id ? "削除中…" : "削除"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-600">
              ← ダッシュボードに戻る
            </Link>
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
