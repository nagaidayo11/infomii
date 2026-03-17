"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listTemplates, createPageFromTemplate, type TemplateRow } from "@/lib/storage";
import { TemplateCard } from "@/components/saas/TemplateCard";

/** Template marketplace categories. Filter by template.category when available. */
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "business", label: "ビジネスホテル" },
  { id: "resort", label: "リゾートホテル" },
  { id: "ryokan", label: "旅館" },
  { id: "airbnb", label: "Airbnb" },
  { id: "guide", label: "観光ガイド" },
] as const;

function filterByCategory(
  templates: TemplateRow[],
  category: string
): TemplateRow[] {
  if (category === "all") return templates;
  const withCat = templates as (TemplateRow & { category?: string })[];
  return withCat.filter((t) => t.category === category);
}

/**
 * Template marketplace — /templates
 * Display template cards (title, description, preview image, Use Template).
 * Categories: Business Hotel, Resort Hotel, Ryokan, Airbnb, Tourist Guide.
 * Use Template creates a page and populates cards, then opens the editor.
 */
export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [category, setCategory] = useState<string>("all");
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

  const filtered = filterByCategory(templates, category);

  async function handleUseTemplate(templateId: string) {
    setUsingId(templateId);
    setError(null);
    try {
      const { pageId } = await createPageFromTemplate(templateId);
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ページの作成に失敗しました");
    } finally {
      setUsingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">テンプレート</h1>
        <p className="mt-1 text-sm text-slate-500">
          館内案内・WiFi・朝食など、そのまま使える型からQR用ページを作成
        </p>
      </header>

      {/* カテゴリ（将来 category カラム対応時はフィルタ有効） */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              (category === c.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
              <div className="aspect-[5/3] animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-50" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="text-slate-600">テンプレートがまだありません。</p>
          <p className="mt-1 text-sm text-slate-500">
            管理者が Supabase の templates テーブルに登録するとここに表示されます。
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              description={template.description}
              preview_image={template.preview_image}
              onUse={() => handleUseTemplate(template.id)}
              using={usingId === template.id}
            />
          ))}
        </div>
      )}

      <p className="text-center text-sm text-slate-400">
        <Link href="/dashboard" className="hover:text-slate-600">← ダッシュボード</Link>
        {" · "}
        <Link href="/dashboard/pages" className="hover:text-slate-600">ページ一覧</Link>
      </p>
    </div>
  );
}
