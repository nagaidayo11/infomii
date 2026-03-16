"use client";

import { useState } from "react";
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
import { CSS } from "@dnd-kit/utilities";
import { CardRenderer } from "@/components/cards/CardRenderer";
import type { EditorCard } from "./types";

/** Guest viewport width (matches public page). */
const CANVAS_WIDTH = 375;

/** Phone frame: bezel + status bar + 375px screen + home indicator. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center"
      aria-label="スマートフォンプレビュー"
    >
      <div className="rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-800 p-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="overflow-hidden rounded-[1.5rem] border-4 border-slate-700 bg-slate-900">
          {/* Status bar */}
          <div className="flex h-7 items-center justify-center bg-slate-900 px-6 pt-1 text-[11px] font-medium text-white">
            <span>9:41</span>
          </div>
          {/* Screen */}
          <div
            className="overflow-hidden bg-white"
            style={{ width: CANVAS_WIDTH, minHeight: 640 }}
          >
            {children}
          </div>
          {/* Home indicator */}
          <div className="flex justify-center bg-slate-900 pb-2 pt-1">
            <span className="h-1 w-24 rounded-full bg-slate-600" aria-hidden />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        ゲストの表示イメージ（375px）
      </p>
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

  const style = {
    transform: [
      CSS.Transform.toString(transform),
      isDragging ? "scale(0.98)" : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined,
    transition: transition ?? "transform 220ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 160ms ease-out",
    opacity: isDragging ? 0.5 : 1,
    pointerEvents: isDragging ? "none" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <div className="flex items-stretch gap-0">
        <button
          type="button"
          className="flex w-9 shrink-0 cursor-grab items-center justify-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-400 opacity-0 transition-all duration-150 ease-out group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="並べ替え"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
          </svg>
        </button>
        <div
          className={
            "min-w-0 flex-1 rounded-r-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-[transform,box-shadow,border-color] duration-150 ease-out " +
            (isNewlyAdded ? "card-insert " : "") +
            (isSelected
              ? "border-slate-400/70 ring-2 ring-slate-400/40 ring-offset-2 ring-offset-slate-100"
              : "border-slate-200 hover:border-slate-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5")
          }
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {children}
        </div>
      </div>
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
    >
      <div
        className="flex flex-1 flex-col overflow-hidden outline-none"
        tabIndex={-1}
        onClick={() => onSelectCard(null)}
      >
        <div className="flex flex-1 justify-center overflow-y-auto p-6">
          <PhoneFrame>
            <div
              className="flex h-full min-h-[560px] flex-col bg-[#f1f5f9]"
              data-mobile-preview
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto p-4">
                <SortableContext
                  items={sortedCards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        左のカードライブラリから追加、または <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px]">/</kbd> でクイック挿入
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        ドラッグで並べ替え
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        カードをクリックすると右で編集
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
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
          </PhoneFrame>
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 220,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.1)",
        }}
      >
        {activeCard ? (
          <div
            className="flex items-stretch gap-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
            style={{
              transform: "translateY(-3px) scale(1.008)",
              transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
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
