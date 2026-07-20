"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EDITOR_FONT_OPTIONS } from "@/lib/editor-font-options";
import { resolveGuestNavLinkLimit } from "@/lib/plan-limits";
import { useHotelPlanTier } from "@/lib/hooks/use-hotel-plan-tier";
import { LocaleProvider } from "@/components/locale-context";
import { EditorAppTopBar } from "@/components/app-shell/EditorAppTopBar";
import { AppBottomSheet } from "@/components/app-shell/primitives/AppBottomSheet";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useAppToast } from "@/components/app-shell/AppToastProvider";
import {
  buildLiveOpsHref,
  LIVE_OPS_DEFINITIONS,
  LIVE_OPS_KEYS,
  liveOpsKeyForCardType,
  syncLiveOpsIntoEditorStore,
} from "@/lib/editor/live-ops";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { FreeformCanvas } from "./FreeformCanvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { PageQualityChecksPanel } from "./PageQualityChecksPanel";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { NewPageOnboarding } from "./NewPageOnboarding";
import { useEditor2Store } from "./store";
import { useAutoSaveCards } from "./useAutoSaveCards";
import {
  canUseCardType,
  getMinimumPlanForCardType,
  CARD_TYPE_LABELS,
  createEmptyCard,
  STARTER_CARD_TYPES,
  type EditorCard,
  type EditorPlanTier,
  type CardType,
} from "./types";
import { type SupportedLocale } from "@/lib/localized-content";
import {
  infoContentFromFacilityPreset,
  isFacilityInfoType,
  type LabelRowLibraryPreset,
} from "@/lib/editor/facility-info-presets";
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
  getCurrentUserHotelRole,
  trackUpgradeClick,
  getPageGuestShellEditorState,
  getCurrentHotelTranslationUsage,
  trackCurrentHotelTranslationRun,
  listPagesForHotel,
} from "@/lib/storage";
import {
  getStarterCardTypes,
  persistLibraryAudience,
  readStoredLibraryAudience,
  resolveAppLibraryAudience,
  type LibraryAudience,
} from "@/lib/editor/card-library-config";
import {
  closeGuestPreviewTab,
  navigateGuestPageUrl,
  navigatePreviewWindow,
  openGuestPageInNewTab,
  openGuestPreviewPlaceholderTab,
} from "@/lib/app-href";
import { canResumeEditorPage } from "@/lib/editor-resume";
import { createDefaultGuestShellConfig } from "@/lib/guest-shell";
import { GuestShellPagePanel } from "@/components/settings/GuestShellPagePanel";
import {
  batchTranslateEditorCards,
  collectMissingTranslationTargets,
} from "@/lib/editor/batch-translate-cards";
import {
  runPageQualityChecks,
  type PageQualityFinding,
} from "@/lib/editor/page-quality-checks";

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
const DEMO_FRONTDESK_PRESET_TYPES: CardType[] = ["hero", "welcome", "wifi", "faq", "emergency"];
const TRANSLATION_OVERLAY_LABELS = "JA / EN / 中文 / 한국어";

