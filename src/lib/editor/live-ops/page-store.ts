/**
 * Page-level live ops store (pages.ops jsonb) — generic read / write / heal.
 */

import { liveOpsKeyForCardType, LIVE_OPS_DEFINITIONS } from "./registry";
import {
  liveOpsStatusFromCardContent,
  liveOpsUpdatedAtMs,
  parsePageOpsDocument,
} from "./status";
import type { LiveOpsKey, LiveOpsStatus, PageOpsDocument } from "./types";
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
export function pickLiveOpsSeedFromCards(
  rows: Array<{ content: unknown }>,
): LiveOpsStatus | null {
  let best: LiveOpsStatus | null = null;
  let bestMs = -1;
  for (const row of rows) {
    if (!row.content || typeof row.content !== "object" || Array.isArray(row.content)) continue;
    const content = row.content as Record<string, unknown>;
    const candidate = liveOpsStatusFromCardContent(content);
    const ms = liveOpsUpdatedAtMs(candidate.updatedAt);
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

export async function getPageLiveOps(
  pageId: string,
  key: LiveOpsKey,
): Promise<LiveOpsStatus | null> {
  const { doc } = await readPageOpsDocument(pageId);
  return doc[key] ?? null;
}

export async function setPageLiveOps(
  pageId: string,
  key: LiveOpsKey,
  status: LiveOpsStatus,
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
    [key]: {
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
 * Resolve authoritative live ops for a page + key.
 * Heals from card content when pages.ops[key] is missing.
 */
export async function resolvePageLiveOps(
  pageId: string,
  key: LiveOpsKey,
  options?: {
    heal?: boolean;
    cardRows?: Array<{ content: unknown }>;
    /** When provided, fetch cards via this instead of browser client. */
    fetchCardRows?: () => Promise<Array<{ content: unknown }>>;
  },
): Promise<LiveOpsStatus | null> {
  const heal = options?.heal !== false;
  const { doc, columnReady } = await readPageOpsDocument(pageId);
  if (doc[key]) return doc[key] ?? null;

  const rows =
    options?.cardRows ??
    (options?.fetchCardRows ? await options.fetchCardRows() : []);
  const seed = pickLiveOpsSeedFromCards(rows);
  if (!seed) return null;

  if (heal && columnReady) {
    try {
      await setPageLiveOps(pageId, key, seed);
    } catch {
      /* heal is best-effort; still return seed for this request */
    }
  }
  return seed;
}

/** Server / admin client variant — same heal semantics. */
export async function resolvePageLiveOpsWithClient(
  supabase: SupabaseLike,
  pageId: string,
  key: LiveOpsKey,
  options?: { heal?: boolean; cardRows?: Array<{ content: unknown }> },
): Promise<LiveOpsStatus | null> {
  const heal = options?.heal !== false;
  const def = LIVE_OPS_DEFINITIONS[key];

  const { data, error } = await supabase.from("pages").select("ops").eq("id", pageId).maybeSingle();
  if (error && isPageOpsColumnMissingError(error)) {
    return pickLiveOpsSeedFromCards(options?.cardRows ?? []);
  }

  const doc = parsePageOpsDocument((data as { ops?: unknown } | null)?.ops);
  if (doc[key]) return doc[key] ?? null;

  let rows = options?.cardRows;
  if (!rows) {
    const { data: cardData } = await supabase
      .from("cards")
      .select("content,type")
      .eq("page_id", pageId)
      .in("type", [...def.cardTypes]);
    rows = (cardData ?? []) as Array<{ content: unknown }>;
  }

  const seed = pickLiveOpsSeedFromCards(rows);
  if (!seed) return null;

  if (heal) {
    try {
      const prev = parsePageOpsDocument((data as { ops?: unknown } | null)?.ops);
      const nextOps: PageOpsDocument = { ...prev, [key]: seed };
      await supabase.from("pages").update({ ops: nextOps }).eq("id", pageId);
    } catch {
      /* best-effort */
    }
  }
  return seed;
}

/**
 * Resolve all registered live-ops keys present on a page's cards (guest overlay).
 */
export async function resolveAllPageLiveOpsWithClient(
  supabase: SupabaseLike,
  pageId: string,
  cards: Array<{ type: string; content: unknown }>,
  options?: { heal?: boolean },
): Promise<Partial<Record<LiveOpsKey, LiveOpsStatus>>> {
  const keysNeeded = new Set<LiveOpsKey>();
  for (const card of cards) {
    const key = liveOpsKeyForCardType(card.type);
    if (key) keysNeeded.add(key);
  }
  if (keysNeeded.size === 0) return {};

  const result: Partial<Record<LiveOpsKey, LiveOpsStatus>> = {};
  await Promise.all(
    [...keysNeeded].map(async (key) => {
      const def = LIVE_OPS_DEFINITIONS[key];
      const cardRows = cards
        .filter((c) => (def.cardTypes as readonly string[]).includes(c.type))
        .map((c) => ({ content: c.content }));
      const status = await resolvePageLiveOpsWithClient(supabase, pageId, key, {
        heal: options?.heal,
        cardRows,
      });
      if (status) result[key] = status;
    }),
  );
  return result;
}
