"use client";

import { moveListItem } from "@/lib/editor/move-list-item";

export function moveAndKeepExpanded<T>(
  items: T[],
  index: number,
  dir: -1 | 1,
  setItems: (next: T[]) => void,
  setExpandedIndex: (next: number) => void,
) {
  const next = moveListItem(items, index, dir);
  if (!next) return;
  setItems(next);
  setExpandedIndex(index + dir);
}

export function NativeItemSectionToolbar({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        className="app-native-settings-action disabled:opacity-40"
        aria-label="上へ"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        className="app-native-settings-action disabled:opacity-40"
        aria-label="下へ"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="app-native-settings-action app-native-settings-action--danger"
      >
        削除
      </button>
    </div>
  );
}
