"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listTemplates, createPageFromTemplate, type TemplateRow } from "@/lib/storage";
import { TemplateCard } from "@/components/saas/TemplateCard";
import type { CardType, EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";

/** Template marketplace categories. Filter by template.category when available. */
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "business", label: "ビジネスホテル" },
  { id: "resort", label: "リゾートホテル" },
  { id: "ryokan", label: "旅館" },
  { id: "airbnb", label: "Airbnb" },
  { id: "guide", label: "観光ガイド" },
  { id: "inbound", label: "インバウンド" },
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
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRow | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/seed-templates?sync=1")
      .catch(() => null)
      .then(() => listTemplates())
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
        router.push(`/editor/${pageId}?from=template`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ページの作成に失敗しました");
    } finally {
      setUsingId(null);
    }
  }

  function buildPreviewCards(template: TemplateRow): EditorCard[] {
    return (template.cards ?? []).map((card, index) => ({
      id: `${template.id}-${index}`,
      type: (card.type ?? "text") as CardType,
      content: card.content ?? {},
      order: typeof card.order === "number" ? card.order : index,
    }));
  }

  const previewCards = previewTemplate ? buildPreviewCards(previewTemplate) : [];

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
              onPreview={() => setPreviewTemplate(template)}
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

      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplate.name} テンプレートプレビュー`}
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{previewTemplate.name}</h3>
                <p className="text-xs text-slate-500">テンプレート適用時の実プレビュー</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>
            <div className="max-h-[78vh] overflow-y-auto bg-slate-100 p-5">
              <div className="mx-auto w-full max-w-[420px] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                <LocaleProvider value="ja">
                  <div className="space-y-4">
                    <CardRenderer cards={previewCards} />
                  </div>
                </LocaleProvider>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
