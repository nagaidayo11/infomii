"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { LineIcon, normalizeIconToken } from "./LineIcon";

type IconCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function IconCard({ card, isSelected, locale = "ja" }: IconCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const icon = ((c?.icon as string) ?? "📍").trim() || "📍";
  const label = getLocalizedContent(c?.label as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { labelPlaceholder: "라벨", descriptionPlaceholder: "보충 설명" }
      : locale === "zh"
        ? { labelPlaceholder: "标签", descriptionPlaceholder: "补充说明" }
        : locale === "en"
          ? { labelPlaceholder: "Label", descriptionPlaceholder: "Description" }
          : { labelPlaceholder: "ラベル", descriptionPlaceholder: "補足" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const tokenLike = /^[a-z0-9:-]+$/i.test(icon);
  const showLineIcon = tokenLike || icon.startsWith("svg:");
  const normalizedIconName = normalizeIconToken(icon, "info");

  return (
    <Card padding="md" className="">
      <div className="flex items-start gap-3">
        <div
          data-inner-surface
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center text-slate-700 ${editorInnerRadiusClassName} bg-slate-100`}
        >
          {showLineIcon ? (
            <LineIcon name={normalizedIconName} className="h-5 w-5" />
          ) : (
            <p className="text-xl leading-none">{icon}</p>
          )}
        </div>
        <div className="min-w-0">
          <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
            <InlineEditable value={label} onSave={(v) => updateKey("label", v)} editable={editable} onActivate={onActivate} placeholder={labels.labelPlaceholder} className={CARD_BLOCK_TITLE_CLASS} />
          </p>
          <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
            <InlineEditable value={description} onSave={(v) => updateKey("description", v)} editable={editable} onActivate={onActivate} placeholder={labels.descriptionPlaceholder} className="text-slate-600" />
          </p>
        </div>
      </div>
    </Card>
  );
}
