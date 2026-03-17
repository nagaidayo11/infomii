"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
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
import { motion } from "framer-motion";
import { useSaasEditorStore } from "./store";
import { BLOCK_LIBRARY } from "./types";
import type { SaasBlockType } from "./types";

function BlockLibraryItem({
  type,
  label,
  icon,
  onAdd,
}: {
  type: SaasBlockType;
  label: string;
  icon: string;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: { id: string; type: string; order: number };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm ${
        isSelected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
      } ${isDragging ? "opacity-80 shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-slate-400 hover:text-slate-600"
        aria-label="Reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
        </svg>
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left font-medium"
        onClick={onSelect}
      >
        {block.type}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete block"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function BlockListSidebar() {
  const blocks = useSaasEditorStore((s) => s.blocks);
  const selectedBlockId = useSaasEditorStore((s) => s.selectedBlockId);
  const addBlock = useSaasEditorStore((s) => s.addBlock);
  const reorderBlocks = useSaasEditorStore((s) => s.reorderBlocks);
  const selectBlock = useSaasEditorStore((s) => s.selectBlock);
  const removeBlock = useSaasEditorStore((s) => s.removeBlock);

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const handleAddBlock = useCallback(
    (type: SaasBlockType) => {
      addBlock(type, { x: 40 + (blocks.length % 3) * 120, y: 40 + Math.floor(blocks.length / 3) * 140 });
    },
    [addBlock, blocks.length]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id);
      const newIndex = sortedBlocks.findIndex((b) => b.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) reorderBlocks(oldIndex, newIndex);
    },
    [sortedBlocks, reorderBlocks]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-200 px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Blocks
        </h2>
        <div className="mt-2 space-y-1.5">
          {BLOCK_LIBRARY.map((item) => (
            <BlockLibraryItem
              key={item.type}
              type={item.type}
              label={item.label}
              icon={item.icon}
              onAdd={() => handleAddBlock(item.type)}
            />
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          On canvas
        </h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <motion.ul
              className="mt-2 space-y-1.5"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.03 } },
                hidden: {},
              }}
            >
              {sortedBlocks.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-6 text-center text-xs text-slate-500">
                  No blocks yet. Add one above.
                </li>
              ) : (
                sortedBlocks.map((block) => (
                  <motion.li
                    key={block.id}
                    variants={{
                      hidden: { opacity: 0, y: 4 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableBlockItem
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => selectBlock(block.id)}
                      onDelete={() => removeBlock(block.id)}
                    />
                  </motion.li>
                ))
              )}
            </motion.ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
