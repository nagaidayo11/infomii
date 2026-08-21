"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";
import type { CardType, EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";
import { GuestBottomTabBar } from "@/components/guest/GuestBottomTabBar";
import { GuestHamburgerMenu } from "@/components/guest/GuestHamburgerMenu";
import { PhoneDeviceFrame, PHONE_SCREEN_WIDTH } from "@/components/ui/PhoneDeviceFrame";
import { PRESET_HERO_SAMPLE_IMAGE } from "@/components/editor/types";
import { MARKETPLACE_SEED_VERSION, stripDeprecatedIconCards } from "@/lib/template-marketplace";
import {
  normalizeMarketplaceTemplateCardContent,
  TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS,
} from "@/lib/template-preview";
import {
  BTOC_MARKETPLACE_CATEGORIES,
  HOTEL_MARKETPLACE_CATEGORIES,
  TEMPLATE_AUDIENCE_LABELS,
  TEMPLATE_AUDIENCE_SECTION_IDS,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_MARKETPLACE_SECTIONS,
  CASE_STUDY_TEMPLATE_SLUGS,
  type TemplateMarketplaceAudience,
} from "@/lib/template-marketplace-meta";
import {
  getGuestShellNavStyle,
  resolveVisibleGuestShellTabs,
} from "@/lib/guest-shell";
import {
  getTemplateGuestNavHint,
  getTemplateGuestNavLabel,
  resolveTemplateGuestShellConfig,
} from "@/lib/template-guest-shell";
import { GUEST_CARD_STACK_CLASS } from "@/lib/editor/card-width-mode";
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";
import { AppSection } from "@/components/app-shell/primitives/AppSection";
import { AppTabPage } from "@/components/app-shell/primitives/AppTabPage";
import { AppEmptyState } from "@/components/app-shell/AppEmptyState";
import { AppIconEmptyTemplates } from "@/components/app-shell/icons/AppIconSet";
import { AppSegmentedControl } from "@/components/app-shell/primitives/AppSegmentedControl";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { ClientShellContext } from "@/components/app-shell/ClientShellProvider";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: TEMPLATE_CATEGORY_LABELS.all },
  ...HOTEL_MARKETPLACE_CATEGORIES.map((id) => ({ id, label: TEMPLATE_CATEGORY_LABELS[id] })),
  ...BTOC_MARKETPLACE_CATEGORIES.map((id) => ({ id, label: TEMPLATE_CATEGORY_LABELS[id] })),
] as const;

const TEMPLATE_AUDIENCE_OPTIONS: { id: TemplateMarketplaceAudience; label: string }[] = [
  { id: "personal", label: TEMPLATE_AUDIENCE_LABELS.personal },
  { id: "hotel", label: TEMPLATE_AUDIENCE_LABELS.hotel },
  { id: "all", label: TEMPLATE_AUDIENCE_LABELS.all },
];

const VALID_CATEGORY_IDS = new Set<string>(TEMPLATE_CATEGORIES.map((c) => c.id));

const CARD_TYPE_PREVIEW_LABELS: Record<string, string> = {
  hero: "トップ写真・タイトル",
  hero_slider: "スライダー写真",
  welcome: "歓迎メッセージ",
  wifi: "Wi-Fi案内",
  breakfast: "朝食案内",
  checkout: "チェックアウト",
  nearby: "周辺案内",
  faq: "よくある質問",
  map: "地図",
  restaurant: "レストラン",
  laundry: "ランドリー",
  spa: "温泉・スパ",
  pageLinks: "ページリンク",
  schedule: "スケジュール",
  menu: "メニュー",
  gallery: "ギャラリー",
  accordion_info: "開閉式の案内",
  tabs_info: "タブ切り替え案内",
  contact_hub: "連絡先まとめ",
  steps: "手順・流れ",
  checklist: "チェックリスト",
  dayTimeline: "1日の流れ",
  storyBand: "ストーリー帯",
  notice: "お知らせ",
  highlight: "注目ポイント",
  info: "情報一覧",
  heading_body: "見出し＋本文",
  iconRow: "アイコン導線",
  parking: "駐車場",
  emergency: "緊急連絡",
  open_status: "営業状況",
  social_links: "SNSリンク",
  drink_menu: "ドリンクメニュー",
  menu_categories: "メニュー分類",
  daily_special: "本日のおすすめ",
  progress_steps: "進捗ステップ",
  image_tiles: "写真タイル",
  sectionTitle: "セクション見出し",
  quote: "引用・メッセージ",
  compare: "比較",
  kpi: "数字・指標",
  iconAccordion: "アイコン＋開閉",
};

