"use client";

import { useMemo, useState } from "react";
import {
  buildPublicUrlV,
  flattenPageConnectionTree,
  type PageConnectionSet,
  type PageConnectionTreeNode,
  type PageRow,
} from "@/lib/storage";

function modeLabel(mode: PageConnectionSet["mode"]): string {
  return mode === "linked" ? "宿泊者向け・連携" : "単体ページ";
}

function modeBadgeClass(mode: PageConnectionSet["mode"]): string {
  return mode === "linked"
    ? "bg-slate-900 text-white"
    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80";
}

function PagePublishBadge({ page }: { page: PageRow }) {
  const published = page.publishStatus === "published";
  return (
    <span
      className={
        "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium " +
        (published
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80")
      }
    >
      {published ? "公開中" : "非公開"}
    </span>
  );
}

type LayoutNode = {
  page: PageRow;
  depth: number;
  x: number;
  y: number;
};

function layoutTreeNodes(
  set: PageConnectionSet,
): { nodes: LayoutNode[]; width: number; height: number } {
  const idToPage = new Map(set.pages.map((page) => [page.id, page]));
  const nodes: LayoutNode[] = [];
  let leafIndex = 0;

  const walk = (node: PageConnectionTreeNode, depth: number): number => {
    const page = idToPage.get(node.pageId);
    if (!page) return leafIndex;
    if (node.children.length === 0) {
      const x = 28 + leafIndex * 168;
      leafIndex += 1;
      nodes.push({ page, depth, x, y: 28 + depth * 92 });
      return x;
    }
    const childXs = node.children.map((child) => walk(child, depth + 1));
    const x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    nodes.push({ page, depth, x, y: 28 + depth * 92 });
    return x;
  };

  walk(set.tree, 0);
  const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  const width = Math.max(320, leafIndex * 168 + 40);
  const height = Math.max(120, 56 + (maxDepth + 1) * 92);
  return { nodes, width, height };
}

type PageConnectionSetCardProps = {
  set: PageConnectionSet;
  deletingPageId: string | null;
  onEdit: (page: PageRow) => void;
  onRename: (page: PageRow) => void;
  onDelete: (page: PageRow) => void;
};

export function PageConnectionSetCard({
  set,
  deletingPageId,
  onEdit,
  onRename,
  onDelete,
}: PageConnectionSetCardProps) {
  const [showTree, setShowTree] = useState(false);
  const flatRows = useMemo(() => flattenPageConnectionTree(set), [set]);
  const publishedInSet = set.pages.filter((p) => p.publishStatus === "published").length;
  const treeLayout = useMemo(() => (showTree ? layoutTreeNodes(set) : null), [set, showTree]);
  const idToNode = useMemo(() => {
    const map = new Map<string, LayoutNode>();
    for (const node of treeLayout?.nodes ?? []) map.set(node.page.id, node);
    return map;
  }, [treeLayout]);

  const treeEdges = useMemo(() => {
    if (!treeLayout) return [] as Array<{ key: string; x1: number; y1: number; x2: number; y2: number }>;
    const edges: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = [];
    const walk = (node: PageConnectionTreeNode) => {
      const from = idToNode.get(node.pageId);
      for (const child of node.children) {
        const to = idToNode.get(child.pageId);
        if (from && to) {
          edges.push({
            key: `${node.pageId}-${child.pageId}`,
            x1: from.x + 70,
            y1: from.y + 44,
            x2: to.x + 70,
            y2: to.y + 8,
          });
        }
        walk(child);
      }
    };
    walk(set.tree);
    return edges;
  }, [idToNode, set.tree, treeLayout]);

  return (
    <article className="overflow-hidden rounded-lg border border-[#e6e8eb] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">{set.name}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {set.pageCount}ページ · 公開中 {publishedInSet}/{set.pageCount}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {set.mode === "linked" && set.tree?.pageId ? (
            <button
              type="button"
              onClick={() => setShowTree((v) => !v)}
              className="rounded-md border border-[#e6e8eb] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              aria-expanded={showTree}
            >
              {showTree ? "つながり図を閉じる" : "つながり図"}
            </button>
          ) : null}
          <span className={"rounded-md px-2 py-0.5 text-xs font-medium " + modeBadgeClass(set.mode)}>
            {modeLabel(set.mode)}
          </span>
        </div>
      </div>

      {showTree && treeLayout ? (
        <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <p className="mb-2 text-xs text-slate-500">ルートからリンク先へ、1本ずつ繋がる構造です。</p>
          <div className="-mx-1 overflow-x-auto px-1">
            <div className="relative" style={{ width: `${treeLayout.width}px`, height: `${treeLayout.height}px` }}>
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                {treeEdges.map((edge) => (
                  <line
                    key={edge.key}
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                  />
                ))}
              </svg>
              {treeLayout.nodes.map((node) => (
                <button
                  key={node.page.id}
                  type="button"
                  onClick={() => onEdit(node.page)}
                  className="absolute w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {node.depth === 0 ? "ルート" : `階層 ${node.depth}`}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <div className="line-clamp-1 min-w-0 flex-1 text-xs font-medium text-slate-900">
                      {node.page.title || "(無題)"}
                    </div>
                    <PagePublishBadge page={node.page} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ul className="divide-y divide-slate-100" aria-label={`${set.name}の階層`}>
        {flatRows.map((row) => (
          <li key={row.page.id} className="px-3 py-2.5 sm:px-4">
            <div
              className="flex flex-wrap items-center gap-2 sm:gap-3"
              style={{ paddingLeft: `${Math.min(row.depth, 6) * 16}px` }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {row.depth > 0 ? (
                  <span className="shrink-0 text-slate-300" aria-hidden>
                    └
                  </span>
                ) : (
                  <span className="shrink-0 text-slate-400" aria-hidden>
                    ▾
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-slate-900">
                      {row.page.title || "(無題)"}
                    </span>
                    <PagePublishBadge page={row.page} />
                    {row.isRoot ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        ルート
                      </span>
                    ) : null}
                  </div>
                  {row.hasChildren ? (
                    <p className="mt-0.5 text-xs text-slate-400">下層ページあり</p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(row.page)}
                  className="rounded-md border border-[#e6e8eb] bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => onRename(row.page)}
                  className="rounded-md border border-[#e6e8eb] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  名前変更
                </button>
                <a
                  href={buildPublicUrlV(row.page.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-[#e6e8eb] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  公開ページ
                </a>
                <button
                  type="button"
                  disabled={deletingPageId === row.page.id}
                  onClick={() => onDelete(row.page)}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingPageId === row.page.id ? "削除中…" : "削除"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
