"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type WifiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function WifiCard({ card, isSelected, locale = "ja" }: WifiCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const ssid = getLocalizedContent(c?.ssid as LocalizedString | undefined, locale);
  const password = getLocalizedContent(c?.password as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">📶 WiFi</p>
      {ssid && <p className="mt-1 text-xs text-slate-600">SSID: {ssid}</p>}
      {password && <p className="mt-0.5 text-xs font-mono text-slate-600">パスワード: {password}</p>}
      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
    </Card>
  );
}
