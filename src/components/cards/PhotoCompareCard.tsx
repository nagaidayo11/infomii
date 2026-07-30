"use client";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type PhotoCompareCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function PhotoCompareCard({ card, locale = "ja" }: PhotoCompareCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const caption = getLocalizedContent(c?.caption as LocalizedString | undefined, locale);
  const leftSrc = typeof c?.leftSrc === "string" ? c.leftSrc : "";
  const rightSrc = typeof c?.rightSrc === "string" ? c.rightSrc : "";
  const leftLabel = getLocalizedContent(c?.leftLabel as LocalizedString | undefined, locale);
  const rightLabel = getLocalizedContent(c?.rightLabel as LocalizedString | undefined, locale);

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const labels =
    locale === "en"
      ? { title: "Compare", left: "Left", right: "Right", caption: "Caption", photo: "Photo" }
      : { title: "写真で比較", left: "左", right: "右", caption: "キャプション", photo: "写真" };

  const side = (
    src: string,
    label: string,
    labelKey: "leftLabel" | "rightLabel",
    placeholder: string,
  ) => (
    <div className="pres-photo-compare__side">
      <div className="pres-photo-compare__media">
        {src ? (
          <EditorCoverImage src={src} alt={label || labels.photo} sizes="200px" className="object-cover object-center" />
        ) : (
          <div className="pres-photo-compare__empty">{labels.photo}</div>
        )}
      </div>
      <p className="pres-photo-compare__label">
        <InlineEditable
          value={label}
          onSave={(v) => update({ [labelKey]: v })}
          editable={editable}
          onActivate={onActivate}
          className="pres-photo-compare__label"
          placeholder={placeholder}
        />
      </p>
    </div>
  );

  return (
    <section className="pres-block">
      {(editable || title) && (
        <h3 className="pres-block__title">
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-block__title"
            placeholder={labels.title}
          />
        </h3>
      )}
      <div className="pres-photo-compare">
        {side(leftSrc, leftLabel, "leftLabel", labels.left)}
        {side(rightSrc, rightLabel, "rightLabel", labels.right)}
      </div>
      {(editable || caption) && (
        <p className="pres-photo-compare__caption">
          <InlineEditable
            value={caption}
            onSave={(v) => update({ caption: v })}
            editable={editable}
            onActivate={onActivate}
            multiline
            className="pres-photo-compare__caption"
            placeholder={labels.caption}
          />
        </p>
      )}
    </section>
  );
}
