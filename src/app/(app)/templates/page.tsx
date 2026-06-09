"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  listTemplates,
  getTemplateWithCards,
  createPageFromTemplate,
  type TemplateRow,
} from "@/lib/storage";
import { TemplateCard } from "@/components/saas/TemplateCard";
import type { CardType, EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";
import { PRESET_HERO_SAMPLE_IMAGE } from "@/components/editor/types";
import { MARKETPLACE_SEED_VERSION, stripDeprecatedIconCards } from "@/lib/template-marketplace";
import {
  resolveTemplateMediaSrc,
  TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS,
} from "@/lib/template-preview";
import {
  BTOC_MARKETPLACE_CATEGORIES,
  HOTEL_MARKETPLACE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_MARKETPLACE_SECTIONS,
} from "@/lib/template-marketplace-meta";
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";
import { AppSection } from "@/components/app-shell/primitives/AppSection";
import { AppSegmentedControl } from "@/components/app-shell/primitives/AppSegmentedControl";
import { useClientShell } from "@/components/app-shell/useClientShell";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: TEMPLATE_CATEGORY_LABELS.all },
  ...BTOC_MARKETPLACE_CATEGORIES.map((id) => ({ id, label: TEMPLATE_CATEGORY_LABELS[id] })),
  ...HOTEL_MARKETPLACE_CATEGORIES.map((id) => ({ id, label: TEMPLATE_CATEGORY_LABELS[id] })),
] as const;

const VALID_CATEGORY_IDS = new Set<string>(TEMPLATE_CATEGORIES.map((c) => c.id));

const HIDDEN_TEMPLATE_NAMES = new Set<string>([
  "リゾートホテル・館内案内",
  "旅館・ご案内",
  "Airbnb・ゲスト向け案内",
  "観光ガイド・スポット案内",
]);

function templateSeedSyncStorageKey(version: number): string {
  return `infomii-template-seed-v${version}`;
}

function shouldSyncMarketplaceTemplates(version: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(templateSeedSyncStorageKey(version)) !== "done";
  } catch {
    return true;
  }
}

function markMarketplaceTemplatesSynced(version: number): void {
  try {
    sessionStorage.setItem(templateSeedSyncStorageKey(version), "done");
  } catch {
    /* ignore quota / private mode */
  }
}

function filterByCategory(
  templates: TemplateRow[],
  category: string
): TemplateRow[] {
  if (category === "all") return templates;
  const withCat = templates as (TemplateRow & { category?: string })[];
  return withCat.filter((t) => t.category === category);
}

function filterHiddenTemplates(templates: TemplateRow[]): TemplateRow[] {
  return templates.filter((t) => !HIDDEN_TEMPLATE_NAMES.has(t.name));
}

/**
 * Template marketplace — /templates
 * Display template cards (title, description, preview image, Use Template).
 * Categories: Business hotel, Resort hotel, Ryokan, Airbnb, Tourist guide.
 * Use Template creates a page and populates cards, then opens the editor.
 */
