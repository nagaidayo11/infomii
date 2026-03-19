"use client";

import { CARD_TYPE_LABELS } from "./types";
import type { CardType } from "./types";

type BlockToolbarProps = {
  cardId: string;
  cardType: CardType;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  /** 上部ブロックは枠で隠れるため、下に表示 */
  verticalPosition?: "above" | "below";
};

/**
 * カード選択時に表示するフローティングツールバー（Notion風）
 * 複製・削除・上下移動
 */
export function BlockToolbar({
  cardType,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  verticalPosition = "above",
}: BlockToolbarProps) {
  return (
    <div
      className={
        "absolute left-0 z-[300] flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 py-1 shadow-lg " +
        (verticalPosition === "below" ? "-bottom-10" : "top-1")
      }
      role="toolbar"
      aria-label="ブロック操作"
    >
      <span className="px-2 py-1 text-xs font-medium text-slate-500">
        {CARD_TYPE_LABELS[cardType] ?? cardType}
      </span>
      <div className="h-4 w-px bg-slate-200" aria-hidden />
      {onMoveUp && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={!canMoveUp}
          className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="上へ移動"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={!canMoveDown}
          className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="下へ移動"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {(onMoveUp || onMoveDown) && <div className="h-4 w-px bg-slate-200" aria-hidden />}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="複製"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} />
          <path strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        aria-label="削除"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
