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
};

/**
 * Public view of a card-based page. Detects visitor language and falls back to English.
 */
export function GuestCardPageView({ title, cards, initialLocale, pageBackground = null }: GuestCardPageViewProps) {
  return (
    <VisitorLocaleProvider initialLocale={initialLocale}>
      <PublicPageShell title={title} pageBackground={pageBackground}>
        <div className="space-y-4">
          <CardRenderer cards={cards} />
        </div>
      </PublicPageShell>
    </VisitorLocaleProvider>
  );
}
