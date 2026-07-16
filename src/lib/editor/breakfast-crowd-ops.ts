/**
 * Front-desk Quick Ops for breakfast crowd — page-level ops store (pages.ops).
 * Card JSON keeps chrome (title / appearance); level / note / updatedAt live on pages.ops.
 */

import type { EditorCard } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  applyBreakfastCrowdOpsStatusToCards,
  coerceBreakfastCrowdLevel,
  nowBreakfastCrowdUpdatedAt,
  overlayBreakfastCrowdOpsOnContent,
  parseBreakfastCrowdOpsStatus,
  type BreakfastCrowdLevel,
  type BreakfastCrowdOpsStatus,
} from "@/lib/editor/breakfast-crowd";
import {
  PAGE_OPS_MIGRATION_SQL,
  resolvePageBreakfastCrowdOps,
  resolvePageBreakfastCrowdOpsWithClient,
  writePageBreakfastCrowdOps,
} from "@/lib/editor/page-ops";
import {
  getCurrentUserHotelRole,
  getPage,
  getPageCards,
  listPagesForHotel,
  type PageRow,
} from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export type { BreakfastCrowdOpsStatus };
export {
  PAGE_OPS_MIGRATION_SQL,
  resolvePageBreakfastCrowdOps,
  resolvePageBreakfastCrowdOpsWithClient,
};

export type BreakfastCrowdOpsTarget = {
  page: PageRow;
  cardId: string;
  title: string;
  status: BreakfastCrowdOpsStatus;
};

const LAST_PAGE_KEY = "infomii:ops:breakfast-crowd:lastPageId";

export function buildBreakfastCrowdOpsHref(pageId?: string | null): string {
  const base = "/dashboard/ops/breakfast-crowd";
  if (!pageId) return base;
  return `${base}?pageId=${encodeURIComponent(pageId)}`;
}

export function readLastBreakfastCrowdOpsPageId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LAST_PAGE_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

export function rememberBreakfastCrowdOpsPageId(pageId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_PAGE_KEY, pageId);
  } catch {
    /* ignore quota / private mode */
  }
}

function readTitleJa(content: Record<string, unknown>): string {
  const t = getLocalizedContent(content.title as LocalizedString | undefined, "ja").trim();
  return t || "朝食混雑";
}

export async function canEditBreakfastCrowdOps(): Promise<boolean> {
  const role = await getCurrentUserHotelRole().catch(() => null);
  return role === "owner" || role === "admin" || role === "editor";
}

async function statusForPage(
  pageId: string,
  cardRows: Array<{ content: unknown }>,
): Promise<BreakfastCrowdOpsStatus> {
  const resolved = await resolvePageBreakfastCrowdOps(pageId, {
    cardRows,
    fetchCardRows: async () => {
      const all = await getPageCards(pageId);
      return all.filter((r) => r.type === "breakfast_crowd").map((r) => ({ content: r.content }));
    },
  });
  if (resolved) return resolved;
  return {
    level: "open",
    note: "",
    updatedAt: nowBreakfastCrowdUpdatedAt(),
  };
}

/** List breakfast_crowd cards across the current hotel’s pages (for page picker). */
export async function listHotelBreakfastCrowdTargets(): Promise<BreakfastCrowdOpsTarget[]> {
  const pages = await listPagesForHotel();
  if (pages.length === 0) return [];
  const supabase = getBrowserSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cards")
    .select("id,page_id,content,type")
    .eq("type", "breakfast_crowd")
    .in(
      "page_id",
      pages.map((p) => p.id),
    );

  if (error || !data) return [];

  const pageById = new Map(pages.map((p) => [p.id, p]));
  const byPage = new Map<string, Array<{ id: string; content: Record<string, unknown> }>>();

  for (const row of data) {
    const pageId = row.page_id as string;
    const content =
      row.content && typeof row.content === "object" && !Array.isArray(row.content)
        ? (row.content as Record<string, unknown>)
        : {};
    const list = byPage.get(pageId) ?? [];
    list.push({ id: row.id as string, content });
    byPage.set(pageId, list);
  }

  const statusByPage = new Map<string, BreakfastCrowdOpsStatus>();
  await Promise.all(
    [...byPage.entries()].map(async ([pageId, cards]) => {
      const status = await statusForPage(
        pageId,
        cards.map((c) => ({ content: c.content })),
      );
      statusByPage.set(pageId, status);
    }),
  );

  const targets: BreakfastCrowdOpsTarget[] = [];
  for (const [pageId, cards] of byPage) {
    const page = pageById.get(pageId);
    if (!page) continue;
    const status = statusByPage.get(pageId)!;
    for (const card of cards) {
      targets.push({
        page,
        cardId: card.id,
        title: readTitleJa(card.content),
        status,
      });
    }
  }

  targets.sort((a, b) => a.page.title.localeCompare(b.page.title, "ja"));
  return targets;
}

