"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar, EDITOR_LOCALE_PILL_OPTIONS } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { FreeformCanvas } from "./FreeformCanvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SaveToast } from "./SaveToast";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditor2Store } from "./store";
import { useAutoSaveCards } from "./useAutoSaveCards";
import type { CardType } from "./types";
import { createEmptyCard, STARTER_CARD_TYPES } from "./types";
import { getLocalizedContent, type LocalizedString, type SupportedLocale } from "@/lib/localized-content";
import {
  getInformationBySlug,
  getPage,
  buildPublicUrlV,
  savePageCards,
  setInformationStatusBySlug,
  updatePageTitle,
  getCurrentHotelSubscription,
  getCurrentHotelTranslationUsage,
  trackCurrentHotelTranslationRun,
} from "@/lib/storage";

/**
 * Canvas-based card editor — Notion-like experience.
 * State is centralized in useEditor2Store (cards, selectedCardId, isSaving, pageMeta).
 * Canvas, library and settings all use the same store.
 */
type Editor2Props = {
  pageId?: string | null;
  mode?: "full" | "demo";
  demoPreviewUrl?: string;
};

const DEMO_STORAGE_KEY = "editor2:demo-state:v1";
const REQUIRED_LOCALES: SupportedLocale[] = ["en", "zh", "ko"];
/** ヘッダーの言語ピルと同一（EDITOR_LOCALE_PILL_OPTIONS の label を " / " 連結） */
const EDITOR_LOCALE_LABELS_DISPLAY = EDITOR_LOCALE_PILL_OPTIONS.map((o) => o.label).join(" / ");

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isLocalizedRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return "ja" in obj || "en" in obj || "zh" in obj || "ko" in obj;
}

function countMissingRequiredLocales(input: unknown): number {
  if (Array.isArray(input)) {
    return input.reduce((sum, item) => sum + countMissingRequiredLocales(item), 0);
  }
  if (!input || typeof input !== "object") return 0;
  if (isLocalizedRecord(input)) {
    const sourceJa = input.ja;
    if (!hasText(sourceJa)) return 0;
    return REQUIRED_LOCALES.reduce((sum, locale) => sum + (hasText(input[locale]) ? 0 : 1), 0);
  }
  return Object.values(input as Record<string, unknown>).reduce<number>(
    (sum, value) => sum + countMissingRequiredLocales(value),
    0
  );
}

