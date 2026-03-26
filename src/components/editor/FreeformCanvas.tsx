"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { BlockToolbar } from "./BlockToolbar";
import { getBlockStyle, type CardType, type EditorCard } from "./types";

const FIXED_VIEWPORT_WIDTH = 375;

function MobileCanvasFrame({
  children,
  width = 375,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  const bezel = 12;
  return (
    <div
      className="flex shrink-0 flex-col items-center"
      aria-label="モバイルプレビュー（ゲスト表示）"
    >
      <div
        className="flex flex-col rounded-[2rem] border border-slate-200/90 bg-slate-100/80 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
        style={{ width: width + bezel * 2 }}
      >
        <div className="mx-auto mb-1 h-2 w-16 shrink-0 rounded-full bg-slate-300/70" aria-hidden />
        <div
          className="flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white"
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
    </div>
  );
}

const DEFAULT_W = 280;
const DEFAULT_H = 96;
const MIN_W = 120;
const MIN_H = 48;
const GRID = 8;
const SNAP_THRESHOLD = 8;
const STACK_GAP_Y = 12;

type Position = { x: number; y: number; w?: number; h?: number; manualH?: boolean };
const POSITION_KEY = "_position";

const CANVAS_PADDING_X = 16;

const DEFAULT_H_BY_TYPE: Record<CardType, number> = {
  hero: 120,
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
  space: 32,
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
  onDuplicateCard?: (id: string) => void;
  onRemoveCard?: (id: string) => void;
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
  onDuplicateCard,
  onRemoveCard,
  pageBackground,
}: FreeformCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const viewportWidth = FIXED_VIEWPORT_WIDTH;
  const contentWidth = viewportWidth - CANVAS_PADDING_X * 2;
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
      const next = Math.max(MIN_H, measuredHeight);
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
        setAutoHeightForCard(cardId, Math.ceil(el.scrollHeight + 8));
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
        setAutoHeightForCard(id, Math.ceil(el.scrollHeight + 8));
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
      if (saved?.manualH) {
        return pos.h ?? getCardDefaultHeight(card);
      }
      const auto = autoHeights[card.id];
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
      <div
        className="flex flex-1 justify-center overflow-auto p-6"
        style={{
          background: "#eef0f3",
        }}
      >
        <MobileCanvasFrame width={viewportWidth}>
          <div
            className="relative rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
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
            const blockStyle = getBlockStyle(card);
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
                className="!cursor-move"
                style={{ zIndex: isSelected || isDragging ? 200 : 1 }}
                enableResizing={isSelected}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onSelectCard(card.id);
                }}
              >
                <div className="relative h-full w-full">
                  <div
                    className={
                      "h-full w-full overflow-hidden rounded-xl transition-shadow " +
                      (isSelected ? "ring-2 ring-blue-300 ring-offset-2 " : "") +
                      ((card.style as Record<string, unknown> | undefined)?.textColor ? "editor-card-colorized " : "")
                    }
                    style={{
                      ...blockStyle,
                      ...((card.style as Record<string, unknown> | undefined)?.textColor
                        ? ({
                            ["--editor-card-text-color"]: (card.style as Record<string, unknown>).textColor as string,
                          } as Record<string, string>)
                        : {}),
                    }}
                  >
                    <div
                      ref={setContentRef(card.id)}
                      data-card-content-id={card.id}
                      className="overflow-x-hidden overflow-y-visible p-0"
                    >
                      <CardRenderer card={card} isSelected={isSelected} />
                    </div>
                  </div>
                  {isSelected && onDuplicateCard && onRemoveCard && (
                    <BlockToolbar
                      cardId={card.id}
                      cardType={card.type}
                      onDuplicate={() => onDuplicateCard(card.id)}
                      onDelete={() => onRemoveCard(card.id)}
                      onMoveUp={undefined}
                      onMoveDown={undefined}
                      canMoveUp={false}
                      canMoveDown={false}
                      verticalPosition="above"
                    />
                  )}
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
