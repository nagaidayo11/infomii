"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getCurrentHotelSubscription } from "@/lib/storage";
import { Card } from "@/components/ui/Card";

/**
 * Business プランの特典を設定画面に表示（非 Business にはアップグレード案内）
 */
export function BusinessPlanSection() {
  const [plan, setPlan] = useState<"free" | "pro" | "business" | null>(null);

  const load = useCallback(async () => {
    try {
      const sub = await getCurrentHotelSubscription();
      setPlan((sub?.plan as "free" | "pro" | "business") ?? "free");
    } catch {
      setPlan("free");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (plan === null) {
    return (
      <Card padding="lg">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </Card>
    );
  }

  if (plan === "business") {
    return (
      <Card padding="lg" className="border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Business プラン</p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">ご利用中の特典</h2>
          </div>
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800">
            有効
          </span>
        </div>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
          <li className="flex gap-2">
            <span className="text-indigo-500" aria-hidden>
              ✓
            </span>
            <span>
              <strong className="font-medium text-slate-900">公開時の多言語翻訳</strong>
              ／エディタで英語・中文・韓国語を整えてから公開できます（
              <Link href="/dashboard" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
                ダッシュボード
              </Link>
              からページを開いて編集）。
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500" aria-hidden>
              ✓
            </span>
            <span>
              <strong className="font-medium text-slate-900">分析データの CSV ダウンロード</strong>
              ／
              <Link href="/dashboard/analytics" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
                分析ダッシュボード
              </Link>
              から、閲覧数のサマリーをファイルに保存できます。
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500" aria-hidden>
              ✓
            </span>
            <span>
              <strong className="font-medium text-slate-900">公開ページ数</strong>
              ／大規模な施設向けに、公開できる案内ページの上限を広く取っています。
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500" aria-hidden>
              ✓
            </span>
            <span>
              <strong className="font-medium text-slate-900">監査ログの CSV</strong>
              ／操作履歴をファイルで保存できます（下の「監査ログ」）。
            </span>
          </li>
        </ul>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="border-slate-200">
      <h2 className="text-base font-semibold text-slate-900">Business プラン</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        多言語翻訳の自動補助、分析の CSV ダウンロード、公開ページ数の拡張など、運用が大きくなった施設向けのプランです。
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/lp/saas#pricing"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 sm:min-h-0"
        >
          料金・プランを見る
        </Link>
        <Link
          href="/dashboard/analytics"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:min-h-0"
        >
          分析機能を見る（Pro 以上）
        </Link>
      </div>
    </Card>
  );
}
