/**
 * Breakfast crowd / congestion card — display helpers + thin wrappers over live-ops.
 */

import {
  LIVE_OPS_DEFINITIONS,
  LIVE_OPS_LEVELS,
  applyLiveOpsStatusToCards,
  applyNewerLiveOpsFromRows,
  coerceLiveOpsLevel,
  formatLiveOpsUpdatedAt,
  liveOpsStatusFromCardContent,
  liveOpsUpdatedAtMs,
  mergeLiveOpsFields,
  nowLiveOpsUpdatedAt,
  overlayLiveOpsStatusOnContent,
  parseLiveOpsStatus,
  parsePageOpsDocument,
  readLiveOpsNoteJa,
  writeLiveOpsNoteJa,
  type LiveOpsLevel,
  type LiveOpsStatus,
  type PageOpsDocument,
} from "@/lib/editor/live-ops";

export const BREAKFAST_CROWD_LEVELS = LIVE_OPS_LEVELS;

export type BreakfastCrowdLevel = LiveOpsLevel;

const BREAKFAST_DEF = LIVE_OPS_DEFINITIONS.breakfastCrowd;

/** Guest-facing status copy (level itself stays an enum string). */
export const BREAKFAST_CROWD_STATUS_LABELS = BREAKFAST_DEF.statusLabels;

/** Short labels for editor segmented control. */
export const BREAKFAST_CROWD_EDITOR_LABELS = BREAKFAST_DEF.editorLabels;

/** Shared Tailwind tone tokens — guest card, Quick Ops, settings picker. */
export const BREAKFAST_CROWD_LEVEL_TONES = BREAKFAST_DEF.levelTones;

export function coerceBreakfastCrowdLevel(value: unknown): BreakfastCrowdLevel {
  return coerceLiveOpsLevel(value);
}

export function breakfastCrowdStatusLabel(level: BreakfastCrowdLevel, locale = "ja"): string {
  const labels = BREAKFAST_CROWD_STATUS_LABELS[level];
  if (locale === "en") return labels.en;
  if (locale === "zh") return labels.zh;
  if (locale === "ko") return labels.ko;
  return labels.ja;
}

/** Guest trust line: 「最終更新 HH:MM」 */
export function formatBreakfastCrowdUpdatedAt(iso: unknown, locale = "ja"): string | null {
  return formatLiveOpsUpdatedAt(iso, locale);
}

export function nowBreakfastCrowdUpdatedAt(): string {
  return nowLiveOpsUpdatedAt();
}

/** Parse content.updatedAt to epoch ms; missing/invalid → 0. */
export function breakfastCrowdUpdatedAtMs(value: unknown): number {
  return liveOpsUpdatedAtMs(value);
}

/** Page-level ops snapshot (source of truth for live congestion). */
export type BreakfastCrowdOpsStatus = LiveOpsStatus;

export type { PageOpsDocument };

export function readBreakfastCrowdNoteJa(note: unknown): string {
  return readLiveOpsNoteJa(note);
}

export function writeBreakfastCrowdNoteJa(prev: unknown, note: string): unknown {
  return writeLiveOpsNoteJa(prev, note);
}

export function parseBreakfastCrowdOpsStatus(value: unknown): BreakfastCrowdOpsStatus | null {
  return parseLiveOpsStatus(value);
}

export { parsePageOpsDocument };

/** Seed ops status from denormalized card content (migration heal). */
export function breakfastCrowdOpsStatusFromCardContent(
  content: Record<string, unknown>,
): BreakfastCrowdOpsStatus {
  return liveOpsStatusFromCardContent(content);
}

/**
 * Overlay authoritative ops onto card chrome content.
 * Card keeps title / appearance; ops owns level / note / updatedAt.
 */
export function overlayBreakfastCrowdOpsOnContent(
  content: Record<string, unknown>,
  ops: BreakfastCrowdOpsStatus,
): Record<string, unknown> {
  return overlayLiveOpsStatusOnContent(content, ops);
}

/**
 * Prefer newer ops fields (level / note / updatedAt) by updatedAt.
 * Used when merging two denormalized snapshots; prefer page ops via overlay when available.
 */
export function mergeBreakfastCrowdOpsFields(
  localContent: Record<string, unknown>,
  serverContent: Record<string, unknown>,
): Record<string, unknown> {
  return mergeLiveOpsFields(localContent, serverContent);
}

/**
 * Apply page-level breakfast crowd ops onto all breakfast_crowd cards.
 * Returns a new array when anything changed.
 */
export function applyBreakfastCrowdOpsStatusToCards<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(cards: T[], ops: BreakfastCrowdOpsStatus | null | undefined): { cards: T[]; changed: boolean } {
  return applyLiveOpsStatusToCards(cards, "breakfastCrowd", ops);
}

/**
 * @deprecated Prefer applyBreakfastCrowdOpsStatusToCards with page.ops.
 * Patch in-memory cards with newer breakfast_crowd ops from card DB rows.
 */
export function applyNewerBreakfastCrowdOpsFromRows<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(cards: T[], rows: Array<{ id: string; type?: string; content: unknown }>): { cards: T[]; changed: boolean } {
  return applyNewerLiveOpsFromRows(cards, "breakfastCrowd", rows);
}
