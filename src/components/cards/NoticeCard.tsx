"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type NoticeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function NoticeCard({ card, isSelected, locale = "ja" }: NoticeCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const body = getLocalizedContent(c?.body as LocalizedString | undefined, locale);
  const variant = (c?.variant as string) ?? "info";
  const isWarning = variant === "warning";
  const labels =
    locale === "ko"
      ? { bodyPlaceholder: "본문", defaultTitle: "공지" }
      : locale === "zh"
        ? { bodyPlaceholder: "正文", defaultTitle: "通知" }
        : locale === "en"
          ? { bodyPlaceholder: "Body", defaultTitle: "Notice" }
          : { bodyPlaceholder: "本文", defaultTitle: "お知らせ" };
  const title =
    getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.defaultTitle;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="none">
      <div
        data-inner-surface
        className={`${editorInnerRadiusClassName} flex flex-col gap-2 px-3 py-3 ${isWarning ? "bg-amber-50" : "bg-sky-50/80"}`}
      >
        <div className="min-w-0 font-medium leading-tight text-slate-800" style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={isSelected}
            onActivate={onActivate}
            className="font-medium leading-tight text-slate-800"
          />
        </div>
        <div className="min-w-0 leading-normal text-slate-600" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={body}
            onSave={(v) => updateKey("body", v)}
            editable={isSelected}
            onActivate={onActivate}
            multiline
            className="text-slate-600 leading-normal"
            placeholder={labels.bodyPlaceholder}
          />
        </div>
      </div>
    </Card>
  );
}
