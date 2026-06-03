"use client";

import { formatRelativeTimeJa } from "@/lib/format-relative-time";
import { AppShellLink } from "./AppShellLink";
import { AppSwitch } from "./primitives/AppSwitch";

export type AppWorksListItemProps = {
  id: string;
  title: string;
  slug?: string;
  status: "draft" | "published";
  updatedAt: string;
  qrViews7d?: number;
  publishToggling?: boolean;
  deleting?: boolean;
  /** Show publish switch (works list). Compact mode hides it. */
  showPublishSwitch?: boolean;
  onTogglePublish?: (id: string, nextStatus: "draft" | "published") => Promise<void> | void;
  onDelete?: (id: string) => void;
};

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-[var(--app-text-muted)] opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function AppWorksListItem({
  id,
  title,
  status,
  updatedAt,
  qrViews7d = 0,
  publishToggling = false,
  deleting = false,
  showPublishSwitch = true,
  onTogglePublish,
  onDelete,
}: AppWorksListItemProps) {
  const published = status === "published";
  const editHref = `/editor/${id}`;

  return (
    <article className="app-shell-card ui-pop-card overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-3.5">
        <AppShellLink
          href={editHref}
          className="app-pressable flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent text-left no-underline"
        >
          <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--app-text)]">
            {title || "無題"}
          </h3>
          <ChevronRight />
        </AppShellLink>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(id)}
            disabled={deleting}
            className="app-works-delete-btn ui-pop-tap shrink-0"
            aria-label={deleting ? "削除中" : "削除"}
          >
            {deleting ? (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-text-muted)] border-t-transparent"
                aria-hidden
              />
            ) : (
              <TrashIcon />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-[var(--app-border)] px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--app-text)]">
          <span
            className={
              "app-status-dot " + (published ? "app-status-dot--published" : "app-status-dot--draft")
            }
            aria-hidden
          />
          <span>{published ? "公開中" : "下書き"}</span>
        </span>

        {showPublishSwitch && onTogglePublish ? (
          <>
            <span className="app-meta-separator" aria-hidden>
              ·
            </span>
            <AppSwitch
              label="公開"
              checked={published}
              loading={publishToggling}
              onCheckedChange={(next) => {
                void onTogglePublish(id, next ? "published" : "draft");
              }}
            />
          </>
        ) : null}

        <span className="app-meta-separator" aria-hidden>
          ·
        </span>
        <span className="app-meta">{formatRelativeTimeJa(updatedAt)}</span>
        <span className="app-meta-separator" aria-hidden>
          ·
        </span>
        <span className="app-meta tabular-nums">QR閲覧 {qrViews7d}</span>
      </div>
    </article>
  );
}
