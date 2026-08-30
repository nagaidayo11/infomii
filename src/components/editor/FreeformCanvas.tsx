"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Rnd } from "react-rnd";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { CardEditProvider } from "@/components/cards/card-inline-edit";
import { ClientShellContext } from "@/components/app-shell/ClientShellProvider";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { guestCardColumnMaxWidthPx, GUEST_PAGE_MAIN_PADDING_X_PX } from "@/lib/guest-page-layout";
import { isCardFullBleed } from "@/lib/editor/card-width-mode";
import { reorderCardsAtTargetY } from "@/lib/freeform-stack";
import { GuestBottomTabBar } from "@/components/guest/GuestBottomTabBar";
import { GuestHamburgerMenu } from "@/components/guest/GuestHamburgerMenu";
import { GuestLanguageToggle } from "@/components/guest/GuestLanguageToggle";
import { LocaleProvider } from "@/components/locale-context";
import { PhoneDeviceFrame } from "@/components/ui/PhoneDeviceFrame";
import {
  getGuestShellNavStyle,
  resolveVisibleGuestShellTabs,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import type { SupportedLocale } from "@/lib/localized-content";
import { getBlockStyle, isMediaCardType, usesHeroColumnWidth, type CardType, type EditorCard } from "./types";
const DEFAULT_W = 280;
const DEFAULT_H = 96;
const MIN_W = 120;
const MIN_H = 48;
const EDITOR_WEB_FRAME_WIDTH = 350;
const EDITOR_APP_FRAME_WIDTH = 390;
/** Map blocks need room for 16:11 frame + address + pin list; legacy cap at 320 caused clipping. */
const MAP_AUTO_MAX_H = 900;
/** 観測要素の scrollHeight が親高さと再帰し暴走するのを防ぐ上限（px） */
const MAX_AUTO_BLOCK_H = 2400;
const GRID = 8;
const APP_LONG_PRESS_REORDER_MS = 380;
const APP_TRASH_DELETE_DELAY_MS = 180;
const APP_REORDER_SCROLL_EDGE_PX = 112;
const APP_REORDER_SCROLL_MAX_STEP = 18;

/**
 * 自動高さ用の実測。コンテナに `h-full`+`justify-center` があると `scrollHeight` が親の高さに引きずられ再帰しやすいので、
 * 中身のルート要素（firstElementChild）の `offsetHeight` を優先する。
 */
function measureCardContentHeightPx(container: HTMLElement): number {
  const first = container.firstElementChild as HTMLElement | null;
  if (first) {
    const h = first.offsetHeight;
    if (Number.isFinite(h) && h > 0) {
      return Math.min(MAX_AUTO_BLOCK_H, Math.ceil(h + 8));
    }
  }
  const sh = container.scrollHeight;
  const capped = Math.min(MAX_AUTO_BLOCK_H - 8, Math.max(MIN_H, sh));
  return Math.ceil(capped + 8);
}
const SNAP_THRESHOLD = 8;
const STACK_GAP_Y = 12;

type Position = { x: number; y: number; w?: number; h?: number; manualH?: boolean };
const POSITION_KEY = "_position";

const CANVAS_PADDING_X = GUEST_PAGE_MAIN_PADDING_X_PX;

const DEFAULT_H_BY_TYPE: Record<CardType, number> = {
  hero: 120,
  hero_slider: 220,
  heading_body: 96,
  info: 90,
  highlight: 84,
  action: 64,
  welcome: 90,
  wifi: 72,
  breakfast: 78,
  checkout: 72,
  nearby: 104,
  notice: 72,
  map: 480,
  restaurant: 78,
  taxi: 72,
  emergency: 96,
  laundry: 78,
  spa: 78,
  text: 72,
  icon: 72,
  image: 110,
  video: 120,
  button: 64,
  faq: 104,
  schedule: 96,
  menu: 96,
  gallery: 110,
  divider: 52,
  parking: 78,
  pageLinks: 104,
  iconAccordion: 180,
  storyBand: 220,
  editorialCover: 280,
  dayTimeline: 200,
  scrollCards: 200,
  sectionTitle: 88,
  photoCompare: 240,
  icon_shortcuts: 96,
  image_tiles: 180,
  quote: 84,
  checklist: 104,
  steps: 104,
  compare: 96,
  kpi: 96,
  space: 48,
  campaign_timer: 128,
  tabs_info: 280,
  faq_search: 128,
  notice_ticker: 92,
  coupon: 128,
  accordion_info: 200,
  open_status: 104,
  breakfast_crowd: 120,
  dinner_crowd: 120,
  spa_crowd: 120,
  social_links: 120,
  contact_hub: 132,
  progress_steps: 124,
  emergency_banner: 108,
  scheduled_banner: 108,
  menu_categories: 140,
  daily_special: 120,
  drink_menu: 110,
  salon_service_menu: 120,
  combo_set_menu: 110,
  menu_grid: 136,
  menu_sheet_sync: 120,
  menu_time_band: 130,
};

function getCardDefaultHeight(card: EditorCard): number {
  if (card.type === "map") {
    const pins = Array.isArray((card.content as Record<string, unknown> | undefined)?.pins)
      ? ((card.content as Record<string, unknown>).pins as unknown[])
      : [];
    const pinCount = Math.max(0, pins.length);
    // title + map frame + address + gaps + pin rows
    return 300 + pinCount * 58;
  }
  return DEFAULT_H_BY_TYPE[card.type] ?? DEFAULT_H;
}

function getMapMinHeight(card: EditorCard): number {
  return getCardDefaultHeight(card);
}

/**
 * Keep legacy short heights from clipping newly introduced presentation layouts.
 * Existing pages may carry persisted `_position.h` from before these blocks grew.
 */
function getResolvedCardHeight(card: EditorCard, savedHeight: number | undefined): number {
  const initialH = getCardDefaultHeight(card);

  if (card.type === "map") {
    const needed = getMapMinHeight(card);
    if (typeof savedHeight !== "number") return needed;
    if (savedHeight < needed) return needed;
    return savedHeight;
  }

  if (typeof savedHeight !== "number") return initialH;

  if (card.type === "tabs_info" && savedHeight < 180) return initialH;
  if (card.type === "accordion_info" && savedHeight < 170) return initialH;

  return savedHeight;
}

/** 完全中央配置: ブロック幅いっぱいにし、左右均等の余白で中央に配置 */
function getInitialStackY(cards: EditorCard[], index: number): number {
  if (index <= 0) return 24;
  let y = 24;
  for (let i = 0; i < index; i += 1) {
    const prev = cards[i] as EditorCard;
    const saved = prev.style?.[POSITION_KEY] as Position | undefined;
    const prevH = typeof saved?.h === "number" ? saved.h : getCardDefaultHeight(prev);
    y += prevH + STACK_GAP_Y;
  }
  return y;
}

/**
 * Stage is full phone width (content + side gutters).
 * Full-bleed heroes span the stage; inset cards sit in the content column.
 */
function getPosition(card: EditorCard, index: number, contentWidth: number, cards: EditorCard[] = []): Position {
  const pos = card.style?.[POSITION_KEY] as Position | undefined;
  const initialH = getCardDefaultHeight(card);
  const fullBleed = isCardFullBleed(card);
  const forceHeroWidth = usesHeroColumnWidth(card.type);
  const stageWidth = contentWidth + CANVAS_PADDING_X * 2;
  const h = getResolvedCardHeight(card, typeof pos?.h === "number" ? pos.h : undefined);

  if (fullBleed) {
    return {
      x: 0,
      y: typeof pos?.y === "number" ? pos.y : getInitialStackY(cards, index),
      w: stageWidth,
      h,
    };
  }

  if (forceHeroWidth) {
    return {
      x: CANVAS_PADDING_X,
      y: typeof pos?.y === "number" ? pos.y : getInitialStackY(cards, index),
      w: contentWidth,
      h,
    };
  }

  const w = typeof pos?.w === "number" ? pos.w : contentWidth;
  const blockW = Math.min(w, contentWidth);
  const centeredX = CANVAS_PADDING_X + Math.round((contentWidth - blockW) / 2);

  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    const savedX = pos.x;
    // Legacy positions were in the old content-only coordinate system (x≈0).
    const isLegacyLeftAligned = savedX <= 60;
    return {
      x: isLegacyLeftAligned ? centeredX : savedX,
      y: pos.y,
      w: blockW,
      h,
    };
  }
  return {
    x: centeredX,
    y: getInitialStackY(cards, index),
    w: blockW,
    h: initialH,
  };
}

