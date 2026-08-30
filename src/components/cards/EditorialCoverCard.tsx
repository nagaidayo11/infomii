"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type EditorialCoverCardProps = {
  card: EditorCard;
  locale?: string;
};

/**
 * Full-bleed lookbook cover: tall photo, huge title, one operational fact.
 */
export function EditorialCoverCard({ card, locale = "ja" }: EditorialCoverCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const kicker = getLocalizedContent(c?.kicker as LocalizedString | undefined, locale);
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const fact = getLocalizedContent(c?.fact as LocalizedString | undefined, locale);
  const image = typeof c?.image === "string" ? c.image : "";
  const imageAlt = typeof c?.imageAlt === "string" ? c.imageAlt : title || "カバー";
  const href = typeof c?.href === "string" ? c.href.trim() : "";
  const size = c?.size === "chapter" ? "chapter" : "cover";

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const placeholders =
    locale === "en"
      ? { kicker: "Place", title: "Title", fact: "One useful line", empty: "Add a photo" }
      : { kicker: "場所", title: "タイトル", fact: "いま知りたい一行", empty: "写真を追加" };

  const copy = (
    <div className="pres-editorial-cover__copy">
      {(editable || kicker) && (
        <p className="pres-editorial-cover__kicker">
          <InlineEditable
            value={kicker}
            onSave={(v) => update({ kicker: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-editorial-cover__kicker"
            placeholder={placeholders.kicker}
          />
        </p>
      )}
      {(editable || title) && (
        <h2 className="pres-editorial-cover__title">
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-editorial-cover__title"
            placeholder={placeholders.title}
          />
        </h2>
      )}
      {(editable || fact) && (
        <p className="pres-editorial-cover__fact">
          <InlineEditable
            value={fact}
            onSave={(v) => update({ fact: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-editorial-cover__fact"
            placeholder={placeholders.fact}
          />
        </p>
      )}
    </div>
  );

  return (
    <section className="pres-editorial-cover" data-size={size}>
      <div className="pres-editorial-cover__media">
        {image ? (
          <EditorCoverImage src={image} alt={imageAlt} sizes="100vw" className="object-cover object-center" />
        ) : (
          <div className="pres-editorial-cover__empty">{placeholders.empty}</div>
        )}
        <div className="pres-editorial-cover__shade" aria-hidden />
        {href && !editable ? (
          <Link href={href} className="pres-editorial-cover__hit guest-page-link">
            {copy}
          </Link>
        ) : (
          copy
        )}
      </div>
    </section>
  );
}
