/**
 * Page-level ops store (pages.ops jsonb).
 * Breakfast crowd live status lives here; cards keep display chrome.
 */

import {
  breakfastCrowdOpsStatusFromCardContent,
  breakfastCrowdUpdatedAtMs,
  parsePageOpsDocument,
  type BreakfastCrowdOpsStatus,
  type PageOpsDocument,
} from "@/lib/editor/breakfast-crowd";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export const PAGE_OPS_MIGRATION_SQL = `alter table public.pages
add column if not exists ops jsonb;`;

export function isPageOpsColumnMissingError(error: unknown): boolean {
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message)
      : String(error ?? "");
  return message.includes("ops") && (message.includes("schema cache") || message.includes("does not exist"));
}

/** Pick the freshest denormalized card snapshot to seed page ops (one-time heal). */
export function pickBreakfastCrowdSeedFromCards(
  rows: Array<{ content: unknown }>,
): BreakfastCrowdOpsStatus | null {
  let best: BreakfastCrowdOpsStatus | null = null;
  let bestMs = -1;
  for (const row of rows) {
    if (!row.content || typeof row.content !== "object" || Array.isArray(row.content)) continue;
    const content = row.content as Record<string, unknown>;
    const candidate = breakfastCrowdOpsStatusFromCardContent(content);
    const ms = breakfastCrowdUpdatedAtMs(candidate.updatedAt);
    if (!best || ms > bestMs) {
      best = candidate;
      bestMs = ms;
    }
  }
  return best;
}

export async function readPageOpsDocument(
  pageId: string,
): Promise<{ doc: PageOpsDocument; columnReady: boolean }> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) return { doc: {}, columnReady: false };

  const { data, error } = await supabase.from("pages").select("ops").eq("id", pageId).maybeSingle();
  if (error) {
    if (isPageOpsColumnMissingError(error)) return { doc: {}, columnReady: false };
    return { doc: {}, columnReady: true };
  }
  return {
    doc: parsePageOpsDocument((data as { ops?: unknown } | null)?.ops),
    columnReady: true,
  };
}

export async function writePageBreakfastCrowdOps(
  pageId: string,
  status: BreakfastCrowdOpsStatus,
): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) throw new Error("Supabase設定が未完了です");

  const { data: row, error: readError } = await supabase
    .from("pages")
    .select("ops")
    .eq("id", pageId)
    .maybeSingle();

  if (readError) {
    if (isPageOpsColumnMissingError(readError)) {
      throw new Error(
        "データベースに pages.ops 列がまだありません。Supabase マイグレーション（page_ops）を適用してください。",
      );
    }
    throw new Error(readError.message || "ページの読み込みに失敗しました");
  }
  if (!row) throw new Error("ページが見つかりません");

  const prev = parsePageOpsDocument((row as { ops?: unknown }).ops);
  const nextOps: PageOpsDocument = {
    ...prev,
    breakfastCrowd: {
      level: status.level,
      note: status.note,
      updatedAt: status.updatedAt,
      ...(status.updatedBy !== undefined ? { updatedBy: status.updatedBy } : {}),
    },
  };

  const { error: writeError } = await supabase
    .from("pages")
    .update({ ops: nextOps })
    .eq("id", pageId);

  if (writeError) {
    if (isPageOpsColumnMissingError(writeError)) {
      throw new Error(
        "データベースに pages.ops 列がまだありません。Supabase マイグレーション（page_ops）を適用してください。",
      );
    }
    throw new Error(writeError.message || "保存に失敗しました");
  }
}

type SupabaseLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

/**
 * Resolve authoritative breakfast crowd ops for a page.
 * Heals from card content when pages.ops.breakfastCrowd is missing.
 */
export async function resolvePageBreakfastCrowdOps(
  pageId: string,
  options?: {
    heal?: boolean;
    cardRows?: Array<{ content: unknown }>;
    /** When provided, fetch cards via this instead of browser client. */
    fetchCardRows?: () => Promise<Array<{ content: unknown }>>;
  },
): Promise<BreakfastCrowdOpsStatus | null> {
  const heal = options?.heal !== false;
  const { doc, columnReady } = await readPageOpsDocument(pageId);
  if (doc.breakfastCrowd) return doc.breakfastCrowd;

  const rows =
    options?.cardRows ??
    (options?.fetchCardRows ? await options.fetchCardRows() : []);
  const seed = pickBreakfastCrowdSeedFromCards(rows);
  if (!seed) return null;

  if (heal && columnReady) {
    try {
      await writePageBreakfastCrowdOps(pageId, seed);
    } catch {
      /* heal is best-effort; still return seed for this request */
    }
  }
  return seed;
}

/** Server / admin client variant — same heal semantics. */
export async function resolvePageBreakfastCrowdOpsWithClient(
  supabase: SupabaseLike,
  pageId: string,
  options?: { heal?: boolean; cardRows?: Array<{ content: unknown }> },
): Promise<BreakfastCrowdOpsStatus | null> {
  const heal = options?.heal !== false;

  const { data, error } = await supabase.from("pages").select("ops").eq("id", pageId).maybeSingle();
  if (error && isPageOpsColumnMissingError(error)) {
    return pickBreakfastCrowdSeedFromCards(options?.cardRows ?? []);
  }

  const doc = parsePageOpsDocument((data as { ops?: unknown } | null)?.ops);
  if (doc.breakfastCrowd) return doc.breakfastCrowd;

  let rows = options?.cardRows;
  if (!rows) {
    const { data: cardData } = await supabase
      .from("cards")
      .select("content,type")
      .eq("page_id", pageId)
      .eq("type", "breakfast_crowd");
    rows = (cardData ?? []) as Array<{ content: unknown }>;
  }

  const seed = pickBreakfastCrowdSeedFromCards(rows);
  if (!seed) return null;

  if (heal) {
    try {
      const prev = parsePageOpsDocument((data as { ops?: unknown } | null)?.ops);
      const nextOps: PageOpsDocument = { ...prev, breakfastCrowd: seed };
      await supabase.from("pages").update({ ops: nextOps }).eq("id", pageId);
    } catch {
      /* best-effort */
    }
  }
  return seed;
}
