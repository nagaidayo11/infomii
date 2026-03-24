"use client";

import { useCallback, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useSaasEditorStore } from "./store";
import { BLOCK_LIBRARY, BLOCK_TYPE_LABELS } from "./types";
import type { SaasBlockType } from "./types";

const BLOCK_GROUPS: { title: string; types: SaasBlockType[] }[] = [
  { title: "ヒーロー", types: ["hero"] },
  { title: "コンテンツ", types: ["highlight", "info", "text", "notice"] },
  { title: "メディア", types: ["image", "gallery", "map"] },
  { title: "アクション", types: ["button", "coupon", "qr"] },
];

function BlockLibraryItem({
  type,
  label,
  icon,
  onAdd,
}: {
  type: SaasBlockType;
  label: string;
  icon: ReactNode;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex w-full items-center gap-4 rounded-[16px] border border-slate-200/80 bg-white px-4 py-3.5 text-left transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-slate-100 text-lg">
        {icon}
      </span>
      <span className="font-medium text-slate-800">{label}</span>
    </button>
  );
}

function BlockTypeIcon({ type }: { type: SaasBlockType }) {
  const cls = "h-5 w-5 text-slate-600";
  switch (type) {
    case "hero":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14l2.5-2.5L13 14l3-3 2 2" />
        </svg>
      );
    case "highlight":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3z" />
        </svg>
      );
    case "info":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0-9h.01" />
        </svg>
      );
    case "text":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h9" />
        </svg>
      );
    case "image":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth={2} />
          <circle cx="9" cy="10" r="1.5" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3.5-3.5L14 16l3-3 2 2" />
        </svg>
      );
    case "button":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="7" width="16" height="10" rx="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
        </svg>
      );
    case "map":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s6-5.1 6-10a6 6 0 10-12 0c0 4.9 6 10 6 10z" />
          <circle cx="12" cy="11" r="2" strokeWidth={2} />
        </svg>
      );
    case "gallery":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="5" width="6" height="6" rx="1" strokeWidth={2} />
          <rect x="14" y="5" width="6" height="6" rx="1" strokeWidth={2} />
          <rect x="4" y="13" width="6" height="6" rx="1" strokeWidth={2} />
          <rect x="14" y="13" width="6" height="6" rx="1" strokeWidth={2} />
        </svg>
      );
    case "notice":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 14H4L12 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v4m0 2h.01" />
        </svg>
      );
    case "coupon":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14v8H5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8v8m6-8v8" />
        </svg>
      );
    case "qr":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="6" height="6" rx="1" strokeWidth={2} />
          <rect x="14" y="4" width="6" height="6" rx="1" strokeWidth={2} />
          <rect x="4" y="14" width="6" height="6" rx="1" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14h4v4h-4zM14 18h2M18 14v2" />
        </svg>
      );
    default:
      return null;
  }
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

  const transformStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isSelected ? "0 2px 8px rgba(59,130,246,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
  };

  return (
    <div
      ref={setNodeRef}
      style={transformStyle}
      className={`flex items-center gap-2 rounded-[16px] border-2 px-4 py-3 text-sm transition-all ${
        isSelected
          ? "border-blue-400 bg-blue-50/90"
          : "border-slate-200/80 bg-white hover:border-slate-300"
      } ${isDragging ? "opacity-90" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded-[12px] p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="並べ替え"
        {...attributes}
        {...listeners}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
        </svg>
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left font-medium text-slate-800"
        onClick={onSelect}
      >
        {BLOCK_TYPE_LABELS[block.type as SaasBlockType] ?? block.type}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
        aria-label="ブロックを削除"
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
  const libraryMap = new Map(BLOCK_LIBRARY.map((b) => [b.type, b]));

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
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/50 px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-800">
          ブロックを追加
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          クリックでキャンバスに追加
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {BLOCK_GROUPS.map((group) => (
          <section key={group.title} className="mb-6 last:mb-0">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.types.map((type) => {
                const item = libraryMap.get(type);
                if (!item) return null;
                return (
                  <BlockLibraryItem
                    key={item.type}
                    type={item.type}
                    label={item.label}
                    icon={<BlockTypeIcon type={item.type} />}
                    onAdd={() => handleAddBlock(item.type)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="shrink-0 border-t border-slate-200/60 bg-slate-50/50 px-6 py-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          キャンバス上
        </h3>
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
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.02 } },
                hidden: {},
              }}
            >
              {sortedBlocks.length === 0 ? (
                <li className="rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 py-8 text-center text-sm text-slate-500">
                  ブロックがありません
                  <br />
                  <span className="text-xs">上から追加してください</span>
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
