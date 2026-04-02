"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { LineIcon, normalizeIconToken } from "./LineIcon";

type InfoCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

type InfoRow = { label?: string; value?: string };

export function InfoCard({ card, isSelected = false, locale = "ja" }: InfoCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const localeLabels =
    locale === "ko"
      ? { empty: "라벨과 값을 추가", title: "제목", value: "값", defaultTitle: "정보" }
      : locale === "zh"
        ? { empty: "请添加标签和值", title: "标题", value: "值", defaultTitle: "信息" }
        : locale === "en"
          ? { empty: "Add label and value", title: "Title", value: "Value", defaultTitle: "Information" }
          : { empty: "ラベルと値を追加", title: "タイトル", value: "値", defaultTitle: "情報" };
  const title =
    getLocalizedContent(c?.title as LocalizedString | undefined, locale) || localeLabels.defaultTitle;
  const icon = normalizeIconToken(c?.icon, "info");
  const rows = (c?.rows as InfoRow[]) ?? [];

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md">
      <div className="flex items-center gap-3 pb-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${editorInnerRadiusClassName} bg-slate-100 text-slate-700`}
        >
          <LineIcon name={icon} className="h-5 w-5" />
        </span>
        <h3 className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => update({ title: v })} editable={isSelected} onActivate={onActivate} className="text-slate-800" placeholder={localeLabels.title} />
        </h3>
      </div>
      <div className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {rows.length === 0 ? (
          <p className="text-slate-500">{localeLabels.empty}</p>
        ) : (
          rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-2 ${editorInnerRadiusClassName} bg-slate-50/80 px-2 py-1.5`}
            >
              <span className="text-slate-500 break-words">{row.label ?? "—"}</span>
              <span className="text-right font-medium text-slate-800 break-all leading-snug">
                <InlineEditable
                  value={row.value ?? ""}
                  onSave={(v) => {
                    const next = [...rows];
                    next[i] = { ...next[i], value: v };
                    update({ rows: next });
                  }}
                  editable={isSelected}
                  onActivate={onActivate}
                  className="font-medium text-slate-800"
                  placeholder={localeLabels.value}
                />
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
