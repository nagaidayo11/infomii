"use client";

import { useMemo, useState, type CSSProperties } from "react";
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
  kind?: "guide" | "stamp";
  status: "draft" | "published";
  updatedAt: string;
  publishToggling?: boolean;
  deleting?: boolean;
  /** Show publish switch (works list). Compact mode hides it. */
  showPublishSwitch?: boolean;
  onTogglePublish?: (id: string, nextStatus: "draft" | "published") => Promise<void> | void;
  onDelete?: (id: string) => void;
  liveOpsKeys?: LiveOpsKey[];
  previewCards?: Array<{ type: string; content: Record<string, unknown>; order?: number }>;
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

type ResolvedWorkPreview = {
  image?: string;
  title: string;
  subtitle?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function firstImageFromContent(content: Record<string, unknown>): string | undefined {
  const direct = readString(content.src) ?? readString(content.imageSrc) ?? readString(content.imageUrl) ?? readString(content.image);
  if (direct) return direct;

  for (const key of ["slides", "items", "images"]) {
    const items = Array.isArray(content[key]) ? content[key] : [];
    for (const item of items) {
      const row = asRecord(item);
      if (!row) continue;
      const src = readString(row.src) ?? readString(row.imageSrc) ?? readString(row.imageUrl) ?? readString(row.image);
      if (src) return src;
    }
  }
  return undefined;
}

function firstTextFromContent(content: Record<string, unknown>): string | undefined {
  return (
    readString(content.subtitle) ??
    readString(content.caption) ??
    readString(content.body) ??
    readString(content.description) ??
    readString(content.content) ??
    readString(content.note)
  );
}

function resolveWorkPreview(
  cards: AppWorksListItemProps["previewCards"],
  fallbackTitle: string,
): ResolvedWorkPreview {
  const orderedCards = [...(cards ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const heroCard =
    orderedCards.find((card) => card.type === "hero" || card.type === "hero_slider") ??
    orderedCards.find((card) => firstImageFromContent(card.content));
  const textCard = orderedCards.find((card) => readString(card.content.title) || firstTextFromContent(card.content));
  const title = readString(heroCard?.content.title) ?? readString(textCard?.content.title) ?? (fallbackTitle || "無題");
  const subtitle = firstTextFromContent(heroCard?.content ?? {}) ?? firstTextFromContent(textCard?.content ?? {});
  return {
    image: heroCard ? firstImageFromContent(heroCard.content) : undefined,
    title,
    subtitle,
  };
}

function buildPreviewStyle(image?: string): CSSProperties | undefined {
  if (!image) return undefined;
  const safeImage = image.replace(/"/g, "%22");
  return {
    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.62)), url("${safeImage}")`,
  };
}

export function AppWorksListItem({
  id,
  title,
  slug,
  kind = "guide",
  status,
  updatedAt,
  publishToggling = false,
  deleting = false,
  showPublishSwitch = true,
  onTogglePublish,
  onDelete,
  liveOpsKeys = [],
  previewCards,
}: AppWorksListItemProps) {
  const { showToast } = useAppToast();
  const [shareOpen, setShareOpen] = useState(false);
  const published = status === "published";
  const editHref = kind === "stamp" ? `/editor/stamp/${id}` : `/editor/${id}`;
  const publicUrl =
    kind === "stamp" && slug
      ? typeof window !== "undefined"
        ? `${window.location.origin}/s/p/${encodeURIComponent(slug)}`
        : `/s/p/${encodeURIComponent(slug)}`
      : slug
        ? buildPublicUrl(slug)
        : "";
  const preview = useMemo(
    () => resolveWorkPreview(previewCards, title),
    [previewCards, title],
  );

  const handleShareClick = () => {
    if (!slug) {
      showToast("ページ情報を読み込めませんでした", "error");
      return;
    }
    if (!published) {
      showToast("公開すると送れます", "info");
      return;
    }
    setShareOpen(true);
  };

  return (
    <>
      <article className="app-works-card app-shell-card ui-pop-card overflow-hidden">
        <AppShellLink
          href={editHref}
          className={`app-works-preview app-pressable no-underline ${preview.image ? "has-image" : "has-no-image"}`}
          aria-label={`${title || "無題"}を編集`}
          style={buildPreviewStyle(preview.image)}
        >
          <div className="app-works-preview-live">
            <span className="app-works-preview-live-status">{published ? "公開中" : "下書き"}</span>
            <div className="app-works-preview-live-copy">
              <strong>{preview.title}</strong>
              {preview.subtitle ? <span>{preview.subtitle}</span> : null}
            </div>
          </div>
        </AppShellLink>

        <div className="app-works-title-row flex items-center gap-1 px-4 py-3.5">
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
            aria-label="送る"
          >
            <QrLinkIcon className="h-3.5 w-3.5" />
            <span>送る</span>
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
          publicUrl={publicUrl || buildPublicUrl(slug)}
          pageTitle={title || "無題"}
          slug={slug}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </>
  );
}
