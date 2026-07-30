"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type SectionTitleCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function SectionTitleCard({ card, locale = "ja" }: SectionTitleCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const subtitle = getLocalizedContent(c?.subtitle as LocalizedString | undefined, locale);
  const align = c?.align === "center" ? "center" : "left";
  const showLine = c?.showLine !== false;
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const placeholders =
    locale === "en"
      ? { title: "Section title", subtitle: "Supporting line" }
      : { title: "セクション見出し", subtitle: "補足の一文" };

  return (
    <section
      className="pres-block pres-section-title"
      data-align={align}
      style={{ ["--pres-accent" as string]: accent }}
    >
      <h2 className="pres-section-title__heading">
        <InlineEditable
          value={title}
          onSave={(v) => update({ title: v })}
          editable={editable}
          onActivate={onActivate}
          className="pres-section-title__heading"
          placeholder={placeholders.title}
        />
      </h2>
      {showLine ? <div className="pres-section-title__line" aria-hidden /> : null}
      {(editable || subtitle) && (
        <p className="pres-section-title__sub">
          <InlineEditable
            value={subtitle}
            onSave={(v) => update({ subtitle: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-section-title__sub"
            placeholder={placeholders.subtitle}
          />
        </p>
      )}
    </section>
  );
}
