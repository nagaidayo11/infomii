"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { CardEditProvider } from "@/components/cards/card-inline-edit";
import { guestCardColumnMaxWidthPx, GUEST_PAGE_MAIN_PADDING_X_PX } from "@/lib/guest-page-layout";
import { isCardFullBleed } from "@/lib/editor/card-width-mode";
import { reorderCardsAtTargetY } from "@/lib/freeform-stack";
import { GuestBottomTabBar } from "@/components/guest/GuestBottomTabBar";
import { GuestHamburgerMenu } from "@/components/guest/GuestHamburgerMenu";
import { PhoneDeviceFrame } from "@/components/ui/PhoneDeviceFrame";
import {
  getGuestShellNavStyle,
  resolveVisibleGuestShellTabs,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import { getBlockStyle, isMediaCardType, usesHeroColumnWidth, type CardType, type EditorCard } from "./types";

const DEFAULT_W = 280;
const DEFAULT_H = 96;
const MIN_W = 120;
const MIN_H = 48;
const MAP_AUTO_MAX_H = 320;
/** 観測要素の scrollHeight が親高さと再帰し暴走するのを防ぐ上限（px） */
const MAX_AUTO_BLOCK_H = 2400;
const GRID = 8;

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
  wifi: 90,
  breakfast: 96,
  checkout: 96,
  nearby: 104,
  notice: 84,
  map: 104,
  restaurant: 96,
  taxi: 90,
  emergency: 96,
  laundry: 96,
  spa: 104,
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
  parking: 96,
  pageLinks: 104,
  icon_shortcuts: 96,
  image_tiles: 180,
  quote: 84,
  checklist: 104,
  steps: 104,
  compare: 96,
  kpi: 96,
  space: 48,
  campaign_timer: 128,
  tabs_info: 120,
  faq_search: 128,
  notice_ticker: 92,
  coupon: 128,
  accordion_info: 140,
  open_status: 104,
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
  return DEFAULT_H_BY_TYPE[card.type] ?? DEFAULT_H;
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
  const h = typeof pos?.h === "number" ? pos.h : initialH;

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
};

export function FreeformCanvas({
  cards,
  selectedCardId,
  onSelectCard,
  onUpdateCard,
  onReorderCards,
  scrollPriorityMode = false,
  pageBackground,
  guestShell = null,
  pageSlug = "",
  pageTitle = "",
  isBusinessPlan = false,
  guestNavMaxVisible,
  unframed = false,
}: FreeformCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [viewportWidth, setViewportWidth] = useState(350);
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
  const [autoHeights, setAutoHeights] = useState<Record<string, number>>({});
  const [previewLocale, setPreviewLocale] = useState<"ja" | "en" | "zh" | "ko">("ja");
  const navStyle = guestShell ? getGuestShellNavStyle(guestShell) : "off";
  const shellTabs = guestShell
    ? resolveVisibleGuestShellTabs(guestShell, {
        businessFeaturesEnabled: isBusinessPlan,
        maxVisibleTabs: guestNavMaxVisible,
      })
    : [];

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
        return pos.h ?? getCardDefaultHeight(card);
      }
      const auto = autoHeights[card.id];
      if (card.type === "map") {
        if (typeof auto === "number" && Number.isFinite(auto)) {
          return Math.max(MIN_H, Math.min(MAP_AUTO_MAX_H, auto));
        }
        const fallback = pos.h ?? getCardDefaultHeight(card);
        return Math.max(MIN_H, Math.min(MAP_AUTO_MAX_H, fallback));
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

  return (
    <CardEditProvider inlineEditable>
    <div
      ref={canvasRef}
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden outline-none"
      tabIndex={-1}
      onClick={() => onSelectCard(null)}
    >
      <div className="editor-canvas-outer flex h-full min-h-0 min-w-0 flex-1 justify-center overflow-hidden bg-slate-200/80">
        <PhoneDeviceFrame
          width={350}
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
              {navStyle === "hamburger" && shellTabs.length > 0 ? (
                <div className="shrink-0">
                  <GuestHamburgerMenu
                    tabs={shellTabs}
                    currentSlug={pageSlug}
                    locale={previewLocale}
                    onLocaleChange={setPreviewLocale}
                    previewMode
                  />
                </div>
              ) : null}
            </div>
          }
          footer={
            navStyle === "tabs" && shellTabs.length > 0 ? (
              <GuestBottomTabBar
                tabs={shellTabs}
                currentSlug={pageSlug}
                locale={previewLocale}
                onLocaleChange={setPreviewLocale}
                previewMode
              />
            ) : null
          }
        >
          <div
            className="guest-content-gutter relative mx-auto"
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
                className={(scrollPriorityMode ? "!cursor-default " : "!cursor-move ") + "editor-reorder-smooth"}
                style={{ zIndex: isSelected || isDragging ? 200 : 1 }}
                disableDragging={scrollPriorityMode}
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
                  onSelectCard(card.id);
                }}
              >
                <div
                  className="relative h-full w-full"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onSelectCard(card.id);
                  }}
                >
                  <div
                    className={
                      "editor-card-selected h-full w-full overflow-hidden transition-shadow " +
                      (fullBleed ? "card-full-bleed rounded-none " : "rounded-xl ") +
                      (isSelected
                        ? fullBleed
                          ? "ring-2 ring-blue-300 "
                          : "ring-2 ring-blue-300 ring-offset-2 "
                        : "") +
                      ((card.style as Record<string, unknown> | undefined)?.textColor ? "editor-card-colorized " : "") +
                      ((card.style as Record<string, unknown> | undefined)?.innerTonePreset ? "editor-inner-surface-overridden " : "")
                    }
                    style={shellStyle}
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
                        (isOverflowing ? "justify-start" : "justify-center")
                      }
                    >
                      <CardRenderer card={card} isSelected={isSelected} showSpaceLabel />
                    </div>
                  </div>
                </div>
              </Rnd>
            );
          })}
          </div>
          </div>
        </PhoneDeviceFrame>
      </div>
    </div>
    </CardEditProvider>
  );
}
