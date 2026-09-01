"use client";

import { BRAND_ACCENT } from "@/lib/brand-accent";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  normalizePhotoSplitItems,
  splitPhotoSplitBodyLines,
  type PhotoSplitItem,
} from "@/lib/editor/photo-split";

type PhotoSplitCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function PhotoSplitCard({ card, locale = "ja" }: PhotoSplitCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const items = normalizePhotoSplitItems(c?.items);
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : BRAND_ACCENT;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const updateItem = (index: number, patch: Partial<PhotoSplitItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    update({ items: next });
  };

  const labels =
    locale === "en"
      ? { title: "Title", body: "Description", photo: "Add a photo", empty: "Add a photo + text row" }
      : { title: "見出し", body: "説明文", photo: "写真を追加", empty: "写真＋テキストの列を追加" };

  return (
    <section className="pres-block pres-photo-split" style={{ ["--pres-accent" as string]: accent }}>
      {items.length === 0 ? (
        <p className="pres-photo-split__empty-block">{labels.empty}</p>
      ) : (
        items.map((item, index) => {
          const title = getLocalizedContent(item.title as LocalizedString | undefined, locale);
          const body = getLocalizedContent(item.body as LocalizedString | undefined, locale);
          const image = item.image?.trim() ?? "";
          const imageAlt = item.imageAlt?.trim() || title || labels.photo;
          const bodyLines = splitPhotoSplitBodyLines(body);
          const copyClass =
            "pres-photo-split__copy" +
            (item.mark === "bar" ? " pres-photo-split__copy--bar" : "");

          return (
            <article
              key={index}
              className="pres-photo-split__row"
              data-size={item.mediaSize}
              data-reverse={item.reverse ? "true" : "false"}
              data-align={item.align}
              data-valign={item.valign}
            >
              <div className="pres-photo-split__media">
                {image ? (
                  <EditorCoverImage
                    src={image}
                    alt={imageAlt}
                    sizes="(max-width: 420px) 55vw, 220px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="pres-photo-split__media-empty">{labels.photo}</div>
                )}
              </div>
              <div className="pres-photo-split__text">
                <div className={copyClass}>
                  {(editable || title) && (
                    <h3 className="pres-photo-split__title">
                      <InlineEditable
                        value={title}
                        onSave={(v) => updateItem(index, { title: v })}
                        editable={editable}
                        onActivate={onActivate}
                        className="pres-photo-split__title"
                        placeholder={labels.title}
                      />
                    </h3>
                  )}
                  {item.mark === "dots" ? (
                    <ul className="pres-photo-split__dots">
                      {bodyLines.map((line, lineIndex) =>
                        editable || line.trim() ? (
                          <li key={lineIndex}>
                            <InlineEditable
                              value={line}
                              onSave={(v) => {
                                const nextLines = [...bodyLines];
                                nextLines[lineIndex] = v;
                                updateItem(index, { body: nextLines.join("\n") });
                              }}
                              editable={editable}
                              onActivate={onActivate}
                              className="pres-photo-split__dot-line"
                              placeholder={labels.body}
                            />
                          </li>
                        ) : null,
                      )}
                    </ul>
                  ) : editable || body ? (
                    <p className="pres-photo-split__body">
                      <InlineEditable
                        value={body}
                        onSave={(v) => updateItem(index, { body: v })}
                        editable={editable}
                        onActivate={onActivate}
                        multiline
                        className="pres-photo-split__body"
                        placeholder={labels.body}
                      />
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
