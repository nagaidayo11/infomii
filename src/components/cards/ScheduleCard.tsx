"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type ScheduleCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function ScheduleCard({ card, isSelected, locale = "ja" }: ScheduleCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko" ? { title: "운영 시간", day: "구분" } :
    locale === "zh" ? { title: "营业时间", day: "分类" } :
    locale === "en" ? { title: "Opening Hours", day: "Category" } :
    { title: "営業時間", day: "区分" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.title;
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  return (
    <Card padding="md" className="">
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className="mt-2 space-y-1.5">
        {items.slice(0, 5).map((item, index) => {
          const day = getLocalizedContent(item.day as LocalizedString | undefined, locale) || labels.day;
          const time = getLocalizedContent(item.time as LocalizedString | undefined, locale) || "-";
          const label = getLocalizedContent(item.label as LocalizedString | undefined, locale);
          return (
            <div key={index} className="rounded-lg bg-slate-50 px-2.5 py-2">
              <p className="font-medium text-slate-700" style={getBodyFontSizeStyle()}>{day}: {time}</p>
              {label ? <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>{label}</p> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
