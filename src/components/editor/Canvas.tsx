"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { BlockToolbar } from "./BlockToolbar";
import { getBlockStyle, type EditorCard } from "./types";

/** Guest viewport widths (matches public page). */
const VIEWPORT_SIZES = [
  { label: "375px", width: 375 },
  { label: "414px", width: 414 },
] as const;

/** Mobile phone-style frame: rounded corners, light border, subtle shadow. */
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

type CanvasProps = {
  cards: EditorCard[];
  selectedCardId: string | null;
  lastAddedCardId?: string | null;
  highlightedCardIds?: Set<string>;
  onSelectCard: (id: string | null) => void;
  onReorder: (cards: EditorCard[]) => void;
  onDuplicateCard?: (id: string) => void;
  onRemoveCard?: (id: string) => void;
};

function CardContextMenu({
  x,
  y,
  onClose,
  onDuplicate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
        style={{ left: x, top: y }}
        role="menu"
      >
        {onMoveUp && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onMoveUp();
              onClose();
            }}
            disabled={!canMoveUp}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            上へ移動
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onMoveDown();
              onClose();
            }}
            disabled={!canMoveDown}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            下へ移動
          </button>
        )}
        {(onMoveUp || onMoveDown) && <div className="my-1 border-t border-slate-100" />}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onDuplicate();
            onClose();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          複製
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          削除
        </button>
      </div>
    </>
  );
}

