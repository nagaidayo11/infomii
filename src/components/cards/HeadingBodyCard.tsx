"use client";

import type { CSSProperties } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type HeadingBodyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function HeadingBodyCard({ card, isSelected = false }: HeadingBodyCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = (card.content ?? {}) as Record<string, unknown>;

  const title = typeof c.title === "string" ? c.title : "";
  const body = typeof c.body === "string" ? c.body : "";
  const dividerEnabled = c.dividerEnabled === true;
  const dividerStyle = c.dividerStyle === "dashed" ? "dashed" : "solid";

  const update = (key: "title" | "body", value: string) => {
    updateCard(card.id, { content: { ...c, [key]: value } });
  };

  const onActivate = () => selectCard(card.id);
  const dividerClass = dividerStyle === "dashed" ? "border-dashed" : "border-solid";
  const dividerStyleObj: CSSProperties = {
    borderTopWidth: 1,
    borderTopColor: "rgb(203 213 225 / 0.9)",
  };

  return (
    <Card padding="none" hover>
      <section data-inner-surface className={`${editorInnerRadiusClassName} bg-slate-50/80 px-3 py-3`}>
        <h3 className="font-semibold leading-tight text-slate-900" style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update("title", v)}
            editable={isSelected}
            onActivate={onActivate}
            placeholder="見出しテキスト"
            className="font-semibold text-slate-900"
          />
        </h3>
        {dividerEnabled ? <div className={`my-2.5 border-t ${dividerClass}`} style={dividerStyleObj} /> : null}
        <div className="text-slate-700" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={body}
            onSave={(v) => update("body", v)}
            editable={isSelected}
            onActivate={onActivate}
            multiline
            placeholder="本文テキスト"
            className="leading-relaxed text-slate-700"
          />
        </div>
      </section>
    </Card>
  );
}
