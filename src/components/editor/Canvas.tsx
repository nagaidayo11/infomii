"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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

const CANVAS_WIDTH = 375;

type CanvasProps = {
  cards: EditorCard[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onReorder: (cards: EditorCard[]) => void;
};

function SortableCardRow({
  card,
  isSelected,
  onSelect,
}: {
  card: EditorCard;
  isSelected: boolean;
  onSelect: () => void;
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="flex items-stretch gap-0">
        <button
          type="button"
          className="flex w-9 shrink-0 cursor-grab items-center justify-center rounded-l-xl border border-r-0 border-ds-border bg-ds-bg text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 active:cursor-grabbing"
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
            "min-w-0 flex-1 rounded-r-xl border border-ds-border bg-ds-card shadow-[var(--shadow-ds-sm)] transition-all duration-200 " +
            (isSelected
              ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg"
              : "hover:border-slate-300 hover:shadow-[var(--shadow-ds-md)]")
          }
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <CardRenderer card={card} isSelected={isSelected} />
        </div>
      </div>
    </div>
  );
}

export function Canvas({
  cards,
  selectedCardId,
  onSelectCard,
  onReorder,
}: CanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
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

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="flex flex-1 flex-col overflow-hidden"
        onClick={() => onSelectCard(null)}
      >
        <div className="flex flex-1 justify-center overflow-y-auto p-6">
          <div
            className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-ds-border bg-ds-card shadow-[var(--shadow-ds-md)]"
            style={{ width: CANVAS_WIDTH }}
            data-mobile-preview
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-ds-border bg-ds-bg px-4 py-2.5">
              <p className="text-center text-[12px] font-medium uppercase tracking-wider text-slate-500">
                プレビュー
              </p>
            </div>
            <div className="min-h-[480px] flex-1 overflow-y-auto bg-ds-bg/50 p-4">
              <SortableContext
                items={sortedCards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ds-border bg-slate-50/50 py-16 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      左からカードを追加
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      ドラッグ＆ドロップで並べ替え。カードをクリックすると右で編集できます。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedCards.map((card) => (
                      <SortableCardRow
                        key={card.id}
                        card={card}
                        isSelected={selectedCardId === card.id}
                        onSelect={() => onSelectCard(card.id)}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