export function Editor2({ pageId, mode = "full", demoPreviewUrl = "/p/demo-hub-menu" }: Editor2Props) {
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
  const [editorLocale, setEditorLocale] = useState<SupportedLocale>("ja");
  const [localeTranslating, setLocaleTranslating] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [demoLockMessage, setDemoLockMessage] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [publishToggleLoading, setPublishToggleLoading] = useState(false);
  const [publishFlowBusy, setPublishFlowBusy] = useState(false);
  const [togglePublishBusy, setTogglePublishBusy] = useState(false);
  const [qrModalPreparing, setQrModalPreparing] = useState(false);

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
    });
    return { errors, warnings };
  }, [cards]);

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
            selectCard(parsed.cards[0]?.id ?? null);
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
    const starterCards = STARTER_CARD_TYPES.map((type, i) =>
      createEmptyCard(type, `demo-${i}-${Math.random().toString(36).slice(2, 8)}`, i)
    );
    setCards(starterCards);
    selectCard(starterCards[0]?.id ?? null);
    setPageMeta({
      pageId: null,
      title: "デモ編集画面",
      slug: "demo-preview",
      publicUrl: demoPreviewUrl,
    });
  }, [isDemoMode, demoPreviewUrl, setCards, selectCard, setPageMeta, setPageBackground]);

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
      .then((sub) => setTranslationEnabled(Boolean(sub && sub.plan === "business")))
      .catch(() => setTranslationEnabled(false));
  }, [isDemoMode, pageId, setPageMeta]);

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
      addCard(type);
      setSlashMenuOpen(false);
    },
    [addCard]
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

  const handlePreviewClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開・QR発行はできません。無料登録で続きから編集できます。");
      window.open(demoPreviewUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!pageMeta.publicUrl || !pageId) return;
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
    } catch {
      // Even if save fails, allow user to inspect current public page.
    }
    const previewUrl = `${pageMeta.publicUrl}${pageMeta.publicUrl.includes("?") ? "&" : "?"}preview=1`;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }, [isDemoMode, demoPreviewUrl, pageMeta.publicUrl, pageId]);

  const handleAddPreset = useCallback(
    (types: CardType[]) => {
      for (const type of types) {
        addCard(type);
      }
    },
    [addCard]
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

  const ensureTranslationsBeforePublish = useCallback(async (): Promise<string | null> => {
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
      return "未翻訳項目があります。公開前に翻訳を完了するにはBusinessプランが必要です。";
    }
    const usage = await getCurrentHotelTranslationUsage().catch(() => null);
    if (usage && usage.usedRuns >= usage.includedRuns) {
      return `未翻訳項目があります。今月の翻訳実行枠（${usage.includedRuns}回）に達しているため公開できません。`;
    }

    setLocaleTranslating(true);
    try {
      const translatedCount = await translateAllCardsToMultilingual();
      if (translatedCount > 0) {
        await trackCurrentHotelTranslationRun({
          translatedItems: translatedCount,
          source: "pre_publish",
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
        return `未翻訳項目が ${remainingTargets.length} 件残っているため公開できません。編集内容を確認してください。`;
      }
      return null;
    } catch {
      return "自動翻訳に失敗したため公開できません。時間をおいて再試行してください。";
    } finally {
      setLocaleTranslating(false);
    }
  }, [cards, translateAllCardsToMultilingual]);

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
      await handlePublishClick();
    } finally {
      setPublishFlowBusy(false);
    }
  }, [isDemoMode, ensureTranslationsBeforePublish, handlePublishClick]);

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

  const handleChangeEditorLocale = useCallback(async (nextLocale: SupportedLocale) => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは翻訳機能は利用できません。無料登録で解放されます。");
      return;
    }
    if (localeTranslating || editorLocale === nextLocale) return;
    if (nextLocale === "ja") {
      setEditorLocale("ja");
      return;
    }
    const subscription = await getCurrentHotelSubscription().catch(() => null);
    if (!subscription || subscription.plan !== "business") {
      alert("多言語翻訳はBusinessプラン限定機能です。プランをアップグレードしてご利用ください。");
      return;
    }
    const usage = await getCurrentHotelTranslationUsage().catch(() => null);
    if (usage && usage.usedRuns >= usage.includedRuns) {
      alert(
        `今月の翻訳実行枠（${usage.includedRuns}回）に達しました。追加課金プランで継続利用できます。`
      );
      return;
    }
    setLocaleTranslating(true);
    try {
      const translatedCount = await translateAllCardsToMultilingual();
      if (translatedCount > 0) {
        await trackCurrentHotelTranslationRun({
          locale: nextLocale,
          translatedItems: translatedCount,
          source: "editor_locale",
        });
      }
      setEditorLocale(nextLocale);
    } catch {
      // Even when translation API fails, switch locale and rely on existing localized/fallback text.
      setEditorLocale(nextLocale);
    } finally {
      setLocaleTranslating(false);
    }
  }, [isDemoMode, localeTranslating, editorLocale, translateAllCardsToMultilingual]);

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
        locale={editorLocale}
        onChangeLocale={handleChangeEditorLocale}
        localeTranslating={localeTranslating}
        translationEnabled={translationEnabled}
        onPreview={handlePreviewClick}
        onPublish={handlePublishClickStrict}
        onQr={handleQrClick}
        onTogglePublished={isDemoMode ? undefined : handleTogglePublishedStrict}
        publishToggleLoading={publishToggleLoading}
        publishToggleChecked={publishStatus === "published"}
        onRenamePageTitle={isDemoMode ? undefined : handleRenamePageTitle}
      />
    ) : null;

  const showEditorBusyOverlay =
    publishFlowBusy || publishing || togglePublishBusy || qrModalPreparing;
  let editorBusyTitle = "公開中...";
  let editorBusySubtitle = "保存と公開設定を実行しています";
  if (togglePublishBusy) {
    if (localeTranslating) {
      editorBusyTitle = "一括翻訳中...";
      editorBusySubtitle = `${EDITOR_LOCALE_LABELS_DISPLAY} の翻訳を整えています`;
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
  } else if (publishFlowBusy && localeTranslating) {
    editorBusyTitle = "多言語データ取得中...";
    editorBusySubtitle = `${EDITOR_LOCALE_LABELS_DISPLAY} の翻訳を取得・反映しています`;
  }

  return (
    <LocaleProvider value={editorLocale}>
      <div ref={rootRef} className="h-[100dvh] w-full overflow-hidden">
        <EditorLayout
          topBar={topBar}
          library={<CardLibrary onAddCard={addCard} onAddPreset={handleAddPreset} />}
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
                  onDuplicateCard={duplicateCard}
                  onRemoveCard={removeCard}
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
              onBulkReplace={isDemoMode ? undefined : replaceTextAll}
              onRunPrepublishCheck={isDemoMode ? undefined : handleRunPrepublishCheck}
              lastAddedCardId={lastAddedCardId}
              demoMode={isDemoMode}
              onLockedAction={(message) => setDemoLockMessage(message)}
            />
          }
        />
        <SlashCommandMenu
          open={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashSelect}
          anchorRef={canvasRef}
        />
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
                  <option value="">標準（システム）</option>
                  <option value="'Noto Sans JP', sans-serif">Noto Sans JP</option>
                  <option value="'Hiragino Kaku Gothic ProN', sans-serif">ヒラギノ角ゴ</option>
                  <option value="'Yu Gothic', 'YuGothic', sans-serif">Yu Gothic</option>
                  <option value="'Noto Serif JP', serif">Noto Serif JP</option>
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
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