/** Load targets for one page (first card is the default when multiple). */
export async function loadBreakfastCrowdTargetsForPage(
  pageId: string,
): Promise<{ page: PageRow | null; targets: BreakfastCrowdOpsTarget[] }> {
  const page = await getPage(pageId);
  if (!page) return { page: null, targets: [] };

  const supabase = getBrowserSupabaseClient();
  if (!supabase) return { page, targets: [] };

  const { data, error } = await supabase
    .from("cards")
    .select("id,page_id,content,type,order")
    .eq("page_id", pageId)
    .eq("type", "breakfast_crowd")
    .order("order", { ascending: true });

  if (error || !data) return { page, targets: [] };

  const cardRows = data.map((row) => {
    const content =
      row.content && typeof row.content === "object" && !Array.isArray(row.content)
        ? (row.content as Record<string, unknown>)
        : {};
    return { id: row.id as string, content };
  });

  const status = await statusForPage(
    pageId,
    cardRows.map((c) => ({ content: c.content })),
  );

  const targets: BreakfastCrowdOpsTarget[] = cardRows.map((row) => ({
    page,
    cardId: row.id,
    title: readTitleJa(row.content),
    status,
  }));

  return { page, targets };
}

/**
 * Persist level / note / updatedAt on pages.ops (source of truth).
 * Optionally stamps a denormalized mirror onto breakfast_crowd card rows for templates.
 */
export async function saveBreakfastCrowdOpsStatus(
  pageId: string,
  patch: { level: BreakfastCrowdLevel; note: string },
  options?: { mirrorToCards?: boolean },
): Promise<BreakfastCrowdOpsStatus> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) throw new Error("Supabase設定が未完了です");

  let updatedBy: string | null | undefined;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    updatedBy = user?.id ?? null;
  } catch {
    updatedBy = undefined;
  }

  const status: BreakfastCrowdOpsStatus = {
    level: patch.level,
    note: patch.note,
    updatedAt: nowBreakfastCrowdUpdatedAt(),
    ...(updatedBy !== undefined ? { updatedBy } : {}),
  };

  await writePageBreakfastCrowdOps(pageId, status);

  if (options?.mirrorToCards !== false) {
    const { data: cards } = await supabase
      .from("cards")
      .select("id,content,type")
      .eq("page_id", pageId)
      .eq("type", "breakfast_crowd");

    for (const row of cards ?? []) {
      const prev =
        row.content && typeof row.content === "object" && !Array.isArray(row.content)
          ? (row.content as Record<string, unknown>)
          : {};
      const nextContent = overlayBreakfastCrowdOpsOnContent(prev, status);
      await supabase.from("cards").update({ content: nextContent }).eq("id", row.id);
    }
  }

  return status;
}

/**
 * Pull page-level breakfast_crowd ops into the in-memory editor store.
 * Safe on resume / focus.
 */
export async function syncBreakfastCrowdOpsIntoEditorStore(
  pageId: string,
): Promise<boolean> {
  if (!pageId) return false;
  const store = useEditor2Store.getState();
  if (store.pageMeta.pageId !== pageId) return false;
  const localCrowd = store.cards.filter((c) => c.type === "breakfast_crowd");
  if (localCrowd.length === 0) return false;

  const ops = await resolvePageBreakfastCrowdOps(pageId, {
    cardRows: localCrowd.map((c) => ({ content: c.content })),
    fetchCardRows: async () => {
      const all = await getPageCards(pageId);
      return all.filter((r) => r.type === "breakfast_crowd").map((r) => ({ content: r.content }));
    },
  });
  if (!ops) return false;

  const { cards, changed } = applyBreakfastCrowdOpsStatusToCards(
    store.cards as EditorCard[],
    ops,
  );
  if (!changed) return false;
  useEditor2Store.getState().setCards(cards);
  return true;
}

/** Re-export coerce for callers that imported from this module historically. */
export { coerceBreakfastCrowdLevel, parseBreakfastCrowdOpsStatus };
