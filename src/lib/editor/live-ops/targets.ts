/**
 * Front-desk Quick Ops helpers — parameterized by LiveOpsKey.
 * Card JSON keeps chrome; level / note / updatedAt live on pages.ops.
 */

import type { EditorCard } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  LIVE_OPS_DEFINITIONS,
  buildLiveOpsHref,
  liveOpsKeyForCardType,
} from "./registry";
import {
  applyLiveOpsByKeyToCards,
  applyLiveOpsStatusToCards,
  nowLiveOpsUpdatedAt,
  overlayLiveOpsStatusOnContent,
} from "./status";
import {
  PAGE_OPS_MIGRATION_SQL,
  resolvePageLiveOps,
  setPageLiveOps,
} from "./page-store";
import type { LiveOpsKey, LiveOpsLevel, LiveOpsStatus } from "./types";
import {
  getCurrentUserHotelRole,
  getPage,
  getPageCards,
  listPagesForHotel,
  type PageRow,
} from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export { PAGE_OPS_MIGRATION_SQL, buildLiveOpsHref };

export type LiveOpsTarget = {
  page: PageRow;
  cardId: string;
  title: string;
  status: LiveOpsStatus;
};

export function readLastLiveOpsPageId(key: LiveOpsKey): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LIVE_OPS_DEFINITIONS[key].localStorageLastPageKey);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

export function rememberLiveOpsPageId(key: LiveOpsKey, pageId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LIVE_OPS_DEFINITIONS[key].localStorageLastPageKey, pageId);
  } catch {
    /* ignore quota / private mode */
  }
}

function readTitleJa(content: Record<string, unknown>, fallback: string): string {
  const t = getLocalizedContent(content.title as LocalizedString | undefined, "ja").trim();
  return t || fallback;
}

export async function canEditLiveOps(): Promise<boolean> {
  const role = await getCurrentUserHotelRole().catch(() => null);
  return role === "owner" || role === "admin" || role === "editor";
}

async function statusForPage(
  pageId: string,
  key: LiveOpsKey,
  cardRows: Array<{ content: unknown }>,
): Promise<LiveOpsStatus> {
  const def = LIVE_OPS_DEFINITIONS[key];
  const resolved = await resolvePageLiveOps(pageId, key, {
    cardRows,
    fetchCardRows: async () => {
      const all = await getPageCards(pageId);
      return all
        .filter((r) => (def.cardTypes as readonly string[]).includes(r.type))
        .map((r) => ({ content: r.content }));
    },
  });
  if (resolved) return resolved;
  return {
    level: "open",
    note: "",
    updatedAt: nowLiveOpsUpdatedAt(),
  };
}

/** List matching cards across the current hotel’s pages (for page picker). */
export async function listHotelLiveOpsTargets(key: LiveOpsKey): Promise<LiveOpsTarget[]> {
  const def = LIVE_OPS_DEFINITIONS[key];
  const pages = await listPagesForHotel();
  if (pages.length === 0) return [];
  const supabase = getBrowserSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cards")
    .select("id,page_id,content,type")
    .in("type", [...def.cardTypes])
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

  const statusByPage = new Map<string, LiveOpsStatus>();
  await Promise.all(
    [...byPage.entries()].map(async ([pageId, cards]) => {
      const status = await statusForPage(
        pageId,
        key,
        cards.map((c) => ({ content: c.content })),
      );
      statusByPage.set(pageId, status);
    }),
  );

  const targets: LiveOpsTarget[] = [];
  for (const [pageId, cards] of byPage) {
    const page = pageById.get(pageId);
    if (!page) continue;
    const status = statusByPage.get(pageId)!;
    for (const card of cards) {
      targets.push({
        page,
        cardId: card.id,
        title: readTitleJa(card.content, def.defaultTitle),
        status,
      });
    }
  }

  targets.sort((a, b) => a.page.title.localeCompare(b.page.title, "ja"));
  return targets;
}

/** Load targets for one page (first card is the default when multiple). */
export async function loadLiveOpsTargetsForPage(
  key: LiveOpsKey,
  pageId: string,
): Promise<{ page: PageRow | null; targets: LiveOpsTarget[] }> {
  const def = LIVE_OPS_DEFINITIONS[key];
  const page = await getPage(pageId);
  if (!page) return { page: null, targets: [] };

  const supabase = getBrowserSupabaseClient();
  if (!supabase) return { page, targets: [] };

  const { data, error } = await supabase
    .from("cards")
    .select("id,page_id,content,type,order")
    .eq("page_id", pageId)
    .in("type", [...def.cardTypes])
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
    key,
    cardRows.map((c) => ({ content: c.content })),
  );

  const targets: LiveOpsTarget[] = cardRows.map((row) => ({
    page,
    cardId: row.id,
    title: readTitleJa(row.content, def.defaultTitle),
    status,
  }));

  return { page, targets };
}

