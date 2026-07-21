"use client";

import { formatRelativeTimeJa } from "@/lib/format-relative-time";
import { AppShellLink } from "./AppShellLink";
import { AppIconPages } from "./icons/AppIconSet";

type AppHomeContinueCardProps = {
  pageId: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
};

export function AppHomeContinueCard({ pageId, title, status, updatedAt }: AppHomeContinueCardProps) {
  const published = status === "published";
  const displayTitle = title.trim() || "（無題）";

  return (
    <AppShellLink href={`/editor/${pageId}`} className="app-home-continue app-pressable ui-pop-tap block no-underline">
      <div className="app-home-continue__glow" aria-hidden />
      <div className="relative flex items-center gap-3.5">
        <div className="app-home-continue__thumb" aria-hidden>
          <AppIconPages size={36} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[var(--app-accent)]">続きから</p>
          <p className="mt-0.5 truncate text-lg font-bold leading-tight text-[var(--app-text)]">
            {displayTitle}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={
                  "app-status-dot " + (published ? "app-status-dot--published" : "app-status-dot--draft")
                }
                aria-hidden
              />
              {published ? "公開中" : "下書き"}
            </span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTimeJa(updatedAt)}</span>
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-[var(--app-accent)] opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </AppShellLink>
  );
}
