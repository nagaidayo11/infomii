"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listTemplates,
  createPageFromTemplate,
  recheckTemplateConsistency,
  type TemplateRow,
} from "@/lib/storage";
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
import { PRESET_HERO_SAMPLE_IMAGE } from "@/components/editor/types";

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
  const [recheckingTemplateId, setRecheckingTemplateId] = useState<string | null>(null);

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
  const filteredMeta = filtered.map((t) => resolveTemplateMeta(t, runtimeMetaOverrides));
  const avgConsistencyScore =
    filteredMeta.length > 0
      ? Math.round(filteredMeta.reduce((sum, m) => sum + m.consistencyScore, 0) / filteredMeta.length)
      : 0;
  const lowScoreCount = filteredMeta.filter((m) => m.consistencyScore < 60).length;
  const lowScoreRate = filteredMeta.length > 0 ? Math.round((lowScoreCount / filteredMeta.length) * 100) : 0;
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

  async function handleRecheckTemplate(template: TemplateRow) {
    setRecheckingTemplateId(template.id);
    setError(null);
    try {
      const result = await recheckTemplateConsistency(template.id);
      setTemplates((prev) =>
        prev.map((row) =>
          row.id === template.id
            ? {
                ...row,
                review_status: result.review_status,
                consistency_score: result.consistency_score,
                consistency_reason: result.consistency_reason,
              }
            : row
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "再評価に失敗しました");
    } finally {
      setRecheckingTemplateId(null);
    }
  }

  function normalizeTemplatePreviewContent(
    type: CardType,
    content: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    const base = { ...(content ?? {}) };
    if (type === "hero" && (typeof base.image !== "string" || !base.image.trim())) {
      base.image = PRESET_HERO_SAMPLE_IMAGE;
    }
    if (type === "image" && (typeof base.src !== "string" || !base.src.trim())) {
      base.src = PRESET_HERO_SAMPLE_IMAGE;
    }
    if (type === "gallery" && Array.isArray(base.items)) {
      base.items = base.items.map((item, i) => {
        const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
        if (typeof row.src !== "string" || !row.src.trim()) row.src = PRESET_HERO_SAMPLE_IMAGE;
        if (typeof row.alt !== "string" || !row.alt.trim()) row.alt = `gallery-${i + 1}`;
        return row;
      });
    }
    const rawStyle = base._style;
    if (rawStyle && typeof rawStyle === "object" && !Array.isArray(rawStyle)) {
      const style = { ...(rawStyle as Record<string, unknown>) };
      delete style.fontSize;
      delete style.backgroundColor;
      delete style.padding;
      if (Object.keys(style).length === 0) delete base._style;
      else base._style = style;
    }
    return base;
  }

  function buildPreviewCards(template: TemplateRow): EditorCard[] {
    return (template.cards ?? []).map((card, index) => ({
      id: `${template.id}-${index}`,
      type: (card.type ?? "text") as CardType,
      content: normalizeTemplatePreviewContent((card.type ?? "text") as CardType, card.content),
      order: typeof card.order === "number" ? card.order : index,
    }));
  }

  const previewCards = previewTemplate ? buildPreviewCards(previewTemplate) : [];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">テンプレート</h1>
        <p className="mt-1 text-sm text-slate-500">
          館内案内・WiFi・朝食など、そのまま使える型からQR用ページを作成
        </p>
      </header>

      {/* カテゴリ — スマホは横スクロールで押しやすく */}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition " +
              (category === c.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] text-slate-500">平均一致スコア</p>
          <p className="text-lg font-semibold text-slate-900">{avgConsistencyScore}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] text-slate-500">低スコア率 (&lt;60)</p>
          <p className="text-lg font-semibold text-amber-700">{lowScoreRate}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] text-slate-500">要見直し件数</p>
          <p className="text-lg font-semibold text-amber-700">{lowScoreCount}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm">
              <div className="aspect-[5/3] animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-50" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <p className="text-slate-600">テンプレートがまだありません。</p>
          <p className="mt-1 text-sm text-slate-500">
            管理者が Supabase の templates テーブルに登録するとここに表示されます。
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      ) : category !== "all" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const meta = resolveTemplateMeta(template, runtimeMetaOverrides);
            const consistencyScore =
              typeof template.consistency_score === "number"
                ? template.consistency_score
                : meta.consistencyScore;
            const needsReview =
              template.review_status === "needs_review" ||
              template.review_status === "failed" ||
              consistencyScore < 60;
            const consistencyReason =
              template.consistency_reason?.trim() ||
              meta.consistencyReason;
            return (
              <div key={template.id} className="space-y-2">
                <TemplateCard
                  id={template.id}
                  name={template.name}
                  description={template.description}
                  preview_image={template.preview_image}
                  audienceTags={meta.audienceTags}
                  industry={meta.industry}
                  useCase={meta.useCase}
                  recommendedPlan={meta.recommendedPlan}
                  consistencyScore={consistencyScore}
                  needsReview={needsReview}
                  consistencyReason={consistencyReason}
                  onUse={() => handleUseTemplate(template.id)}
                  onPreview={() => setPreviewTemplate(template)}
                  using={usingId === template.id}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleRecheckTemplate(template)}
                    disabled={recheckingTemplateId === template.id}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {recheckingTemplateId === template.id ? "再評価中..." : "再評価"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((template) => {
                    const meta = resolveTemplateMeta(template, runtimeMetaOverrides);
                    const consistencyScore =
                      typeof template.consistency_score === "number"
                        ? template.consistency_score
                        : meta.consistencyScore;
                    const needsReview =
                      template.review_status === "needs_review" ||
                      template.review_status === "failed" ||
                      consistencyScore < 60;
                    const consistencyReason =
                      template.consistency_reason?.trim() ||
                      meta.consistencyReason;
                    return (
                      <div key={template.id} className="space-y-2">
                        <TemplateCard
                          id={template.id}
                          name={template.name}
                          description={template.description}
                          preview_image={template.preview_image}
                          audienceTags={meta.audienceTags}
                          industry={meta.industry}
                          useCase={meta.useCase}
                          recommendedPlan={meta.recommendedPlan}
                          consistencyScore={consistencyScore}
                          needsReview={needsReview}
                          consistencyReason={consistencyReason}
                          onUse={() => handleUseTemplate(template.id)}
                          onPreview={() => setPreviewTemplate(template)}
                          using={usingId === template.id}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleRecheckTemplate(template)}
                            disabled={recheckingTemplateId === template.id}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {recheckingTemplateId === template.id ? "再評価中..." : "再評価"}
                          </button>
                        </div>
                      </div>
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
              <div className="max-h-[78vh] overflow-y-auto bg-slate-100 p-4">
                <div className="mx-auto w-full max-w-[420px] rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  <LocaleProvider value="ja">
                    <div className="space-y-3">
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
                                        industry: current?.industry ?? meta.industry,
                                        useCase: current?.useCase ?? meta.useCase,
                                        tone: current?.tone ?? meta.tone,
                                        mustIncludeElements:
                                          current?.mustIncludeElements ?? meta.mustIncludeElements,
                                        forbiddenElements:
                                          current?.forbiddenElements ?? meta.forbiddenElements,
                                        imagePromptSeed:
                                          current?.imagePromptSeed ?? meta.imagePromptSeed,
                                        recommendedPlan:
                                          current?.recommendedPlan ?? meta.recommendedPlan,
                                        consistencyScore:
                                          current?.consistencyScore ?? meta.consistencyScore,
                                        needsReview:
                                          current?.needsReview ?? meta.needsReview,
                                        consistencyReason:
                                          current?.consistencyReason ?? meta.consistencyReason,
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
