"use client";

import { useState } from "react";
import { PublishModal } from "@/components/editor/PublishModal";
import { formatRelativeTimeJa } from "@/lib/format-relative-time";
import { buildPublicUrl } from "@/lib/storage";
import { useAppToast } from "./AppToastProvider";
import { AppShellLink } from "./AppShellLink";
import { AppSwitch } from "./primitives/AppSwitch";
import type { LiveOpsKey } from "@/lib/editor/live-ops";
import { LiveOpsPageRowActions } from "@/components/ops/LiveOpsPageRowActions";

export type AppWorksListItemProps = {
  id: string;
  title: string;
  slug?: string;
  status: "draft" | "published";
  updatedAt: string;
  publishToggling?: boolean;
  deleting?: boolean;
  /** Show publish switch (works list). Compact mode hides it. */
  showPublishSwitch?: boolean;
  onTogglePublish?: (id: string, nextStatus: "draft" | "published") => Promise<void> | void;
  onDelete?: (id: string) => void;
  liveOpsKeys?: LiveOpsKey[];
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

function QrLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  );
}

export function AppWorksListItem({
  id,
  title,
  slug,
  status,
  updatedAt,
  publishToggling = false,
  deleting = false,
  showPublishSwitch = true,
  onTogglePublish,
  onDelete,
  liveOpsKeys = [],
}: AppWorksListItemProps) {
  const { showToast } = useAppToast();
  const [shareOpen, setShareOpen] = useState(false);
  const published = status === "published";
  const editHref = `/editor/${id}`;

  const handleShareClick = () => {
    if (!slug) {
      showToast("ページ情報を読み込めませんでした", "error");
      return;
    }
    if (!published) {
      showToast("公開するとQRとリンクを共有できます", "info");
      return;
    }
    setShareOpen(true);
  };

  return (
    <>
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

        <div className="app-works-meta-row border-t border-[var(--app-border)] px-4 py-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-[var(--app-text)]">
            <span
              className={
                "app-status-dot " + (published ? "app-status-dot--published" : "app-status-dot--draft")
              }
              aria-hidden
            />
            <span>{published ? "公開中" : "下書き"}</span>
          </span>

          {showPublishSwitch && onTogglePublish ? (
            <AppSwitch
              label="公開"
              checked={published}
              loading={publishToggling}
              onCheckedChange={(next) => {
                void onTogglePublish(id, next ? "published" : "draft");
              }}
            />
          ) : null}

          <span className="app-meta shrink-0">{formatRelativeTimeJa(updatedAt)}</span>

          <button
            type="button"
            onClick={handleShareClick}
            className="app-works-share-btn ui-pop-tap inline-flex shrink-0 items-center gap-0.5"
            aria-label="QRとリンクを表示"
          >
            <QrLinkIcon className="h-3.5 w-3.5" />
            <span>QR / リンク</span>
          </button>
        </div>
        {liveOpsKeys.length > 0 ? (
          <div className="border-t border-[var(--app-border)] px-4 py-2">
            <LiveOpsPageRowActions pageId={id} keys={liveOpsKeys} />
          </div>
        ) : null}
      </article>

      {shareOpen && slug ? (
        <PublishModal
          variant="share"
          publicUrl={buildPublicUrl(slug)}
          pageTitle={title || "無題"}
          slug={slug}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </>
  );
}
