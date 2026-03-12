"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
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
import { useRef, useState } from "react";
import { usePageEditorStore } from "./store";
import { BlockLibrary } from "./BlockLibrary";
import { BlockRenderer } from "./BlockRenderer";
import { BlockToolbar } from "./BlockToolbar";
import { MobilePreview } from "./MobilePreview";
import { TemplateGallery } from "@/components/template-gallery";
import type { PageBlock } from "./types";
import { BLOCK_TYPE_LABELS, type PageBlockType } from "./types";

function SortableBlockRow({
  block,
  isSelected,
}: {
  block: PageBlock;
  isSelected: boolean;
}) {
  const selectBlock = usePageEditorStore((s) => s.selectBlock);
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <div className="flex gap-2">
        {/* drag handle */}
        <button
          type="button"
          className="mt-3 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm active:cursor-grabbing hover:border-slate-300 hover:text-slate-600"
          {...attributes}
          {...listeners}
          aria-label="並び替え"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <BlockRenderer
            block={block}
            mode="canvas"
            isSelected={isSelected}
          />
        </div>
      </div>
      {/* toolbar on hover / when selected */}
      <div
        className={
          "absolute -top-2 right-0 z-10 transition " +
          (isSelected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100")
        }
      >
        <BlockToolbar blockId={block.id} />
      </div>
    </div>
  );
}

function CanvasDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop" });
  return (
    <div
      ref={setNodeRef}
      className={
        "flex-1 overflow-y-auto p-6 " +
        (isOver ? "bg-blue-50/50 ring-2 ring-inset ring-blue-200/60" : "")
      }
    >
      {children}
    </div>
  );
}

export function Editor() {
  const blocks = usePageEditorStore((s) => s.blocks);
  const selectedId = usePageEditorStore((s) => s.selectedId);
  const selectBlock = usePageEditorStore((s) => s.selectBlock);
  const addBlock = usePageEditorStore((s) => s.addBlock);
  const setBlocks = usePageEditorStore((s) => s.setBlocks);

  const [activeLibraryType, setActiveLibraryType] = useState<PageBlockType | null>(
    null
  );
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromLibrary && data?.blockType) {
      setActiveLibraryType(data.blockType as PageBlockType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLibraryType(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    // Drop from library onto canvas
    if (activeData?.fromLibrary && activeData?.blockType) {
      const type = activeData.blockType as PageBlockType;
      if (over.id === "canvas-drop" || blocks.some((b) => b.id === over.id)) {
        const overIndex = blocks.findIndex((b) => b.id === over.id);
        if (overIndex >= 0) {
          addBlock(type, overIndex);
        } else {
          addBlock(type);
        }
      }
      return;
    }

    // Reorder sortable
    if (active.id !== over.id && blocks.some((b) => b.id === active.id)) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        setBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  };

  const handleDragCancel = () => setActiveLibraryType(null);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-[100vh] min-h-[640px] w-full overflow-hidden bg-ds-bg">
        <BlockLibrary />
        <main
          className="flex min-w-0 flex-1 flex-col bg-ds-bg"
          onClick={() => selectBlock(null)}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-ds-border bg-ds-card px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div>
              <h1 className="text-base font-semibold text-slate-900">インフォミー</h1>
              <p className="text-xs text-slate-500">ゲスト向け案内ページを編集</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTemplateGallery(true)}
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                テンプレート
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const text = String(reader.result ?? "");
                    usePageEditorStore.getState().loadJSON(text);
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                読み込み
              </button>
              <button
                type="button"
                onClick={() => {
                  const json = usePageEditorStore.getState().toJSON();
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "infomii-page.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                保存（JSON）
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {blocks.length} 個のブロック
              </span>
            </div>
          </header>
          <CanvasDropZone>
            <div
              className="mx-auto max-w-2xl rounded-2xl border border-ds-border bg-ds-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {blocks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-ds-border bg-slate-50 py-14 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        左からブロックを選んでください
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        テキストや画像を足すと、右のプレビューにすぐ反映されます
                      </p>
                    </div>
                  )}
                  {blocks.map((block) => (
                    <SortableBlockRow
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </CanvasDropZone>
        </main>
        <MobilePreview />
      </div>
      <DragOverlay dropAnimation={null}>
        {activeLibraryType ? (
          <div className="rounded-xl border border-blue-200 bg-ds-card px-4 py-3 shadow-lg">
            <span className="text-sm font-medium text-slate-800">
              {BLOCK_TYPE_LABELS[activeLibraryType]}
            </span>
          </div>
        ) : null}
      </DragOverlay>
      {showTemplateGallery && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-labelledby="template-gallery-title"
        >
          <div className="my-8 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="template-gallery-title" className="text-lg font-semibold text-slate-900">
                テンプレートギャラリー
              </h2>
              <button
                type="button"
                onClick={() => setShowTemplateGallery(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>
            <TemplateGallery
              applyToEditor
              onApply={() => setShowTemplateGallery(false)}
            />
          </div>
        </div>
      )}
    </DndContext>
  );
}
