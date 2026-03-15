"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listTemplates, createPageFromTemplate, type TemplateRow } from "@/lib/storage";

/**
 * テンプレートマーケットプレイス — /templates
 * Supabase の templates を一覧表示し、「テンプレートを使う」で新規ページ＋カードを作成。
 */
export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listTemplates()
      .then(async (list) => {
        if (!mounted) return;
        if (list.length === 0) {
          try {
            await fetch("/api/seed-templates");
            const again = await listTemplates();
            if (mounted) setTemplates(again);
          } catch {
            if (mounted) setTemplates(list);
          }
        } else {
          setTemplates(list);
        }
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleUseTemplate(templateId: string) {
    setUsingId(templateId);
    setError(null);
    try {
      const { pageId } = await createPageFromTemplate(templateId);
      router.push(`/editor/v2?pageId=${encodeURIComponent(pageId)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ページの作成に失敗しました");
    } finally {
      setUsingId(null);
    }
  }

  return (
    <div className="min-h-full bg-[#fafbfc]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            さあ、何を作成しますか?
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            テンプレートを選んで「テンプレートを使う」で新しいページを作成できます。
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-[5/3] animate-pulse rounded-xl bg-slate-100" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-50" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-ds-border border-dashed bg-ds-card p-12 text-center shadow-sm">
            <p className="text-slate-500">テンプレートがまだありません。</p>
            <p className="mt-1 text-sm text-slate-400">
              管理者が Supabase の templates テーブルに登録するとここに表示されます。
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium text-ds-primary hover:underline"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              >
                <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
                  {template.preview_image ? (
                    <Image
                      src={template.preview_image}
                      alt=""
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={template.preview_image.startsWith("http")}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                      📄
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="text-lg font-semibold text-white drop-shadow-sm">
                      {template.name}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {template.description || "説明なし"}
                  </p>
                  <div className="mt-4 flex-1" />
                  <button
                    type="button"
                    disabled={!!usingId}
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full rounded-xl bg-ds-primary py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60"
                  >
                    {usingId === template.id ? "作成中…" : "テンプレートを使う"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-600">
            ← ダッシュボードに戻る
          </Link>
          {" · "}
          <Link href="/dashboard/pages" className="hover:text-slate-600">
            ページ一覧
          </Link>
        </p>
      </div>
    </div>
  );
}
