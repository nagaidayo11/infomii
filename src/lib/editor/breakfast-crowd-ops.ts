/**
 * Front-desk Quick Ops for breakfast crowd — thin wrappers over live-ops.
 */

import {
  buildLiveOpsHref,
  canEditLiveOps,
  listHotelLiveOpsTargets,
  loadLiveOpsTargetsForPage,
  readLastLiveOpsPageId,
  rememberLiveOpsPageId,
  saveLiveOpsStatus,
  syncLiveOpsKeyIntoEditorStore,
  type LiveOpsTarget,
} from "@/lib/editor/live-ops";
import type { BreakfastCrowdLevel, BreakfastCrowdOpsStatus } from "@/lib/editor/breakfast-crowd";
import {
  coerceBreakfastCrowdLevel,
  parseBreakfastCrowdOpsStatus,
} from "@/lib/editor/breakfast-crowd";
import {
  PAGE_OPS_MIGRATION_SQL,
  resolvePageBreakfastCrowdOps,
  resolvePageBreakfastCrowdOpsWithClient,
} from "@/lib/editor/page-ops";

export type { BreakfastCrowdOpsStatus };
export {
  PAGE_OPS_MIGRATION_SQL,
  resolvePageBreakfastCrowdOps,
  resolvePageBreakfastCrowdOpsWithClient,
};

export type BreakfastCrowdOpsTarget = LiveOpsTarget;

const OPS_KEY = "breakfastCrowd" as const;

export function buildBreakfastCrowdOpsHref(pageId?: string | null): string {
  return buildLiveOpsHref(OPS_KEY, pageId);
}

export function readLastBreakfastCrowdOpsPageId(): string | null {
  return readLastLiveOpsPageId(OPS_KEY);
}

export function rememberBreakfastCrowdOpsPageId(pageId: string): void {
  rememberLiveOpsPageId(OPS_KEY, pageId);
}

export async function canEditBreakfastCrowdOps(): Promise<boolean> {
  return canEditLiveOps();
}

export async function listHotelBreakfastCrowdTargets(): Promise<BreakfastCrowdOpsTarget[]> {
  return listHotelLiveOpsTargets(OPS_KEY);
}

export async function loadBreakfastCrowdTargetsForPage(
  pageId: string,
): Promise<{ page: Awaited<ReturnType<typeof loadLiveOpsTargetsForPage>>["page"]; targets: BreakfastCrowdOpsTarget[] }> {
  return loadLiveOpsTargetsForPage(OPS_KEY, pageId);
}

export async function saveBreakfastCrowdOpsStatus(
  pageId: string,
  patch: { level: BreakfastCrowdLevel; note: string },
  options?: { mirrorToCards?: boolean },
): Promise<BreakfastCrowdOpsStatus> {
  return saveLiveOpsStatus(pageId, OPS_KEY, patch, options);
}

/**
 * Pull page-level breakfast_crowd ops into the in-memory editor store.
 * Safe on resume / focus.
 */
export async function syncBreakfastCrowdOpsIntoEditorStore(
  pageId: string,
): Promise<boolean> {
  return syncLiveOpsKeyIntoEditorStore(pageId, OPS_KEY);
}

/** Re-export coerce for callers that imported from this module historically. */
export { coerceBreakfastCrowdLevel, parseBreakfastCrowdOpsStatus };
