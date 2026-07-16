/**
 * Page-level ops store (pages.ops jsonb).
 * Breakfast wrappers around the generic live-ops layer.
 */

export {
  PAGE_OPS_MIGRATION_SQL,
  isPageOpsColumnMissingError,
  readPageOpsDocument,
  getPageLiveOps,
  setPageLiveOps,
  resolvePageLiveOps,
  resolvePageLiveOpsWithClient,
  resolveAllPageLiveOpsWithClient,
  pickLiveOpsSeedFromCards,
} from "@/lib/editor/live-ops/page-store";

import {
  pickLiveOpsSeedFromCards,
  resolvePageLiveOps,
  resolvePageLiveOpsWithClient,
  setPageLiveOps,
} from "@/lib/editor/live-ops/page-store";
import type { LiveOpsStatus } from "@/lib/editor/live-ops/types";

/** @deprecated Prefer pickLiveOpsSeedFromCards */
export function pickBreakfastCrowdSeedFromCards(
  rows: Array<{ content: unknown }>,
): LiveOpsStatus | null {
  return pickLiveOpsSeedFromCards(rows);
}

/** @deprecated Prefer setPageLiveOps(pageId, "breakfastCrowd", status) */
export async function writePageBreakfastCrowdOps(
  pageId: string,
  status: LiveOpsStatus,
): Promise<void> {
  await setPageLiveOps(pageId, "breakfastCrowd", status);
}

/**
 * Resolve authoritative breakfast crowd ops for a page.
 * Heals from card content when pages.ops.breakfastCrowd is missing.
 */
export async function resolvePageBreakfastCrowdOps(
  pageId: string,
  options?: {
    heal?: boolean;
    cardRows?: Array<{ content: unknown }>;
    fetchCardRows?: () => Promise<Array<{ content: unknown }>>;
  },
): Promise<LiveOpsStatus | null> {
  return resolvePageLiveOps(pageId, "breakfastCrowd", options);
}

type SupabaseLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

/** Server / admin client variant — same heal semantics. */
export async function resolvePageBreakfastCrowdOpsWithClient(
  supabase: SupabaseLike,
  pageId: string,
  options?: { heal?: boolean; cardRows?: Array<{ content: unknown }> },
): Promise<LiveOpsStatus | null> {
  return resolvePageLiveOpsWithClient(supabase, pageId, "breakfastCrowd", options);
}