export default function TemplatesPage() {
  const { isAppShell } = useClientShell();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRow | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const starterSlug = searchParams.get("starter");

  useRouteProgressLoading(loading || !!usingId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const paramCategory = searchParams.get("category");
    if (paramCategory && VALID_CATEGORY_IDS.has(paramCategory)) {
      setCategory(paramCategory);
    }
  }, [searchParams]);

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
    let active = true;
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const seeded = filterHiddenTemplates(await listTemplates());
        if (!active) return;
        setTemplates(seeded);
        setLoading(false);

        if (!shouldSyncMarketplaceTemplates(MARKETPLACE_SEED_VERSION)) return;

        const res = await fetch(`/api/seed-templates?sync=1&v=${MARKETPLACE_SEED_VERSION}`);
        if (!active) return;
        if (res.ok) {
          markMarketplaceTemplatesSynced(MARKETPLACE_SEED_VERSION);
          const refreshed = filterHiddenTemplates(await listTemplates());
          if (active) setTemplates(refreshed);
        }
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
        setLoading(false);
      }
    };
    void loadTemplates();
    return () => {
      active = false;
    };
  }, []);

  const filtered = filterByCategory(templates, category);
  const groupedWhenAll = useMemo(
    () =>
      TEMPLATE_MARKETPLACE_SECTIONS.flatMap((section) =>
        section.categories.map((catId) => ({
          sectionId: section.id,
          sectionLabel: section.label,
          category: catId,
          label: TEMPLATE_CATEGORY_LABELS[catId] ?? catId,
          items: filterByCategory(templates, catId),
        })),
      ).filter((g) => g.items.length > 0),
    [templates],
  );
  const selectedCategoryLabel =
    TEMPLATE_CATEGORIES.find((c) => c.id === category)?.label ?? "選択中カテゴリ";
  const groupsToRender =
    category === "all"
      ? groupedWhenAll
      : filtered.length > 0
        ? [{ sectionId: "single", sectionLabel: "", category, label: selectedCategoryLabel, items: filtered }]
        : [];

  useEffect(() => {
    if (!starterSlug || loading || templates.length === 0) return;
    const target = document.getElementById(`template-${starterSlug}`);
    if (!target) return;
    const scrollId = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightSlug(starterSlug);
    }, 200);
    const clearId = window.setTimeout(() => setHighlightSlug(null), 3600);
    return () => {
      window.clearTimeout(scrollId);
      window.clearTimeout(clearId);
    };
  }, [starterSlug, loading, templates]);

  async function handlePreview(template: TemplateRow) {
    setPreviewLoading(true);
    setPreviewTemplate(template);
    setError(null);
    try {
      const full = await getTemplateWithCards(template.id);
      if (full) setPreviewTemplate(full);
    } catch (e) {
      setPreviewTemplate(null);
      setError(e instanceof Error ? e.message : "プレビューの読み込みに失敗しました");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleUseTemplate(templateId: string) {
    setUsingId(templateId);
    setError(null);
    try {
      const { pageId } = await createPageFromTemplate(templateId);
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}?from=template&focus=hero`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ページの作成に失敗しました");
    } finally {
      setUsingId(null);
    }
  }

  function resolvePreviewMediaSrc(
    src: string | undefined,
    template: TemplateRow,
  ): string {
    const categoryFallback =
      TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS[template.category ?? ""] ??
      PRESET_HERO_SAMPLE_IMAGE;
    return resolveTemplateMediaSrc(
      src,
      template.preview_image,
      template.category ?? null,
      template.name,
      categoryFallback,
    );
  }

  function normalizeTemplatePreviewContent(
    type: CardType,
    content: Record<string, unknown> | undefined,
    template: TemplateRow,
  ): Record<string, unknown> {
    const base = { ...(content ?? {}) };
    if (type === "hero") {
      base.image = resolvePreviewMediaSrc(
        typeof base.image === "string" ? base.image : undefined,
        template,
      );
    }
    if (type === "image") {
      base.src = resolvePreviewMediaSrc(
        typeof base.src === "string" ? base.src : undefined,
        template,
      );
    }
    if (type === "gallery" && Array.isArray(base.items)) {
      base.items = base.items.map((item, i) => {
        const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
        row.src = resolvePreviewMediaSrc(
          typeof row.src === "string" ? row.src : undefined,
          template,
        );
        if (typeof row.alt !== "string" || !row.alt.trim()) row.alt = `gallery-${i + 1}`;
        return row;
      });
    }
    if (type === "hero_slider" && Array.isArray(base.items)) {
      base.items = base.items.map((item, i) => {
        const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
        row.src = resolvePreviewMediaSrc(
          typeof row.src === "string" ? row.src : undefined,
          template,
        );
        if (typeof row.alt !== "string" || !row.alt.trim()) row.alt = `slide-${i + 1}`;
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
    return stripDeprecatedIconCards(template.cards ?? []).map((card, index) => ({
      id: `${template.id}-${index}`,
      type: (card.type ?? "text") as CardType,
      content: normalizeTemplatePreviewContent(
        (card.type ?? "text") as CardType,
        card.content,
        template,
      ),
      order: typeof card.order === "number" ? card.order : index,
    }));
  }

  const previewCards = previewTemplate ? buildPreviewCards(previewTemplate) : [];
  const previewFrameClassName =
    "mx-auto w-full max-w-[375px] rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]";

  return (
    <div
      className={
        isAppShell
          ? "mx-auto w-full max-w-lg space-y-4 pb-4"
          : "app-main-container space-y-4"
      }
    >
      <header className={isAppShell ? "mb-1" : "app-page-header"}>
        <h1
          className={
            isAppShell
              ? "text-[1.75rem] font-bold text-[var(--app-text)]"
              : "app-page-title"
          }
        >
          テンプレート
        </h1>
        <p
          className={
            isAppShell
              ? "mt-2 text-base text-[var(--app-text-muted)]"
              : "app-page-subtitle"
          }
        >
          {isAppShell
            ? "旅行の日程から推し活まで。型を選んで、あなただけのインフォメーションをすぐつくれます。"
            : "旅行しおり・推し活・おでかけから、ホテル・旅館の館内案内まで。用途別の型からページを作成できます。"}
        </p>
      </header>

      {isAppShell ? (
        <AppSegmentedControl
          options={TEMPLATE_CATEGORIES}
          value={category}
          onChange={setCategory}
          ariaLabel="テンプレートカテゴリ"
        />
      ) : (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={
                "app-button-native shrink-0 rounded-lg px-3 py-2 text-sm shadow-sm transition " +
                (category === c.id
                  ? "bg-slate-900 !text-white font-semibold"
                  : "bg-slate-100 font-medium text-slate-600 hover:bg-slate-200")
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
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
              className="app-button-native mt-3 inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold !text-white shadow-sm hover:bg-slate-800"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groupsToRender.map((group, index) => {
              const prev = groupsToRender[index - 1];
              const showSectionHeading = category === "all" && group.sectionId !== prev?.sectionId;
              return (
                <AppSection
                  key={`${group.sectionId}-${group.category}`}
                  className="space-y-2"
                >
                  {showSectionHeading ? (
                    <h2
                      className={
                        isAppShell
                          ? "text-base font-bold tracking-tight text-[var(--app-text)]"
                          : "text-base font-bold tracking-tight text-slate-800"
                      }
                    >
                      {group.sectionLabel}
                    </h2>
                  ) : null}
                  <h3
                    className={
                      isAppShell
                        ? "text-sm font-semibold text-[var(--app-text-muted)]"
                        : "text-sm font-semibold text-slate-700"
                    }
                  >
                    {group.label}
                  </h3>
                  <div
                    className="-mx-4 overflow-x-auto px-4 pb-2 pt-3 [-ms-overflow-style:none] [scrollbar-width:thin] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
                    role="region"
                    aria-label={`${group.label} テンプレート一覧（横スクロール）`}
                    tabIndex={0}
                  >
                    <div className="grid w-max min-w-full grid-flow-col auto-cols-[min(88vw,280px)] gap-3 sm:auto-cols-[300px] sm:gap-4 lg:auto-cols-[320px]">
                      {group.items.map((template) => {
                        const highlighted = highlightSlug === template.slug;
                        return (
                          <div
                            key={template.id}
                            id={template.slug ? `template-${template.slug}` : undefined}
                            className={
                              "flex h-full min-h-0 flex-col scroll-mt-24 rounded-xl transition-shadow " +
                              (highlighted
                                ? "mt-1 shadow-[0_0_0_2px_rgb(16,185,129)] ring-2 ring-inset ring-emerald-500"
                                : "")
                            }
                          >
                            <TemplateCard
                              id={template.id}
                              name={template.name}
                              description={template.description}
                              preview_image={template.preview_image}
                              category={template.category}
                              variant={isAppShell ? "app" : "default"}
                              onUse={() => handleUseTemplate(template.id)}
                              onPreview={() => void handlePreview(template)}
                              using={usingId === template.id}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </AppSection>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-center text-sm text-slate-400">
        <Link href="/dashboard" className="hover:text-slate-600">← ダッシュボード</Link>
        {" · "}
        <Link href="/dashboard/pages" className="hover:text-slate-600">ページ一覧</Link>
      </p>

      {mounted && previewTemplate &&
        createPortal(
          <div
            className="ui-overlay-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-label={`${previewTemplate.name} テンプレートプレビュー`}
            onClick={() => setPreviewTemplate(null)}
          >
            <div
              className="ui-pop-in max-h-[92vh] w-full max-w-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
                    className="app-button-native rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    閉じる
                  </button>
                </div>
              </div>
              <div className="max-h-[78vh] overflow-y-auto bg-slate-100 p-4">
                <div className={previewFrameClassName}>
                  {previewLoading ? (
                    <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
                      プレビューを読み込み中…
                    </div>
                  ) : (
                    <LocaleProvider value="ja">
                      <div className="space-y-3">
                        <CardRenderer cards={previewCards} />
                      </div>
                    </LocaleProvider>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
}