function summarizePreviewCardTypes(
  cards: Array<{ type?: string | null }>,
  limit = 6,
): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const card of cards) {
    const type = typeof card.type === "string" ? card.type : "";
    if (!type || type === "divider" || type === "icon") continue;
    const label = CARD_TYPE_PREVIEW_LABELS[type] ?? null;
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
    if (labels.length >= limit) break;
  }
  return labels;
}

const HIDDEN_TEMPLATE_NAMES = new Set<string>([]);

const APP_TEMPLATE_RECOMMENDS = [
  {
    href: "/templates?category=travel",
    category: "travel",
    kicker: "旅行",
    title: "旅のしおりを作る",
    body: "集合・日程・持ち物を1ページに",
    image: "/templates/previews/travel/travel-itinerary.jpg",
  },
  {
    href: "/templates?category=oshi",
    category: "oshi",
    kicker: "推し活",
    title: "ライブ遠征まとめ",
    body: "開演・グッズ・帰りの予定まで",
    image: "/templates/previews/oshi/oshi-live-set.jpg",
  },
  {
    href: "/templates?category=personal",
    category: "personal",
    kicker: "リンク",
    title: "おでかけ・リンク集",
    body: "友達に送る予定表やメモに",
    image: "/templates/previews/personal/personal-link-collection.jpg",
  },
] as const;

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

function isCaseStudyTemplate(slug: string | null | undefined): boolean {
  return Boolean(slug && (CASE_STUDY_TEMPLATE_SLUGS as readonly string[]).includes(slug));
}

function filterHiddenTemplates(templates: TemplateRow[]): TemplateRow[] {
  return templates.filter((t) => !HIDDEN_TEMPLATE_NAMES.has(t.name));
}

type TemplateRailProps = {
  items: TemplateRow[];
  variant: "app" | "default";
  groupLabel: string;
  highlightSlug: string | null;
  usingId: string | null;
  onUse: (id: string) => void;
  onPreview: (template: TemplateRow) => void;
};

