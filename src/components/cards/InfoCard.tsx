"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { LineIcon, normalizeIconToken } from "./LineIcon";

type InfoCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

type InfoRow = { label?: string; value?: string };

export function InfoCard({ card, isSelected = false, locale = "ja" }: InfoCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const localeLabels =
    locale === "ko"
      ? { empty: "라벨과 값을 추가", title: "제목", value: "값" }
      : locale === "zh"
        ? { empty: "请添加标签和值", title: "标题", value: "值" }
        : locale === "en"
          ? { empty: "Add label and value", title: "Title", value: "Value" }
          : { empty: "ラベルと値を追加", title: "タイトル", value: "値" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const icon = normalizeIconToken(c?.icon, "info");
  const rows = (c?.rows as InfoRow[]) ?? [];

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  return (
    <Card padding="md">
      <div className="flex items-center gap-3 pb-3">
        <span
          data-inner-surface
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${editorInnerRadiusClassName} bg-slate-100 text-slate-700`}
        >
          <LineIcon name={icon} className="h-5 w-5" />
        </span>
        {(editable || title) ? (
          <h3 className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
            <InlineEditable
              value={title}
              onSave={(v) => update({ title: v })}
              editable={editable}
              onActivate={onActivate}
              className={CARD_BLOCK_TITLE_CLASS}
              placeholder={localeLabels.title}
            />
          </h3>
        ) : null}
      </div>
      <div className={`mt-3 space-y-2 ${CARD_BLOCK_BODY_CLASS}`} style={getBodyFontSizeStyle()}>
        {rows.length === 0 ? (
          <p className={CARD_BLOCK_CAPTION_CLASS}>{localeLabels.empty}</p>
        ) : (
          rows.map((row, i) => (
            <div
              key={i}
              data-inner-surface
              className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-2 ${editorInnerRadiusClassName} bg-slate-50/80 px-2 py-1.5`}
            >
              <span className={`break-words ${CARD_BLOCK_CAPTION_CLASS}`}>
                <InlineEditable
                  value={row.label ?? ""}
                  onSave={(v) => {
                    const next = [...rows];
                    next[i] = { ...next[i], label: v };
                    update({ rows: next });
                  }}
                  editable={editable}
                  onActivate={onActivate}
                  className={CARD_BLOCK_CAPTION_CLASS}
                  placeholder="ラベル"
                />
              </span>
              <span className={`text-right break-all ${CARD_BLOCK_BODY_CLASS} text-slate-800`}>
                <InlineEditable
                  value={row.value ?? ""}
                  onSave={(v) => {
                    const next = [...rows];
                    next[i] = { ...next[i], value: v };
                    update({ rows: next });
                  }}
                  editable={editable}
                  onActivate={onActivate}
                  className={`text-right ${CARD_BLOCK_BODY_CLASS} text-slate-800`}
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
