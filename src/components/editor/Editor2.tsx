"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EDITOR_FONT_OPTIONS } from "@/lib/editor-font-options";
import { LocaleProvider } from "@/components/locale-context";
import { EditorAppTopBar } from "@/components/app-shell/EditorAppTopBar";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { FreeformCanvas } from "./FreeformCanvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditor2Store } from "./store";
import { useAutoSaveCards } from "./useAutoSaveCards";
import {
  BUSINESS_ONLY_CARD_TYPES,
  CARD_TYPE_LABELS,
  createEmptyCard,
  STARTER_CARD_TYPES,
  type EditorCard,
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
  inferLibraryAudience,
  persistLibraryAudience,
  readStoredLibraryAudience,
  type LibraryAudience,
} from "@/lib/editor/card-library-config";

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

function buildEditorContentSignature(payload: {
  cards: { id: string; type: string; order: number; content: unknown; style?: unknown }[];
  background: { mode: "solid" | "gradient"; color: string; from: string; to: string; angle: number };
}): string {
  return JSON.stringify({
    cards: payload.cards.map((card) => ({
      type: card.type,
      order: card.order,
      content: card.content,
      style: card.style ?? null,
    })),
    background: payload.background,
  });
}

export function Editor2({
  pageId,
  mode = "full",
  demoPreviewUrl = "/p/demo-hub-menu",
  startUnselected = false,
}: Editor2Props) {
  const isDemoMode = mode === "demo";
  const { isAppShell } = useClientShell();
  const useAppEditorChrome = isAppShell && !isDemoMode;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [publishState, setPublishState] = useState<{
    publicUrl: string;
    pageTitle: string;
    slug: string;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [bulkFontOpen, setBulkFontOpen] = useState(false);
  const [bulkFontFamily, setBulkFontFamily] = useState<string>("");
  const [bulkFontAnchor, setBulkFontAnchor] = useState<{ top: number; left: number } | null>(null);
  const editorLocale: SupportedLocale = "ja";
  const [localeTranslating, setLocaleTranslating] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [demoLockMessage, setDemoLockMessage] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [publishToggleLoading, setPublishToggleLoading] = useState(false);
  const [publishFlowBusy, setPublishFlowBusy] = useState(false);
  const [togglePublishBusy, setTogglePublishBusy] = useState(false);
  const [scrollPriorityMode, setScrollPriorityMode] = useState(true);
  const [qrModalPreparing, setQrModalPreparing] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [initialEditorLoading, setInitialEditorLoading] = useState<boolean>(() => !isDemoMode && Boolean(pageId));
  const [hotelRole, setHotelRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [hasPendingApproval, setHasPendingApproval] = useState(false);
  const [publishedBaselineSignature, setPublishedBaselineSignature] = useState<string | null>(null);
  const [businessUpsellState, setBusinessUpsellState] = useState<{
    open: boolean;
    lockedType: CardType | null;
  }>({ open: false, lockedType: null });
  const [libraryAudience, setLibraryAudience] = useState<LibraryAudience>(() => {
    if (typeof window === "undefined") return "hotel";
    return readStoredLibraryAudience() ?? "hotel";
  });
  const libraryAudienceInferredRef = useRef(false);
  const bulkFontPanelRef = useRef<HTMLDivElement | null>(null);
  const bulkFontSnapshotRef = useRef<EditorCard[] | null>(null);
  const copiedCardRef = useRef<EditorCard | null>(null);
  const openBusinessUpsell = useCallback((type: CardType) => {
    void trackUpgradeClick("editor");
    setBusinessUpsellState({ open: true, lockedType: type });
  }, []);

  const cards = useEditor2Store((s) => s.cards);

  const handleLibraryAudienceChange = useCallback((audience: LibraryAudience) => {
    setLibraryAudience(audience);
    if (!isDemoMode) persistLibraryAudience(audience);
    libraryAudienceInferredRef.current = true;
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode || libraryAudienceInferredRef.current) return;
    if (readStoredLibraryAudience()) {
      libraryAudienceInferredRef.current = true;
      return;
    }
    if (cards.length === 0) return;
    libraryAudienceInferredRef.current = true;
    setLibraryAudience(inferLibraryAudience(cards));
  }, [cards, isDemoMode]);

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
  const addCardRaw = useEditor2Store((s) => s.addCard);
  const addCard = useCallback(
    (type: CardType, index?: number) => {
      addCardRaw(type, index, libraryAudience);
    },
    [addCardRaw, libraryAudience],
  );
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const removeCard = useEditor2Store((s) => s.removeCard);
  const duplicateCard = useEditor2Store((s) => s.duplicateCard);
  const pasteCard = useEditor2Store((s) => s.pasteCard);
  const undo = useEditor2Store((s) => s.undo);
  const redo = useEditor2Store((s) => s.redo);
  const clearCards = useEditor2Store((s) => s.clearCards);
  const applyFontFamilyAll = useEditor2Store((s) => s.applyFontFamilyAll);
  const canUndo = useEditor2Store((s) => s.historyPast.length > 0);
  const canRedo = useEditor2Store((s) => s.historyFuture.length > 0);
  const setPageMeta = useEditor2Store((s) => s.setPageMeta);
  const setPageBackground = useEditor2Store((s) => s.setPageBackground);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);
  const setCards = useEditor2Store((s) => s.setCards);

  const cloneCardsSnapshot = useCallback(
    (source: EditorCard[]) =>
      source.map((card) => ({
        ...card,
        content: (() => {
          try {
            return JSON.parse(JSON.stringify(card.content ?? {})) as Record<string, unknown>;
          } catch {
            return { ...(card.content ?? {}) };
          }
        })(),
        style: (() => {
          if (!card.style) return undefined;
          try {
            return JSON.parse(JSON.stringify(card.style)) as Record<string, unknown>;
          } catch {
            return { ...(card.style as Record<string, unknown>) };
          }
        })(),
      })),
    []
  );

  const previewBulkFontFamily = useCallback(
    (fontFamily: string) => {
      const base = bulkFontSnapshotRef.current;
      if (!base) return;
      const next = cloneCardsSnapshot(base).map((card) => {
        const prevStyle = (card.style ?? {}) as Record<string, unknown>;
        const style = { ...prevStyle };
        if (!fontFamily) delete style.fontFamily;
        else style.fontFamily = fontFamily;
        return { ...card, style };
      });
      setCards(next);
    },
    [cloneCardsSnapshot, setCards]
  );

  const cancelBulkFontModal = useCallback(() => {
    if (bulkFontSnapshotRef.current) {
      setCards(cloneCardsSnapshot(bulkFontSnapshotRef.current));
    }
    bulkFontSnapshotRef.current = null;
    setBulkFontOpen(false);
    setBulkFontAnchor(null);
  }, [cloneCardsSnapshot, setCards]);

  const applyBulkFontModal = useCallback(() => {
    const snapshot = bulkFontSnapshotRef.current;
    if (!snapshot) {
      setBulkFontOpen(false);
      return;
    }
    setCards(cloneCardsSnapshot(snapshot));
    applyFontFamilyAll(bulkFontFamily || undefined);
    bulkFontSnapshotRef.current = null;
    setBulkFontOpen(false);
    setBulkFontAnchor(null);
  }, [applyFontFamilyAll, bulkFontFamily, cloneCardsSnapshot, setCards]);

  useEffect(() => {
    if (!bulkFontOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-bulk-font-anchor='true']")) return;
      if (bulkFontPanelRef.current?.contains(target as Node)) return;
      cancelBulkFontModal();
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelBulkFontModal();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [bulkFontOpen, cancelBulkFontModal]);

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
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobileViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setInitialEditorLoading(false);
      return;
    }
    if (!pageId) {
      setInitialEditorLoading(false);
      setPageMeta({ pageId: null, title: "", slug: "", publicUrl: null });
      return;
    }
    setInitialEditorLoading(true);
    let cancelled = false;
    void (async () => {
      try {
        const page = await getPage(pageId);
        if (cancelled) return;
        if (!page) {
          setPageMeta({ pageId: null, title: "", slug: "", publicUrl: null });
          setPublishStatus("draft");
          return;
        }
        setPageMeta({
          pageId,
          title: page.title ?? "",
          slug: page.slug,
          publicUrl: buildPublicUrlV(page.slug),
        });
        try {
          const info = await getInformationBySlug(page.slug);
          if (!cancelled) {
            setPublishStatus(info?.status === "published" ? "published" : "draft");
          }
        } catch {
          if (!cancelled) {
            setPublishStatus("draft");
          }
        }
      } finally {
        if (!cancelled) {
          setInitialEditorLoading(false);
        }
      }
    })();
    getCurrentHotelSubscription()
      .then((sub) => {
        setTranslationEnabled(Boolean(sub && sub.plan === "business"));
      })
      .catch(() => {
        setTranslationEnabled(false);
      });
    getCurrentUserHotelRole().then(setHotelRole).catch(() => setHotelRole(null));
    return () => {
      cancelled = true;
    };
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

  const { retry, flushAutosaveNow } = useAutoSaveCards(pageId ?? null);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );
  const currentContentSignature = useMemo(
    () =>
      buildEditorContentSignature({
        cards,
        background: {
          mode: pageBackgroundMode,
          color: pageBackgroundColor,
          from: pageGradientFrom,
          to: pageGradientTo,
          angle: pageGradientAngle,
        },
      }),
    [cards, pageBackgroundMode, pageBackgroundColor, pageGradientFrom, pageGradientTo, pageGradientAngle]
  );
  const hasUnpublishedChanges =
    publishStatus === "published" &&
    publishedBaselineSignature != null &&
    currentContentSignature !== publishedBaselineSignature;

  useEffect(() => {
    if (publishStatus !== "published") {
      setPublishedBaselineSignature(null);
      return;
    }
    if (publishedBaselineSignature == null) {
      setPublishedBaselineSignature(currentContentSignature);
    }
  }, [publishStatus, publishedBaselineSignature, currentContentSignature]);

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
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (mod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "c") {
        if (isTypingTarget || !selectedCardId) return;
        const selected = cards.find((c) => c.id === selectedCardId);
        if (!selected) return;
        e.preventDefault();
        copiedCardRef.current = selected;
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        if (isTypingTarget) return;
        const copied = copiedCardRef.current;
        if (!copied) return;
        e.preventDefault();
        pasteCard(copied, selectedCardId ?? null);
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
    [undo, redo, duplicateCard, pasteCard, removeCard, addCard, selectedCardId, slashMenuOpen, cards]
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

  const publishNow = useCallback(async (opts?: { silent?: boolean }) => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。");
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
      setPublishedBaselineSignature(currentContentSignature);
      const publicUrl = buildPublicUrlV(page.slug);
      if (!opts?.silent) {
        setPublishState({
          publicUrl,
          pageTitle: page.title ?? "",
          slug: page.slug,
        });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "公開処理に失敗しました。");
    } finally {
      setPublishing(false);
    }
  }, [isDemoMode, pageId, currentContentSignature]);

  const handlePublishClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    await publishNow();
  }, [isDemoMode, publishNow]);

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
      if (nextStatus === "published") {
        setPublishedBaselineSignature(currentContentSignature);
      } else {
        setPublishedBaselineSignature(null);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "公開状態の変更に失敗しました。");
    } finally {
      setPublishToggleLoading(false);
    }
  }, [isDemoMode, pageMeta.slug, publishStatus, publishToggleLoading, currentContentSignature]);

  const translateAllCardsToMultilingual = useCallback(async (): Promise<number> => {
    if (cards.length === 0) return 0;
    const cache = new Map<string, { en: string; zh: string; ko: string }>();
    const nonTranslatable = new Set([
      "href",
      "link",
      "linkUrl",
      "linkType",
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
    // Translation flow is Business-only. Free/Pro should skip checks and alerts.
    if (!translationEnabled) return null;
    const flow = opts?.translationSource === "preview" ? "preview" : "publish";
    const nonTranslatable = new Set([
      "href",
      "link",
      "linkUrl",
      "linkType",
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
          ? `未翻訳項目が ${remainingTargets.length} 件残っています。失敗言語: EN / 中文 / 한국어。編集内容を確認して再試行してください。`
          : `未翻訳項目が ${remainingTargets.length} 件残っています。失敗言語: EN / 中文 / 한국어。公開更新を中断しました。編集内容を確認して再試行してください。`;
      }
      return null;
    } catch {
      return flow === "preview"
        ? "自動翻訳に失敗しました。失敗言語: EN / 中文 / 한국어。時間をおいて再試行してください。"
        : "自動翻訳に失敗したため公開更新を中断しました。失敗言語: EN / 中文 / 한국어。時間をおいて再試行してください。";
    } finally {
      setLocaleTranslating(false);
    }
  },
    [cards, translateAllCardsToMultilingual, translationEnabled]
  );

  /** 公開済みで未反映のとき、プレビュー／QR は開かず公開更新（または公開申請）を促す */
  const guardPublishedBeforeGuestView = useCallback((): boolean => {
    if (publishStatus !== "published" || !hasUnpublishedChanges) return true;

    if (hotelRole === "editor") {
      window.alert(
        "未反映の編集があります。プレビュー・QRを表示するには、先にツールバーの「公開申請」を送信するか、承認後に公開ページへ反映してください。",
      );
      return false;
    }

    window.alert(
      "未反映の変更があります。プレビュー・QRを表示するには、先にツールバーの「公開更新」で公開ページへ反映してください。",
    );
    return false;
  }, [publishStatus, hasUnpublishedChanges, hotelRole]);

  /** 公開済みページのみ: 保存してQR/URLモーダルを開く（初回公開は「公開」ボタンを使用） */
  const handleQrClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    if (!pageId || !pageMeta.slug) return;
    if (publishStatus !== "published") {
      window.alert(
        "QRコードを表示するには、先にページを公開してください。\n「公開」ボタンから公開すると、URLとQRを確認できます。",
      );
      return;
    }
    await flushAutosaveNow();
    const saveErr = useEditor2Store.getState().saveError;
    if (saveErr) {
      window.alert(
        `最新の編集がサーバーに保存できていません。\n${saveErr}\n\nツールバーの「再試行」で保存してから、もう一度 QR / URL を押してください。`,
      );
      return;
    }
    if (!guardPublishedBeforeGuestView()) return;
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
  }, [isDemoMode, pageId, pageMeta.slug, pageMeta.title, publishStatus, flushAutosaveNow, guardPublishedBeforeGuestView]);

  const guardDemoAction = useCallback(
    (message: string): boolean => {
      if (!isDemoMode) return false;
      setDemoLockMessage(message);
      return true;
    },
    [isDemoMode]
  );

  const handlePreviewClick = useCallback(async () => {
    if (guardDemoAction("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。")) {
      return;
    }
    if (!pageMeta.publicUrl || !pageId) return;

    await flushAutosaveNow();
    const saveErr = useEditor2Store.getState().saveError;
    if (saveErr) {
      window.alert(
        `最新の編集がサーバーに保存できていません。\n${saveErr}\n\nツールバーの「再試行」で保存してから、もう一度プレビューを押してください。`,
      );
      return;
    }

    if (!guardPublishedBeforeGuestView()) return;

    // ユーザー操作の直後にタブを開き、続く await のあとでもブロックされにくくする
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      window.alert(
        "プレビューを別タブで開けませんでした。ブラウザのポップアップブロックを解除してから、もう一度お試しください。",
      );
      return;
    }
    previewWindow.opener = null;
    try {
      previewWindow.document.open();
      previewWindow.document.write(
        "<!DOCTYPE html><html lang=\"ja\"><head><meta charset=\"utf-8\"><title>プレビュー準備中</title></head>" +
          "<body style=\"margin:0;font-family:system-ui,sans-serif;background:#f8fafc;color:#475569;\">" +
          "<div style=\"display:flex;min-height:100vh;align-items:center;justify-content:center;padding:1.5rem;text-align:center;\">" +
          "<div><p style=\"margin:0;font-size:1rem;font-weight:600;color:#334155;\">プレビューを準備しています…</p>" +
          "<p style=\"margin:0.75rem 0 0;font-size:0.875rem;\">このタブはまもなくゲスト表示に切り替わります。</p></div></div></body></html>"
      );
      previewWindow.document.close();
    } catch {
      /* 表示できなくても続行し、後で location で遷移する */
    }

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
        try {
          previewWindow.close();
        } catch {
          /* ignore */
        }
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
      try {
        previewWindow.location.href = previewUrl;
      } catch {
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setPreviewBusy(false);
    }
  }, [
    guardDemoAction,
    pageMeta.publicUrl,
    pageId,
    ensureTranslationsBeforePublish,
    flushAutosaveNow,
    guardPublishedBeforeGuestView,
  ]);

  const handlePublishClickStrict = useCallback(async () => {
    if (guardDemoAction("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。")) {
      return;
    }
    if (pageId) {
      await flushAutosaveNow();
      const err = useEditor2Store.getState().saveError;
      if (err) {
        window.alert(
          `最新の編集がサーバーに保存できていません。\n${err}\n\nツールバーの保存エラー横「再試行」で保存してから、もう一度お試しください。`
        );
        return;
      }
    }
    setPublishFlowBusy(true);
    try {
      const translationError =
        publishStatus === "published" && !hasUnpublishedChanges
          ? null
          : await ensureTranslationsBeforePublish();
      if (translationError) {
        window.alert(translationError);
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
        setPublishedBaselineSignature(currentContentSignature);
        window.alert("公開申請を承認し、公開しました。");
        return;
      }
      await handlePublishClick();
    } finally {
      setPublishFlowBusy(false);
    }
  }, [guardDemoAction, publishStatus, hasUnpublishedChanges, ensureTranslationsBeforePublish, handlePublishClick, hotelRole, pageMeta.slug, hasPendingApproval, currentContentSignature, flushAutosaveNow, pageId]);

  const handleTogglePublishedStrict = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードでは公開状態の変更は利用できません。無料登録で解放されます。");
      return;
    }
    setTogglePublishBusy(true);
    try {
      if (publishStatus === "published") {
        await handleTogglePublished();
        return;
      }
      await flushAutosaveNow();
      const saveErr = useEditor2Store.getState().saveError;
      if (saveErr) {
        window.alert(
          `最新の編集がサーバーに保存できていません。\n${saveErr}\n\nツールバーの「再試行」で保存してから、もう一度ゲスト公開をオンにしてください。`,
        );
        return;
      }
      const translationError = await ensureTranslationsBeforePublish();
      if (translationError) {
        window.alert(translationError);
        return;
      }
      await publishNow({ silent: true });
    } finally {
      setTogglePublishBusy(false);
    }
  }, [
    isDemoMode,
    publishStatus,
    ensureTranslationsBeforePublish,
    handleTogglePublished,
    flushAutosaveNow,
    publishNow,
  ]);

  const publishActionLabel =
    hotelRole === "editor"
      ? hasPendingApproval
        ? "再申請"
        : "公開申請"
      : publishStatus === "published" && !hasPendingApproval
        ? "公開更新"
      : hasPendingApproval
        ? "承認して公開"
        : "公開";
  const onBulkFontFromAnchor = useCallback(
    (anchorEl: HTMLElement) => {
      if (isDemoMode) {
        setDemoLockMessage("デモモードでは詳細設定は利用できません。無料登録で解放されます。");
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const panelWidth = 420;
      const maxLeft = Math.max(10, window.innerWidth - panelWidth - 10);
      const left = Math.max(10, Math.min(rect.left, maxLeft));
      const top = Math.min(rect.bottom + 8, window.innerHeight - 80);
      bulkFontSnapshotRef.current = cloneCardsSnapshot(cards);
      const first = cards[0]?.style as Record<string, unknown> | undefined;
      const current = typeof first?.fontFamily === "string" ? first.fontFamily : "";
      setBulkFontFamily(current);
      setBulkFontAnchor({ top, left });
      setBulkFontOpen(true);
    },
    [cards, cloneCardsSnapshot, isDemoMode],
  );

  const topBar =
    pageId || isDemoMode ? (
      useAppEditorChrome ? (
        <EditorAppTopBar
          backHref="/dashboard"
          pageTitle={pageMeta.title}
          saving={isSaving}
          lastSavedAt={lastSavedAt}
          saveError={saveError}
          onRetry={retry}
          publicUrl={pageMeta.publicUrl}
          publishing={publishing}
          qrPreparing={qrModalPreparing}
          previewPreparing={previewBusy || localeTranslating}
          canUndo={canUndo}
          canRedo={canRedo}
          canClearAll={cards.length > 0}
          onUndo={undo}
          onRedo={redo}
          onClearAll={handleClearAll}
          onBulkFont={onBulkFontFromAnchor}
          onPreview={handlePreviewClick}
          onPublish={handlePublishClickStrict}
          publishActionLabel={publishActionLabel}
          onQr={handleQrClick}
          onTogglePublished={hotelRole === "editor" ? undefined : handleTogglePublishedStrict}
          publishToggleLoading={publishToggleLoading}
          publishToggleChecked={publishStatus === "published"}
          onRenamePageTitle={handleRenamePageTitle}
        />
      ) : (
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
          onBulkFont={onBulkFontFromAnchor}
          onPreview={handlePreviewClick}
          previewPreparing={previewBusy || localeTranslating}
          onPublish={handlePublishClickStrict}
          publishActionLabel={publishActionLabel}
          onQr={handleQrClick}
          onTogglePublished={isDemoMode || hotelRole === "editor" ? undefined : handleTogglePublishedStrict}
          publishToggleLoading={publishToggleLoading}
          publishToggleChecked={publishStatus === "published"}
          onRenamePageTitle={isDemoMode ? undefined : handleRenamePageTitle}
          scrollPriorityMode={scrollPriorityMode}
          onToggleScrollPriority={() => setScrollPriorityMode((prev) => !prev)}
        />
      )
    ) : null;
  const showEditorBusyOverlay =
    previewBusy || publishFlowBusy || publishing || togglePublishBusy || qrModalPreparing;
  const showBusinessTranslationOverlay = translationEnabled && localeTranslating;
  let editorBusyTitle = "公開中...";
  let editorBusySubtitle = "保存と公開設定を実行しています";
  if (previewBusy && showBusinessTranslationOverlay) {
    editorBusyTitle = `${TRANSLATION_OVERLAY_LABELS} 一括翻訳中...`;
    editorBusySubtitle = "プレビュー用に翻訳確認中です";
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
    editorBusyTitle =
      publishStatus === "published" ? "公開中の内容を更新しています" : `${TRANSLATION_OVERLAY_LABELS} 一括翻訳中...`;
    editorBusySubtitle =
      publishStatus === "published"
        ? `多言語を再生成しています（${TRANSLATION_OVERLAY_LABELS}）`
        : "公開前に多言語データを取得・反映しています";
  } else if (publishFlowBusy) {
    editorBusyTitle = publishStatus === "published" ? "公開中の内容を更新しています" : "公開準備中...";
    editorBusySubtitle =
      publishStatus === "published"
        ? "保存と公開内容の反映を実行しています"
        : "保存と公開処理を実行しています";
  }

  return (
    <LocaleProvider value={editorLocale}>
      <div ref={rootRef} className="h-[100dvh] w-full overflow-hidden">
        <EditorLayout
          topBar={topBar}
          footerVariant={useAppEditorChrome ? "app" : "default"}
          onMobileSheetChange={(nextSheet) => {
            if (nextSheet !== "settings" || !selectedCardId) return;
            window.requestAnimationFrame(() => {
              document
                .querySelector(`[data-card-id="${selectedCardId}"]`)
                ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            });
          }}
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
              libraryAudience={libraryAudience}
              onLibraryAudienceChange={handleLibraryAudienceChange}
            />
          }
          canvas={
            <div ref={canvasRef} className="relative flex h-full flex-col overflow-hidden">
              <div className={`flex h-full flex-col overflow-hidden transition ${initialEditorLoading ? "pointer-events-none select-none blur-[2px]" : ""}`}>
              {!isDemoMode && !initialEditorLoading && publishStatus !== "published" && (
                <div className="mx-4 mt-3 rounded-lg border border-amber-300 bg-amber-50 px-0 py-1.5 text-center text-sm leading-tight text-amber-800">現在公開OFFになっています（プレビュー/QRアクセス時は公開OFFエラーになります）。</div>
              )}
              {!isDemoMode && !initialEditorLoading && publishStatus === "published" && hasUnpublishedChanges && (
                <div className="mx-4 mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-0 py-1.5 text-center text-sm leading-tight text-emerald-800">未反映の変更があります。プレビュー・QR・公開更新のいずれかで公開ページへ反映できます</div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y pb-6">
                <FreeformCanvas
                  cards={cards}
                  selectedCardId={selectedCardId}
                  onSelectCard={selectCard}
                  onUpdateCard={updateCard}
                  onReorderCards={reorderCards}
                  scrollPriorityMode={isMobileViewport && scrollPriorityMode}
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
              {!isDemoMode && initialEditorLoading && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/35 backdrop-blur-sm">
                  <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    読み込み中…
                  </div>
                </div>
              )}
            </div>
          }
          settings={
            <CardSettings
              card={selectedCard}
              onUpdate={updateCard}
              onDuplicateCard={duplicateCard}
              onRemoveCard={removeCard}
              lastAddedCardId={lastAddedCardId}
              demoMode={isDemoMode}
              onLockedAction={(message) => setDemoLockMessage(message)}
              isBusinessEnabled={translationEnabled}
              libraryAudience={libraryAudience}
            />
          }
        />
        <SlashCommandMenu
          open={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashSelect}
          anchorRef={canvasRef}
          canUseBusinessBlocks={translationEnabled}
          libraryAudience={libraryAudience}
          onLockedAddCard={(type) => {
            if (isDemoMode) {
              setDemoLockMessage("このブロックはBusinessプラン限定です。");
            } else {
              openBusinessUpsell(type);
            }
          }}
        />
        {businessUpsellState.open && (
          <div className="ui-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="ui-pop-in w-full max-w-lg rounded-2xl border border-violet-200 bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">この機能はBusinessプラン限定です</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">Businessプランにアップグレードすると、今選んだ機能をすぐ使えます。</p>
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
                  href="/lp/saas#pricing-plans"
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
        {showEditorBusyOverlay && (
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="rounded-2xl border border-slate-200 bg-white/92 px-6 py-5 text-center shadow-xl">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
              <p className="mt-3 text-base font-semibold tracking-wide text-slate-800">{editorBusyTitle}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">{editorBusySubtitle}</p>
            </div>
          </div>
        )}
        {demoLockMessage && (
          <div className="ui-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="ui-pop-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
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
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold !text-white no-underline hover:bg-slate-800"
                >
                  無料登録して続ける
                </a>
              </div>
            </div>
          </div>
        )}
        {bulkFontOpen && bulkFontAnchor && (
          <div
            ref={bulkFontPanelRef}
            className="ui-pop-in fixed z-[90] w-[min(420px,calc(100vw-20px))] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            style={{ top: bulkFontAnchor.top, left: bulkFontAnchor.left }}
          >
            <h3 className="text-lg font-semibold text-slate-900">フォント一括変更</h3>
            <p className="mt-1 text-sm text-slate-500">候補を選ぶと即時プレビューされます。確定は「一括適用」です。</p>
            <div className="mt-4 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
              {EDITOR_FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.label + opt.value}
                  type="button"
                  onClick={() => {
                    setBulkFontFamily(opt.value);
                    previewBulkFontFamily(opt.value);
                  }}
                  className={
                    "w-full rounded-lg px-2.5 py-2 text-left text-sm transition " +
                    (bulkFontFamily === opt.value
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100")
                  }
                  style={opt.value ? { fontFamily: opt.value } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelBulkFontModal}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={applyBulkFontModal}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:bg-slate-800"
                >
                  一括適用
                </button>
              </div>
          </div>
        )}
      </div>
    </LocaleProvider>
  );
}
