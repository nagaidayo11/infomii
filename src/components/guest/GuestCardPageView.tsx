"use client";

import type { EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { VisitorLocaleProvider } from "@/components/locale-context";
import { PublicPageShell } from "@/components/public-page/PublicPageShell";
import type { SupportedLocale } from "@/lib/localized-content";

type GuestCardPageViewProps = {
  title: string;
  cards: EditorCard[];
  initialLocale: SupportedLocale;
};

/**
 * Public view of a card-based page. Detects visitor language and falls back to English.
 */
export function GuestCardPageView({ title, cards, initialLocale }: GuestCardPageViewProps) {
  return (
    <VisitorLocaleProvider initialLocale={initialLocale}>
      <PublicPageShell title={title}>
        <div className="space-y-4">
          {cards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <CardRenderer key={card.id} card={card} isSelected={false} />
            ))}
        </div>
      </PublicPageShell>
    </VisitorLocaleProvider>
  );
}
