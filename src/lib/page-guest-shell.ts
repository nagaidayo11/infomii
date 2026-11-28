import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createDefaultGuestShellConfig,
  getGuestShellNavStyle,
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

type PageRow = { id: string; title: string; slug: string; guest_shell?: unknown };
type CardLinkRow = { page_id: string; content: Record<string, unknown> };

export type DirectedPageGraph = {
  undirected: Map<string, Set<string>>;
  directedOut: Map<string, Set<string>>;
  directedIn: Map<string, Set<string>>;
};

function readPageLinkSlug(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  for (const key of ["ja", "en", "zh", "ko"]) {
    const text = record[key];
    if (typeof text === "string" && text.trim()) return text.trim();
  }
  return "";
}

/** Publish state is irrelevant: a saved internal link is a connection. */
export function linkPagesInGraph(graph: DirectedPageGraph, fromId: string, toId: string): void {
  if (!fromId || !toId || fromId === toId) return;
  if (!graph.undirected.has(fromId) || !graph.undirected.has(toId)) return;
  graph.undirected.get(fromId)?.add(toId);
  graph.undirected.get(toId)?.add(fromId);
  graph.directedOut.get(fromId)?.add(toId);
  graph.directedIn.get(toId)?.add(fromId);
}

function linkSlugInGraph(
  graph: DirectedPageGraph,
  fromId: string,
  slug: string,
  slugToId: Map<string, string>,
): void {
  const targetId = slugToId.get(slug);
  if (!targetId) return;
  linkPagesInGraph(graph, fromId, targetId);
}

/** pageLinks cards. Empty or external links do not connect pages. */
export function linkPageLinksCard(
  graph: DirectedPageGraph,
  pageId: string,
  content: Record<string, unknown> | null | undefined,
  slugToId: Map<string, string>,
): void {
  const items = Array.isArray(content?.items) ? content.items : [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as { linkType?: unknown; pageSlug?: unknown };
    if ((record.linkType ?? "page") !== "page") continue;
    const slug = readPageLinkSlug(record.pageSlug);
    if (!slug) continue;
    linkSlugInGraph(graph, pageId, slug, slugToId);
  }
}

/**
 * Guest nav on this page (bottom tabs or hamburger).
 * Inactive nav is ignored so leftover default slugs do not glue unrelated pages.
 * Draft / unpublished targets still count: the route connection is the link.
 */
export function linkActiveGuestShell(
  graph: DirectedPageGraph,
  pageId: string,
  shell: unknown,
  slugToId: Map<string, string>,
): void {
  const config = parseGuestShellConfig(shell);
  if (getGuestShellNavStyle(config) === "off") return;
  for (const tab of config.tabs) {
    if (!tab.enabled || tab.type === "phone" || tab.type === "locale") continue;
    const slug = tab.pageSlug?.trim() ?? "";
    if (!slug) continue;
    linkSlugInGraph(graph, pageId, slug, slugToId);
  }
}

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
  const withShell = await supabase
    .from("pages")
    .select("id,title,slug,guest_shell")
    .eq("hotel_id", hotelId)
    .order("title", { ascending: true });

  let pages = (withShell.data ?? []) as PageRow[];
  if (withShell.error) {
    const message = typeof withShell.error.message === "string" ? withShell.error.message : "";
    if (!message.includes("guest_shell")) {
      return { rootPageId: pageId, rootPageTitle: "" };
    }
    const fallback = await supabase
      .from("pages")
      .select("id,title,slug")
      .eq("hotel_id", hotelId)
      .order("title", { ascending: true });
    pages = (fallback.data ?? []) as PageRow[];
  }
  if (pages.length === 0) {
    return { rootPageId: pageId, rootPageTitle: "" };
  }

  const pageIds = pages.map((p) => p.id);
  const slugToId = new Map(pages.map((p) => [p.slug, p.id]));
  const idToPage = new Map(pages.map((p) => [p.id, p]));
  const undirected = new Map<string, Set<string>>();
  const directedOut = new Map<string, Set<string>>();
  const directedIn = new Map<string, Set<string>>();
  const graph: DirectedPageGraph = { undirected, directedOut, directedIn };

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

  for (const row of (linkCards ?? []) as CardLinkRow[]) {
    linkPageLinksCard(graph, row.page_id, row.content, slugToId);
  }
  for (const page of pages) {
    linkActiveGuestShell(graph, page.id, page.guest_shell, slugToId);
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