/** Compute snap position against other cards. Returns { x, y } with snapping applied. */
function computeSnap(
  draggingId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  cards: EditorCard[],
  canvasWidth: number
): { x: number; y: number; guides: { axis: "x" | "y"; value: number }[] } {
  const others = cards.filter((c) => c.id !== draggingId);
  const guides: { axis: "x" | "y"; value: number }[] = [];
  let snapX = x;
  let snapY = y;

  for (const c of others) {
    const idx = cards.findIndex((row) => row.id === c.id);
    const pos = getPosition(c, idx >= 0 ? idx : 0, canvasWidth, cards);
    const ow = pos.w ?? DEFAULT_W;
    const oh = pos.h ?? DEFAULT_H;

    const edges = [
      { x: pos.x, y: pos.y },
      { x: pos.x + ow, y: pos.y },
      { x: pos.x, y: pos.y + oh },
      { x: pos.x + ow, y: pos.y + oh },
      { x: pos.x + ow / 2, y: pos.y },
      { x: pos.x + ow / 2, y: pos.y + oh },
      { x: pos.x, y: pos.y + oh / 2 },
      { x: pos.x + ow, y: pos.y + oh / 2 },
    ];

    for (const e of edges) {
      if (Math.abs(x - e.x) <= SNAP_THRESHOLD) {
        snapX = e.x;
        guides.push({ axis: "x", value: e.x });
      }
      if (Math.abs(x + w - e.x) <= SNAP_THRESHOLD) {
        snapX = e.x - w;
        guides.push({ axis: "x", value: e.x });
      }
      if (Math.abs(y - e.y) <= SNAP_THRESHOLD) {
        snapY = e.y;
        guides.push({ axis: "y", value: e.y });
      }
      if (Math.abs(y + h - e.y) <= SNAP_THRESHOLD) {
        snapY = e.y - h;
        guides.push({ axis: "y", value: e.y });
      }
    }
  }

  return { x: snapX, y: snapY, guides };
}

