"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { TemplateGallery } from "@/components/template-gallery-ui";

/**
 * テンプレートギャラリー専用ページ — カード一覧で「テンプレートを使う」で複数ページ自動作成
 */
export default function DashboardTemplatesPage() {
  const router = useRouter();

  return (
    <AuthGate>
      <div className="min-h-screen bg-ds-bg px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                テンプレート
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                テンプレートを選んで、案内ページをまとめて作成
              </p>
            </div>
            <Link
              href="/dashboard/pages"
              className="rounded-xl border border-ds-border bg-ds-card px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ページ一覧へ
            </Link>
          </div>

          <TemplateGallery
            title="テンプレートを選ぶ"
            description="使いたいテンプレートの「テンプレートを使う」を押すと、5ページが自動作成されます。作成後はページ一覧で編集できます。"
            onCreated={() => router.push("/dashboard/pages")}
          />

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-700">
              ← ダッシュボードに戻る
            </Link>
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
