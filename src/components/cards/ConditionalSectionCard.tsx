"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { isWithinSchedule, useServerNow } from "@/lib/server-time";

export function ConditionalSectionCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "条件表示";
  const message = typeof c.message === "string" ? c.message : "";
  const days = (Array.isArray(c.enabledDays) ? c.enabledDays : []) as number[];
  const startHour = Number(c.startHour ?? 0);
  const endHour = Number(c.endHour ?? 24);
  const serverNow = useServerNow();
  const show = isWithinSchedule(serverNow, {
    enabledDays: days,
    startHour,
    endHour,
  });
  if (!show) return null;
  return (
    <Card padding="md">
      <section className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 px-3 py-3`}>
        <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
        <p className="mt-1 text-sm text-slate-700" style={getBodyFontSizeStyle()}>{message}</p>
      </section>
    </Card>
  );
}
