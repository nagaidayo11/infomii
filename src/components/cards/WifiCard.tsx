"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type WifiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function WifiCard({ card, isSelected }: WifiCardProps) {
  const c = card.content as { title?: string; ssid?: string; password?: string } | undefined;
  const title = c?.title ?? "WiFi";
  const ssid = c?.ssid;
  const password = c?.password;
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">📶 {title}</p>
      {ssid && <p className="mt-1 text-xs text-slate-600">{ssid}</p>}
      {password && <p className="mt-0.5 text-xs font-mono text-slate-600">{password}</p>}
    </Card>
  );
}
