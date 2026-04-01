"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type NearbyItem = { name?: string; description?: string; link?: string };

type NearbyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function NearbyCard({ card, isSelected, locale = "ja" }: NearbyCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "주변 안내", detail: "상세", empty: "주변 명소를 추가할 수 있습니다" }
      : locale === "zh"
        ? { title: "周边信息", detail: "详情", empty: "可添加周边景点" }
        : locale === "en"
          ? { title: "Nearby Info", detail: "Details", empty: "You can add nearby spots" }
          : { title: "周辺案内", detail: "詳細", empty: "周辺スポットを追加できます" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.title;
  const items = (Array.isArray(c?.items) ? c.items : []) as NearbyItem[];

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card
      padding="md"
      className=""
    >
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-semibold text-slate-800" />
      </p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
          {items.map((item, i) => (
            <li key={i} className={`pt-2 first:pt-0 ${editorInnerRadiusClassName} border border-slate-100 bg-slate-50/70 px-3 py-2`}>
              {item.name && <p className="font-medium text-slate-700">{item.name}</p>}
              {item.description && (
                <p className="mt-0.5 text-slate-500">{item.description}</p>
              )}
              {item.link && (
                <a
                  href={item.link}
                  className="mt-1 inline-block font-medium text-slate-600 underline"
                  onClick={isSelected !== undefined ? (e) => e.preventDefault() : undefined}
                  aria-disabled={isSelected !== undefined ? true : undefined}
                >
                  {labels.detail}
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-slate-500" style={getBodyFontSizeStyle()}>{labels.empty}</p>
      )}
    </Card>
  );
}
