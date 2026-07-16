"use client";

import type { CSSProperties } from "react";
import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  CARD_CONTENT_INSET,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";

type HeadingBodyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function HeadingBodyCard({ card, isSelected = false }: HeadingBodyCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = (card.content ?? {}) as Record<string, unknown>;

  const title = typeof c.title === "string" ? c.title : "";
  const body = typeof c.body === "string" ? c.body : "";
  const dividerEnabled = c.dividerEnabled === true;
  const dividerStyle = c.dividerStyle === "dashed" ? "dashed" : "solid";

  const update = (key: "title" | "body", value: string) => {
    updateCard(card.id, { content: { ...c, [key]: value } });
  };
  const dividerClass = dividerStyle === "dashed" ? "border-dashed" : "border-solid";
  const dividerStyleObj: CSSProperties = {
    borderTopWidth: 1,
    borderTopColor: "rgb(203 213 225 / 0.9)",
  };

  return (
    <Card padding="none" hover>
      <section data-inner-surface className={`${editorInnerRadiusClassName} bg-white ${CARD_CONTENT_INSET}`}>
        <h3 className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update("title", v)}
            editable={editable}
            onActivate={onActivate}
            placeholder="見出しテキスト"
            className={CARD_BLOCK_TITLE_CLASS}
          />
        </h3>
        {dividerEnabled ? <div className={`my-2.5 border-t ${dividerClass}`} style={dividerStyleObj} /> : null}
        <div className={`${CARD_BLOCK_BODY_CLASS} text-slate-700`} style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={body}
            onSave={(v) => update("body", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            placeholder="本文テキスト"
            className={`${CARD_BLOCK_BODY_CLASS} text-slate-700`}
          />
        </div>
      </section>
    </Card>
  );
}
