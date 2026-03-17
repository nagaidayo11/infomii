"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listPagesForHotel, type PageRow } from "@/lib/storage";

type PageListSidebarProps = {
  currentPageId: string | null;
  /** "left" | "right" - 左右どちらに表示するか */
  position: "left" | "right";
};

/**
 * 施設内のページ一覧。スマホ枠の左右余白に表示し、クリックでそのページの編集に遷移。
 */
export function PageListSidebar({ currentPageId, position }: PageListSidebarProps) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPagesForHotel()
      .then(setPages)
      .finally(() => setLoading(false));
  }, []);

  const others = pages.filter((p) => p.id !== currentPageId);
  if (loading || others.length === 0) return null;

  return (
    <aside
      className="flex w-[140px] shrink-0 flex-col"
      aria-label={position === "left" ? "他のページ（左）" : "他のページ（右）"}
    >
      <div className="mb-2 px-1 text-xs font-medium text-slate-500">他のページ</div>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {others.map((page) => (
          <Link
            key={page.id}
            href={`/editor/${page.id}`}
            className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50/80"
          >
            <span className="truncate text-sm font-medium text-slate-800">
              {page.title || page.slug || ""}
            </span>
            <span className="truncate text-xs text-slate-500">/v/{page.slug}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