function SortableCardWrapper({
  card,
  isSelected,
  isNewlyAdded,
  isTemplateHighlighted,
  onSelect,
  onDuplicate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onContextMenuClick,
  children,
}: {
  card: EditorCard;
  isSelected: boolean;
  isNewlyAdded: boolean;
  onSelect: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onContextMenuClick?: (e: React.MouseEvent) => void;
  isTemplateHighlighted?: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
    pointerEvents: isDragging ? ("none" as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
      data-card-id={card.id}
    >
      {isDragging ? (
        <div
          className="editor-card-drop-placeholder flex min-h-[72px] items-stretch gap-0 overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 shadow-[0_0_0_2px_rgba(37,99,235,0.12)]"
          aria-hidden
        >
          <div className="w-9 shrink-0 border-r border-blue-200/50 bg-blue-100/60" />
          <div className="min-w-0 flex-1 bg-blue-50/20" />
        </div>
      ) : (
        <div
          className={
            "relative flex items-stretch gap-0 overflow-hidden rounded-2xl border transition-[transform,box-shadow,border-color,background-color] duration-250 ease-out " +
            (isNewlyAdded ? "card-insert " : "") +
            (isTemplateHighlighted ? "ring-2 ring-emerald-400/60 bg-emerald-50/40 " : "") +
            (isSelected
              ? "border-blue-200/80 bg-blue-50/30 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)] ring-[3px] ring-blue-200/40 ring-inset -translate-y-0.5"
              : "border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-slate-300 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:scale-[1.005]")
          }
        >
          <button
            type="button"
            className={
              "flex w-9 shrink-0 cursor-grab items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-400 transition-all duration-200 ease-out group-hover:opacity-100 active:cursor-grabbing " +
              (isSelected ? "border-blue-200/80 opacity-100" : "opacity-0")
            }
            {...attributes}
            {...listeners}
            aria-label="並べ替え"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
            </svg>
          </button>
          <div
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onContextMenu={onContextMenuClick}
            aria-label={isSelected ? "カードを選択中。右パネルで編集" : "カードを選択"}
            className={
              "editor-card relative min-w-0 flex-1 overflow-hidden border-0 bg-white transition-[background-color] duration-250 ease-out " +
              ((((card.style as Record<string, unknown> | undefined)?.innerSurfaceMode === "transparent") ||
              ((card.style as Record<string, unknown> | undefined)?.innerSurfaceMode === "custom"))
                ? "editor-inner-surface-overridden "
                : "")
            }
            style={getBlockStyle(card)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }}
          >
            {isSelected && onDuplicate && onRemove && (
              <BlockToolbar
                cardId={card.id}
                cardType={card.type}
                onDuplicate={onDuplicate}
                onDelete={onRemove}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
              />
            )}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile preview canvas. Renders cards with cards.map() and CardRenderer.
 * Drag-and-drop reorder via dnd-kit. Click to select; live preview updates from store.
 * Drag: lifted card in overlay with shadow; list animates with spacing.
 */
export function Canvas({
  cards,
  selectedCardId,
  lastAddedCardId = null,
  highlightedCardIds,
  onSelectCard,
  onReorder,
  onDuplicateCard,
  onRemoveCard,
}: CanvasProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(375);
  const [contextMenu, setContextMenu] = useState<{
    cardId: string;
    x: number;
    y: number;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When a card is added, scroll it into view after layout so the animation is visible. Double rAF ensures layout is done.
  useEffect(() => {
    if (!lastAddedCardId || !scrollContainerRef.current) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = scrollContainerRef.current?.querySelector(
          `[data-card-id="${lastAddedCardId}"]`
        ) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [lastAddedCardId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) {
      const next = arrayMove(cards, oldIndex, newIndex);
      const withOrder = next.map((c, i) => ({ ...c, order: i }));
      onReorder(withOrder);
    }
  };

  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  const activeCard = activeCardId ? sortedCards.find((c) => c.id === activeCardId) ?? null : null;

  const closeContextMenu = () => setContextMenu(null);

  const moveCard = (cardId: string, direction: "up" | "down") => {
    const idx = sortedCards.findIndex((c) => c.id === cardId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sortedCards.length) return;
    const next = arrayMove(sortedCards, idx, newIdx);
    const withOrder = next.map((c, i) => ({ ...c, order: i }));
    onReorder(withOrder);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div
        className="flex flex-1 flex-col overflow-hidden outline-none"
        tabIndex={-1}
        onClick={() => onSelectCard(null)}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-center gap-2 border-b border-slate-200/80 bg-white/80 py-2">
            <span className="text-xs font-medium text-slate-500">プレビュー幅</span>
            {VIEWPORT_SIZES.map(({ label, width }) => (
              <button
                key={width}
                type="button"
                onClick={() => setViewportWidth(width)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  viewportWidth === width
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-1 justify-center overflow-y-auto p-6">
          <MobileCanvasFrame width={viewportWidth}>
            <div
              className="flex min-h-[480px] flex-1 flex-col bg-white"
              data-mobile-preview
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto bg-white px-4 py-4"
              >
                <div className="mx-auto" style={{ maxWidth: viewportWidth }}>
                <SortableContext
                  items={sortedCards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        左のカードライブラリから追加、または <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs">/</kbd> でクイック挿入
                      </p>
                      <p className="mt-3 text-xs text-slate-500">
                        Click any text to edit inline · Drag to reorder · Right panel for settings
                      </p>
                    </div>
                  ) : (
                    <div
                      className="space-y-3"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) onSelectCard(null);
                      }}
                    >
                      {sortedCards.map((card, idx) => (
                        <SortableCardWrapper
                          key={card.id}
                          card={card}
                          isSelected={selectedCardId === card.id}
                          isNewlyAdded={card.id === lastAddedCardId}
                          isTemplateHighlighted={highlightedCardIds?.has(card.id)}
                          onSelect={() => onSelectCard(card.id)}
                          onDuplicate={onDuplicateCard ? () => onDuplicateCard(card.id) : undefined}
                          onRemove={onRemoveCard ? () => onRemoveCard(card.id) : undefined}
                          onMoveUp={idx > 0 ? () => moveCard(card.id, "up") : undefined}
                          onMoveDown={idx < sortedCards.length - 1 ? () => moveCard(card.id, "down") : undefined}
                          canMoveUp={idx > 0}
                          canMoveDown={idx < sortedCards.length - 1}
                          onContextMenuClick={
                            onDuplicateCard && onRemoveCard
                              ? (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({ cardId: card.id, x: e.clientX, y: e.clientY });
                                }
                              : undefined
                          }
                        >
                          <CardRenderer
                            card={card}
                            isSelected={selectedCardId === card.id}
                          />
                        </SortableCardWrapper>
                      ))}
                    </div>
                  )}
                </SortableContext>
                </div>
              </div>
            </div>
          </MobileCanvasFrame>
          </div>
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 260,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {activeCard ? (
          <div
            className="editor-card-dragging flex items-stretch gap-0 overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white"
            style={{
              boxShadow:
                "0 24px 56px -12px rgba(0,0,0,0.24), 0 12px 28px -8px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)",
              transform: "translateY(-14px) scale(1.02)",
            }}
          >
            <div className="w-9 shrink-0 border-r border-slate-200 bg-slate-100" aria-hidden />
            <div className="min-w-0 flex-1 border-0 bg-white">
              <CardRenderer card={activeCard} isSelected={false} />
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {contextMenu && (() => {
        const card = sortedCards.find((c) => c.id === contextMenu.cardId);
        if (!card || !onDuplicateCard || !onRemoveCard) return null;
        const idx = sortedCards.findIndex((c) => c.id === contextMenu.cardId);
        return (
          <CardContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onDuplicate={() => onDuplicateCard(card.id)}
            onRemove={() => onRemoveCard(card.id)}
            onMoveUp={idx > 0 ? () => moveCard(card.id, "up") : undefined}
            onMoveDown={idx < sortedCards.length - 1 ? () => moveCard(card.id, "down") : undefined}
            canMoveUp={idx > 0}
            canMoveDown={idx < sortedCards.length - 1}
          />
        );
      })()}
    </DndContext>
  );
}
