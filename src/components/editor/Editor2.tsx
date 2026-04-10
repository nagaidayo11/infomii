"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EDITOR_FONT_OPTIONS } from "@/lib/editor-font-options";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { FreeformCanvas } from "./FreeformCanvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SaveToast } from "./SaveToast";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditor2Store } from "./store";
import { useAutoSaveCards } from "./useAutoSaveCards";
import {
  BUSINESS_ONLY_CARD_TYPES,
  CARD_TYPE_LABELS,
  createEmptyCard,
  STARTER_CARD_TYPES,
  type CardType,
} from "./types";
import { getLocalizedContent, type LocalizedString, type SupportedLocale } from "@/lib/localized-content";
import {
  getInformationBySlug,
  getPage,
  buildPublicUrlV,
  savePageCards,
  setInformationStatusBySlug,
  requestPublishApprovalBySlug,
  getPendingPublishApprovalBySlug,
  approvePublishApprovalBySlug,
  updatePageTitle,
  getCurrentHotelSubscription,
  getCurrentHotelTranslationUsage,
  trackCurrentHotelTranslationRun,
  getCurrentUserHotelRole,
  trackUpgradeClick,
} from "@/lib/storage";
import {
  detectBusinessTypeMisuse,
  estimateTemplateConsistencyScore,
  hasInvalidRange,
} from "@/lib/server-time";

/**
 * Canvas-based card editor — Notion-like experience.
 * State is centralized in useEditor2Store (cards, selectedCardId, isSaving, pageMeta).
 * Canvas, library and settings all use the same store.
 */
type Editor2Props = {
  pageId?: string | null;
  mode?: "full" | "demo";
  demoPreviewUrl?: string;
  startUnselected?: boolean;
};

const DEMO_STORAGE_KEY = "editor2:demo-state:v2";
const DEMO_FRONTDESK_PRESET_TYPES: CardType[] = ["hero", "notice", "pageLinks", "faq", "emergency"];
const TRANSLATION_OVERLAY_LABELS = "JA / EN / 中文 / 한국어";

