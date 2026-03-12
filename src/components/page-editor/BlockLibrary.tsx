"use client";

import { useDraggable } from "@dnd-kit/core";
import { BLOCK_LIBRARY_ITEMS, type PageBlockType } from "./types";
import { usePageEditorStore } from "./store";

function LibraryItem({
  type,
  label,
  description,
}: {
  type: PageBlockType;
  label: string;
  description: string;
}) {
  const addBlock = usePageEditorStore((s) => s.addBlock);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { fromLibrary: true, blockType: type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => addBlock(type)}
      className={
        "flex w-full flex-col items-start rounded-xl border border-ds-border bg-ds-card px-4 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition " +
        (isDragging
          ? "cursor-grabbing opacity-90 ring-2 ring-blue-500/30"
          : "cursor-grab hover:border-blue-300 hover:shadow-md")
      }
    >
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="text-xs text-slate-500">{description}</span>
    </button>
  );
}

export function BlockLibrary() {
  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-ds-border bg-ds-card">
      <div className="border-b border-ds-border px-4 py-3">
        <h2 className="text-[11px] font-semibold tracking-wide text-slate-500">
          ブロックライブラリ
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          クリックで追加・ドラッグで並べ替え
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {BLOCK_LIBRARY_ITEMS.map((item) => (
          <LibraryItem
            key={item.type}
            type={item.type}
            label={item.label}
            description={item.description}
          />
        ))}
      </div>
      <p className="border-t border-ds-border px-4 py-2 text-[10px] leading-relaxed text-slate-400">
        並べ替えは左の「⋮⋮」をドラッグ
      </p>
    </aside>
  );
}
