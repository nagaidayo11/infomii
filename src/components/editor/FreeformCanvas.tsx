"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { BlockToolbar } from "./BlockToolbar";
import { useEditor2Store } from "./store";
import { getBlockStyle, type EditorCard } from "./types";

const VIEWPORT_SIZES = [
  { label: "375px", width: 375 },
  { label: "414px", width: 414 },
] as const;

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
          {children}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_W = 280;
const DEFAULT_H = 100;
const MIN_W = 120;
const MIN_H = 48;
const GRID = 8;
const SNAP_THRESHOLD = 8;

type Position = { x: number; y: number; w?: number; h?: number };
const POSITION_KEY = "_position";

function getPosition(card: EditorCard, index: number): Position {
  const pos = card.style?.[POSITION_KEY] as Position | undefined;
  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    return {
      x: pos.x,
      y: pos.y,
      w: typeof pos.w === "number" ? pos.w : DEFAULT_W,
      h: typeof pos.h === "number" ? pos.h : DEFAULT_H,
    };
  }
  return {
    x: 24,
    y: 24 + index * (DEFAULT_H + 16),
    w: DEFAULT_W,
    h: DEFAULT_H,
  };
}

/** Compute snap position against other cards. Returns { x, y } with snapping applied. */
function computeSnap(
  draggingId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  cards: EditorCard[]
): { x: number; y: number; guides: { axis: "x" | "y"; value: number }[] } {
  const others = cards.filter((c) => c.id !== draggingId);
  const guides: { axis: "x" | "y"; value: number }[] = [];
  let snapX = x;
  let snapY = y;

  for (const c of others) {
    const pos = getPosition(c, 0);
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
  onDuplicateCard?: (id: string) => void;
  onRemoveCard?: (id: string) => void;
};

export function FreeformCanvas({
  cards,
  selectedCardId,
  onSelectCard,
  onUpdateCard,
  onDuplicateCard,
  onRemoveCard,
}: FreeformCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const showGrid = useEditor2Store((s) => s.showGrid);
  const pageTheme = useEditor2Store((s) => s.pageTheme);
  const [viewportWidth, setViewportWidth] = useState(375);
  const [dragState, setDragState] = useState<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    guides: { axis: "x" | "y"; value: number }[];
  } | null>(null);

  const handleDrag = useCallback(
    (id: string, _e: unknown, d: { x: number; y: number }) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const pos = getPosition(card, cards.findIndex((c) => c.id === id));
      const w = pos.w ?? DEFAULT_W;
      const h = pos.h ?? DEFAULT_H;
      const { x, y, guides } = computeSnap(id, d.x, d.y, w, h, cards);
      setDragState({ id, x, y, w, h, guides });
    },
    [cards]
  );

  const handleDragStop = useCallback(
    (id: string, _e: unknown, d: { x: number; y: number }) => {
      setDragState(null);
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const pos = getPosition(card, cards.findIndex((c) => c.id === id));
      const w = pos.w ?? DEFAULT_W;
      const h = pos.h ?? DEFAULT_H;
      const { x, y } = computeSnap(id, d.x, d.y, w, h, cards);
      const snappedX = Math.round(x / GRID) * GRID;
      const snappedY = Math.round(y / GRID) * GRID;
      onUpdateCard(id, {
        style: {
          ...card.style,
          [POSITION_KEY]: {
            x: snappedX,
            y: snappedY,
            w: pos.w,
            h: pos.h,
          },
        },
      });
    },
    [cards, onUpdateCard]
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
        style: {
          ...card.style,
          [POSITION_KEY]: {
            x: Math.round(pos.x / GRID) * GRID,
            y: Math.round(pos.y / GRID) * GRID,
            w,
            h,
          },
        },
      });
    },
    [cards, onUpdateCard]
  );

  const themeStyles = {
    light: { bg: "#eef0f3", canvas: "bg-white", grid: "#d1d5db" },
    dark: { bg: "#1e293b", canvas: "bg-slate-800", grid: "#475569" },
    "hotel-amber": { bg: "#fef3c7", canvas: "bg-amber-50", grid: "#fcd34d" },
  };
  const theme = themeStyles[pageTheme];

  const canvasW = viewportWidth;
  const canvasH = 800;

  return (
    <div
      ref={canvasRef}
      className="flex flex-1 flex-col overflow-hidden outline-none"
      tabIndex={-1}
      onClick={() => onSelectCard(null)}
    >
      <div className="flex shrink-0 items-center justify-center gap-2 border-b border-slate-200/80 bg-white/80 py-2">
        <span className="text-xs font-medium text-slate-500">プレビュー幅</span>
        {VIEWPORT_SIZES.map(({ label, width }) => (
          <button
            key={width}
            type="button"
            onClick={() => setViewportWidth(width)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              viewportWidth === width
                ? "bg-slate-900 !text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="flex flex-1 justify-center overflow-auto p-6"
        style={{
          background: theme.bg,
          backgroundImage: showGrid
            ? `radial-gradient(circle at 1px 1px, ${theme.grid} 1px, transparent 0)`
            : undefined,
          backgroundSize: "24px 24px",
        }}
      >
        <MobileCanvasFrame width={viewportWidth}>
          <div
            className={`relative rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] ${theme.canvas}`}
            style={{ width: canvasW, height: canvasH, minHeight: canvasH }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onSelectCard(null);
            }}
          >
          {/* Guide lines during drag */}
          {dragState && (
            <svg
              className="pointer-events-none absolute inset-0 z-20"
              style={{ overflow: "visible", width: canvasW, height: canvasH }}
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
                    x2={canvasW}
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
            const pos = getPosition(card, idx);
            const w = pos.w ?? DEFAULT_W;
            const h = pos.h ?? DEFAULT_H;
            const isDragging = dragState?.id === card.id;
            const displayPos = { x: pos.x, y: pos.y };
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
                style={{ zIndex: isSelected || isDragging ? 10 : 1 }}
                enableResizing={isSelected}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onSelectCard(card.id);
                }}
              >
                <div
                  className={
                    "h-full w-full overflow-hidden rounded-xl border transition-shadow " +
                    (isSelected
                      ? "border-blue-300 shadow-lg ring-2 ring-blue-200"
                      : "border-slate-200 shadow-sm hover:border-slate-300")
                  }
                  style={{
                    ...blockStyle,
                    backgroundColor: blockStyle.backgroundColor ?? "white",
                  }}
                >
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
                    />
                  )}
                  <div className="overflow-auto p-2" style={{ height: "calc(100% - 36px)" }}>
                    <CardRenderer card={card} isSelected={isSelected} />
                  </div>
                </div>
              </Rnd>
            );
          })}
          </div>
        </MobileCanvasFrame>
      </div>
    </div>
  );
}
