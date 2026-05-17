"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";

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
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRow | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useRouteProgressLoading(loading || !!usingId);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const groupedWhenAll = TEMPLATE_CATEGORIES
    .filter((c) => c.id !== "all")
    .map((c) => ({ category: c.id, label: c.label, items: filterByCategory(templates, c.id) }))
    .filter((g) => g.items.length > 0);
  const selectedCategoryLabel =
    TEMPLATE_CATEGORIES.find((c) => c.id === category)?.label ?? "選択中カテゴリ";
  const groupsToRender =
    category === "all"
      ? groupedWhenAll
      : filtered.length > 0
        ? [{ category, label: selectedCategoryLabel, items: filtered }]
        : [];

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
    return stripDeprecatedIconCards(template.cards ?? []).map((card, index) => ({
      id: `${template.id}-${index}`,
      type: (card.type ?? "text") as CardType,
      content: normalizeTemplatePreviewContent((card.type ?? "text") as CardType, card.content),
      order: typeof card.order === "number" ? card.order : index,
    }));
  }

  const previewCards = previewTemplate ? buildPreviewCards(previewTemplate) : [];
  const previewFrameClassName =
    "mx-auto w-full max-w-[375px] rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]";

  return (
    <div className="app-main-container space-y-4">
      <header className="app-page-header">
        <h1 className="app-page-title">テンプレート</h1>
        <p className="app-page-subtitle">
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
          <div className="space-y-5">
            {groupsToRender.map((group) => (
              <section key={group.category} className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-700">{group.label}</h2>
                <div
                  className="-mx-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
                  role="region"
                  aria-label={`${group.label} テンプレート一覧（横スクロール）`}
                  tabIndex={0}
                >
                  <div className="flex w-max min-w-full items-stretch gap-3 sm:gap-4">
                    {group.items.map((template) => (
                      <div
                        key={template.id}
                        className="w-[min(88vw,280px)] shrink-0 sm:w-[300px] lg:w-[320px]"
                      >
                        <TemplateCard
                          id={template.id}
                          name={template.name}
                          description={template.description}
                          preview_image={template.preview_image}
                          category={template.category}
                          onUse={() => handleUseTemplate(template.id)}
                          onPreview={() => void handlePreview(template)}
                          using={usingId === template.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
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
