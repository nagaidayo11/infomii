import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createDefaultGuestShellConfig,
  parseGuestShellConfig,
  type GuestShellConfig,
} from "@/lib/guest-shell";

export const PAGE_GUEST_SHELL_MIGRATION_SQL = `alter table public.pages
add column if not exists guest_shell jsonb;`;

export type PageGuestShellInheritMode = "root" | "inherited" | "override";

export type PageGuestShellEditorState = {
  effective: GuestShellConfig;
  editing: GuestShellConfig;
  mode: PageGuestShellInheritMode;
  pageId: string;
  rootPageId: string;
  rootPageTitle: string;
  isRootPage: boolean;
  hasPageOverride: boolean;
  columnReady: boolean;
};

type PageRow = { id: string; title: string; slug: string };
type CardLinkRow = { page_id: string; content: Record<string, unknown> };
type PageLinkItem = { linkType?: "page" | "url"; pageSlug?: string };

function comparePageTitle(a: PageRow | undefined, b: PageRow | undefined): number {
  return (a?.title ?? "").localeCompare(b?.title ?? "", "ja");
}

function pickConnectionRootId(
  groupIds: string[],
  directedOut: Map<string, Set<string>>,
  directedIn: Map<string, Set<string>>,
  idToPage: Map<string, PageRow>,
): string {
  const sources = groupIds.filter((id) => (directedIn.get(id)?.size ?? 0) === 0);
  const candidates = sources.length > 0 ? sources : groupIds;
  return [...candidates].sort((a, b) => {
    const outDiff = (directedOut.get(b)?.size ?? 0) - (directedOut.get(a)?.size ?? 0);
    if (outDiff !== 0) return outDiff;
    return comparePageTitle(idToPage.get(a), idToPage.get(b));
  })[0]!;
}

/** Resolve connection-set root page id for a page (falls back to the page itself). */
export async function getConnectionRootPageIdForPage(
  supabase: SupabaseClient,
  hotelId: string,
  pageId: string,
): Promise<{ rootPageId: string; rootPageTitle: string }> {
  const { data: pagesData } = await supabase
    .from("pages")
    .select("id,title,slug")
    .eq("hotel_id", hotelId)
    .order("title", { ascending: true });

  const pages = (pagesData ?? []) as PageRow[];
  if (pages.length === 0) {
    return { rootPageId: pageId, rootPageTitle: "" };
  }

  const pageIds = pages.map((p) => p.id);
  const slugToId = new Map(pages.map((p) => [p.slug, p.id]));
  const idToPage = new Map(pages.map((p) => [p.id, p]));
  const undirected = new Map<string, Set<string>>();
  const directedOut = new Map<string, Set<string>>();
  const directedIn = new Map<string, Set<string>>();

  for (const p of pages) {
    undirected.set(p.id, new Set<string>());
    directedOut.set(p.id, new Set<string>());
    directedIn.set(p.id, new Set<string>());
  }

  const { data: linkCards } = await supabase
    .from("cards")
    .select("page_id,content")
    .eq("type", "pageLinks")
    .in("page_id", pageIds);

  for (const row of ((linkCards ?? []) as CardLinkRow[])) {
    const items = (Array.isArray(row.content?.items) ? row.content.items : []) as PageLinkItem[];
    for (const item of items) {
      if ((item.linkType ?? "page") !== "page") continue;
      const slug = typeof item.pageSlug === "string" ? item.pageSlug : "";
      if (!slug) continue;
      const targetId = slugToId.get(slug);
      if (!targetId || targetId === row.page_id) continue;
      undirected.get(row.page_id)?.add(targetId);
      undirected.get(targetId)?.add(row.page_id);
      directedOut.get(row.page_id)?.add(targetId);
      directedIn.get(targetId)?.add(row.page_id);
    }
  }

  const visited = new Set<string>();
  const sortedIds = [...pageIds].sort((a, b) => comparePageTitle(idToPage.get(a), idToPage.get(b)));

  for (const startId of sortedIds) {
    if (visited.has(startId)) continue;
    const stack = [startId];
    const groupIds: string[] = [];
    visited.add(startId);
    while (stack.length > 0) {
      const cur = stack.pop() as string;
      groupIds.push(cur);
      for (const next of undirected.get(cur) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        stack.push(next);
      }
    }
    if (!groupIds.includes(pageId)) continue;
    const rootId = pickConnectionRootId(groupIds, directedOut, directedIn, idToPage);
    const root = idToPage.get(rootId);
    return { rootPageId: rootId, rootPageTitle: root?.title ?? "" };
  }

  const self = idToPage.get(pageId);
  return { rootPageId: pageId, rootPageTitle: self?.title ?? "" };
}

/** Effective guest shell for display (page → root → hotel → default). */
export function resolveEffectiveGuestShell(input: {
  pageId: string;
  pageShell: unknown | null | undefined;
  rootPageId: string;
  rootShell: unknown | null | undefined;
  hotelShell: unknown | null | undefined;
}): GuestShellConfig {
  if (input.pageShell != null) {
    return parseGuestShellConfig(input.pageShell);
  }
  if (input.pageId !== input.rootPageId && input.rootShell != null) {
    return parseGuestShellConfig(input.rootShell);
  }
  if (input.hotelShell != null) {
    return parseGuestShellConfig(input.hotelShell);
  }
  return createDefaultGuestShellConfig();
}

export function buildPageGuestShellEditorState(input: {
  pageId: string;
  pageShell: unknown | null | undefined;
  rootPageId: string;
  rootPageTitle: string;
  rootShell: unknown | null | undefined;
  hotelShell: unknown | null | undefined;
  columnReady: boolean;
}): PageGuestShellEditorState {
  const effective = resolveEffectiveGuestShell(input);
  const isRootPage = input.pageId === input.rootPageId;
  const hasPageOverride = input.pageShell != null;

  let mode: PageGuestShellInheritMode = "root";
  if (!isRootPage && !hasPageOverride) mode = "inherited";
  if (!isRootPage && hasPageOverride) mode = "override";

  const editing = hasPageOverride
    ? parseGuestShellConfig(input.pageShell)
    : effective;

  return {
    effective,
    editing,
    mode,
    pageId: input.pageId,
    rootPageId: input.rootPageId,
    rootPageTitle: input.rootPageTitle,
    isRootPage,
    hasPageOverride,
    columnReady: input.columnReady,
  };
}
