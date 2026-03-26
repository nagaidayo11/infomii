"use client";

import type { EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { VisitorLocaleProvider } from "@/components/locale-context";
import { PublicPageShell } from "@/components/public-page/PublicPageShell";
import type { SupportedLocale } from "@/lib/localized-content";
import type { PageBackgroundStyle } from "@/lib/storage";

type GuestCardPageViewProps = {
  title: string;
  cards: EditorCard[];
  initialLocale: SupportedLocale;
  pageBackground?: PageBackgroundStyle | null;
  unpublishedPreview?: boolean;
};

/**
 * Public view of a card-based page. Detects visitor language and falls back to English.
 */
export function GuestCardPageView({
  title,
  cards,
  initialLocale,
  pageBackground = null,
  unpublishedPreview = false,
}: GuestCardPageViewProps) {
  return (
    <VisitorLocaleProvider initialLocale={initialLocale}>
      <PublicPageShell title={title} pageBackground={pageBackground}>
        <div className="space-y-4">
          {unpublishedPreview && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              現在公開OFFになっています（これはプレビュー表示です）。
            </div>
          )}
          <CardRenderer cards={cards} />
        </div>
      </PublicPageShell>
    </VisitorLocaleProvider>
  );
}
