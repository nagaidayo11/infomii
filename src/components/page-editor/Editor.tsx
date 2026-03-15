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
import { useRef, useState, useMemo } from "react";
import { usePageEditorStore } from "./store";
import { BlockLibrary } from "./BlockLibrary";
import { BlockRenderer } from "./BlockRenderer";
import { CardSettings } from "./CardSettings";
import { EditorLayout } from "./EditorLayout";
import { TemplateGallery } from "@/components/template-gallery";
import type { PageBlock } from "./types";
import { BLOCK_TYPE_LABELS, type PageBlockType } from "./types";

const MOBILE_PREVIEW_WIDTH = 375;

function SortablePreviewRow({
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
    opacity: isDragging ? 0.6 : 1,
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
            selectBlock(block.id);
          }}
        >
          <BlockRenderer block={block} mode="preview" isSelected={isSelected} />
        </div>
      </div>
    </div>
  );
}

function PreviewDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop" });
  return (
    <div
      ref={setNodeRef}
      className={
        "flex-1 overflow-y-auto transition-all duration-200 " +
        (isOver ? "bg-ds-primary/5 ring-2 ring-inset ring-ds-primary/20 rounded-2xl" : "")
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

  const selectedBlock = useMemo(
    () => (selectedId ? blocks.find((b) => b.id === selectedId) ?? null : null),
    [blocks, selectedId]
  );

  const [activeLibraryType, setActiveLibraryType] = useState<PageBlockType | null>(null);
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
      <EditorLayout
        library={<BlockLibrary />}
        preview={
          <main
            className="flex min-w-0 flex-1 flex-col bg-ds-bg"
            onClick={() => selectBlock(null)}
            role="region"
            aria-label="プレビュー"
          >
          <header className="flex shrink-0 items-center justify-between border-b border-ds-border bg-ds-card px-5 py-3">
            <div>
              <h1 className="text-base font-semibold text-slate-900">ページエディタ</h1>
              <p className="text-xs text-slate-500">ゲスト向け案内ページを作成</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTemplateGallery(true)}
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
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
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                JSONを読み込み
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
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                JSONを保存
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                {blocks.length} 枚
              </span>
            </div>
          </header>

          <PreviewDropZone>
            <div className="flex justify-center p-6">
              <div
                className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-ds-border bg-ds-card shadow-[var(--shadow-ds-md)] transition-shadow"
                style={{ width: MOBILE_PREVIEW_WIDTH }}
                data-mobile-preview
                onClick={(e) => e.stopPropagation()}
              >
                <div className="shrink-0 border-b border-ds-border bg-ds-bg px-4 py-2.5">
                  <p className="text-center text-[12px] font-medium uppercase tracking-wider text-slate-500">
                    プレビュー
                  </p>
                </div>
                <div className="min-h-[480px] flex-1 overflow-y-auto bg-ds-bg/50 p-4 transition-[background-color] duration-200">
                  <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.length === 0 && (
                      <div
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ds-border bg-slate-50/50 py-16 text-center transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-sm font-medium text-slate-600">
                          左からカードを追加
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          ドラッグ＆ドロップも可能。カードをクリックすると右で編集できます。
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {blocks.map((block) => (
                        <SortablePreviewRow
                          key={block.id}
                          block={block}
                          isSelected={selectedId === block.id}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              </div>
            </div>
          </PreviewDropZone>
          </main>
        }
        settings={<CardSettings block={selectedBlock} />}
      />

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeLibraryType ? (
          <div className="flex items-center gap-3 rounded-xl border-2 border-ds-primary/40 bg-ds-card px-4 py-3 shadow-[var(--shadow-ds-lg)]">
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
          <div className="my-8 w-full max-w-5xl rounded-2xl border border-ds-border bg-ds-card p-6 shadow-[var(--shadow-ds-lg)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="template-gallery-title" className="text-lg font-semibold text-slate-900">
                テンプレート
              </h2>
              <button
                type="button"
                onClick={() => setShowTemplateGallery(false)}
                className="rounded-lg border border-ds-border px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
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
