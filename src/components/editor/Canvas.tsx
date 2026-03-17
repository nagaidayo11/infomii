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
import type { EditorCard } from "./types";

/** Guest viewport width (matches public page). */
const CANVAS_WIDTH = 375;

/** Mobile phone-style frame: 375px screen, rounded corners, light border, subtle shadow. Makes the mobile layout obvious. */
function MobileCanvasFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center"
      aria-label="モバイルプレビュー（ゲスト表示）"
    >
      {/* Phone frame: bezel + screen */}
      <div
        className="flex flex-col rounded-[2rem] border border-slate-200/90 bg-slate-100/80 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
        style={{ width: CANVAS_WIDTH + 24 }}
      >
        {/* Optional top notch/dynamic island hint */}
        <div className="mx-auto mb-1 h-2 w-16 shrink-0 rounded-full bg-slate-300/70" aria-hidden />
        {/* Screen */}
        <div
          className="flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white"
          style={{ width: CANVAS_WIDTH }}
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
  onSelectCard: (id: string | null) => void;
  onReorder: (cards: EditorCard[]) => void;
};

function SortableCardWrapper({
  card,
  isSelected,
  isNewlyAdded,
  onSelect,
  children,
}: {
  card: EditorCard;
  isSelected: boolean;
  isNewlyAdded: boolean;
  onSelect: () => void;
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
          className="editor-card-drop-placeholder flex items-stretch gap-0 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 min-h-[72px] shadow-[0_0_0_2px_rgba(37,99,235,0.12)]"
          aria-hidden
        >
          <div className="w-9 shrink-0 rounded-l-xl bg-blue-100/60" />
          <div className="min-w-0 flex-1 rounded-r-xl" />
        </div>
      ) : (
        <div className="flex items-stretch gap-0">
          <button
            type="button"
            className={
              "flex w-9 shrink-0 cursor-grab items-center justify-center rounded-l-xl border border-r-0 bg-slate-50 text-slate-400 transition-all duration-200 ease-out group-hover:opacity-100 active:cursor-grabbing " +
              (isSelected ? "border-blue-200 opacity-100" : "border-slate-200 opacity-0")
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
            aria-label={isSelected ? "カードを選択中。右パネルで編集" : "カードを選択"}
            className={
              "editor-card min-w-0 flex-1 rounded-r-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-[transform,box-shadow,border-color,background-color] duration-250 ease-out " +
              (isNewlyAdded ? "card-insert " : "") +
              (isSelected
                ? "border border-blue-200/80 bg-blue-50/30 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)] ring-[3px] ring-blue-200/40 ring-inset -translate-y-0.5"
                : "border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:scale-[1.005]")
            }
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
  onSelectCard,
  onReorder,
}: CanvasProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
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
        <div className="flex flex-1 justify-center overflow-y-auto p-6">
          <MobileCanvasFrame>
            <div
              className="flex min-h-[480px] flex-1 flex-col bg-white"
              data-mobile-preview
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto bg-white px-4 py-4"
              >
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
                      className="space-y-4"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) onSelectCard(null);
                      }}
                    >
                      {sortedCards.map((card) => (
                        <SortableCardWrapper
                          key={card.id}
                          card={card}
                          isSelected={selectedCardId === card.id}
                          isNewlyAdded={card.id === lastAddedCardId}
                          onSelect={() => onSelectCard(card.id)}
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
          </MobileCanvasFrame>
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
            className="editor-card-dragging flex items-stretch gap-0 rounded-xl border-2 border-slate-200/90 bg-white"
            style={{
              boxShadow:
                "0 24px 56px -12px rgba(0,0,0,0.24), 0 12px 28px -8px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)",
              transform: "translateY(-14px) scale(1.02)",
            }}
          >
            <div className="w-9 shrink-0 rounded-l-xl bg-slate-100" aria-hidden />
            <div className="min-w-0 flex-1 rounded-r-xl border-l border-slate-200 bg-white">
              <CardRenderer card={activeCard} isSelected={false} />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
