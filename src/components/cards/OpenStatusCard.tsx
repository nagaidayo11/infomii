"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

export function OpenStatusCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "営業時間";
  const mode = c.mode === "hours" ? "hours" : "manual";
  const openNow = c.openNow !== false;
  const startHour = Number(c.startHour ?? 7);
  const endHour = Number(c.endHour ?? 23);
  const nowHour = new Date().getHours();
  const byHour = nowHour >= startHour && nowHour < endHour;
  const isOpen = mode === "hours" ? byHour : openNow;
  const openLabel = typeof c.openLabel === "string" ? c.openLabel : "営業中";
  const closedLabel = typeof c.closedLabel === "string" ? c.closedLabel : "営業時間外";
  const hoursText = typeof c.hoursText === "string" ? c.hoursText : `${startHour}:00-${endHour}:00`;

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className={`${editorInnerRadiusClassName} mt-3 border px-3 py-2 ${isOpen ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
        <p className={`text-sm font-semibold ${isOpen ? "text-emerald-700" : "text-slate-700"}`} style={getBodyFontSizeStyle()}>
          {isOpen ? openLabel : closedLabel}
        </p>
        <p className="mt-1 text-xs text-slate-600" style={getBodyFontSizeStyle()}>{hoursText}</p>
      </div>
    </Card>
  );
}
