"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type NearbyItem = { name?: string; description?: string; link?: string };

type NearbyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function NearbyCard({ card, isSelected, locale = "ja" }: NearbyCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "周辺案内";
  const items = (Array.isArray(c?.items) ? c.items : []) as NearbyItem[];
  return (
    <Card
      padding="md"
      className={isSelected ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50" : ""}
    >
      <p className="text-sm font-semibold text-slate-800">📍 {title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
              {item.name && <p className="text-xs font-medium text-slate-700">{item.name}</p>}
              {item.description && (
                <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
              )}
              {item.link && (
                <a
                  href={item.link}
                  className="mt-1 inline-block text-xs font-medium text-slate-600 underline"
                >
                  詳細
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-500">周辺スポットを追加できます</p>
      )}
    </Card>
  );
}
