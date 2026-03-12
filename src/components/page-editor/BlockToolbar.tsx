"use client";

import { usePageEditorStore } from "./store";

type BlockToolbarProps = {
  blockId: string;
  className?: string;
};

export function BlockToolbar({ blockId, className = "" }: BlockToolbarProps) {
  const duplicateBlock = usePageEditorStore((s) => s.duplicateBlock);
  const removeBlock = usePageEditorStore((s) => s.removeBlock);

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/95 px-1 py-0.5 shadow-sm backdrop-blur-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => duplicateBlock(blockId)}
        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        title="同じブロックを複製"
      >
        複製
      </button>
      <span className="h-4 w-px bg-slate-200" aria-hidden />
      <button
        type="button"
        onClick={() => removeBlock(blockId)}
        className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
        title="このブロックを削除"
      >
        削除
      </button>
    </div>
  );
}
