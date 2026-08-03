"use client";

import { formatRelativeTimeJa } from "@/lib/format-relative-time";
import { AppShellLink } from "./AppShellLink";
import { AppIconPages } from "./icons/AppIconSet";

type AppHomeContinueCardProps = {
  pageId: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
  onShare?: () => void;
};

export function AppHomeContinueCard({ pageId, title, status, updatedAt, onShare }: AppHomeContinueCardProps) {
  const published = status === "published";
  const displayTitle = title.trim() || "（無題）";

  return (
    <article className="app-home-continue app-pressable ui-pop-tap">
      <div className="app-home-continue__glow" aria-hidden />
      <div className="app-home-continue__inner">
        <AppShellLink href={`/editor/${pageId}`} className="app-home-continue__main no-underline">
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
        </AppShellLink>
        <div className="app-home-continue__actions">
          {published && onShare ? (
            <button
              type="button"
              className="app-home-continue__cta app-home-continue__cta--share"
              onClick={onShare}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9m0 0-3.5-3.5M16.5 12 13 15.5" />
              </svg>
              送る
            </button>
          ) : null}
          <AppShellLink href={`/editor/${pageId}`} className="app-home-continue__cta no-underline">
            開く
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </AppShellLink>
        </div>
      </div>
    </article>
  );
}