export function Editor2({
  pageId,
  mode = "full",
  demoPreviewUrl = "/p/demo-hub-menu",
  startUnselected = false,
}: Editor2Props) {
  const isDemoMode = mode === "demo";
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [publishState, setPublishState] = useState<{
    publicUrl: string;
    pageTitle: string;
    slug: string;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [prepublishState, setPrepublishState] = useState<{
    errors: string[];
    warnings: string[];
    allowContinue: boolean;
  } | null>(null);
  const [bulkFontOpen, setBulkFontOpen] = useState(false);
  const [bulkFontFamily, setBulkFontFamily] = useState<string>("");
  const editorLocale: SupportedLocale = "ja";
  const [localeTranslating, setLocaleTranslating] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [demoLockMessage, setDemoLockMessage] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [publishToggleLoading, setPublishToggleLoading] = useState(false);
  const [publishFlowBusy, setPublishFlowBusy] = useState(false);
  const [togglePublishBusy, setTogglePublishBusy] = useState(false);
  const [qrModalPreparing, setQrModalPreparing] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [hotelRole, setHotelRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [hasPendingApproval, setHasPendingApproval] = useState(false);
  const [businessUpsellState, setBusinessUpsellState] = useState<{
    open: boolean;
    lockedType: CardType | null;
  }>({ open: false, lockedType: null });
  const openBusinessUpsell = useCallback((type: CardType) => {
    void trackUpgradeClick("editor");
    setBusinessUpsellState({ open: true, lockedType: type });
  }, []);

  const cards = useEditor2Store((s) => s.cards);
  const selectedCardId = useEditor2Store((s) => s.selectedCardId);
  const lastAddedCardId = useEditor2Store((s) => s.lastAddedCardId);
  const pageBackgroundMode = useEditor2Store((s) => s.pageBackgroundMode);
  const pageBackgroundColor = useEditor2Store((s) => s.pageBackgroundColor);
  const pageGradientFrom = useEditor2Store((s) => s.pageGradientFrom);
  const pageGradientTo = useEditor2Store((s) => s.pageGradientTo);
  const pageGradientAngle = useEditor2Store((s) => s.pageGradientAngle);
  const isSaving = useEditor2Store((s) => s.isSaving);
  const lastSavedAt = useEditor2Store((s) => s.lastSavedAt);
  const saveError = useEditor2Store((s) => s.saveError);
  const pageMeta = useEditor2Store((s) => s.pageMeta);
  const addCard = useEditor2Store((s) => s.addCard);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const removeCard = useEditor2Store((s) => s.removeCard);
  const duplicateCard = useEditor2Store((s) => s.duplicateCard);
  const undo = useEditor2Store((s) => s.undo);
  const redo = useEditor2Store((s) => s.redo);
  const clearCards = useEditor2Store((s) => s.clearCards);
  const replaceTextAll = useEditor2Store((s) => s.replaceTextAll);
  const applyFontFamilyAll = useEditor2Store((s) => s.applyFontFamilyAll);
  const canUndo = useEditor2Store((s) => s.historyPast.length > 0);
  const canRedo = useEditor2Store((s) => s.historyFuture.length > 0);
  const setPageMeta = useEditor2Store((s) => s.setPageMeta);
  const setPageBackground = useEditor2Store((s) => s.setPageBackground);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);
  const setCards = useEditor2Store((s) => s.setCards);

  const runPrepublishChecks = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (cards.length === 0) {
      errors.push("ブロックが1つもありません。最低1ブロック追加してください。");
    }
    const hasWifi = cards.some((c) => c.type === "wifi");
    const hasCheckout = cards.some((c) => c.type === "checkout");
    if (!hasWifi) {
      warnings.push(
        "「Wi-Fi」ブロックがまだありません。接続手順やSSIDを載せると、宿泊客が迷いにくくなります（任意・後から追加可）。",
      );
    }
    if (!hasCheckout) {
      warnings.push(
        "「チェックアウト」ブロックがまだありません。退室時刻や手順を載せると安心です（任意・後から追加可）。",
      );
    }
    const placeholderPattern = /\[[^\]]+\]|ここに|入力してください|記載してください/;
    const emptyOrAnchorHrefPattern = /^#?$|^\s*$/;
    cards.forEach((card) => {
      const raw = JSON.stringify(card.content ?? {});
      if (placeholderPattern.test(raw)) {
        warnings.push(
          `「${card.type}」ブロックに、まだ仮の文言（例: [ ] や「ここに〜」）が残っている可能性があります。公開前に実際の内容へ差し替えてください。`,
        );
      }
      if (card.type === "button") {
        const href = String((card.content as Record<string, unknown>).href ?? "");
        if (emptyOrAnchorHrefPattern.test(href)) {
          warnings.push(
            "リンクボタンの「リンク先URL」が未設定です。タップしても飛べない状態のままです。",
          );
        }
      }
      if (card.type === "scheduled_banner") {
        const c = card.content as Record<string, unknown>;
        const startAt = typeof c.startAt === "string" ? c.startAt : undefined;
        const endAt = typeof c.endAt === "string" ? c.endAt : undefined;
        if (hasInvalidRange(startAt, endAt)) {
          errors.push("期間限定バナーの開始日時が終了日時より後になっています。");
        }
      }
      if (card.type === "campaign_timer") {
        const c = card.content as Record<string, unknown>;
        const startAt = typeof c.startAt === "string" ? c.startAt : undefined;
        const endAt = typeof c.endAt === "string" ? c.endAt : undefined;
        if (hasInvalidRange(startAt, endAt)) {
          errors.push("キャンペーンタイマーの開始日時が終了日時より後になっています。");
        }
      }
    });
    const lowConsistencyScore = estimateTemplateConsistencyScore(pageMeta.title || "", JSON.stringify(cards));
    if (lowConsistencyScore < 60) {
      warnings.push(`テンプレート整合スコアが低めです（${lowConsistencyScore}）。タイトルと画像/本文の一致を見直してください。`);
    }
    if (detectBusinessTypeMisuse(cards.map((c) => c.type), translationEnabled)) {
      warnings.push("Business限定ブロックが含まれています。現在のプランで公開時表示が制限される可能性があります。");
    }
    return { errors, warnings };
  }, [cards, pageMeta.title, translationEnabled]);

  useEffect(() => {
    if (!isDemoMode) return;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            cards?: typeof cards;
            background?: {
              mode?: "solid" | "gradient";
              color?: string;
              from?: string;
              to?: string;
              angle?: number;
            };
          };
          if (Array.isArray(parsed.cards) && parsed.cards.length > 0) {
            setCards(parsed.cards);
            selectCard(startUnselected ? null : (parsed.cards[0]?.id ?? null));
            if (parsed.background) {
              setPageBackground({
                mode: parsed.background.mode,
                color: parsed.background.color,
                from: parsed.background.from,
                to: parsed.background.to,
                angle: parsed.background.angle,
              });
            }
            setPageMeta({
              pageId: null,
              title: "デモ編集画面",
              slug: "demo-preview",
              publicUrl: demoPreviewUrl,
            });
            return;
          }
        }
      } catch {
        // ignore malformed localStorage and fall back to starter cards
      }
    }
    const starterTypes = isDemoMode ? DEMO_FRONTDESK_PRESET_TYPES : STARTER_CARD_TYPES;
    const starterCards = starterTypes.map((type, i) =>
      createEmptyCard(type, `demo-${i}-${Math.random().toString(36).slice(2, 8)}`, i)
    );
    setCards(starterCards);
    selectCard(startUnselected ? null : (starterCards[0]?.id ?? null));
    setPageMeta({
      pageId: null,
      title: "デモ編集画面",
      slug: "demo-preview",
      publicUrl: demoPreviewUrl,
    });
  }, [isDemoMode, demoPreviewUrl, setCards, selectCard, setPageMeta, setPageBackground, startUnselected]);

  useEffect(() => {
    if (!isDemoMode || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        DEMO_STORAGE_KEY,
        JSON.stringify({
          cards,
          background: {
            mode: pageBackgroundMode,
            color: pageBackgroundColor,
            from: pageGradientFrom,
            to: pageGradientTo,
            angle: pageGradientAngle,
          },
        })
      );
      setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now(), saveError: null });
    } catch {
      // ignore localStorage quota errors in demo mode
    }
  }, [
    isDemoMode,
    cards,
    pageBackgroundMode,
    pageBackgroundColor,
    pageGradientFrom,
    pageGradientTo,
    pageGradientAngle,
    setAutosaveStatus,
  ]);

  useEffect(() => {
    if (isDemoMode) return;
    if (!pageId) {
      setPageMeta({ pageId: null, title: "", slug: "", publicUrl: null });
      return;
    }
    getPage(pageId).then((page) => {
      if (page) {
        setPageMeta({
          pageId,
          title: page.title ?? "",
          slug: page.slug,
          publicUrl: buildPublicUrlV(page.slug),
        });
        getInformationBySlug(page.slug)
          .then((info) => {
            setPublishStatus(info?.status === "published" ? "published" : "draft");
          })
          .catch(() => {
            setPublishStatus("draft");
          });
      }
    });
    getCurrentHotelSubscription()
      .then((sub) => {
        setTranslationEnabled(Boolean(sub && sub.plan === "business"));
      })
      .catch(() => {
        setTranslationEnabled(false);
      });
    getCurrentUserHotelRole().then(setHotelRole).catch(() => setHotelRole(null));
  }, [isDemoMode, pageId, setPageMeta]);

  useEffect(() => {
    if (isDemoMode || !pageMeta.slug) return;
    getPendingPublishApprovalBySlug(pageMeta.slug)
      .then((row) => setHasPendingApproval(Boolean(row)))
      .catch(() => setHasPendingApproval(false));
  }, [isDemoMode, pageMeta.slug, publishStatus]);

  useEffect(() => {
    if (!pageId || typeof window === "undefined" || isDemoMode) return;
    const key = `editor-page-background:${pageId}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        mode: pageBackgroundMode,
        color: pageBackgroundColor,
        from: pageGradientFrom,
        to: pageGradientTo,
        angle: pageGradientAngle,
      })
    );
  }, [isDemoMode, pageId, pageBackgroundMode, pageBackgroundColor, pageGradientFrom, pageGradientTo, pageGradientAngle]);

  const { retry } = useAutoSaveCards(pageId ?? null);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  const handleSlashKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== "/") return;
    const root = rootRef.current;
    const target = e.target as Node | null;
    if (!root || !target || !root.contains(target)) return;
    const el = target as HTMLElement;
    if (
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
    setSlashMenuOpen(true);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleSlashKey);
    return () => document.removeEventListener("keydown", handleSlashKey);
  }, [handleSlashKey]);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (slashMenuOpen) return;
      const root = rootRef.current;
      const target = e.target as HTMLElement | null;
      if (!root || !target || !root.contains(target)) return;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) {
        const isEmpty =
          (target as HTMLInputElement | HTMLTextAreaElement).value?.trim() === "" ||
          target.textContent?.trim() === "";
        if (isEmpty) {
          if (e.key === "Backspace" || e.key === "Delete") {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId && selectedCardId === cardId) {
              e.preventDefault();
              removeCard(cardId);
              (target as HTMLElement).blur();
            }
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId) {
              e.preventDefault();
              const idx = cards.findIndex((c) => c.id === cardId);
              if (idx >= 0) {
                addCard("text", idx + 1);
                (target as HTMLElement).blur();
              }
            }
            return;
          }
        }
        if (e.key === "Backspace" || e.key === "Delete") return;
      }
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key === "d") {
        e.preventDefault();
        if (selectedCardId) duplicateCard(selectedCardId);
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedCardId) {
        const el = target as HTMLElement;
        if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !el.isContentEditable) {
          e.preventDefault();
          removeCard(selectedCardId);
        }
      }
    },
    [undo, redo, duplicateCard, removeCard, addCard, selectedCardId, slashMenuOpen, cards]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const handleSlashSelect = useCallback(
    (type: CardType) => {
      if (BUSINESS_ONLY_CARD_TYPES.includes(type) && !translationEnabled) {
        if (isDemoMode) {
          setDemoLockMessage("このブロックはBusinessプラン限定です。");
        } else {
          openBusinessUpsell(type);
        }
        return;
      }
      addCard(type);
      setSlashMenuOpen(false);
    },
    [addCard, translationEnabled, isDemoMode, openBusinessUpsell]
  );

  const publishNow = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    if (!pageId) return;
    setPublishing(true);
    try {
      const state = useEditor2Store.getState();
      await savePageCards(pageId, state.cards, {
        pageStyle: {
          background: {
            mode: state.pageBackgroundMode,
            color: state.pageBackgroundColor,
            from: state.pageGradientFrom,
            to: state.pageGradientTo,
            angle: state.pageGradientAngle,
          },
        },
      });
      const page = await getPage(pageId);
      if (!page?.slug) {
        setPublishing(false);
        return;
      }
      await setInformationStatusBySlug(page.slug, "published");
      setPublishStatus("published");
      const publicUrl = buildPublicUrlV(page.slug);
      setPublishState({
        publicUrl,
        pageTitle: page.title ?? "",
        slug: page.slug,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "公開処理に失敗しました。");
    } finally {
      setPublishing(false);
    }
  }, [isDemoMode, pageId]);

  const handlePublishClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    const report = runPrepublishChecks();
    if (report.errors.length > 0 || report.warnings.length > 0) {
      setPrepublishState({
        errors: report.errors,
        warnings: report.warnings,
        allowContinue: report.errors.length === 0,
      });
      return;
    }
    await publishNow();
  }, [isDemoMode, publishNow, runPrepublishChecks]);

  /** 公開済みページのみ: 保存してQR/URLモーダルを開く（初回公開は「公開」ボタンを使用） */
  const handleQrClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    if (!pageId || !pageMeta.slug) return;
    if (publishStatus !== "published") {
      window.alert(
        "QRコードを表示するには、先にページを公開してください。\n「公開」ボタンから公開すると、URLとQRを確認できます。",
      );
      return;
    }
    setQrModalPreparing(true);
    try {
      const state = useEditor2Store.getState();
      await savePageCards(pageId, state.cards, {
        pageStyle: {
          background: {
            mode: state.pageBackgroundMode,
            color: state.pageBackgroundColor,
            from: state.pageGradientFrom,
            to: state.pageGradientTo,
            angle: state.pageGradientAngle,
          },
        },
      });
      const publicUrl = buildPublicUrlV(pageMeta.slug);
      setPublishState({
        publicUrl,
        pageTitle: pageMeta.title ?? "",
        slug: pageMeta.slug,
      });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "保存に失敗しました。");
    } finally {
      setQrModalPreparing(false);
    }
  }, [isDemoMode, pageId, pageMeta.slug, pageMeta.title, publishStatus]);

  const handleAddPreset = useCallback(
    (types: CardType[]) => {
      for (const type of types) {
        if (BUSINESS_ONLY_CARD_TYPES.includes(type) && !translationEnabled) {
          if (isDemoMode) {
            setDemoLockMessage("このセットにはBusinessプラン限定ブロックが含まれています。");
          } else {
            openBusinessUpsell(type);
          }
          continue;
        }
        addCard(type);
      }
    },
    [addCard, translationEnabled, isDemoMode, openBusinessUpsell]
  );

  const handleClearAll = useCallback(() => {
    if (cards.length === 0) return;
    const ok = window.confirm("このページのブロックをすべて削除します。よろしいですか？");
    if (!ok) return;
    clearCards();
  }, [cards.length, clearCards]);

  const handleRenamePageTitle = useCallback(
    async (nextTitle: string) => {
      if (isDemoMode || !pageId) return;
      await updatePageTitle(pageId, nextTitle);
      setPageMeta({
        ...pageMeta,
        title: nextTitle,
      });
    },
    [isDemoMode, pageId, pageMeta, setPageMeta]
  );

  const handleRunPrepublishCheck = useCallback(() => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開前チェックは利用できません。無料登録で解放されます。");
      return;
    }
    const report = runPrepublishChecks();
    setPrepublishState({
      errors: report.errors,
      warnings: report.warnings,
      allowContinue: false,
    });
  }, [isDemoMode, runPrepublishChecks]);

  const handleTogglePublished = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開状態の変更は利用できません。無料登録で解放されます。");
      return;
    }
    if (!pageMeta.slug || publishToggleLoading) return;
    const nextStatus = publishStatus === "published" ? "draft" : "published";
    setPublishToggleLoading(true);
    try {
      await setInformationStatusBySlug(pageMeta.slug, nextStatus);
      setPublishStatus(nextStatus);
    } catch (e) {
      alert(e instanceof Error ? e.message : "公開状態の変更に失敗しました。");
    } finally {
      setPublishToggleLoading(false);
    }
  }, [isDemoMode, pageMeta.slug, publishStatus, publishToggleLoading]);

  const translateAllCardsToMultilingual = useCallback(async (): Promise<number> => {
    if (cards.length === 0) return 0;
    const cache = new Map<string, { en: string; zh: string; ko: string }>();
    const nonTranslatable = new Set([
      "href",
      "link",
      "linkUrl",
      "src",
      "mapEmbedUrl",
      "pageSlug",
      "icon",
      "variant",
      "style",
      "color",
      "accent",
    ]);

    const collectTargets = (value: unknown, key?: string, out: Set<string> = new Set()): Set<string> => {
      if (typeof value === "string") {
        const ja = value.trim();
        if (!ja || (key && nonTranslatable.has(key)) || /^https?:\/\//i.test(ja) || ja.length < 2) return out;
        out.add(ja);
        return out;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const localized = value as Record<string, unknown>;
        if ("ja" in localized || "en" in localized || "zh" in localized || "ko" in localized) {
          const ja = getLocalizedContent(localized as LocalizedString, "ja").trim();
          if (ja && ja.length >= 2 && !/^https?:\/\//i.test(ja)) out.add(ja);
          return out;
        }
      }
      if (Array.isArray(value)) {
        value.forEach((v) => collectTargets(v, key, out));
        return out;
      }
      if (value && typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => collectTargets(v, k, out));
      }
      return out;
    };

    const translateBatch = async (targets: string[]) => {
      if (targets.length === 0) return;
      const res = await fetch("/api/ai/translate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: targets }),
      });
      if (!res.ok) throw new Error("batch translate failed");
      const data = (await res.json()) as { items?: Array<{ i: number; en: string; zh: string; ko: string }> };
      const items = Array.isArray(data.items) ? data.items : [];
      for (const item of items) {
        const source = targets[item.i];
        if (!source) continue;
        if (typeof item.en === "string" && typeof item.zh === "string" && typeof item.ko === "string") {
          cache.set(source, { en: item.en, zh: item.zh, ko: item.ko });
        }
      }
    };

    const walk = async (value: unknown, key?: string): Promise<{ value: unknown; count: number }> => {
      if (typeof value === "string") {
        const ja = value.trim();
        if (!ja || (key && nonTranslatable.has(key)) || /^https?:\/\//i.test(ja) || ja.length < 2) return { value, count: 0 };
        const translated = cache.get(ja);
        if (!translated) return { value, count: 0 };
        return { value: { ja: value, en: translated.en, zh: translated.zh, ko: translated.ko }, count: 1 };
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const localized = value as Record<string, unknown>;
        if ("ja" in localized || "en" in localized || "zh" in localized || "ko" in localized) {
          const ja = getLocalizedContent(localized as LocalizedString, "ja");
          const translated = cache.get(ja.trim());
          if (!translated) return { value, count: 0 };
          return {
            value: { ...localized, ja, en: translated.en, zh: translated.zh, ko: translated.ko },
            count: 1,
          };
        }
      }
      if (Array.isArray(value)) {
        const next: unknown[] = [];
        let total = 0;
        for (const item of value) {
          const result = await walk(item, key);
          next.push(result.value);
          total += result.count;
        }
        return { value: next, count: total };
      }
      if (value && typeof value === "object") {
        const next: Record<string, unknown> = {};
        let total = 0;
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          const result = await walk(v, k);
          next[k] = result.value;
          total += result.count;
        }
        return { value: next, count: total };
      }
      return { value, count: 0 };
    };

    const targets = Array.from(cards.reduce((set, card) => collectTargets(card.content as Record<string, unknown>, undefined, set), new Set<string>()));
    await translateBatch(targets);

    const nextCards = [...cards];
    let translatedCount = 0;
    for (let i = 0; i < nextCards.length; i += 1) {
      const card = nextCards[i];
      const result = await walk(card.content as Record<string, unknown>);
      translatedCount += result.count;
      nextCards[i] = { ...card, content: result.value as Record<string, unknown> };
    }
    if (translatedCount > 0) setCards(nextCards);
    return translatedCount;
  }, [cards, setCards]);

  const ensureTranslationsBeforePublish = useCallback(
    async (opts?: { translationSource?: "pre_publish" | "preview" }): Promise<string | null> => {
    const flow = opts?.translationSource === "preview" ? "preview" : "publish";
    const nonTranslatable = new Set([
      "href",
      "link",
      "linkUrl",
      "src",
      "mapEmbedUrl",
      "pageSlug",
      "icon",
      "variant",
      "style",
      "color",
      "accent",
    ]);
    const requiredLocales: SupportedLocale[] = ["ja", "en", "zh", "ko"];
    const collectTargets = (value: unknown, key?: string, out: Set<string> = new Set()): Set<string> => {
      if (typeof value === "string") {
        const ja = value.trim();
        if (!ja || (key && nonTranslatable.has(key)) || /^https?:\/\//i.test(ja) || ja.length < 2) return out;
        out.add(ja);
        return out;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const localized = value as Record<string, unknown>;
        if ("ja" in localized || "en" in localized || "zh" in localized || "ko" in localized) {
          const ja = getLocalizedContent(localized as LocalizedString, "ja").trim();
          const hasMissingLocale = requiredLocales.some((localeCode) => {
            const val = localized[localeCode];
            return typeof val !== "string" || val.trim().length === 0;
          });
          if (hasMissingLocale && ja && ja.length >= 2 && !/^https?:\/\//i.test(ja)) out.add(ja);
          return out;
        }
      }
      if (Array.isArray(value)) {
        value.forEach((v) => collectTargets(v, key, out));
        return out;
      }
      if (value && typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => collectTargets(v, k, out));
      }
      return out;
    };
    const targetsBefore = Array.from(
      cards.reduce((set, card) => collectTargets(card.content as Record<string, unknown>, undefined, set), new Set<string>())
    );
    if (targetsBefore.length === 0) return null;

    const subscription = await getCurrentHotelSubscription().catch(() => null);
    if (!subscription || subscription.plan !== "business") {
      return flow === "preview"
        ? "未翻訳項目があります。プレビュー前に翻訳を完了するにはBusinessプランが必要です。"
        : "未翻訳項目があります。公開前に翻訳を完了するにはBusinessプランが必要です。";
    }
    const usage = await getCurrentHotelTranslationUsage().catch(() => null);
    if (usage && usage.usedRuns >= usage.includedRuns) {
      return flow === "preview"
        ? `未翻訳項目があります。今月の翻訳実行枠（${usage.includedRuns}回）に達しているためプレビューできません。`
        : `未翻訳項目があります。今月の翻訳実行枠（${usage.includedRuns}回）に達しているため公開できません。`;
    }

    setLocaleTranslating(true);
    try {
      const translatedCount = await translateAllCardsToMultilingual();
      if (translatedCount > 0) {
        await trackCurrentHotelTranslationRun({
          translatedItems: translatedCount,
          source: flow === "preview" ? "preview" : "pre_publish",
        });
      }
      const latestCards = useEditor2Store.getState().cards;
      const remainingTargets = Array.from(
        latestCards.reduce(
          (set, card) => collectTargets(card.content as Record<string, unknown>, undefined, set),
          new Set<string>()
        )
      );
      if (remainingTargets.length > 0) {
        return flow === "preview"
          ? `未翻訳項目が ${remainingTargets.length} 件残っているためプレビューできません。編集内容を確認してください。`
          : `未翻訳項目が ${remainingTargets.length} 件残っているため公開できません。編集内容を確認してください。`;
      }
      return null;
    } catch {
      return flow === "preview"
        ? "自動翻訳に失敗したためプレビューできません。時間をおいて再試行してください。"
        : "自動翻訳に失敗したため公開できません。時間をおいて再試行してください。";
    } finally {
      setLocaleTranslating(false);
    }
  },
    [cards, translateAllCardsToMultilingual]
  );

  const handlePreviewClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      window.open(demoPreviewUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!pageMeta.publicUrl || !pageId) return;
    setPreviewBusy(true);
    try {
      const state = useEditor2Store.getState();
      try {
        await savePageCards(pageId, state.cards, {
          pageStyle: {
            background: {
              mode: state.pageBackgroundMode,
              color: state.pageBackgroundColor,
              from: state.pageGradientFrom,
              to: state.pageGradientTo,
              angle: state.pageGradientAngle,
            },
          },
        });
      } catch {
        // Even if save fails, allow user to inspect current public page.
      }
      const translationError = await ensureTranslationsBeforePublish({ translationSource: "preview" });
      if (translationError) {
        window.alert(translationError);
        return;
      }
      try {
        const after = useEditor2Store.getState();
        await savePageCards(pageId, after.cards, {
          pageStyle: {
            background: {
              mode: after.pageBackgroundMode,
              color: after.pageBackgroundColor,
              from: after.pageGradientFrom,
              to: after.pageGradientTo,
              angle: after.pageGradientAngle,
            },
          },
        });
      } catch {
        // Preview tab still opens; user may see slightly stale server content until save succeeds.
      }
      const previewUrl = `${pageMeta.publicUrl}${pageMeta.publicUrl.includes("?") ? "&" : "?"}preview=1`;
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } finally {
      setPreviewBusy(false);
    }
  }, [isDemoMode, demoPreviewUrl, pageMeta.publicUrl, pageId, ensureTranslationsBeforePublish]);

  const handlePublishClickStrict = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    setPublishFlowBusy(true);
    try {
      const translationError = await ensureTranslationsBeforePublish();
      if (translationError) {
        setPrepublishState({
          errors: [translationError],
          warnings: [],
          allowContinue: false,
        });
        return;
      }
      if (hotelRole === "editor") {
        if (!pageMeta.slug) {
          window.alert("公開申請対象ページが見つかりません。");
          return;
        }
        await requestPublishApprovalBySlug(pageMeta.slug);
        setHasPendingApproval(true);
        window.alert("公開申請を送信しました。オーナー/管理者の承認後に公開されます。");
        return;
      }
      if ((hotelRole === "owner" || hotelRole === "admin") && hasPendingApproval && pageMeta.slug) {
        await approvePublishApprovalBySlug(pageMeta.slug);
        setHasPendingApproval(false);
        setPublishStatus("published");
        window.alert("公開申請を承認し、公開しました。");
        return;
      }
      await handlePublishClick();
    } finally {
      setPublishFlowBusy(false);
    }
  }, [isDemoMode, ensureTranslationsBeforePublish, handlePublishClick, hotelRole, pageMeta.slug, hasPendingApproval]);

  /** 警告だけのとき「このまま公開」用。再び公開前チェックを走らせず翻訳確認後にそのまま公開する */
  const handlePublishPastWarnings = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    setPublishFlowBusy(true);
    try {
      const translationError = await ensureTranslationsBeforePublish();
      if (translationError) {
        setPrepublishState({
          errors: [translationError],
          warnings: [],
          allowContinue: false,
        });
        return;
      }
      setPrepublishState(null);
      await publishNow();
    } finally {
      setPublishFlowBusy(false);
    }
  }, [isDemoMode, ensureTranslationsBeforePublish, publishNow]);

  const handleTogglePublishedStrict = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開状態の変更は利用できません。無料登録で解放されます。");
      return;
    }
    setTogglePublishBusy(true);
    try {
      if (publishStatus !== "published") {
        const translationError = await ensureTranslationsBeforePublish();
        if (translationError) {
          window.alert(translationError);
          return;
        }
      }
      await handleTogglePublished();
    } finally {
      setTogglePublishBusy(false);
    }
  }, [isDemoMode, publishStatus, ensureTranslationsBeforePublish, handleTogglePublished]);

  const topBar =
    pageId || isDemoMode ? (
      <EditorTopBar
        backHref={isDemoMode ? "/lp/saas" : "/dashboard"}
        demoMode={isDemoMode}
        pageTitle={isDemoMode ? "デモ編集画面" : pageMeta.title}
        saving={isSaving}
        lastSavedAt={lastSavedAt}
        saveError={saveError}
        onRetry={retry}
        status={publishStatus}
        publicUrl={isDemoMode ? demoPreviewUrl : pageMeta.publicUrl}
        publishing={publishing}
        qrPreparing={qrModalPreparing}
        canUndo={canUndo}
        canRedo={canRedo}
        canClearAll={cards.length > 0}
        onUndo={undo}
        onRedo={redo}
        onClearAll={handleClearAll}
        onEditPageBackground={() => {
          if (isDemoMode) {
            setDemoLockMessage("デモモードでは詳細設定は利用できません。無料登録で解放されます。");
            return;
          }
          selectCard(null);
        }}
        onBulkFont={() => {
          if (isDemoMode) {
            setDemoLockMessage("デモモードでは詳細設定は利用できません。無料登録で解放されます。");
            return;
          }
          setBulkFontOpen(true);
        }}
        onPreview={handlePreviewClick}
        previewPreparing={previewBusy || localeTranslating}
        onPublish={handlePublishClickStrict}
        publishActionLabel={
          hotelRole === "editor"
            ? hasPendingApproval
              ? "再申請"
              : "公開申請"
            : hasPendingApproval
              ? "承認して公開"
              : "公開"
        }
        onQr={handleQrClick}
        onTogglePublished={isDemoMode || hotelRole === "editor" ? undefined : handleTogglePublishedStrict}
        publishToggleLoading={publishToggleLoading}
        publishToggleChecked={publishStatus === "published"}
        onRenamePageTitle={isDemoMode ? undefined : handleRenamePageTitle}
      />
    ) : null;

  const showEditorBusyOverlay =
    previewBusy || publishFlowBusy || publishing || togglePublishBusy || qrModalPreparing;
  const showBusinessTranslationOverlay = translationEnabled && localeTranslating;
  let editorBusyTitle = "公開中...";
  let editorBusySubtitle = "保存と公開設定を実行しています";
  if (previewBusy && showBusinessTranslationOverlay) {
    editorBusyTitle = `${TRANSLATION_OVERLAY_LABELS} 一括翻訳中...`;
    editorBusySubtitle = "公開前に多言語データを整えています";
  } else if (previewBusy) {
    editorBusyTitle = "プレビュー準備中...";
    editorBusySubtitle = "保存してプレビューを開きます";
  } else if (togglePublishBusy) {
    if (showBusinessTranslationOverlay) {
      editorBusyTitle = `${TRANSLATION_OVERLAY_LABELS} 一括翻訳中...`;
      editorBusySubtitle = "公開前に多言語データを整えています";
    } else {
      editorBusyTitle = "公開準備中...";
      editorBusySubtitle =
        publishStatus === "published"
          ? "公開OFFへ切り替えています"
          : "公開ONへ切り替えています";
    }
  } else if (qrModalPreparing) {
    editorBusyTitle = "QRを表示しています";
    editorBusySubtitle = "最新の編集内容を保存しています";
  } else if (publishFlowBusy && showBusinessTranslationOverlay) {
    editorBusyTitle = `${TRANSLATION_OVERLAY_LABELS} 一括翻訳中...`;
    editorBusySubtitle = "公開前に多言語データを取得・反映しています";
  } else if (publishFlowBusy) {
    editorBusyTitle = "公開準備中...";
    editorBusySubtitle = "保存と公開前チェックを実行しています";
  }

  return (
    <LocaleProvider value={editorLocale}>
      <div ref={rootRef} className="h-[100dvh] w-full overflow-hidden">
        <EditorLayout
          topBar={topBar}
          library={
            <CardLibrary
              onAddCard={(type) => {
                if (BUSINESS_ONLY_CARD_TYPES.includes(type) && !translationEnabled) {
                  if (isDemoMode) {
                    setDemoLockMessage("このブロックはBusinessプラン限定です。");
                  } else {
                    openBusinessUpsell(type);
                  }
                  return;
                }
                addCard(type);
              }}
              onAddPreset={handleAddPreset}
              canUseBusinessBlocks={translationEnabled}
              onLockedAddCard={(type) => {
                if (isDemoMode) {
                  setDemoLockMessage("このブロックはBusinessプラン限定です。");
                } else {
                  openBusinessUpsell(type);
                }
              }}
            />
          }
          canvas={
            <div ref={canvasRef} className="flex h-full flex-col overflow-hidden">
              {!isDemoMode && publishStatus !== "published" && (
                <div className="mx-4 mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  現在公開OFFになっています（プレビュー/QRアクセス時は公開OFFエラーになります）。
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-auto">
                <FreeformCanvas
                  cards={cards}
                  selectedCardId={selectedCardId}
                  onSelectCard={selectCard}
                  onUpdateCard={updateCard}
                  onReorderCards={reorderCards}
                  pageBackground={{
                    mode: pageBackgroundMode,
                    color: pageBackgroundColor,
                    from: pageGradientFrom,
                    to: pageGradientTo,
                    angle: pageGradientAngle,
                  }}
                />
              </div>
            </div>
          }
          settings={
            <CardSettings
              card={selectedCard}
              onUpdate={updateCard}
              onDuplicateCard={duplicateCard}
              onRemoveCard={removeCard}
              onBulkReplace={isDemoMode ? undefined : replaceTextAll}
              onRunPrepublishCheck={isDemoMode ? undefined : handleRunPrepublishCheck}
              lastAddedCardId={lastAddedCardId}
              demoMode={isDemoMode}
              onLockedAction={(message) => setDemoLockMessage(message)}
              isBusinessEnabled={translationEnabled}
            />
          }
        />
        <SlashCommandMenu
          open={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashSelect}
          anchorRef={canvasRef}
          canUseBusinessBlocks={translationEnabled}
          onLockedAddCard={(type) => {
            if (isDemoMode) {
              setDemoLockMessage("このブロックはBusinessプラン限定です。");
            } else {
              openBusinessUpsell(type);
            }
          }}
        />
        {businessUpsellState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-violet-200 bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">この機能はBusiness限定です</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">Businessにアップグレードすると、今選んだ機能をすぐ使えます。</p>
                </div>
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-300 bg-violet-100 text-violet-700"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 18h16l-1.4-8.3a1 1 0 0 0-1.66-.58L13.7 12.1a1 1 0 0 1-1.4 0L7.06 9.12a1 1 0 0 0-1.66.58L4 18zm3.2-11.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zm9.6 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM12 8.1A1.9 1.9 0 1 0 12 4.3a1.9 1.9 0 0 0 0 3.8z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-slate-600">
                  <p className="font-semibold text-slate-700">Free</p>
                  <p className="mt-1 text-[11px]">1ページ運用</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-slate-600">
                  <p className="font-semibold text-slate-700">Pro</p>
                  <p className="mt-1 text-[11px]">10ページ運用</p>
                </div>
                <div className="rounded-lg border border-violet-300 bg-violet-50 px-2 py-2 text-violet-800">
                  <p className="font-semibold">Business</p>
                  <p className="mt-1 text-[11px]">無制限 + 多言語/運用</p>
                </div>
              </div>
              {businessUpsellState.lockedType ? (
                <p className="mt-3 text-xs text-slate-500">
                  選択ブロック: {CARD_TYPE_LABELS[businessUpsellState.lockedType] ?? businessUpsellState.lockedType}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBusinessUpsellState({ open: false, lockedType: null })}
                  className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <a
                  href="/lp/saas#pricing"
                  onClick={() => {
                    void trackUpgradeClick("editor");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold !text-white no-underline hover:bg-violet-600"
                >
                  Businessプランを見る
                </a>
              </div>
            </div>
          </div>
        )}
        {publishState && (
          <PublishModal
            publicUrl={publishState.publicUrl}
            pageTitle={publishState.pageTitle}
            slug={publishState.slug}
            onClose={() => setPublishState(null)}
          />
        )}
        {prepublishState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900">公開前チェック</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                公開直前に、ページの内容を自動で確認しています。
                {prepublishState.errors.length === 0 && prepublishState.warnings.length > 0 ? (
                  <>
                    下の「おすすめ」は<strong className="font-medium text-slate-800">なくても公開できます</strong>
                    が、宿泊客向けに足した方がよい項目です。対応してから公開するか、「このまま公開」で先に公開しても構いません。
                  </>
                ) : null}
              </p>
              {prepublishState.errors.length === 0 && prepublishState.warnings.length === 0 ? (
                <p className="mt-3 text-sm text-emerald-700">問題は見つかりませんでした。</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {prepublishState.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-rose-700">公開できない項目（要対応）</p>
                      <p className="mt-1 text-xs text-slate-500">
                        次を解消するまで公開処理に進めません。
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-rose-700">
                        {prepublishState.errors.map((item) => (
                          <li key={item}>・{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {prepublishState.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-amber-800">おすすめ（任意）</p>
                      <p className="mt-1 text-xs text-slate-500">
                        ブロック種別名ではなく、「何が足りないか」「なぜ足すとよいか」を表示しています。
                      </p>
                      <ul className="mt-1 max-h-44 space-y-1 overflow-auto text-sm text-amber-800">
                        {prepublishState.warnings.map((item, idx) => (
                          <li key={`${item}-${idx}`}>・{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPrepublishState(null)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  閉じる
                </button>
                {prepublishState.allowContinue && (
                  <button
                    type="button"
                    onClick={() => void handlePublishPastWarnings()}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium !text-white hover:bg-slate-800"
                  >
                    このまま公開
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {showEditorBusyOverlay && (
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45">
            <div className="rounded-2xl border border-white/40 bg-slate-900/80 px-10 py-8 text-center shadow-2xl backdrop-blur-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              <p className="mt-4 text-3xl font-bold tracking-wide text-white">{editorBusyTitle}</p>
              <p className="mt-2 text-sm font-medium text-slate-200">{editorBusySubtitle}</p>
            </div>
          </div>
        )}
        {demoLockMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900">デモモード制限</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{demoLockMessage}</p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDemoLockMessage(null)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <a
                  href="/login?ref=demo-editor&next=%2Fdashboard%3Ftab%3Dcreate"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium !text-white no-underline hover:bg-slate-800"
                >
                  無料登録して続ける
                </a>
              </div>
            </div>
          </div>
        )}
        {bulkFontOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900">フォント一括変更</h3>
              <p className="mt-1 text-sm text-slate-500">ページ内すべてのブロックに同じフォントを適用します。</p>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">フォント</label>
                <select
                  value={bulkFontFamily}
                  onChange={(e) => setBulkFontFamily(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                >
                  {EDITOR_FONT_OPTIONS.map((opt) => (
                    <option key={opt.label + opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkFontOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyFontFamilyAll(bulkFontFamily || undefined);
                    setBulkFontOpen(false);
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium !text-white hover:bg-slate-800"
                >
                  一括適用
                </button>
              </div>
            </div>
          </div>
        )}
        <SaveToast lastSavedAt={lastSavedAt} />
      </div>
    </LocaleProvider>
  );
}
