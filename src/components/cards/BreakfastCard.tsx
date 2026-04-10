"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type BreakfastCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function BreakfastCard({ card, isSelected, locale = "ja" }: BreakfastCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { time: "시간", location: "장소", titlePlaceholder: "조식", menuPlaceholder: "메뉴", locationPlaceholder: "1층 다이닝" }
      : locale === "zh"
        ? { time: "时间", location: "地点", titlePlaceholder: "早餐", menuPlaceholder: "菜单", locationPlaceholder: "1层餐厅" }
        : locale === "en"
          ? { time: "Time", location: "Venue", titlePlaceholder: "Breakfast", menuPlaceholder: "Menu", locationPlaceholder: "1F Dining" }
          : { time: "時間", location: "会場", titlePlaceholder: "朝食", menuPlaceholder: "メニュー", locationPlaceholder: "1F ダイニング" };
  const title =
    getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.titlePlaceholder;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="text-sm font-medium text-slate-800" placeholder={labels.titlePlaceholder} />
      </p>
      <p className="mt-1 text-xs text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.time}:{" "}
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={isSelected} onActivate={onActivate} className="text-xs text-slate-600" placeholder="7:00–9:30" />
      </p>
      <p className="mt-0.5 text-xs text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.location}:{" "}
        <InlineEditable value={location} onSave={(v) => updateKey("location", v)} editable={isSelected} onActivate={onActivate} className="text-xs text-slate-600" placeholder={labels.locationPlaceholder} />
      </p>
      <p className="mt-2 text-xs text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={menu} onSave={(v) => updateKey("menu", v)} editable={isSelected} onActivate={onActivate} multiline className="block w-full min-h-[1lh] text-xs text-slate-500" placeholder={labels.menuPlaceholder} />
      </p>
    </Card>
  );
}