function buildEditorContentSignature(payload: {
  cards: { id: string; type: string; order: number; content: unknown; style?: unknown }[];
  background: { mode: "solid" | "gradient"; color: string; from: string; to: string; angle: number; atmosphere?: string };
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

function buildEditorContentSignatureFromStore(
  state: ReturnType<typeof useEditor2Store.getState> = useEditor2Store.getState(),
): string {
  return buildEditorContentSignature({
    cards: state.cards,
    background: {
      mode: state.pageBackgroundMode,
      color: state.pageBackgroundColor,
      from: state.pageGradientFrom,
      to: state.pageGradientTo,
      angle: state.pageGradientAngle,
      atmosphere: state.pageAtmosphere,
    },
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
  const { showToast } = useAppToast();
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
  const planTier = useHotelPlanTier(isDemoMode) as EditorPlanTier;
  const isBusinessPlan = planTier === "business";
  const canUseProBlocks = planTier === "pro" || planTier === "business";
  const canUseBusinessBlocks = planTier === "business";
  const [demoLockMessage, setDemoLockMessage] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [publishToggleLoading, setPublishToggleLoading] = useState(false);
  const [publishFlowBusy, setPublishFlowBusy] = useState(false);
  const [togglePublishBusy, setTogglePublishBusy] = useState(false);
  const [scrollPriorityMode, setScrollPriorityMode] = useState(true);
  const [qrModalPreparing, setQrModalPreparing] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewGuestShell, setPreviewGuestShell] = useState(() => createDefaultGuestShellConfig());
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [initialEditorLoading, setInitialEditorLoading] = useState<boolean>(() => {
    if (isDemoMode || !pageId) return false;
    return !canResumeEditorPage(pageId);
  });
  const [hotelRole, setHotelRole] = useState<"owner" | "admin" | "editor" | "viewer" | null>(null);
  const [hasPendingApproval, setHasPendingApproval] = useState(false);
  const [publishedBaselineSignature, setPublishedBaselineSignature] = useState<string | null>(null);
  const [planUpsellState, setPlanUpsellState] = useState<{
    open: boolean;
    lockedType: CardType | null;
    requiredPlan: "pro" | "business";
  }>({ open: false, lockedType: null, requiredPlan: "business" });
  const [qualityGate, setQualityGate] = useState<{
    findings: PageQualityFinding[];
    mode: "publish" | "preview";
    resume: "publish_click_strict" | "toggle_publish_on" | "preview";
  } | null>(null);
  const [libraryAudience, setLibraryAudience] = useState<LibraryAudience>(
    () => (useAppEditorChrome ? "personal" : "hotel"),
  );
  const libraryAudiencePageRef = useRef<string | null>(null);
  const bulkFontPanelRef = useRef<HTMLDivElement | null>(null);
  const bulkFontSnapshotRef = useRef<EditorCard[] | null>(null);
  const copiedCardRef = useRef<EditorCard | null>(null);
  const knownPageSlugsRef = useRef<Set<string> | null>(null);
  const qualityGateSkipRef = useRef(false);
  const openPlanUpsell = useCallback((type: CardType) => {
    void trackUpgradeClick("editor");
    const requiredPlan = getMinimumPlanForCardType(type);
    setPlanUpsellState({
      open: true,
      lockedType: type,
      requiredPlan: requiredPlan === "business" ? "business" : "pro",
    });
  }, []);

  const cards = useEditor2Store((s) => s.cards);

  const handleLibraryAudienceChange = useCallback((audience: LibraryAudience) => {
    if (!useAppEditorChrome) return;
    setLibraryAudience(audience);
    persistLibraryAudience(audience);
  }, [useAppEditorChrome]);

  const selectedCardId = useEditor2Store((s) => s.selectedCardId);
  const lastAddedCardId = useEditor2Store((s) => s.lastAddedCardId);
  const pageBackgroundMode = useEditor2Store((s) => s.pageBackgroundMode);
  const pageBackgroundColor = useEditor2Store((s) => s.pageBackgroundColor);
  const pageGradientFrom = useEditor2Store((s) => s.pageGradientFrom);
  const pageGradientTo = useEditor2Store((s) => s.pageGradientTo);
  const pageGradientAngle = useEditor2Store((s) => s.pageGradientAngle);
  const pageAtmosphere = useEditor2Store((s) => s.pageAtmosphere);
  const isSaving = useEditor2Store((s) => s.isSaving);
  const lastSavedAt = useEditor2Store((s) => s.lastSavedAt);
  const saveError = useEditor2Store((s) => s.saveError);
  const pageMeta = useEditor2Store((s) => s.pageMeta);
  const addCardRaw = useEditor2Store((s) => s.addCard);

  useEffect(() => {
    if (!useAppEditorChrome) {
      libraryAudiencePageRef.current = null;
      setLibraryAudience("hotel");
      return;
    }
    const scope = pageId ?? (isDemoMode ? "__demo__" : "__none__");
    if (libraryAudiencePageRef.current === scope) return;
    if (pageId != null && pageMeta.pageId !== pageId) return;

    libraryAudiencePageRef.current = scope;
    setLibraryAudience(resolveAppLibraryAudience(cards));
  }, [useAppEditorChrome, pageId, isDemoMode, pageMeta.pageId, cards]);

  const addCardWithContent = useEditor2Store((s) => s.addCardWithContent);
  const notifyBlockPlaced = useCallback(
    (type: CardType) => {
      if (!useAppEditorChrome) return;
      const label = CARD_TYPE_LABELS[type] ?? type;
      showToast(`「${label}」ブロックを配置しました`, "success");
    },
    [useAppEditorChrome, showToast],
  );

  const addCard = useCallback(
    (type: CardType, index?: number) => {
      addCardRaw(type, index, libraryAudience);
      notifyBlockPlaced(type);
    },
    [addCardRaw, libraryAudience, notifyBlockPlaced],
  );
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const moveCard = useEditor2Store((s) => s.moveCard);
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
    if (!bulkFontOpen || useAppEditorChrome) return;
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
  }, [bulkFontOpen, cancelBulkFontModal, useAppEditorChrome]);

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
              atmosphere?: string;
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
                atmosphere: parsed.background.atmosphere,
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
            atmosphere: pageAtmosphere,
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
    pageAtmosphere,
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
    const resume = canResumeEditorPage(pageId);
    if (!resume) {
      setInitialEditorLoading(true);
    }
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
    getCurrentUserHotelRole().then(setHotelRole).catch(() => setHotelRole(null));
    return () => {
      cancelled = true;
    };
  }, [isDemoMode, pageId, setPageMeta]);

  useEffect(() => {
    if (isDemoMode || !pageId) {
      setPreviewGuestShell(createDefaultGuestShellConfig());
      return;
    }
    let cancelled = false;
    getPageGuestShellEditorState(pageId)
      .then((state) => {
        if (cancelled || !state) return;
        setPreviewGuestShell(state.effective);
      })
      .catch(() => {
        if (!cancelled) setPreviewGuestShell(createDefaultGuestShellConfig());
      });
    return () => {
      cancelled = true;
    };
  }, [isDemoMode, pageId]);

  useEffect(() => {
    if (isDemoMode) {
      knownPageSlugsRef.current = null;
      return;
    }
    let cancelled = false;
    listPagesForHotel()
      .then((pages) => {
        if (cancelled) return;
        knownPageSlugsRef.current = new Set(
          pages.map((p) => p.slug).filter((slug): slug is string => Boolean(slug?.trim())),
        );
      })
      .catch(() => {
        if (!cancelled) knownPageSlugsRef.current = null;
      });
    return () => {
      cancelled = true;
    };
  }, [isDemoMode, pageId]);

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
        atmosphere: pageAtmosphere,
      })
    );
  }, [isDemoMode, pageId, pageBackgroundMode, pageBackgroundColor, pageGradientFrom, pageGradientTo, pageGradientAngle, pageAtmosphere]);

  const { retry, flushAutosaveNow } = useAutoSaveCards(pageId ?? null);

  // Another tab / Quick Ops may update live ops while this editor stays mounted.
  useEffect(() => {
    if (isDemoMode || !pageId) return;
    const pull = () => {
      void syncLiveOpsIntoEditorStore(pageId);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") pull();
    };
    window.addEventListener("focus", pull);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", pull);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isDemoMode, pageId]);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );
  const sortedCardsForReorder = useMemo(
    () => [...cards].sort((a, b) => a.order - b.order),
    [cards]
  );
  const selectedCardOrderIndex = selectedCardId
    ? sortedCardsForReorder.findIndex((c) => c.id === selectedCardId)
    : -1;
  const canMoveSelectedCardUp = selectedCardOrderIndex > 0;
  const canMoveSelectedCardDown =
    selectedCardOrderIndex >= 0 && selectedCardOrderIndex < sortedCardsForReorder.length - 1;
  const scrollSelectedCardIntoView = useCallback(() => {
    if (!selectedCardId) return;
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-card-id="${selectedCardId}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, [selectedCardId]);
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
          atmosphere: pageAtmosphere,
        },
      }),
    [cards, pageBackgroundMode, pageBackgroundColor, pageGradientFrom, pageGradientTo, pageGradientAngle, pageAtmosphere]
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
        const field = target as HTMLInputElement | HTMLTextAreaElement;
        const hasTextSelection =
          typeof field.selectionStart === "number" &&
          typeof field.selectionEnd === "number" &&
          field.selectionStart !== field.selectionEnd;

        if (e.key === "Backspace" || e.key === "Delete") {
          // Partial/full selection in a field: always edit text only, never delete the block.
          if (hasTextSelection) return;

          const isEmpty = field.value?.trim() === "" || target.textContent?.trim() === "";
          if (isEmpty) {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            const card = cardId ? cards.find((c) => c.id === cardId) : undefined;
            // Notion-style: empty dedicated text block + Backspace removes the block only.
            if (cardId && selectedCardId === cardId && card?.type === "text") {
              e.preventDefault();
              removeCard(cardId);
              target.blur();
            }
          }
          return;
        }

        const isEmpty = field.value?.trim() === "" || target.textContent?.trim() === "";
        if (isEmpty) {
          if (e.key === "Enter" && !e.shiftKey) {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId) {
              e.preventDefault();
              const idx = cards.findIndex((c) => c.id === cardId);
              if (idx >= 0) {
                addCard("text", idx + 1);
                target.blur();
              }
            }
            return;
          }
        }
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
        const active = document.activeElement as HTMLElement | null;
        const inlineEditing =
          active &&
          root.contains(active) &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.isContentEditable);
        if (inlineEditing) return;

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
      if (!canUseCardType(type, planTier)) {
        if (isDemoMode) {
          const tierLabel = getMinimumPlanForCardType(type) === "business" ? "Business" : "Pro";
          setDemoLockMessage(`このブロックは${tierLabel}プラン限定です。`);
        } else {
          openPlanUpsell(type);
        }
        return;
      }
      addCard(type);
      setSlashMenuOpen(false);
    },
    [addCard, planTier, isDemoMode, openPlanUpsell]
  );

  const ensureTranslationsBeforeGuestAction = useCallback(
    async (opts?: { translationSource?: "pre_publish" | "preview" }): Promise<string | null> => {
      if (!isBusinessPlan) return null;
      const flow = opts?.translationSource === "preview" ? "preview" : "publish";
      const latestCards = useEditor2Store.getState().cards;
      const targets = collectMissingTranslationTargets(latestCards);
      if (targets.length === 0) return null;

      const usage = await getCurrentHotelTranslationUsage().catch(() => null);
      if (usage && usage.usedRuns >= usage.includedRuns) {
        return flow === "preview"
          ? `未翻訳項目があります。今月の翻訳実行枠（${usage.includedRuns}回）に達しているためプレビューできません。`
          : `未翻訳項目があります。今月の翻訳実行枠（${usage.includedRuns}回）に達しているため公開できません。`;
      }

      setLocaleTranslating(true);
      try {
        const { cards: nextCards, translatedCount } = await batchTranslateEditorCards(latestCards);
        if (translatedCount > 0) {
          setCards(nextCards);
          await trackCurrentHotelTranslationRun({
            translatedItems: translatedCount,
            source: flow === "preview" ? "preview" : "pre_publish",
          });
          if (pageId) {
            const state = useEditor2Store.getState();
            await savePageCards(pageId, state.cards, {
              pageStyle: {
                background: {
                  mode: state.pageBackgroundMode,
                  color: state.pageBackgroundColor,
                  from: state.pageGradientFrom,
                  to: state.pageGradientTo,
                  angle: state.pageGradientAngle,
                  atmosphere: state.pageAtmosphere,
                },
              },
            }).catch(() => undefined);
          }
        }
        const remaining = collectMissingTranslationTargets(useEditor2Store.getState().cards);
        if (remaining.length > 0) {
          // Soft continue: warn but don't hard-block so UX stays natural if API partially fails.
          console.warn("[translate] remaining targets", remaining.length);
        }
        return null;
      } catch {
        return flow === "preview"
          ? "自動翻訳に失敗しました。時間をおいて再試行するか、そのままプレビューを続けられます。"
          : "自動翻訳に失敗しました。時間をおいて再試行してください。";
      } finally {
        setLocaleTranslating(false);
      }
    },
    [isBusinessPlan, pageId, setCards],
  );

  const collectQualityFindings = useCallback((): PageQualityFinding[] => {
    return runPageQualityChecks({
      cards: useEditor2Store.getState().cards,
      guestShell: previewGuestShell,
      knownPageSlugs: knownPageSlugsRef.current ?? undefined,
      pageTitle: pageMeta.title,
    });
  }, [previewGuestShell, pageMeta.title]);

  const openQualityGateIfNeeded = useCallback(
    (mode: "publish" | "preview", resume: "publish_click_strict" | "toggle_publish_on" | "preview") => {
      if (qualityGateSkipRef.current) {
        qualityGateSkipRef.current = false;
        return false;
      }
      const findings = collectQualityFindings();
      if (findings.length === 0) return false;
      setQualityGate({ findings, mode, resume });
      return true;
    },
    [collectQualityFindings],
  );

  const focusFirstQualityFinding = useCallback(
    (findings: PageQualityFinding[]) => {
      const cardId = findings.find((f) => f.cardId)?.cardId;
      setQualityGate(null);
      if (!cardId) return;
      selectCard(cardId);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-card-id="${cardId}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [selectCard],
  );

  const publishNow = useCallback(async (opts?: { silent?: boolean }) => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    if (!pageId) return;
    const translationError = await ensureTranslationsBeforeGuestAction({ translationSource: "pre_publish" });
    if (translationError) {
      window.alert(translationError);
      return;
    }
    setPublishing(true);
    try {
      // Read store after translation so save + baseline match what the guest page gets.
      const state = useEditor2Store.getState();
      await savePageCards(pageId, state.cards, {
        pageStyle: {
          background: {
            mode: state.pageBackgroundMode,
            color: state.pageBackgroundColor,
            from: state.pageGradientFrom,
            to: state.pageGradientTo,
            angle: state.pageGradientAngle,
            atmosphere: state.pageAtmosphere,
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
      setPublishedBaselineSignature(buildEditorContentSignatureFromStore());
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
  }, [isDemoMode, pageId, ensureTranslationsBeforeGuestAction]);

  const handlePublishClick = useCallback(async () => {
    if (isDemoMode) {
      setDemoLockMessage("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。");
      return;
    }
    await publishNow();
  }, [isDemoMode, publishNow]);

  const handleAddPreset = useCallback(
    (preset: { types: CardType[]; infoContent?: Record<string, unknown> }) => {
      let placed = 0;
      for (const type of preset.types) {
        if (!canUseCardType(type, planTier)) {
          if (isDemoMode) {
            const tierLabel = getMinimumPlanForCardType(type) === "business" ? "Business" : "Pro";
            setDemoLockMessage(`このセットには${tierLabel}プラン限定ブロックが含まれています。`);
          } else {
            openPlanUpsell(type);
          }
          continue;
        }
        if (isFacilityInfoType(type)) {
          const content = infoContentFromFacilityPreset(type);
          if (content) {
            addCardWithContent("info", content);
            placed += 1;
            continue;
          }
        }
        if (type === "info" && preset.infoContent) {
          addCardWithContent("info", preset.infoContent);
          placed += 1;
          continue;
        }
        addCardRaw(type, undefined, libraryAudience);
        placed += 1;
      }
      if (useAppEditorChrome && placed > 0) {
        showToast(`${placed}件のブロックを配置しました`, "success");
      }
    },
    [
      addCardRaw,
      addCardWithContent,
      libraryAudience,
      planTier,
      isDemoMode,
      openPlanUpsell,
      useAppEditorChrome,
      showToast,
    ]
  );

  const handleAddLabelRowPreset = useCallback(
    (preset: LabelRowLibraryPreset) => {
      const content = infoContentFromFacilityPreset(preset.seedFrom);
      if (!content) return;
      addCardWithContent("info", content);
      if (useAppEditorChrome) {
        showToast(`${preset.label}を配置しました`, "success");
      }
    },
    [addCardWithContent, useAppEditorChrome, showToast]
  );

  const handleClearAll = useCallback(async () => {
    if (cards.length === 0) return;
    const ok = window.confirm("このページのブロックをすべて削除します。よろしいですか？");
    if (!ok) return;
    clearCards();
    if (!pageId) return;
    const state = useEditor2Store.getState();
    try {
      await savePageCards(pageId, [], {
        allowEmpty: true,
        pageStyle: {
          background: {
            mode: state.pageBackgroundMode,
            color: state.pageBackgroundColor,
            from: state.pageGradientFrom,
            to: state.pageGradientTo,
            angle: state.pageGradientAngle,
            atmosphere: state.pageAtmosphere,
          },
        },
      });
      setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now(), saveError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存に失敗しました";
      setAutosaveStatus({ isSaving: false, saveError: msg });
    }
  }, [cards.length, clearCards, pageId, setAutosaveStatus]);

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
            atmosphere: state.pageAtmosphere,
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
    if (!pageId || !pageMeta.slug) {
      window.alert("プレビューするページが見つかりません。一度保存してから再度お試しください。");
      return;
    }

    if (openQualityGateIfNeeded("preview", "preview")) {
      return;
    }

    // Always use /v/ for preview so drafts load with ?preview=1 ( /qr rewrite can mask issues ).
    const previewBasePath = `/v/${encodeURIComponent(pageMeta.slug)}`;
    const previewUrl = `${window.location.origin}${previewBasePath}?preview=1`;

    const useSameTabPreview = useAppEditorChrome;
    let previewWindow: Window | null = null;
    /** True once the new-tab preview is already on the guest URL (do not close on soft errors). */
    let previewNavigatedEarly = false;

    if (!useSameTabPreview) {
      // Must open the tab synchronously on tap — await before window.open breaks mobile Safari.
      previewWindow = openGuestPreviewPlaceholderTab();
      if (!previewWindow) {
        window.alert(
          "プレビューを別タブで開けませんでした。ブラウザのポップアップブロックを解除してから、もう一度お試しください。",
        );
        return;
      }
      // Navigate ASAP so the tab leaves about:blank before long save/translate awaits.
      previewNavigatedEarly = navigatePreviewWindow(previewWindow, previewUrl);
    }

    setPreviewBusy(true);
    try {
      await flushAutosaveNow();
      const saveErr = useEditor2Store.getState().saveError;
      if (saveErr) {
        if (!previewNavigatedEarly) {
          closeGuestPreviewTab(previewWindow);
        }
        window.alert(
          `最新の編集がサーバーに保存できていません。\n${saveErr}\n\nツールバーの「再試行」で保存してから、もう一度プレビューを押してください。`,
        );
        return;
      }

      const translationError = await ensureTranslationsBeforeGuestAction({ translationSource: "preview" });
      if (translationError) {
        // Soft: warn but still allow preview so editing flow isn't blocked.
        const continuePreview = window.confirm(`${translationError}\n\nこのままプレビューを開きますか？`);
        if (!continuePreview) {
          if (!previewNavigatedEarly) {
            closeGuestPreviewTab(previewWindow);
          }
          return;
        }
      }

      if (!guardPublishedBeforeGuestView()) {
        if (!previewNavigatedEarly) {
          closeGuestPreviewTab(previewWindow);
        }
        return;
      }

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
              atmosphere: state.pageAtmosphere,
            },
          },
        });
      } catch {
        // Even if save fails, allow user to inspect current public page.
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
              atmosphere: after.pageAtmosphere,
            },
          },
        });
      } catch {
        // Preview tab still opens; user may see slightly stale server content until save succeeds.
      }

      if (useSameTabPreview) {
        navigateGuestPageUrl(previewBasePath, { preview: true, returnEditorPageId: pageId });
      } else if (previewWindow) {
        // Early nav: replace again to pick up freshly saved content. Else: first navigation off placeholder.
        if (!navigatePreviewWindow(previewWindow, previewUrl)) {
          openGuestPageInNewTab(previewBasePath, { preview: true, appClient: false });
        }
      }
    } finally {
      setPreviewBusy(false);
    }
  }, [
    guardDemoAction,
    pageMeta.slug,
    pageId,
    flushAutosaveNow,
    guardPublishedBeforeGuestView,
    useAppEditorChrome,
    ensureTranslationsBeforeGuestAction,
    openQualityGateIfNeeded,
  ]);

  const handlePublishClickStrict = useCallback(async () => {
    if (guardDemoAction("デモモードではプレビュー・公開・QR発行はできません。無料登録で続きから編集できます。")) {
      return;
    }
    if (openQualityGateIfNeeded("publish", "publish_click_strict")) {
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
        await publishNow({ silent: true });
        await approvePublishApprovalBySlug(pageMeta.slug);
        setHasPendingApproval(false);
        setPublishStatus("published");
        setPublishedBaselineSignature(buildEditorContentSignatureFromStore());
        window.alert("公開申請を承認し、公開しました。");
        return;
      }
      await handlePublishClick();
    } finally {
      setPublishFlowBusy(false);
    }
  }, [
    guardDemoAction,
    handlePublishClick,
    hotelRole,
    pageMeta.slug,
    hasPendingApproval,
    flushAutosaveNow,
    pageId,
    publishNow,
    openQualityGateIfNeeded,
  ]);

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
      if (openQualityGateIfNeeded("publish", "toggle_publish_on")) {
        return;
      }
      // First publish (draft → ON): save + publish content + open QR modal in one step.
      await flushAutosaveNow();
      const saveErr = useEditor2Store.getState().saveError;
      if (saveErr) {
        window.alert(
          `最新の編集がサーバーに保存できていません。\n${saveErr}\n\nツールバーの「再試行」で保存してから、もう一度ゲスト公開をオンにしてください。`,
        );
        return;
      }
      setPublishFlowBusy(true);
      try {
        await publishNow({ silent: false });
      } finally {
        setPublishFlowBusy(false);
      }
    } finally {
      setTogglePublishBusy(false);
    }
  }, [
    isDemoMode,
    publishStatus,
    handleTogglePublished,
    flushAutosaveNow,
    publishNow,
    openQualityGateIfNeeded,
  ]);

  const handleQualityGateContinue = useCallback(() => {
    if (!qualityGate) return;
    const { resume } = qualityGate;
    setQualityGate(null);
    qualityGateSkipRef.current = true;
    if (resume === "preview") {
      void handlePreviewClick();
      return;
    }
    if (resume === "toggle_publish_on") {
      void handleTogglePublishedStrict();
      return;
    }
    void handlePublishClickStrict();
  }, [qualityGate, handlePreviewClick, handleTogglePublishedStrict, handlePublishClickStrict]);

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
      bulkFontSnapshotRef.current = cloneCardsSnapshot(cards);
      const first = cards[0]?.style as Record<string, unknown> | undefined;
      const current = typeof first?.fontFamily === "string" ? first.fontFamily : "";
      setBulkFontFamily(current);
      if (useAppEditorChrome) {
        setBulkFontAnchor(null);
        setBulkFontOpen(true);
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const panelWidth = 420;
      const maxLeft = Math.max(10, window.innerWidth - panelWidth - 10);
      const left = Math.max(10, Math.min(rect.left, maxLeft));
      const top = Math.min(rect.bottom + 8, window.innerHeight - 80);
      setBulkFontAnchor({ top, left });
      setBulkFontOpen(true);
    },
    [cards, cloneCardsSnapshot, isDemoMode, useAppEditorChrome],
  );

  const publishNotice =
    isDemoMode || initialEditorLoading
      ? null
      : publishStatus !== "published"
        ? ("draft_off" as const)
        : hasUnpublishedChanges
          ? ("unpublished_changes" as const)
          : null;

  const liveOpsQuickLinks =
    !isDemoMode && pageId
      ? LIVE_OPS_KEYS.filter((key) =>
          cards.some((c) => liveOpsKeyForCardType(c.type) === key),
        ).map((key) => {
          const def = LIVE_OPS_DEFINITIONS[key];
          return {
            href: buildLiveOpsHref(key, pageId),
            label: def.defaultTitle,
            title: def.quickOpsTitle,
          };
        })
      : [];

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
          publishNotice={publishNotice}
          liveOpsQuickLinks={liveOpsQuickLinks}
        />
      ) : (
        <EditorTopBar
          backHref={isDemoMode ? "/lp/business" : "/dashboard"}
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
          publishNotice={publishNotice}
          liveOpsQuickLinks={liveOpsQuickLinks}
        />
      )
    ) : null;
  const showEditorBusyOverlay =
    previewBusy || publishFlowBusy || publishing || togglePublishBusy || qrModalPreparing;
  const showBusinessTranslationOverlay = isBusinessPlan && localeTranslating;
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
                if (!canUseCardType(type, planTier)) {
                  if (isDemoMode) {
                    const tierLabel = getMinimumPlanForCardType(type) === "business" ? "Business" : "Pro";
                    setDemoLockMessage(`このブロックは${tierLabel}プラン限定です。`);
                  } else {
                    openPlanUpsell(type);
                  }
                  return;
                }
                addCard(type);
              }}
              onAddPreset={handleAddPreset}
              onAddLabelRowPreset={handleAddLabelRowPreset}
              canUseProBlocks={canUseProBlocks}
              canUseBusinessBlocks={canUseBusinessBlocks}
              onLockedAddCard={(type) => {
                if (isDemoMode) {
                  const tierLabel = getMinimumPlanForCardType(type) === "business" ? "Business" : "Pro";
                  setDemoLockMessage(`このブロックは${tierLabel}プラン限定です。`);
                } else {
                  openPlanUpsell(type);
                }
              }}
              libraryAudience={libraryAudience}
              onLibraryAudienceChange={handleLibraryAudienceChange}
              showAudienceSwitch={useAppEditorChrome}
            />
          }
          canvas={
            <div ref={canvasRef} className="relative flex h-full flex-col overflow-hidden">
              <div className={`flex h-full flex-col overflow-hidden transition ${initialEditorLoading ? "pointer-events-none select-none blur-[2px]" : ""}`}>
              <div className="min-h-0 flex-1 overflow-hidden">
                {!isDemoMode && !initialEditorLoading && pageId && cards.length === 0 ? (
                  <NewPageOnboarding pageId={pageId} pageTitle={pageMeta.title} />
                ) : (
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
                    atmosphere: pageAtmosphere,
                  }}
                  guestShell={previewGuestShell}
                  pageSlug={pageMeta.slug}
                  pageTitle={pageMeta.title}
                  isBusinessPlan={isBusinessPlan}
                  guestNavMaxVisible={resolveGuestNavLinkLimit(planTier)}
                  unframed={useAppEditorChrome}
                />
                )}
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
            !selectedCard && pageId && !isDemoMode ? (
              <GuestShellPagePanel
                pageId={pageId}
                isBusinessPlan={isBusinessPlan}
                planTier={planTier}
                onConfigChange={setPreviewGuestShell}
              />
            ) : (
            <CardSettings
              card={selectedCard}
              onUpdate={updateCard}
              onDuplicateCard={duplicateCard}
              onRemoveCard={removeCard}
              onMoveCardUp={
                selectedCardId && sortedCardsForReorder.length > 1
                  ? () => {
                      moveCard(selectedCardId, "up");
                      scrollSelectedCardIntoView();
                    }
                  : undefined
              }
              onMoveCardDown={
                selectedCardId && sortedCardsForReorder.length > 1
                  ? () => {
                      moveCard(selectedCardId, "down");
                      scrollSelectedCardIntoView();
                    }
                  : undefined
              }
              canMoveCardUp={canMoveSelectedCardUp}
              canMoveCardDown={canMoveSelectedCardDown}
              lastAddedCardId={lastAddedCardId}
              demoMode={isDemoMode}
              onLockedAction={(message) => setDemoLockMessage(message)}
              isBusinessEnabled={canUseBusinessBlocks}
              isBusinessPlan={isBusinessPlan}
              canUseProBlocks={canUseProBlocks}
              libraryAudience={libraryAudience}
            />
            )
          }
        />
        <SlashCommandMenu
          open={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashSelect}
          anchorRef={canvasRef}
          canUseProBlocks={canUseProBlocks}
          canUseBusinessBlocks={canUseBusinessBlocks}
          libraryAudience={libraryAudience}
          onLockedAddCard={(type) => {
            if (isDemoMode) {
              const tierLabel = getMinimumPlanForCardType(type) === "business" ? "Business" : "Pro";
              setDemoLockMessage(`このブロックは${tierLabel}プラン限定です。`);
            } else {
              openPlanUpsell(type);
            }
          }}
        />
        {planUpsellState.open && (
          <div className="ui-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="ui-pop-in w-full max-w-lg rounded-lg border border-[#e6e8eb] bg-white p-5 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {planUpsellState.requiredPlan === "business"
                      ? "この機能はBusinessプラン限定です"
                      : "この機能はProプラン以上で利用できます"}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {planUpsellState.requiredPlan === "business"
                      ? "Businessプランにアップグレードすると、今選んだ機能をすぐ使えます。"
                      : "Proプランにアップグレードすると、訴求ブロックやページ上限の拡張が利用できます。"}
                  </p>
                </div>
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700"
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
                  <p className="mt-1 text-[11px]">ページ・分析の拡張</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-slate-700">
                  <p className="font-semibold">Business</p>
                  <p className="mt-1 text-[11px]">無制限 + 多言語/運用</p>
                </div>
              </div>
              {planUpsellState.lockedType ? (
                <p className="mt-3 text-xs text-slate-500">
                  選択ブロック: {CARD_TYPE_LABELS[planUpsellState.lockedType] ?? planUpsellState.lockedType}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlanUpsellState({ open: false, lockedType: null, requiredPlan: "business" })}
                  className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <a
                  href={isAppShell ? "/settings/billing" : "/lp/business#pricing-plans"}
                  onClick={() => {
                    void trackUpgradeClick("editor");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium !text-white no-underline hover:bg-slate-800"
                >
                  {isAppShell
                    ? "プランを見る"
                    : planUpsellState.requiredPlan === "business"
                      ? "Businessプランを見る"
                      : "Proプランを見る"}
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
            showBusinessUpsell={planTier !== "business"}
          />
        )}
        {qualityGate && (
          <PageQualityChecksPanel
            findings={qualityGate.findings}
            mode={qualityGate.mode}
            onClose={() => setQualityGate(null)}
            onFix={() => focusFirstQualityFinding(qualityGate.findings)}
            onContinue={handleQualityGateContinue}
          />
        )}
        {showEditorBusyOverlay && (
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="rounded-lg border border-[#e6e8eb] bg-white/95 px-6 py-5 text-center shadow-md">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
              <p className="mt-3 text-base font-semibold tracking-wide text-slate-800">{editorBusyTitle}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">{editorBusySubtitle}</p>
            </div>
          </div>
        )}
        {demoLockMessage && (
          <div className="ui-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="ui-pop-in w-full max-w-md rounded-lg border border-[#e6e8eb] bg-white p-5 shadow-md">
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
        {useAppEditorChrome ? (
          <AppBottomSheet
            open={bulkFontOpen}
            onClose={cancelBulkFontModal}
            title="フォント一括変更"
            panelClassName="app-bottom-sheet-panel--bulk-font"
          >
            <p className="editor-bulk-font-hint px-3 text-sm text-[var(--app-text-muted)]">
              候補を選ぶと即時プレビューされます。確定は「一括適用」です。
            </p>
            <div className="editor-bulk-font-options" role="listbox" aria-label="フォント候補">
              {EDITOR_FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.label + opt.value}
                  type="button"
                  role="option"
                  aria-selected={bulkFontFamily === opt.value}
                  onClick={() => {
                    setBulkFontFamily(opt.value);
                    previewBulkFontFamily(opt.value);
                  }}
                  className={
                    "editor-bulk-font-option " +
                    (bulkFontFamily === opt.value ? "editor-bulk-font-option--active" : "")
                  }
                  style={opt.value ? { fontFamily: opt.value } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="editor-bulk-font-actions">
              <button type="button" className="app-sheet-action" onClick={cancelBulkFontModal}>
                閉じる
              </button>
              <button
                type="button"
                className="app-sheet-action app-sheet-action--primary"
                onClick={applyBulkFontModal}
              >
                一括適用
              </button>
            </div>
          </AppBottomSheet>
        ) : null}
        {!useAppEditorChrome && bulkFontOpen && bulkFontAnchor ? (
          <div
            ref={bulkFontPanelRef}
            className="ui-pop-in fixed z-[90] w-[min(420px,calc(100vw-20px))] rounded-lg border border-[#e6e8eb] bg-white p-5 shadow-md"
            style={{ top: bulkFontAnchor.top, left: bulkFontAnchor.left }}
          >
            <h3 className="text-lg font-semibold text-slate-900">フォント一括変更</h3>
            <p className="mt-1 text-sm text-slate-500">候補を選ぶと即時プレビューされます。確定は「一括適用」です。</p>
            <div className="mt-4 max-h-[min(40vh,280px)] space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-2 [-webkit-overflow-scrolling:touch]">
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
        ) : null}
      </div>
    </LocaleProvider>
  );
}
