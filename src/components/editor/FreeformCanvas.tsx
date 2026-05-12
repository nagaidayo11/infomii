"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { guestCardColumnMaxWidthPx } from "@/lib/guest-page-layout";
import { getBlockStyle, isMediaCardType, type CardType, type EditorCard } from "./types";

const FIXED_VIEWPORT_WIDTH = 375;

function MobileCanvasFrame({
  children,
  width = 375,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center" aria-label="モバイルプレビュー（ゲスト表示）">
      <div
        className="flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/65 bg-white shadow-[0_12px_36px_-8px_rgba(15,23,42,0.12)]"
        style={{ width }}
      >
        <div
          className="template-preview-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-scroll"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

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

const CANVAS_PADDING_X = 16;

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

/** 完全中央配置: ブロック幅いっぱいにし、左右均等の余白で中央に配置 */
function getPosition(card: EditorCard, index: number, contentWidth: number, cards: EditorCard[] = []): Position {
  const pos = card.style?.[POSITION_KEY] as Position | undefined;
  const initialH = getCardDefaultHeight(card);
  // New cards (no saved width) should start full-width in the content area.
  const w = typeof pos?.w === "number" ? pos.w : contentWidth;
  const h = typeof pos?.h === "number" ? pos.h : initialH;
  const blockW = Math.min(w, contentWidth);
  const centeredX = Math.round((contentWidth - blockW) / 2);

  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    const savedX = pos.x;
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
};

export function FreeformCanvas({
  cards,
  selectedCardId,
  onSelectCard,
  onUpdateCard,
  onReorderCards,
  scrollPriorityMode = false,
  pageBackground,
}: FreeformCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const viewportWidth = FIXED_VIEWPORT_WIDTH;
  const contentWidth = guestCardColumnMaxWidthPx(viewportWidth);
  const [dragState, setDragState] = useState<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    guides: { axis: "x" | "y"; value: number }[];
  } | null>(null);
  const [autoHeights, setAutoHeights] = useState<Record<string, number>>({});

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
      const width = Math.min(pos.w ?? DEFAULT_W, contentWidth);
      const centeredX = Math.round((contentWidth - width) / 2);
      const renderH = getRenderHeight(card, idx);
      const nextH = manualH ? (typeof saved?.h === "number" ? saved.h : renderH) : renderH;
      const nextPos: Position = {
        x: centeredX,
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
      const snappedY = Math.round(y / GRID) * GRID;
      const positions = new Map<
        string,
        {
          card: EditorCard;
          w: number;
          h: number;
          y: number;
          manualH: boolean;
        }
      >();
      for (const c of cards) {
        const i = cards.findIndex((row) => row.id === c.id);
        const p = getPosition(c, i, contentWidth, cards);
        const savedPos = (c.style?.[POSITION_KEY] as Position | undefined) ?? undefined;
        positions.set(c.id, {
          card: c,
          w: p.w ?? DEFAULT_W,
          h: getRenderHeight(c, i),
          y: p.y,
          manualH: savedPos?.manualH === true,
        });
      }
      const moved = positions.get(id);
      if (!moved) return;
      moved.y = snappedY;

      const sorted = [...positions.values()].sort((a, b) => a.y - b.y);
      let currentY = 24;
      const nextCards = sorted.map((entry, order) => {
        const centeredX = Math.round((contentWidth - entry.w) / 2);
        const next = {
          ...entry.card,
          order,
          style: {
            ...(entry.card.style ?? {}),
            [POSITION_KEY]: {
              x: centeredX,
              y: currentY,
              w: entry.w,
              h: entry.h,
              manualH: entry.manualH,
            },
          },
        };
        currentY += entry.h + STACK_GAP_Y;
        return next;
      });

      if (onReorderCards) {
        onReorderCards(nextCards);
        return;
      }

      const movedCard = nextCards.find((c) => c.id === id);
      if (!movedCard) return;
      onUpdateCard(id, { style: movedCard.style as Record<string, unknown> });
    },
    [cards, onUpdateCard, onReorderCards, contentWidth, getRenderHeight]
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
      const w = ref.offsetWidth;
      const h = ref.offsetHeight;
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
            x: Math.round(pos.x / GRID) * GRID,
            y: Math.round(pos.y / GRID) * GRID,
            w,
            h,
            manualH: true,
          },
        },
      });
    },
    [cards, onUpdateCard]
  );

  const pageBackgroundStyle =
    pageBackground?.mode === "gradient"
      ? `linear-gradient(${pageBackground.angle}deg, ${pageBackground.from}, ${pageBackground.to})`
      : pageBackground?.color ?? "#ffffff";

  const canvasW = viewportWidth;
  const canvasH = Math.max(
    800,
    cards.reduce((max, card, idx) => {
      const pos = getPosition(card, idx, contentWidth, cards);
      const h = getRenderHeight(card, idx);
      return Math.max(max, pos.y + h + 32);
    }, 0)
  );

  return (
    <div
      ref={canvasRef}
      className="flex flex-1 flex-col overflow-hidden outline-none"
      tabIndex={-1}
      onClick={() => onSelectCard(null)}
    >
      <div className="editor-canvas-outer-scroll flex min-w-0 flex-1 justify-center overflow-auto bg-slate-100 p-5">
        <MobileCanvasFrame width={viewportWidth}>
          <div
            className="relative"
            style={{ width: canvasW, height: canvasH, minHeight: canvasH, background: pageBackgroundStyle }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onSelectCard(null);
            }}
          >
          {/* Content area: 左右均等の余白で中央に配置 */}
          <div
            className="absolute top-0"
            style={{
              left: CANVAS_PADDING_X,
              width: contentWidth,
              height: canvasH,
            }}
          >
          {/* Guide lines during drag - コンテンツエリア座標系 */}
          {dragState && (
            <svg
              className="pointer-events-none absolute inset-0 z-20"
              style={{ overflow: "visible", width: contentWidth, height: canvasH }}
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
                    x2={contentWidth}
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
            const measuredContentHeight = autoHeights[card.id];
            const isOverflowing =
              typeof measuredContentHeight === "number" &&
              Number.isFinite(measuredContentHeight) &&
              measuredContentHeight > h + 1;
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
                position={{ x: pos.x, y: pos.y }}
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
                enableResizing={isSelected && !scrollPriorityMode}
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
                      "editor-card-selected h-full w-full overflow-hidden rounded-xl transition-shadow " +
                      (isSelected ? "ring-2 ring-blue-300 ring-offset-2 " : "") +
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
        </MobileCanvasFrame>
      </div>
    </div>
  );
}
