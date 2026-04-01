"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listTemplates, createPageFromTemplate, type TemplateRow } from "@/lib/storage";
import {
  resolveTemplateMeta,
  TEMPLATE_AUDIENCE_TAGS,
  type TemplateMeta,
} from "@/lib/template-meta";
import { TemplateCard } from "@/components/saas/TemplateCard";
import type { CardType, EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";

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
  const [mounted, setMounted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [badgeEditorOpen, setBadgeEditorOpen] = useState(false);
  const [runtimeMetaOverrides, setRuntimeMetaOverrides] = useState<Record<string, TemplateMeta>>({});

  const BADGE_META_STORAGE_KEY = "infomii.template-meta-overrides.v1";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = window.localStorage.getItem(BADGE_META_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, TemplateMeta>;
      if (parsed && typeof parsed === "object") setRuntimeMetaOverrides(parsed);
    } catch {
      // ignore malformed local storage
    }
  }, [mounted]);

  function saveRuntimeOverrides(next: Record<string, TemplateMeta>) {
    setRuntimeMetaOverrides(next);
    if (!mounted) return;
    try {
      window.localStorage.setItem(BADGE_META_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  }

  useEffect(() => {
    if (!previewTemplate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewTemplate(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewTemplate]);

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
  const groupedWhenAll = TEMPLATE_CATEGORIES
    .filter((c) => c.id !== "all")
    .map((c) => ({ category: c.id, label: c.label, items: filterByCategory(templates, c.id) }))
    .filter((g) => g.items.length > 0);

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
      ) : category !== "all" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const meta = resolveTemplateMeta(template, runtimeMetaOverrides);
            return (
            <TemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              description={template.description}
              preview_image={template.preview_image}
              audienceTags={meta.audienceTags}
              onUse={() => handleUseTemplate(template.id)}
              onPreview={() => setPreviewTemplate(template)}
              using={usingId === template.id}
            />
            );
          })}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedWhenAll.map((group) => {
            const expanded = !!expandedCategories[group.category];
            const visible = expanded ? group.items : group.items.slice(0, 3);
            const hiddenCount = Math.max(0, group.items.length - visible.length);
            return (
              <section key={group.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">{group.label}</h2>
                  {group.items.length > 3 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategories((prev) => ({ ...prev, [group.category]: !expanded }))
                      }
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      {expanded ? "折りたたむ" : `さらに表示（+${hiddenCount}）`}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((template) => {
                    const meta = resolveTemplateMeta(template, runtimeMetaOverrides);
                    return (
                    <TemplateCard
                      key={template.id}
                      id={template.id}
                      name={template.name}
                      description={template.description}
                      preview_image={template.preview_image}
                      audienceTags={meta.audienceTags}
                      onUse={() => handleUseTemplate(template.id)}
                      onPreview={() => setPreviewTemplate(template)}
                      using={usingId === template.id}
                    />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-center text-sm text-slate-400">
        <Link href="/dashboard" className="hover:text-slate-600">← ダッシュボード</Link>
        {" · "}
        <Link href="/dashboard/pages" className="hover:text-slate-600">ページ一覧</Link>
        {" · "}
        <button
          type="button"
          onClick={() => setBadgeEditorOpen(true)}
          className="hover:text-slate-600"
        >
          バッジ編集
        </button>
      </p>

      {mounted && previewTemplate &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6"
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    閉じる
                  </button>
                </div>
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
          </div>,
          document.body
        )}

      {mounted && (loading || usingId) &&
        createPortal(
          <FullScreenLoadingOverlay
            title={usingId ? "テンプレートを適用中…" : "読み込み中…"}
            subtitle={
              usingId ? "エディタ用のページを作成しています" : "テンプレート一覧を読み込んでいます"
            }
            classNameZ="z-[90]"
          />,
          document.body
        )}

      {mounted && badgeEditorOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-label="テンプレートバッジ編集"
            onClick={() => setBadgeEditorOpen(false)}
          >
            <div
              className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">テンプレートバッジ編集</h3>
                  <p className="text-xs text-slate-500">難易度と想定ゲストを手動調整できます（このブラウザに保存）</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      saveRuntimeOverrides({});
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    すべてリセット
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeEditorOpen(false)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    閉じる
                  </button>
                </div>
              </div>
              <div className="max-h-[78vh] overflow-y-auto bg-slate-50 p-4">
                <div className="space-y-3">
                  {templates.map((template) => {
                    const meta = resolveTemplateMeta(template, runtimeMetaOverrides);
                    const current = runtimeMetaOverrides[template.name];
                    return (
                      <div key={template.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                          <p className="text-xs text-slate-500">{template.description}</p>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">想定ゲスト</label>
                          <div className="flex flex-wrap gap-1.5">
                            {TEMPLATE_AUDIENCE_TAGS.map((tag) => {
                              const selected = (current?.audienceTags ?? meta.audienceTags).includes(tag);
                              return (
                                <button
                                  key={`${template.id}-${tag}`}
                                  type="button"
                                  onClick={() => {
                                    const base = current?.audienceTags ?? meta.audienceTags;
                                    const updated = selected
                                      ? base.filter((t) => t !== tag)
                                      : [...base, tag].slice(0, 3);
                                    const next = {
                                      ...runtimeMetaOverrides,
                                      [template.name]: {
                                        difficulty: current?.difficulty ?? meta.difficulty,
                                        audienceTags: updated,
                                      },
                                    };
                                    saveRuntimeOverrides(next);
                                  }}
                                  className={
                                    "rounded-full border px-2 py-0.5 text-xs font-medium transition " +
                                    (selected
                                      ? "border-blue-200 bg-blue-50 text-blue-700"
                                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                                  }
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
