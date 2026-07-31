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
      <div className="app-home-continue__inner">
        <div className="app-home-continue__thumb" aria-hidden>
          <AppIconPages size={30} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="app-home-continue__eyebrow">
            <span>続きから</span>
            <span className={published ? "app-home-continue__pill is-published" : "app-home-continue__pill"}>
              {published ? "公開中" : "下書き"}
            </span>
          </div>
          <p className="app-home-continue__title">
            {displayTitle}
          </p>
          <p className="app-home-continue__meta">
            {formatRelativeTimeJa(updatedAt)}
          </p>
        </div>
        <span className="app-home-continue__cta" aria-hidden>
          開く
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </AppShellLink>
  );
}