function TemplateRail({
  items,
  variant,
  groupLabel,
  highlightSlug,
  usingId,
  onUse,
  onPreview,
}: TemplateRailProps) {
  return (
    <div
      className="app-template-rail -mx-4 overflow-x-auto px-4 pb-2 pt-3 [-ms-overflow-style:none] [scrollbar-width:thin] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
      role="region"
      aria-label={`${groupLabel} テンプレート一覧（横スクロール）`}
      tabIndex={0}
    >
      <div className={(variant === "app" ? "grid w-max min-w-full grid-flow-col auto-cols-[min(72vw,236px)] gap-3" : "grid w-max min-w-full grid-flow-col auto-cols-[min(88vw,280px)] gap-3 sm:auto-cols-[300px] sm:gap-4 lg:auto-cols-[320px]") + " ui-stagger"}>
        {items.map((template) => {
          const highlighted = highlightSlug === template.slug;
          return (
            <div
              key={template.id}
              id={template.slug ? `template-${template.slug}` : undefined}
              className={
                "flex h-full min-h-0 flex-col scroll-mt-24 rounded-xl transition-shadow " +
                (highlighted
                  ? "mt-1 shadow-[0_0_0_2px_rgb(15,23,42)] ring-2 ring-inset ring-slate-900"
                  : "")
              }
            >
              <TemplateCard
                id={template.id}
                slug={template.slug}
                name={template.name}
                description={template.description}
                preview_image={template.preview_image}
                category={template.category}
                variant={variant}
                onUse={() => onUse(template.id)}
                onPreview={() => onPreview(template)}
                using={usingId === template.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Template marketplace — /templates
 * Display template cards (title, description, preview image, Use Template).
 * Categories: Business hotel, Resort hotel, Ryokan, Airbnb, Tourist guide.
 * Use Template creates a page and populates cards, then opens the editor.
 */
export default function TemplatesPage() {
  const clientShell = useClientShell();
  const { isAppShell } = clientShell;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [audience, setAudience] = useState<TemplateMarketplaceAudience>("hotel");
  const [category, setCategory] = useState<string>("all");
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRow | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pendingCategoryScrollRef = useRef<string | null>(null);

  const starterSlug = searchParams.get("starter");

  useRouteProgressLoading(loading || !!usingId);

  const requestTemplateCategoryScroll = useCallback((targetCategory: string) => {
    pendingCategoryScrollRef.current = targetCategory;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const paramCategory = searchParams.get("category");
    if (paramCategory && VALID_CATEGORY_IDS.has(paramCategory)) {
      // Web is hotel-only; ignore BtoC category deep-links.
      if (!isAppShell && (BTOC_MARKETPLACE_CATEGORIES as readonly string[]).includes(paramCategory)) {
        setAudience("hotel");
        setCategory("all");
        return;
      }
      setCategory(paramCategory);
      if ((HOTEL_MARKETPLACE_CATEGORIES as readonly string[]).includes(paramCategory)) {
        setAudience("hotel");
      } else if ((BTOC_MARKETPLACE_CATEGORIES as readonly string[]).includes(paramCategory)) {
        setAudience("personal");
      }
      requestTemplateCategoryScroll(paramCategory);
    }
  }, [searchParams, isAppShell, requestTemplateCategoryScroll]);

  useEffect(() => {
    if (!isAppShell && audience !== "hotel") {
      setAudience("hotel");
    }
  }, [isAppShell, audience]);

  useEffect(() => {
    if (!isAppShell) return;
    if (searchParams.get("category")) return;
    setAudience("personal");
    setCategory("all");
  }, [isAppShell, searchParams]);

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

  const caseStudyTemplates = useMemo(
    () => templates.filter((t) => isCaseStudyTemplate(t.slug)),
    [templates],
  );
  const catalogTemplates = useMemo(
    () => templates.filter((t) => !isCaseStudyTemplate(t.slug)),
    [templates],
  );
  const filtered = filterByCategory(catalogTemplates, category);
  const visibleCategories = useMemo(() => {
    if (audience === "all") return TEMPLATE_CATEGORIES;
    const allowed = new Set<string>([
      "all",
      ...(audience === "hotel" ? HOTEL_MARKETPLACE_CATEGORIES : BTOC_MARKETPLACE_CATEGORIES),
    ]);
    return TEMPLATE_CATEGORIES.filter((c) => allowed.has(c.id));
  }, [audience]);
  useEffect(() => {
    if (visibleCategories.some((c) => c.id === category)) return;
    setCategory("all");
  }, [audience, category, visibleCategories]);
  const groupedWhenAll = useMemo(
    () =>
      TEMPLATE_MARKETPLACE_SECTIONS.filter((section) => {
        if (audience === "all") return true;
        return (TEMPLATE_AUDIENCE_SECTION_IDS[audience] as readonly string[]).includes(section.id);
      }).flatMap((section) =>
        section.categories.map((catId) => ({
          sectionId: section.id,
          sectionLabel: section.label,
          category: catId,
          label: TEMPLATE_CATEGORY_LABELS[catId] ?? catId,
          items: filterByCategory(catalogTemplates, catId),
        })),
      ).filter((g) => g.items.length > 0),
    [catalogTemplates, audience],
  );
  const selectedCategoryLabel =
    TEMPLATE_CATEGORIES.find((c) => c.id === category)?.label ?? "選択中カテゴリ";
  const groupsToRender =
    category === "all"
      ? groupedWhenAll
      : filtered.length > 0
        ? [{ sectionId: "single", sectionLabel: "", category, label: selectedCategoryLabel, items: filtered }]
        : [];
  const showCaseStudyFeatured = audience !== "personal" && category === "all" && caseStudyTemplates.length > 0;
  const hasTemplates = showCaseStudyFeatured || groupsToRender.length > 0;

  useEffect(() => {
    const targetCategory = pendingCategoryScrollRef.current;
    if (!targetCategory || loading || !hasTemplates) return;
    const target = document.getElementById(`template-category-${targetCategory}`);
    if (!target) return;
    pendingCategoryScrollRef.current = null;
    const scrollId = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(scrollId);
  }, [category, groupsToRender, hasTemplates, loading]);

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

  function normalizeTemplatePreviewContent(
    type: CardType,
    content: Record<string, unknown> | undefined,
    template: TemplateRow,
  ): Record<string, unknown> {
    const categoryFallback =
      TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS[template.category ?? ""] ??
      PRESET_HERO_SAMPLE_IMAGE;
    return normalizeMarketplaceTemplateCardContent(
      type,
      content,
      {
        name: template.name,
        slug: template.slug,
        preview_image: template.preview_image,
        category: template.category,
      },
      categoryFallback,
    );
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
  const previewGuestShell = previewTemplate
    ? resolveTemplateGuestShellConfig(previewTemplate.slug)
    : null;
  const previewNavStyle = previewGuestShell ? getGuestShellNavStyle(previewGuestShell) : "off";
  const previewShellTabs = previewGuestShell
    ? resolveVisibleGuestShellTabs(previewGuestShell)
    : [];
  const previewIncluded = summarizePreviewCardTypes(previewCards);
  const previewContentCardCount = previewCards.filter(
    (card) => card.type !== "divider" && card.type !== "icon",
  ).length;
  const previewCategoryLabel =
    previewTemplate?.category && TEMPLATE_CATEGORY_LABELS[previewTemplate.category]
      ? TEMPLATE_CATEGORY_LABELS[previewTemplate.category]
      : null;
  const phoneFrameOuterW = PHONE_SCREEN_WIDTH + 20;
  /** ~iPhone aspect for the chassis width used in PhoneDeviceFrame. */
  const phoneFrameH = Math.round(phoneFrameOuterW * (852 / 393));

  const previewDialog =
    mounted && previewTemplate
      ? createPortal(
          <div
            className="ui-overlay-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 px-2 py-2 sm:px-4 sm:py-3"
            role="dialog"
            aria-modal="true"
            aria-label={`${previewTemplate.name} テンプレートプレビュー`}
            onClick={() => setPreviewTemplate(null)}
          >
            <div
              className="ui-pop-in flex max-h-[98vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-stretch">
                <div className="flex min-h-0 flex-col overflow-y-auto border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6 lg:border-b-0 lg:border-r">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      テンプレートプレビュー
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="app-button-native shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 lg:hidden"
                    >
                      閉じる
                    </button>
                  </div>
                  {previewCategoryLabel ? (
                    <p className="mt-3 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {previewCategoryLabel}
                    </p>
                  ) : null}
                  <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
                    {previewTemplate.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {previewTemplate.description?.trim() ||
                      "この型からすぐ編集を始められます。写真も文言もあとから自由に変更できます。"}
                  </p>

                  {previewIncluded.length > 0 ? (
                    <div className="mt-5">
                      <p className="text-xs font-semibold text-slate-800">含まれている主なブロック</p>
                      <ul className="mt-2 space-y-1.5">
                        {previewIncluded.map((label) => (
                          <li
                            key={label}
                            className="flex items-start gap-2 text-sm leading-snug text-slate-600"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                            <span>{label}</span>
                          </li>
                        ))}
                      </ul>
                      {previewContentCardCount > previewIncluded.length ? (
                        <p className="mt-2 text-[11px] text-slate-400">
                          全{previewContentCardCount}ブロック構成
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
                    <p className="text-xs font-semibold text-slate-800">
                      ゲストナビ: {getTemplateGuestNavLabel(previewNavStyle)}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {getTemplateGuestNavHint(previewNavStyle)}
                      。ページ作成時にこの設定が入ります。あとからページ設定で変更できます。
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    <button
                      type="button"
                      disabled={usingId === previewTemplate.id}
                      onClick={() => void handleUseTemplate(previewTemplate.id)}
                      className="app-button-native inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold !text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {usingId === previewTemplate.id ? "作成中…" : "このテンプレートを使う"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="app-button-native hidden min-h-[40px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:inline-flex"
                    >
                      閉じる
                    </button>
                  </div>
                </div>

                <div className="flex min-h-0 items-center justify-center bg-[#d7e0ea] px-3 py-3 sm:px-5 sm:py-4">
                  {previewLoading ? (
                    <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
                      プレビューを読み込み中…
                    </div>
                  ) : (
                    <div
                      className="shrink-0"
                      style={{
                        width: phoneFrameOuterW,
                        height: `min(92dvh, ${phoneFrameH}px)`,
                      }}
                    >
                      <PhoneDeviceFrame
                        width={PHONE_SCREEN_WIDTH}
                        fillHeight
                        verticalInset={0}
                        className="h-full w-full"
                        header={
                          <div className="flex items-start justify-between gap-2">
                            <h1 className="min-w-0 flex-1 break-words text-[15px] font-bold leading-tight tracking-tight text-slate-900">
                              {previewTemplate.name}
                            </h1>
                            {previewNavStyle === "hamburger" && previewShellTabs.length > 0 ? (
                              <GuestHamburgerMenu
                                tabs={previewShellTabs}
                                currentSlug="preview"
                                locale="ja"
                                clientApp={clientShell.isAppShell}
                                previewMode
                                contained
                              />
                            ) : null}
                          </div>
                        }
                        footer={
                          previewNavStyle === "tabs" && previewShellTabs.length > 0 ? (
                            <GuestBottomTabBar
                              tabs={previewShellTabs}
                              currentSlug="preview"
                              locale="ja"
                              clientApp={clientShell.isAppShell}
                              previewMode
                            />
                          ) : null
                        }
                      >
                        <LocaleProvider value="ja">
                          <ClientShellContext.Provider value={{ ...clientShell, isNativeUi: false }}>
                            <div
                              className="guest-page guest-content-gutter min-h-full w-full"
                              style={{ paddingTop: 16, paddingBottom: 12 }}
                            >
                              <div className={GUEST_CARD_STACK_CLASS}>
                                <CardRenderer cards={previewCards} />
                              </div>
                            </div>
                          </ClientShellContext.Provider>
                        </LocaleProvider>
                      </PhoneDeviceFrame>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  if (isAppShell) {
    return (
      <>
        <AppTabPage
          title="テンプレート"
          description="旅行・推し活・おでかけ。近い型からすぐ始められます。"
          className="pb-4"
          contentClassName="space-y-4"
        >
          <AppSection revealDelay={0}>
            <section className="app-template-intro">
              <p className="app-template-intro-kicker">個人向けテンプレ</p>
              <h2 className="app-template-intro-title">作りたい雰囲気から選ぶ</h2>
              <p className="app-template-intro-body">
                旅のしおり、ライブ遠征、リンクまとめ。あとから写真も文章も自由に変えられます。
              </p>
            </section>
          </AppSection>
          <AppSection revealDelay={0}>
            <div className="app-template-recommend-rail" aria-label="おすすめテンプレート">
              {APP_TEMPLATE_RECOMMENDS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    setAudience("personal");
                    setCategory(item.category);
                    requestTemplateCategoryScroll(item.category);
                    router.replace(item.href, { scroll: false });
                  }}
                  className="app-template-recommend-card app-pressable no-underline"
                  style={{ "--template-recommend-image": `url(${item.image})` } as CSSProperties}
                >
                  <span className="app-template-recommend-kicker">{item.kicker}</span>
                  <span className="app-template-recommend-title">{item.title}</span>
                  <span className="app-template-recommend-body">{item.body}</span>
                </Link>
              ))}
            </div>
          </AppSection>
          <AppSection revealDelay={0}>
            <AppSegmentedControl
              options={TEMPLATE_AUDIENCE_OPTIONS}
              value={audience}
              onChange={(next) => setAudience(next as TemplateMarketplaceAudience)}
              ariaLabel="テンプレートの向け先"
            />
          </AppSection>
          <AppSection revealDelay={0}>
            <AppSegmentedControl
              options={visibleCategories}
              value={category}
              onChange={setCategory}
              ariaLabel="テンプレートカテゴリ"
            />
          </AppSection>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2 app-reveal">
                    <div className="app-shell-skeleton h-4 w-24 rounded-md" />
                    <div className="app-shell-skeleton h-52 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : !hasTemplates ? (
              <AppEmptyState
                icon={<AppIconEmptyTemplates />}
                title="テンプレートがまだありません"
                description="しばらくしてからもう一度お試しください。"
              />
            ) : (
              <div key={`${audience}-${category}`} className="space-y-6 dashboard-tab-fade">
                {showCaseStudyFeatured ? (
                  <AppSection className="app-template-group space-y-2" revealDelay={0}>
                    <h2 className="app-template-section-heading">導入事例テンプレ</h2>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      ビジネスホテル・温泉旅館・リゾートの導入イメージ。実際の運用に近い構成から始められます。
                    </p>
                    <TemplateRail
                      items={caseStudyTemplates}
                      variant="app"
                      groupLabel="導入事例テンプレ"
                      highlightSlug={highlightSlug}
                      usingId={usingId}
                      onUse={handleUseTemplate}
                      onPreview={handlePreview}
                    />
                  </AppSection>
                ) : null}
                {groupsToRender.map((group, index) => {
                  const prev = groupsToRender[index - 1];
                  const showSectionHeading = category === "all" && group.sectionId !== prev?.sectionId;
                  return (
                    <AppSection
                      key={`${group.sectionId}-${group.category}`}
                      className="app-template-group space-y-2"
                      revealDelay={Math.min(index * 50, 200)}
                    >
                      <div id={`template-category-${group.category}`} className="app-template-category-anchor" />
                      {showSectionHeading ? (
                        <h2 className="app-template-section-heading">
                          {group.sectionLabel}
                        </h2>
                      ) : null}
                      <h3 className="app-template-category-heading">{group.label}</h3>
                      <TemplateRail
                        items={group.items}
                        variant="app"
                        groupLabel={group.label}
                        highlightSlug={highlightSlug}
                        usingId={usingId}
                        onUse={handleUseTemplate}
                        onPreview={handlePreview}
                      />
                    </AppSection>
                  );
                })}
              </div>
            )}
          </div>
        </AppTabPage>
        {mounted && previewTemplate ? previewDialog : null}
      </>
    );
  }

  return (
    <div className="app-main-container space-y-6">
      <header className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="app-page-title">テンプレート</h1>
          <p className="app-page-subtitle">
            ゲスト案内・館内ハブ・混雑ボードなど、Infomiiで作れる宿泊ページの型から選べます。
          </p>
        </div>
        <PageHelp
          className="shrink-0 self-start sm:self-auto"
          title={PAGE_HELP.templates.title}
          description={PAGE_HELP.templates.description}
          items={[...PAGE_HELP.templates.items]}
        />
      </header>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {visibleCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={
              "app-button-native shrink-0 rounded-md px-3 py-2 text-sm transition " +
              (category === c.id
                ? "bg-slate-900 !text-white font-medium"
                : "bg-white font-medium text-slate-600 ring-1 ring-[#e6e8eb] hover:bg-slate-50")
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
        ) : !hasTemplates ? (
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
          <div key={`${audience}-${category}`} className="space-y-6 dashboard-tab-fade">
            {showCaseStudyFeatured ? (
              <AppSection className="space-y-2">
                <h2 className="text-base font-bold tracking-tight text-slate-800">導入事例テンプレ</h2>
                <p className="text-sm text-slate-600">
                  ビジネスホテル・温泉旅館・リゾートの導入イメージ。実際の運用に近い構成から始められます。
                </p>
                <TemplateRail
                  items={caseStudyTemplates}
                  variant="default"
                  groupLabel="導入事例テンプレ"
                  highlightSlug={highlightSlug}
                  usingId={usingId}
                  onUse={handleUseTemplate}
                  onPreview={handlePreview}
                />
              </AppSection>
            ) : null}
            {groupsToRender.map((group, index) => {
              const prev = groupsToRender[index - 1];
              const showSectionHeading = category === "all" && group.sectionId !== prev?.sectionId;
              return (
                <AppSection
                  key={`${group.sectionId}-${group.category}`}
                  className="space-y-2"
                >
                  {showSectionHeading ? (
                    <h2 className="text-base font-bold tracking-tight text-slate-800">
                      {group.sectionLabel}
                    </h2>
                  ) : null}
                  <h3 className="text-sm font-semibold text-slate-700">{group.label}</h3>
                  <TemplateRail
                    items={group.items}
                    variant="default"
                    groupLabel={group.label}
                    highlightSlug={highlightSlug}
                    usingId={usingId}
                    onUse={handleUseTemplate}
                    onPreview={handlePreview}
                  />
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

      {previewDialog}

    </div>
  );
}
