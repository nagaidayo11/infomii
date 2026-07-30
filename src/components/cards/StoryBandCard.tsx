"use client";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type StoryBandCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function StoryBandCard({ card, locale = "ja" }: StoryBandCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const eyebrow = getLocalizedContent(c?.eyebrow as LocalizedString | undefined, locale);
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const caption = getLocalizedContent(c?.caption as LocalizedString | undefined, locale);
  const image = typeof c?.image === "string" ? c.image : "";
  const imageAlt = typeof c?.imageAlt === "string" ? c.imageAlt : title || "イメージ";
  const overlay = c?.overlay !== false;
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const placeholders =
    locale === "en"
      ? { eyebrow: "Eyebrow", title: "Title", caption: "Caption", empty: "Add a photo" }
      : { eyebrow: "短い見出し", title: "タイトル", caption: "キャプション", empty: "写真を追加" };

  const textBlock = (
    <div className={overlay ? "pres-story-band__copy" : "pres-story-band__copy-below"}>
      {(editable || eyebrow) && (
        <p className="pres-story-band__eyebrow" style={{ color: overlay ? undefined : accent }}>
          <InlineEditable
            value={eyebrow}
            onSave={(v) => update({ eyebrow: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-story-band__eyebrow"
            placeholder={placeholders.eyebrow}
          />
        </p>
      )}
      {(editable || title) && (
        <h3 className="pres-story-band__title">
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-story-band__title"
            placeholder={placeholders.title}
          />
        </h3>
      )}
      {(editable || caption) && (
        <p className="pres-story-band__caption">
          <InlineEditable
            value={caption}
            onSave={(v) => update({ caption: v })}
            editable={editable}
            onActivate={onActivate}
            multiline
            className="pres-story-band__caption"
            placeholder={placeholders.caption}
          />
        </p>
      )}
    </div>
  );

  return (
    <section className="pres-block pres-story-band" style={{ ["--pres-accent" as string]: accent }}>
      <div className={overlay ? "pres-story-band__media" : "pres-story-band__media pres-story-band__media--plain"}>
        {image ? (
          <EditorCoverImage src={image} alt={imageAlt} sizes="420px" className="object-cover object-center" />
        ) : (
          <div className="pres-story-band__empty">{placeholders.empty}</div>
        )}
        {overlay ? <div className="pres-story-band__shade" aria-hidden /> : null}
        {overlay ? textBlock : null}
      </div>
      {!overlay ? textBlock : null}
    </section>
  );
}
