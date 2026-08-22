"use client";

import { BRAND_ACCENT } from "@/lib/brand-accent";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type TimelineItem = { time?: string; title?: string; description?: string };
type DayTimelineCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function DayTimelineCard({ card, locale = "ja" }: DayTimelineCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(c?.items) ? c.items : []) as TimelineItem[];
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : BRAND_ACCENT;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const updateItem = (index: number, field: keyof TimelineItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    update({ items: next });
  };

  const labels =
    locale === "en"
      ? { title: "Timeline", empty: "Add timeline items", time: "Time", item: "Title", desc: "Details" }
      : { title: "タイムライン", empty: "項目を追加", time: "時刻", item: "タイトル", desc: "説明" };

  return (
    <section className="pres-block" style={{ ["--pres-accent" as string]: accent }}>
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
        <ol className="pres-timeline">
          {items.map((item, i) => (
            <li key={i} className="pres-timeline__item">
              <div className="pres-timeline__rail" aria-hidden>
                <span className="pres-timeline__dot" />
                {i < items.length - 1 ? <span className="pres-timeline__line" /> : null}
              </div>
              <div className="pres-timeline__body">
                <p className="pres-timeline__time">
                  <InlineEditable
                    value={getLocalizedContent(item.time as LocalizedString | undefined, locale)}
                    onSave={(v) => updateItem(i, "time", v)}
                    editable={editable}
                    onActivate={onActivate}
                    className="pres-timeline__time"
                    placeholder={labels.time}
                  />
                </p>
                <p className="pres-timeline__title">
                  <InlineEditable
                    value={getLocalizedContent(item.title as LocalizedString | undefined, locale)}
                    onSave={(v) => updateItem(i, "title", v)}
                    editable={editable}
                    onActivate={onActivate}
                    className="pres-timeline__title"
                    placeholder={labels.item}
                  />
                </p>
                {(editable || item.description) && (
                  <p className="pres-timeline__desc">
                    <InlineEditable
                      value={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
                      onSave={(v) => updateItem(i, "description", v)}
                      editable={editable}
                      onActivate={onActivate}
                      multiline
                      className="pres-timeline__desc"
                      placeholder={labels.desc}
                    />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
