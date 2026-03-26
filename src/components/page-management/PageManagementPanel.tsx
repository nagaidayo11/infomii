"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import {
  buildPublicQrUrl,
  buildPublicUrlV,
  createBlankPage,
  deletePage,
  getDashboardBootstrapData,
  listPagesForHotel,
  PAGE_LIMIT_REACHED,
} from "@/lib/storage";
import type { PageRow } from "@/lib/storage";
import { TemplateGallery } from "@/components/template-gallery-ui";
import { PlanLimitModal } from "@/components/plan-limit/PlanLimitModal";
import { AIPageGenerator } from "@/components/ai-page-generator";

/**
 * ページ管理 — ゲスト向け案内ページの一覧・新規・削除
 * UIは日本語のみ
 */
export function PageManagementPanel() {
  const router = useRouter();
  const [cardPages, setCardPages] = useState<PageRow[]>([]);
  const [statusBySlug, setStatusBySlug] = useState<Record<string, "draft" | "published">>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingCardPageId, setDeletingCardPageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<{ plan: "free" | "pro" | "business" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [boot, cards] = await Promise.all([
        getDashboardBootstrapData(),
        listPagesForHotel(),
      ]);
      setCardPages(cards);
      setSubscription(boot.subscription ? { plan: boot.subscription.plan } : null);
      setStatusBySlug(
        Object.fromEntries(
          (boot.informations ?? []).map((info) => [info.slug, info.status === "published" ? "published" : "draft"])
        )
      );
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
    const entered = window.prompt("新規ページ名を入力してください");
    if (entered == null) return;
    const normalizedTitle = entered.trim();
    if (!normalizedTitle) {
      setError("ページ名を入力してください。");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const pageId = await createBlankPage(normalizedTitle);
      await load();
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
      }
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === PAGE_LIMIT_REACHED) {
        setPlanLimitModalOpen(true);
      } else {
        setError(err instanceof Error ? err.message : "新規作成に失敗しました");
      }
    } finally {
      setCreating(false);
    }
  }

  async function onDeleteCardPage(page: PageRow) {
    const ok = window.confirm(
      `${page.title?.trim() ? `「${page.title}」を` : "このページを"}削除しますか？\n取り消しはできません。`
    );
    if (!ok) return;
    setDeletingCardPageId(page.id);
    setError(null);
    try {
      await deletePage(page.id);
      setCardPages((prev) => prev.filter((p) => p.id !== page.id));
      setStatusBySlug((prev) => {
        const next = { ...prev };
        delete next[page.slug];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingCardPageId(null);
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
              ページを追加
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

          {/* ページ一覧（pages テーブル基準） */}
          <div className="overflow-hidden rounded-xl border border-ds-border bg-ds-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="border-b border-ds-border px-5 py-4">
              <h2 className="text-[15px] font-semibold text-slate-900">
                ページ一覧
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                作成・編集・公開・削除を1ページ単位で管理します
              </p>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                読み込み中…
              </div>
            ) : cardPages.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm text-slate-600">
                  まだページがありません
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  右上の「+ ページを追加」から作成できます
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
                    {cardPages.map((page) => (
                      <tr
                        key={page.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-slate-900">
                            {page.title?.trim() || ""}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                              (statusBySlug[page.slug] === "published"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-amber-50 text-amber-800")
                            }
                          >
                            {statusBySlug[page.slug] === "published"
                              ? "公開中"
                              : "下書き"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={buildPublicQrUrl(page.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-lg border border-ds-border bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            QRコード
                          </a>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/editor/${page.id}`}
                            className="inline-flex rounded-lg border border-ds-border bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                          >
                            編集
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            disabled={deletingCardPageId === page.id}
                            onClick={() => void onDeleteCardPage(page)}
                            className="inline-flex rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingCardPageId === page.id ? "削除中…" : "削除"}
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
      <PlanLimitModal
        open={planLimitModalOpen}
        onClose={() => setPlanLimitModalOpen(false)}
        currentPlan={subscription?.plan}
      />
    </AuthGate>
  );
}
