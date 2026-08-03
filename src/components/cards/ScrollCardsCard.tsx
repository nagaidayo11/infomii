"use client";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type ScrollCardItem = {
  src?: string;
  label?: string;
  description?: string;
  linkType?: "page" | "url";
  pageSlug?: string;
  link?: string;
};

type ScrollCardsCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function ScrollCardsCard({ card, locale = "ja" }: ScrollCardsCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(c?.items) ? c.items : []) as ScrollCardItem[];

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const updateItem = (index: number, field: "label" | "description", value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    update({ items: next });
  };

  const getHref = (item: ScrollCardItem): string => {
    const linkType = item.linkType ?? "page";
    if (linkType === "url" && item.link) return resolveGuestHref(item.link);
    if (linkType === "page" && item.pageSlug) return resolveGuestHref(`/v/${item.pageSlug}`);
    return "#";
  };

  const isExternal = (href: string) =>
    href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:");

  const labels =
    locale === "en"
      ? { title: "Recommended", empty: "Add cards", label: "Label", desc: "Description", photo: "Photo" }
      : { title: "おすすめ", empty: "カードを追加", label: "ラベル", desc: "説明", photo: "写真" };

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
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{labels.empty}</p>
      ) : (
        <div className="pres-scroll-cards" role="list">
          {items.map((item, i) => {
            const label = getLocalizedContent(item.label as LocalizedString | undefined, locale);
            const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);
            const href = getHref(item);
            const inner = (
              <>
                <div className="pres-scroll-cards__media">
                  {item.src ? (
                    <EditorCoverImage
                      src={item.src}
                      alt={label || labels.photo}
                      sizes="220px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="pres-scroll-cards__empty">{labels.photo}</div>
                  )}
                </div>
                <div className="pres-scroll-cards__body">
                  <p className="pres-scroll-cards__label">
                    <InlineEditable
                      value={label}
                      onSave={(v) => updateItem(i, "label", v)}
                      editable={editable}
                      onActivate={onActivate}
                      className="pres-scroll-cards__label"
                      placeholder={labels.label}
                    />
                  </p>
                  {(editable || description) && (
                    <p className="pres-scroll-cards__desc">
                      <InlineEditable
                        value={description}
                        onSave={(v) => updateItem(i, "description", v)}
                        editable={editable}
                        onActivate={onActivate}
                        className="pres-scroll-cards__desc"
                        placeholder={labels.desc}
                      />
                    </p>
                  )}
                </div>
              </>
            );

            if (!editable && href && href !== "#") {
              return (
                <a
                  key={i}
                  href={href}
                  role="listitem"
                  className="pres-scroll-cards__card guest-page-link"
                  target={isExternal(href) ? "_blank" : undefined}
                  rel={isExternal(href) ? "noreferrer" : undefined}
                >
                  {inner}
                </a>
              );
            }

            return (
              <div
                key={i}
                role="listitem"
                className="pres-scroll-cards__card"
                onClick={editable ? onActivate : undefined}
              >
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
