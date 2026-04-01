"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
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
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
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

  const onActivate = () => selectCard(card.id);
  const tokenLike = /^[a-z0-9:-]+$/i.test(icon);
  const showLineIcon = tokenLike || icon.startsWith("svg:");
  const normalizedIconName = normalizeIconToken(icon, "info");

  return (
    <Card padding="md" className="">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-700">
          {showLineIcon ? (
            <LineIcon name={normalizedIconName} className="h-5 w-5" />
          ) : (
            <p className="text-xl leading-none">{icon}</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900" style={getTitleFontSizeStyle()}>
            <InlineEditable value={label} onSave={(v) => updateKey("label", v)} editable={isSelected} onActivate={onActivate} placeholder={labels.labelPlaceholder} className="font-semibold text-slate-900" />
          </p>
          <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
            <InlineEditable value={description} onSave={(v) => updateKey("description", v)} editable={isSelected} onActivate={onActivate} placeholder={labels.descriptionPlaceholder} className="text-slate-600" />
          </p>
        </div>
      </div>
    </Card>
  );
}