type FreeformCanvasProps = {
  cards: EditorCard[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onUpdateCard: (id: string, patch: { content?: Record<string, unknown>; style?: Record<string, unknown> }) => void;
  onReorderCards?: (cards: EditorCard[]) => void;
  onRemoveCard?: (id: string) => void;
  onUndo?: () => void;
  scrollPriorityMode?: boolean;
  pageBackground?: {
    mode: "solid" | "gradient";
    color: string;
    from: string;
    to: string;
    angle: number;
  };
  guestShell?: GuestShellConfig | null;
  pageSlug?: string;
  /** Shown in phone header when hamburger nav is on (matches guest preview). */
  pageTitle?: string;
  isBusinessPlan?: boolean;
  /** Guest nav visible-link ceiling (Free = few links). */
  guestNavMaxVisible?: number;
  unframed?: boolean;
  lastAddedCardId?: string | null;
};

export function FreeformCanvas({
  cards,
  selectedCardId,
  onSelectCard,
  onUpdateCard,
  onReorderCards,
  onRemoveCard,
  onUndo,
  scrollPriorityMode = false,
  pageBackground,
  guestShell = null,
  pageSlug = "",
  pageTitle = "",
  isBusinessPlan = false,
  guestNavMaxVisible,
  unframed = false,
  lastAddedCardId = null,
}: FreeformCanvasProps) {
  const clientShell = useClientShell();
  const canvasRef = useRef<HTMLDivElement>(null);
  const appTrashRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() => (unframed ? EDITOR_APP_FRAME_WIDTH : EDITOR_WEB_FRAME_WIDTH));
  const contentWidth = guestCardColumnMaxWidthPx(viewportWidth);
  const stageWidth = contentWidth + CANVAS_PADDING_X * 2;
  const [dragState, setDragState] = useState<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    guides: { axis: "x" | "y"; value: number }[];
  } | null>(null);
  const [appReorderState, setAppReorderState] = useState<{
    id: string;
    input: "pointer" | "touch";
    pointerId: number;
    touchIdentifier?: number;
    startClientX: number;
    startClientY: number;
    startScrollTop: number;
    startX: number;
    startY: number;
    w: number;
    h: number;
  } | null>(null);
  const longPressRef = useRef<{
    timer: number;
    id: string;
    input: "pointer" | "touch";
    pointerId: number;
    touchIdentifier?: number;
    startClientX: number;
    startClientY: number;
    latestClientX: number;
    latestClientY: number;
    startScrollTop: number;
    startX: number;
    startY: number;
    w: number;
    h: number;
  } | null>(null);
  const appDragPointRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const appDragFrameRef = useRef<number | null>(null);
  const appAutoScrollFrameRef = useRef<number | null>(null);
  const [appTrashActive, setAppTrashActive] = useState(false);
  const [appUndoVisible, setAppUndoVisible] = useState(false);
  const [absorbingCardId, setAbsorbingCardId] = useState<string | null>(null);
  const [appLongPressPendingId, setAppLongPressPendingId] = useState<string | null>(null);
  const [autoHeights, setAutoHeights] = useState<Record<string, number>>({});
  const [previewLocale, setPreviewLocale] = useState<SupportedLocale>("ja");
  const navStyle = guestShell ? getGuestShellNavStyle(guestShell) : "off";
  const shellTabs = guestShell
    ? resolveVisibleGuestShellTabs(guestShell, {
        businessFeaturesEnabled: isBusinessPlan,
        maxVisibleTabs: guestNavMaxVisible,
      })
    : [];

  useEffect(() => {
    if (!lastAddedCardId) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const scrollRoot =
          canvasRef.current?.querySelector(".template-preview-scroll") ??
          canvasRef.current?.querySelector(".editor-canvas-outer");
        const el = (scrollRoot ?? canvasRef.current)?.querySelector(
          `[data-card-id="${lastAddedCardId}"]`,
        ) as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [lastAddedCardId]);

  const setAutoHeightForCard = useCallback((id: string, measuredHeight: number) => {
    if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) return;
    setAutoHeights((prev) => {
      const next = Math.min(MAX_AUTO_BLOCK_H, Math.max(MIN_H, measuredHeight));
      const current = prev[id];
      if (typeof current === "number" && Math.abs(current - next) < 2) return prev;
      return { ...prev, [id]: next };
    });
  }, []);

  const setContentRef = useCallback(
    (cardId: string) => (el: HTMLDivElement | null) => {
      const map = contentRefs.current;
      const prev = map.get(cardId);
      if (prev && resizeObserverRef.current) {
        resizeObserverRef.current.unobserve(prev);
      }
      if (!el) {
        map.delete(cardId);
        return;
      }
      map.set(cardId, el);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.observe(el);
      }
      requestAnimationFrame(() => {
        setAutoHeightForCard(cardId, measureCardContentHeightPx(el));
      });
    },
    [setAutoHeightForCard]
  );

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLDivElement;
        const id = el.dataset.cardContentId;
        if (!id) continue;
        setAutoHeightForCard(id, measureCardContentHeightPx(el));
      }
    });
    resizeObserverRef.current = observer;
    contentRefs.current.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
    };
  }, [setAutoHeightForCard]);

  const getRenderHeight = useCallback(
    (card: EditorCard, index: number) => {
      const pos = getPosition(card, index, contentWidth, cards);
      const saved = (card.style?.[POSITION_KEY] as Position | undefined) ?? undefined;
      if (card.type === "space") {
        const rawContentHeight = Number((card.content as Record<string, unknown>)?.height ?? 48);
        const contentHeight = Number.isFinite(rawContentHeight) ? rawContentHeight : 48;
        if (saved?.manualH) {
          return pos.h ?? Math.max(MIN_H, contentHeight);
        }
        if (typeof pos.h === "number" && Number.isFinite(pos.h)) {
          return Math.max(MIN_H, pos.h);
        }
        return Math.max(MIN_H, contentHeight);
      }
      if (saved?.manualH) {
        const auto = autoHeights[card.id];
        const savedHeight = pos.h ?? getCardDefaultHeight(card);
        if (typeof auto === "number" && Number.isFinite(auto) && auto > savedHeight + 1) {
          return Math.max(MIN_H, auto);
        }
        return savedHeight;
      }
      const auto = autoHeights[card.id];
      if (card.type === "map") {
        const floor = getMapMinHeight(card);
        if (typeof auto === "number" && Number.isFinite(auto)) {
          return Math.max(floor, Math.min(MAP_AUTO_MAX_H, auto));
        }
        const fallback = pos.h ?? getCardDefaultHeight(card);
        return Math.max(floor, Math.min(MAP_AUTO_MAX_H, fallback));
      }
      if (typeof auto === "number" && Number.isFinite(auto)) {
        return Math.max(MIN_H, auto);
      }
      return pos.h ?? getCardDefaultHeight(card);
    },
    [autoHeights, contentWidth, cards]
  );

  useEffect(() => {
    if (dragState || cards.length === 0) return;

    let currentY = 24;
    const updates: Array<{ id: string; style: Record<string, unknown> }> = [];

    for (let idx = 0; idx < cards.length; idx += 1) {
      const card = cards[idx] as EditorCard;
      const pos = getPosition(card, idx, contentWidth, cards);
      const saved = (card.style?.[POSITION_KEY] as Position | undefined) ?? undefined;
      const manualH = saved?.manualH === true;
      const width = pos.w ?? contentWidth;
      const nextX = pos.x;
      const renderH = getRenderHeight(card, idx);
      const nextH = manualH ? (typeof saved?.h === "number" ? saved.h : renderH) : renderH;
      const nextPos: Position = {
        x: nextX,
        y: currentY,
        w: width,
        h: nextH,
        manualH,
      };

      const changed =
        !saved ||
        Math.abs((saved.x ?? 0) - nextPos.x) > 1 ||
        Math.abs((saved.y ?? 0) - nextPos.y) > 1 ||
        Math.abs((saved.w ?? 0) - (nextPos.w ?? 0)) > 1 ||
        Math.abs((saved.h ?? 0) - (nextPos.h ?? 0)) > 1 ||
        (saved.manualH === true) !== manualH;

      if (changed) {
        updates.push({
          id: card.id,
          style: {
            ...(card.style ?? {}),
            [POSITION_KEY]: nextPos,
          },
        });
      }

      currentY += nextH + STACK_GAP_Y;
    }

    if (updates.length > 0) {
      updates.forEach((entry) => {
        onUpdateCard(entry.id, { style: entry.style });
      });
    }
  }, [cards, contentWidth, dragState, getRenderHeight, onUpdateCard]);

  const handleDrag = useCallback(
    (id: string, _e: unknown, d: { x: number; y: number }) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const index = cards.findIndex((c) => c.id === id);
      const pos = getPosition(card, index, contentWidth, cards);
      const w = pos.w ?? DEFAULT_W;
      const h = getRenderHeight(card, index);
      const { x, y, guides } = computeSnap(id, d.x, d.y, w, h, cards, contentWidth);
      setDragState({ id, x, y, w, h, guides });
    },
    [cards, contentWidth, getRenderHeight]
  );

  const commitReorderAtY = useCallback(
    (id: string, y: number) => {
      const nextCards = reorderCardsAtTargetY(cards, id, y, contentWidth);
      if (onReorderCards) {
        onReorderCards(nextCards);
        return;
      }
      const movedCard = nextCards.find((c) => c.id === id);
      if (!movedCard) return;
      onUpdateCard(id, { style: movedCard.style as Record<string, unknown> });
    },
    [cards, contentWidth, onReorderCards, onUpdateCard]
  );

  const clearLongPress = useCallback(() => {
    const pending = longPressRef.current;
    if (pending) {
      window.clearTimeout(pending.timer);
    }
    longPressRef.current = null;
    setAppLongPressPendingId(null);
  }, []);

  const isClientPointOverAppTrash = useCallback((clientX: number, clientY: number) => {
    if (typeof window === "undefined") return false;
    const rect = appTrashRef.current?.getBoundingClientRect();
    if (rect) {
      const padX = 34;
      const padTop = 54;
      const padBottom = 54;
      return (
        clientX >= rect.left - padX &&
        clientX <= rect.right + padX &&
        clientY >= rect.top - padTop &&
        clientY <= rect.bottom + padBottom
      );
    }
    const width = Math.min(260, window.innerWidth - 56);
    const right = window.innerWidth - 18;
    const left = right - width;
    const top = window.innerHeight - 236;
    const bottom = window.innerHeight - 96;
    return clientX >= left - 34 && clientX <= right + 34 && clientY >= top && clientY <= bottom;
  }, []);

  const cancelAppDragFrame = useCallback(() => {
    if (appDragFrameRef.current === null) return;
    window.cancelAnimationFrame(appDragFrameRef.current);
    appDragFrameRef.current = null;
  }, []);

  const cancelAppAutoScroll = useCallback(() => {
    if (appAutoScrollFrameRef.current === null) return;
    window.cancelAnimationFrame(appAutoScrollFrameRef.current);
    appAutoScrollFrameRef.current = null;
  }, []);

  const getAppScrollRoot = useCallback(() => {
    return canvasRef.current?.querySelector(".template-preview-scroll") as HTMLElement | null;
  }, []);

  const getAppScrollTop = useCallback(() => {
    return getAppScrollRoot()?.scrollTop ?? 0;
  }, [getAppScrollRoot]);

  const updateAppDragFromPoint = useCallback(
    (
      reorder: NonNullable<typeof appReorderState>,
      clientX: number,
      clientY: number,
    ) => {
      const scrollDelta = getAppScrollTop() - reorder.startScrollTop;
      const rawX = reorder.startX;
      const rawY = reorder.startY + (clientY - reorder.startClientY) + scrollDelta;
      const nextX = Math.max(0, Math.min(stageWidth - reorder.w, rawX));
      const nextY = Math.max(0, rawY);
      const { x, y, guides } = computeSnap(
        reorder.id,
        nextX,
        nextY,
        reorder.w,
        reorder.h,
        cards,
        contentWidth,
      );
      setDragState({
        id: reorder.id,
        x,
        y,
        w: reorder.w,
        h: reorder.h,
        guides,
      });
      setAppTrashActive(isClientPointOverAppTrash(clientX, clientY));
      return y;
    },
    [cards, contentWidth, getAppScrollTop, isClientPointOverAppTrash, stageWidth],
  );

  useEffect(() => {
    const active = Boolean(appLongPressPendingId || appReorderState);
    document.body.classList.toggle("app-editor-reorder-active", active);
    if (active) {
      window.getSelection()?.removeAllRanges();
    }
    return () => {
      document.body.classList.remove("app-editor-reorder-active");
    };
  }, [appLongPressPendingId, appReorderState]);

  useEffect(() => {
    if (!appReorderState) {
      cancelAppAutoScroll();
      return;
    }

    const step = () => {
      const root = getAppScrollRoot();
      const point = appDragPointRef.current;
      if (!root || !point) {
        appAutoScrollFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      const rect = root.getBoundingClientRect();
      const topDistance = point.clientY - rect.top;
      const bottomDistance = rect.bottom - point.clientY;
      let delta = 0;

      if (topDistance < APP_REORDER_SCROLL_EDGE_PX) {
        const ratio = Math.max(0, Math.min(1, (APP_REORDER_SCROLL_EDGE_PX - topDistance) / APP_REORDER_SCROLL_EDGE_PX));
        delta = -Math.max(3, Math.round(APP_REORDER_SCROLL_MAX_STEP * ratio));
      } else if (bottomDistance < APP_REORDER_SCROLL_EDGE_PX) {
        const ratio = Math.max(0, Math.min(1, (APP_REORDER_SCROLL_EDGE_PX - bottomDistance) / APP_REORDER_SCROLL_EDGE_PX));
        delta = Math.max(3, Math.round(APP_REORDER_SCROLL_MAX_STEP * ratio));
      }

      if (delta !== 0) {
        const before = root.scrollTop;
        root.scrollTop = Math.max(0, Math.min(root.scrollHeight - root.clientHeight, before + delta));
        if (root.scrollTop !== before) {
          updateAppDragFromPoint(appReorderState, point.clientX, point.clientY);
        }
      }

      appAutoScrollFrameRef.current = window.requestAnimationFrame(step);
    };

    appAutoScrollFrameRef.current = window.requestAnimationFrame(step);
    return () => {
      cancelAppAutoScroll();
    };
  }, [appReorderState, cancelAppAutoScroll, getAppScrollRoot, updateAppDragFromPoint]);

  useEffect(() => {
    if (!appReorderState) return;
    if (appReorderState.input !== "pointer") return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== appReorderState.pointerId) return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      appDragPointRef.current = { clientX: event.clientX, clientY: event.clientY };
      if (appDragFrameRef.current !== null) return;
      appDragFrameRef.current = window.requestAnimationFrame(() => {
        appDragFrameRef.current = null;
        const point = appDragPointRef.current;
        if (!point) return;
        updateAppDragFromPoint(appReorderState, point.clientX, point.clientY);
      });
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== appReorderState.pointerId) return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      cancelAppAutoScroll();
      cancelAppDragFrame();
      clearLongPress();
      const point = appDragPointRef.current ?? { clientX: event.clientX, clientY: event.clientY };
      const shouldDelete = Boolean(onRemoveCard) && isClientPointOverAppTrash(point.clientX, point.clientY);
      if (shouldDelete) {
        setAbsorbingCardId(appReorderState.id);
        setAppTrashActive(true);
        window.setTimeout(() => {
          onRemoveCard?.(appReorderState.id);
          setDragState(null);
          setAppReorderState(null);
          setAppTrashActive(false);
          setAbsorbingCardId(null);
          setAppUndoVisible(Boolean(onUndo));
        }, APP_TRASH_DELETE_DELAY_MS);
        return;
      }

      const finalY = Math.max(
        0,
        appReorderState.startY +
          (point.clientY - appReorderState.startClientY) +
          (getAppScrollTop() - appReorderState.startScrollTop),
      );
      commitReorderAtY(appReorderState.id, finalY);
      setDragState(null);
      setAppReorderState(null);
      setAppTrashActive(false);
      appDragPointRef.current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: false });
    window.addEventListener("pointercancel", onUp, { passive: false });
    return () => {
      cancelAppDragFrame();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [
    appReorderState,
    cards,
    cancelAppDragFrame,
    cancelAppAutoScroll,
    clearLongPress,
    commitReorderAtY,
    contentWidth,
    getAppScrollTop,
    isClientPointOverAppTrash,
    onRemoveCard,
    onUndo,
    stageWidth,
    updateAppDragFromPoint,
  ]);

  useEffect(() => {
    if (!appReorderState) return;
    if (appReorderState.input !== "touch") return;

    const findTouch = (touches: TouchList) => {
      for (let i = 0; i < touches.length; i += 1) {
        const touch = touches.item(i);
        if (touch && touch.identifier === appReorderState.touchIdentifier) return touch;
      }
      return null;
    };

    const moveToPoint = (clientX: number, clientY: number) => {
      appDragPointRef.current = { clientX, clientY };
      if (appDragFrameRef.current !== null) return;
      appDragFrameRef.current = window.requestAnimationFrame(() => {
        appDragFrameRef.current = null;
        const point = appDragPointRef.current;
        if (!point) return;
        updateAppDragFromPoint(appReorderState, point.clientX, point.clientY);
      });
    };

    const finishAtPoint = (clientX: number, clientY: number) => {
      cancelAppAutoScroll();
      cancelAppDragFrame();
      clearLongPress();
      const shouldDelete = Boolean(onRemoveCard) && isClientPointOverAppTrash(clientX, clientY);
      if (shouldDelete) {
        setAbsorbingCardId(appReorderState.id);
        setAppTrashActive(true);
        window.setTimeout(() => {
          onRemoveCard?.(appReorderState.id);
          setDragState(null);
          setAppReorderState(null);
          setAppTrashActive(false);
          setAbsorbingCardId(null);
          setAppUndoVisible(Boolean(onUndo));
          appDragPointRef.current = null;
        }, APP_TRASH_DELETE_DELAY_MS);
        return;
      }

      const finalY = Math.max(
        0,
        appReorderState.startY +
          (clientY - appReorderState.startClientY) +
          (getAppScrollTop() - appReorderState.startScrollTop),
      );
      commitReorderAtY(appReorderState.id, finalY);
      setDragState(null);
      setAppReorderState(null);
      setAppTrashActive(false);
      appDragPointRef.current = null;
    };

    const onMove = (event: TouchEvent) => {
      const touch = findTouch(event.touches);
      if (!touch) return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      moveToPoint(touch.clientX, touch.clientY);
    };

    const onEnd = (event: TouchEvent) => {
      const touch = findTouch(event.changedTouches);
      const point = touch
        ? { clientX: touch.clientX, clientY: touch.clientY }
        : appDragPointRef.current;
      if (!point) return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      finishAtPoint(point.clientX, point.clientY);
    };

    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: false });
    window.addEventListener("touchcancel", onEnd, { passive: false });
    return () => {
      cancelAppDragFrame();
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [
    appReorderState,
    cards,
    cancelAppDragFrame,
    cancelAppAutoScroll,
    clearLongPress,
    commitReorderAtY,
    contentWidth,
    getAppScrollTop,
    isClientPointOverAppTrash,
    onRemoveCard,
    onUndo,
    stageWidth,
    updateAppDragFromPoint,
  ]);

  useEffect(() => clearLongPress, [clearLongPress]);

  const startAppLongPressReorder = useCallback(
    (card: EditorCard, index: number, event: ReactPointerEvent<HTMLDivElement>) => {
      if (!unframed || event.pointerType === "mouse" || event.pointerType === "touch") return;
      event.stopPropagation();
      window.getSelection()?.removeAllRanges();
      clearLongPress();
      const pos = getPosition(card, index, contentWidth, cards);
      const w = pos.w ?? DEFAULT_W;
      const h = getRenderHeight(card, index);
      const pending = {
        id: card.id,
        input: "pointer" as const,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        latestClientX: event.clientX,
        latestClientY: event.clientY,
        startScrollTop: getAppScrollTop(),
        startX: pos.x,
        startY: pos.y,
        w,
        h,
      };
      setAppLongPressPendingId(card.id);
      longPressRef.current = {
        ...pending,
        timer: window.setTimeout(() => {
          longPressRef.current = null;
          setAppLongPressPendingId(null);
          window.getSelection()?.removeAllRanges();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          onSelectCard(card.id);
          setAppUndoVisible(false);
          appDragPointRef.current = { clientX: pending.latestClientX, clientY: pending.latestClientY };
          setAppReorderState({
            ...pending,
            startClientX: pending.latestClientX,
            startClientY: pending.latestClientY,
          });
          setDragState({ id: card.id, x: pos.x, y: pos.y, w, h, guides: [] });
          setAppTrashActive(false);
        }, APP_LONG_PRESS_REORDER_MS),
      };
    },
    [cards, clearLongPress, contentWidth, getAppScrollTop, getRenderHeight, onSelectCard, unframed],
  );

  const startAppTouchLongPressReorder = useCallback(
    (card: EditorCard, index: number, event: ReactTouchEvent<HTMLDivElement>) => {
      if (!unframed) return;
      const touch = event.changedTouches.item(0);
      if (!touch) return;
      event.stopPropagation();
      window.getSelection()?.removeAllRanges();
      clearLongPress();
      const pos = getPosition(card, index, contentWidth, cards);
      const w = pos.w ?? DEFAULT_W;
      const h = getRenderHeight(card, index);
      const pending = {
        id: card.id,
        input: "touch" as const,
        pointerId: -1,
        touchIdentifier: touch.identifier,
        startClientX: touch.clientX,
        startClientY: touch.clientY,
        latestClientX: touch.clientX,
        latestClientY: touch.clientY,
        startScrollTop: getAppScrollTop(),
        startX: pos.x,
        startY: pos.y,
        w,
        h,
      };
      setAppLongPressPendingId(card.id);
      longPressRef.current = {
        ...pending,
        timer: window.setTimeout(() => {
          longPressRef.current = null;
          setAppLongPressPendingId(null);
          window.getSelection()?.removeAllRanges();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          onSelectCard(card.id);
          setAppUndoVisible(false);
          appDragPointRef.current = { clientX: pending.latestClientX, clientY: pending.latestClientY };
          setAppReorderState({
            ...pending,
            startClientX: pending.latestClientX,
            startClientY: pending.latestClientY,
          });
          setDragState({ id: card.id, x: pos.x, y: pos.y, w, h, guides: [] });
          setAppTrashActive(false);
        }, APP_LONG_PRESS_REORDER_MS),
      };
    },
    [cards, clearLongPress, contentWidth, getAppScrollTop, getRenderHeight, onSelectCard, unframed],
  );

  const handleDragStop = useCallback(
    (id: string, _e: unknown, d: { x: number; y: number }) => {
      setDragState(null);
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const index = cards.findIndex((c) => c.id === id);
      const pos = getPosition(card, index, contentWidth, cards);
      const w = pos.w ?? DEFAULT_W;
      const h = getRenderHeight(card, index);
      const { y } = computeSnap(id, d.x, d.y, w, h, cards, contentWidth);
      commitReorderAtY(id, y);
    },
    [cards, contentWidth, getRenderHeight, commitReorderAtY]
  );

  const handleResizeStop = useCallback(
    (
      id: string,
      _e: unknown,
      _dir: unknown,
      ref: HTMLElement,
      _delta: unknown,
      pos: { x: number; y: number }
    ) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const rawW = ref.offsetWidth;
      const h = ref.offsetHeight;
      const fullBleed = isCardFullBleed(card);
      const stageW = contentWidth + CANVAS_PADDING_X * 2;
      const w = fullBleed
        ? stageW
        : usesHeroColumnWidth(card.type)
          ? contentWidth
          : Math.min(rawW, contentWidth);
      const x = fullBleed
        ? 0
        : usesHeroColumnWidth(card.type)
          ? CANVAS_PADDING_X
          : Math.round(pos.x / GRID) * GRID;
      onUpdateCard(id, {
        ...(card.type === "space"
          ? {
              content: {
                ...(card.content as Record<string, unknown>),
                height: h,
              },
            }
          : {}),
        style: {
          ...card.style,
          [POSITION_KEY]: {
            x,
            y: Math.round(pos.y / GRID) * GRID,
            w,
            h,
            manualH: true,
          },
        },
      });
    },
    [cards, contentWidth, onUpdateCard]
  );

  const pageBackgroundStyle =
    pageBackground?.mode === "gradient"
      ? `linear-gradient(${pageBackground.angle}deg, ${pageBackground.from}, ${pageBackground.to})`
      : pageBackground?.color ?? "#ffffff";
  const canvasH = Math.max(
    800,
    cards.reduce((max, card, idx) => {
      const pos = getPosition(card, idx, contentWidth, cards);
      const h = getRenderHeight(card, idx);
      return Math.max(max, pos.y + h + 32);
    }, 0)
  );
  const frameWidth = unframed ? EDITOR_APP_FRAME_WIDTH : EDITOR_WEB_FRAME_WIDTH;

  return (
    <CardEditProvider inlineEditable>
    <LocaleProvider value={previewLocale}>
    <div
      ref={canvasRef}
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden outline-none"
      tabIndex={-1}
      onClick={() => onSelectCard(null)}
    >
      <div className="editor-canvas-outer flex h-full min-h-0 min-w-0 flex-1 justify-center overflow-hidden bg-slate-200/80">
        <PhoneDeviceFrame
          width={frameWidth}
          fillHeight
          verticalInset={unframed ? 0 : 28}
          showNotch={!unframed}
          className={unframed ? "app-editor-unframed-preview h-full w-full" : "h-full w-full"}
          screenStyle={{ background: pageBackgroundStyle }}
          onScreenWidthChange={setViewportWidth}
          header={
            <div className="flex items-start justify-between gap-2">
              <h1 className="min-w-0 flex-1 break-words text-[15px] font-bold leading-tight tracking-tight text-slate-900">
                {pageTitle.trim() || "（無題）"}
              </h1>
              <div className="flex shrink-0 items-center gap-1.5">
                {isBusinessPlan ? (
                  <GuestLanguageToggle
                    locale={previewLocale}
                    onLocaleChange={setPreviewLocale}
                    contained
                  />
                ) : null}
                {navStyle === "hamburger" && shellTabs.length > 0 ? (
                  <GuestHamburgerMenu
                    tabs={shellTabs}
                    currentSlug={pageSlug}
                    locale={previewLocale}
                    clientApp={clientShell.isAppShell}
                    previewMode
                  />
                ) : null}
              </div>
            </div>
          }
          footer={
            navStyle === "tabs" && shellTabs.length > 0 ? (
              <GuestBottomTabBar
                tabs={shellTabs}
                currentSlug={pageSlug}
                locale={previewLocale}
                clientApp={clientShell.isAppShell}
                previewMode
              />
            ) : null
          }
        >
          <div className="relative">
          <div
            className="guest-page guest-content-gutter relative z-[1] mx-auto"
            style={{ width: stageWidth, minHeight: canvasH }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onSelectCard(null);
            }}
          >
          <div
            className="relative"
            style={{
              width: stageWidth,
              height: canvasH,
              minHeight: canvasH,
            }}
          >
          {/* Guide lines during drag - stage coordinate system */}
          {dragState && (
            <svg
              className="pointer-events-none absolute inset-0 z-20"
              style={{ overflow: "visible", width: stageWidth, height: canvasH }}
            >
              {dragState.guides.map((g, i) =>
                g.axis === "x" ? (
                  <line
                    key={`x-${i}`}
                    x1={g.value}
                    y1={0}
                    x2={g.value}
                    y2={canvasH}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                ) : (
                  <line
                    key={`y-${i}`}
                    x1={0}
                    y1={g.value}
                    x2={stageWidth}
                    y2={g.value}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                )
              )}
            </svg>
          )}
          {cards.map((card, idx) => {
            const pos = getPosition(card, idx, contentWidth, cards);
            const w = pos.w ?? DEFAULT_W;
            const h = getRenderHeight(card, idx);
            const isDragging = dragState?.id === card.id;
            const isSelected = selectedCardId === card.id;
            const isNewlyAdded = card.id === lastAddedCardId;
            const displayX = isDragging ? dragState.x : pos.x;
            const displayY = isDragging ? dragState.y : pos.y;
            const measuredContentHeight = autoHeights[card.id];
            const isOverflowing =
              typeof measuredContentHeight === "number" &&
              Number.isFinite(measuredContentHeight) &&
              measuredContentHeight > h + 1;
            const fullBleed = isCardFullBleed(card);
            const blockStyle = getBlockStyle(card);
            const shellBackgroundColor =
              isMediaCardType(card.type)
                ? "transparent"
                : (blockStyle as Record<string, unknown>).backgroundColor === undefined
                ? "var(--editor-block-surface, var(--color-ds-card))"
                : (blockStyle as Record<string, unknown>).backgroundColor;
            const shellStyle: CSSProperties & { "--editor-card-surface": string } = {
              backgroundColor: shellBackgroundColor as string,
              "--editor-card-surface": "transparent",
              ...blockStyle,
              ...((card.style as Record<string, unknown> | undefined)?.textColor
                ? ({
                    ["--editor-card-text-color"]: (card.style as Record<string, unknown>).textColor as string,
                  } as Record<string, string>)
                : {}),
            };
            const selectedOutlineStyle =
              unframed && isSelected
                ? {
                    "--editor-selected-outline-left": `${(fullBleed ? 0 : CANVAS_PADDING_X) - displayX - 8}px`,
                    "--editor-selected-outline-width": `${(fullBleed ? stageWidth : contentWidth) + 16}px`,
                  }
                : {};
            const cardRenderer = (
              <CardRenderer
                card={card}
                isSelected={isSelected}
                showSpaceLabel
                businessFeaturesEnabled={isBusinessPlan}
              />
            );
            return (
              <Rnd
                key={card.id}
                data-card-id={card.id}
                size={{ width: w, height: h }}
                position={{ x: displayX, y: displayY }}
                minWidth={MIN_W}
                minHeight={MIN_H}
                onDrag={(_e, d) => handleDrag(card.id, _e, d)}
                onDragStop={(_e, d) => handleDragStop(card.id, _e, d)}
                onResizeStop={(_e, _dir, ref, _delta, position) =>
                  handleResizeStop(card.id, _e, _dir, ref, _delta, position)
                }
                dragGrid={[1, 1]}
                resizeGrid={[GRID, GRID]}
                bounds="parent"
                className={
                  (scrollPriorityMode ? "!cursor-default " : "!cursor-move ") +
                  "editor-reorder-smooth " +
                  (appReorderState?.id === card.id ? "app-editor-rnd-reordering " : "")
                }
                style={{ zIndex: isSelected || isDragging ? 200 : 1 }}
                disableDragging={scrollPriorityMode || unframed}
                enableResizing={
                  isSelected && !scrollPriorityMode
                    ? usesHeroColumnWidth(card.type)
                      ? {
                          top: true,
                          right: false,
                          bottom: true,
                          left: false,
                          topRight: false,
                          bottomRight: false,
                          bottomLeft: false,
                          topLeft: false,
                        }
                      : true
                    : false
                }
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  if (unframed && (appReorderState || absorbingCardId)) {
                    e.preventDefault();
                    return;
                  }
                  onSelectCard(card.id);
                }}
              >
                <div
                  className={
                    "relative h-full w-full " +
                    (unframed && appReorderState?.id === card.id
                      ? "app-editor-reorder-touch-guard "
                      : "")
                  }
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (unframed) {
                      window.getSelection()?.removeAllRanges();
                    }
                    startAppLongPressReorder(card, idx, e);
                  }}
                  onPointerMove={(e) => {
                    const pending = longPressRef.current;
                    if (!pending || pending.pointerId !== e.pointerId) return;
                    pending.latestClientX = e.clientX;
                    pending.latestClientY = e.clientY;
                    e.stopPropagation();
                    window.getSelection()?.removeAllRanges();
                  }}
                  onPointerUp={clearLongPress}
                  onPointerCancel={() => {
                    const pending = longPressRef.current;
                    if (!appReorderState && pending?.input !== "touch") clearLongPress();
                  }}
                  onTouchStart={(e) => {
                    startAppTouchLongPressReorder(card, idx, e);
                  }}
                  onTouchMove={(e) => {
                    const pending = longPressRef.current;
                    if (!pending || pending.input !== "touch") return;
                    const touch = Array.from(e.changedTouches).find(
                      (entry) => entry.identifier === pending.touchIdentifier,
                    );
                    if (!touch) return;
                    pending.latestClientX = touch.clientX;
                    pending.latestClientY = touch.clientY;
                    window.getSelection()?.removeAllRanges();
                  }}
                  onTouchEnd={(e) => {
                    const pending = longPressRef.current;
                    if (!pending || pending.input !== "touch") return;
                    const touch = Array.from(e.changedTouches).find(
                      (entry) => entry.identifier === pending.touchIdentifier,
                    );
                    if (!touch) return;
                    clearLongPress();
                  }}
                  onTouchCancel={(e) => {
                    const pending = longPressRef.current;
                    if (!pending || pending.input !== "touch") return;
                    const touch = Array.from(e.changedTouches).find(
                      (entry) => entry.identifier === pending.touchIdentifier,
                    );
                    if (!touch) return;
                    pending.latestClientX = touch.clientX;
                    pending.latestClientY = touch.clientY;
                  }}
                  onContextMenu={(e) => {
                    if (!unframed) return;
                    e.preventDefault();
                    e.stopPropagation();
                    window.getSelection()?.removeAllRanges();
                  }}
                >
                  <div
                    className={
                      "editor-card-selected h-full w-full overflow-hidden transition-shadow " +
                      (isNewlyAdded ? "editor-card-enter " : "") +
                      (appReorderState?.id === card.id ? "app-editor-card-reordering " : "") +
                      (absorbingCardId === card.id ? "app-editor-card-absorbing " : "") +
                      (fullBleed
                        ? "card-full-bleed rounded-none "
                        : "guest-card-surface-media ") +
                      (isSelected
                        ? unframed
                          ? "editor-card-selected--active "
                          : fullBleed
                            ? "ring-2 ring-blue-300 "
                            : "ring-2 ring-blue-300 ring-offset-2 "
                        : "") +
                      ((card.style as Record<string, unknown> | undefined)?.textColor ? "editor-card-colorized " : "") +
                      ((card.style as Record<string, unknown> | undefined)?.innerTonePreset ? "editor-inner-surface-overridden " : "")
                    }
                    style={{ ...shellStyle, ...selectedOutlineStyle }}
                  >
                    {/*
                      カード本体を flex-shrink させない（既定の Rnd 高さに縮ませない）。
                      そうしないとヒーロー画像や長いメニューが 1 行分の高さに潰れ、未表示に見える。
                    */}
                    <div
                      ref={setContentRef(card.id)}
                      data-card-content-id={card.id}
                      className={
                        "flex h-full w-full min-h-0 flex-col items-stretch overflow-x-hidden overflow-y-visible p-0 [&>*]:shrink-0 " +
                        (isOverflowing || card.type === "map" || card.type === "tabs_info" || card.type === "accordion_info"
                          ? "justify-start"
                          : "justify-center")
                      }
                    >
                      {unframed ? (
                        <ClientShellContext.Provider value={{ ...clientShell, isNativeUi: false }}>
                          {cardRenderer}
                        </ClientShellContext.Provider>
                      ) : (
                        cardRenderer
                      )}
                    </div>
                  </div>
                </div>
              </Rnd>
            );
          })}
          </div>
          </div>
          </div>
        </PhoneDeviceFrame>
        {unframed && appReorderState ? (
          <div
            ref={appTrashRef}
            className={
              "app-editor-drag-trash " +
              (appTrashActive ? "app-editor-drag-trash--active" : "")
            }
            aria-live="polite"
          >
            <span className="app-editor-drag-trash-icon" aria-hidden>
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M3 6h18" />
                <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
                <path d="M19 6l-.9 13.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </span>
          </div>
        ) : null}
        {unframed && appUndoVisible && onUndo ? (
          <div className="app-editor-undo-toast" role="status">
            <span>ブロックを削除しました</span>
            <button
              type="button"
              onClick={() => {
                onUndo();
                setAppUndoVisible(false);
              }}
            >
              元に戻す
            </button>
          </div>
        ) : null}
      </div>
    </div>
    </LocaleProvider>
    </CardEditProvider>
  );
}