/**
 * Persist level / note / updatedAt on pages.ops (source of truth).
 * Optionally stamps a denormalized mirror onto matching card rows for templates.
 */
export async function saveLiveOpsStatus(
  pageId: string,
  key: LiveOpsKey,
  patch: { level: LiveOpsLevel; note: string },
  options?: { mirrorToCards?: boolean },
): Promise<LiveOpsStatus> {
  const def = LIVE_OPS_DEFINITIONS[key];
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

  const status: LiveOpsStatus = {
    level: patch.level,
    note: patch.note,
    updatedAt: nowLiveOpsUpdatedAt(),
    ...(updatedBy !== undefined ? { updatedBy } : {}),
  };

  await setPageLiveOps(pageId, key, status);

  if (options?.mirrorToCards !== false) {
    const { data: cards } = await supabase
      .from("cards")
      .select("id,content,type")
      .eq("page_id", pageId)
      .in("type", [...def.cardTypes]);

    for (const row of cards ?? []) {
      const prev =
        row.content && typeof row.content === "object" && !Array.isArray(row.content)
          ? (row.content as Record<string, unknown>)
          : {};
      const nextContent = overlayLiveOpsStatusOnContent(prev, status);
      await supabase.from("cards").update({ content: nextContent }).eq("id", row.id);
    }
  }

  return status;
}

/**
 * Pull page-level live ops into the in-memory editor store for one key.
 * Safe on resume / focus.
 */
export async function syncLiveOpsKeyIntoEditorStore(
  pageId: string,
  key: LiveOpsKey,
): Promise<boolean> {
  if (!pageId) return false;
  const store = useEditor2Store.getState();
  if (store.pageMeta.pageId !== pageId) return false;
  const def = LIVE_OPS_DEFINITIONS[key];
  const localCards = store.cards.filter((c) =>
    (def.cardTypes as readonly string[]).includes(c.type),
  );
  if (localCards.length === 0) return false;

  const ops = await resolvePageLiveOps(pageId, key, {
    cardRows: localCards.map((c) => ({ content: c.content })),
    fetchCardRows: async () => {
      const all = await getPageCards(pageId);
      return all
        .filter((r) => (def.cardTypes as readonly string[]).includes(r.type))
        .map((r) => ({ content: r.content }));
    },
  });
  if (!ops) return false;

  const { cards, changed } = applyLiveOpsStatusToCards(
    store.cards as EditorCard[],
    key,
    ops,
  );
  if (!changed) return false;
  useEditor2Store.getState().setCards(cards);
  return true;
}

/**
 * Sync all registered live-ops keys that have matching cards in the editor store.
 */
export async function syncLiveOpsIntoEditorStore(pageId: string): Promise<boolean> {
  if (!pageId) return false;
  const store = useEditor2Store.getState();
  if (store.pageMeta.pageId !== pageId) return false;

  const keys = new Set<LiveOpsKey>();
  for (const card of store.cards) {
    const key = liveOpsKeyForCardType(card.type);
    if (key) keys.add(key);
  }
  if (keys.size === 0) return false;

  const opsByKey: Partial<Record<LiveOpsKey, LiveOpsStatus>> = {};
  await Promise.all(
    [...keys].map(async (key) => {
      const def = LIVE_OPS_DEFINITIONS[key];
      const localCards = store.cards.filter((c) =>
        (def.cardTypes as readonly string[]).includes(c.type),
      );
      const ops = await resolvePageLiveOps(pageId, key, {
        cardRows: localCards.map((c) => ({ content: c.content })),
        fetchCardRows: async () => {
          const all = await getPageCards(pageId);
          return all
            .filter((r) => (def.cardTypes as readonly string[]).includes(r.type))
            .map((r) => ({ content: r.content }));
        },
      });
      if (ops) opsByKey[key] = ops;
    }),
  );

  const { cards, changed } = applyLiveOpsByKeyToCards(
    store.cards as EditorCard[],
    opsByKey,
  );
  if (!changed) return false;
  useEditor2Store.getState().setCards(cards);
  return true;
}
