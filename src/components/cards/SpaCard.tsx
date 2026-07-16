"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { InfoDetailList, InfoDetailRow } from "./facility-info-rows";
import { DESK_TONE } from "./desk-tone";

type SpaCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

function readField(c: Record<string, unknown> | undefined, keys: string[], locale: string): string {
  if (!c) return "";
  for (const key of keys) {
    const localized = getLocalizedContent(c[key] as LocalizedString | undefined, locale).trim();
    if (localized) return localized;
    if (typeof c[key] === "string" && (c[key] as string).trim()) return (c[key] as string).trim();
  }
  return "";
}

/** Desk-card spa/onsen with soft sky tint. */
export function SpaCard({ card, locale = "ja" }: SpaCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const tone = DESK_TONE.sky;
  const c = card.content as Record<string, unknown> | undefined;
  const hours = readField(c, ["hours", "time"], locale);
  const location = readField(c, ["location", "place"], locale);
  const guidance = readField(c, ["description", "menu"], locale);
  const note = readField(c, ["note"], locale);
  const labels =
    locale === "ko"
      ? {
          time: "시간",
          location: "장소",
          titlePlaceholder: "스파 · 온천",
          descPlaceholder: "안내（수건 등）",
          notePlaceholder: "비고",
        }
      : locale === "zh"
        ? {
            time: "时间",
            location: "地点",
            titlePlaceholder: "SPA / 温泉",
            descPlaceholder: "说明（毛巾等）",
            notePlaceholder: "备注",
          }
        : locale === "en"
          ? {
              time: "Hours",
              location: "Floor",
              titlePlaceholder: "Spa / Onsen",
              descPlaceholder: "Details (towels, etc.)",
              notePlaceholder: "Note",
            }
          : {
              time: "時間",
              location: "場所",
              titlePlaceholder: "スパ・温泉",
              descPlaceholder: "ご案内（タオルなど）",
              notePlaceholder: "備考",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const hoursKey = c && "time" in c && !("hours" in c) ? "time" : "hours";
  const locationKey = c && "place" in c && !("location" in c) ? "place" : "location";
  const guidanceKey = c && "menu" in c && !("description" in c) ? "menu" : "description";

  return (
    <Card padding="md" className={tone.frame} style={{ backgroundColor: tone.surface }}>
      {(editable || title) ? (
        <p className={`${CARD_BLOCK_TITLE_CLASS} ${tone.title}`} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={`${CARD_BLOCK_TITLE_CLASS} ${tone.title}`}
            placeholder={labels.titlePlaceholder}
          />
        </p>
      ) : null}

      <InfoDetailList divideClassName={tone.divide}>
        <InfoDetailRow
          label={labels.time}
          labelClassName={tone.label}
          valueClassName={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
        >
          <InlineEditable
            value={hours}
            onSave={(v) => updateKey(hoursKey, v)}
            editable={editable}
            onActivate={onActivate}
            className={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
            placeholder="15:00–24:00 / 6:00–10:00"
          />
        </InfoDetailRow>
        <InfoDetailRow
          label={labels.location}
          labelClassName={tone.label}
          valueClassName={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
        >
          <InlineEditable
            value={location}
            onSave={(v) => updateKey(locationKey, v)}
            editable={editable}
            onActivate={onActivate}
            className={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
            placeholder="2F"
          />
        </InfoDetailRow>
      </InfoDetailList>

      {(editable || guidance) ? (
        <p className={`mt-3 ${CARD_BLOCK_BODY_CLASS}`} style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={guidance}
            onSave={(v) => updateKey(guidanceKey, v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className={`block w-full min-h-[1lh] ${CARD_BLOCK_BODY_CLASS}`}
            placeholder={labels.descPlaceholder}
          />
        </p>
      ) : null}

      {(editable || note) ? (
        <p className={`mt-2 ${CARD_BLOCK_CAPTION_CLASS} ${tone.label}`}>
          <InlineEditable
            value={note}
            onSave={(v) => updateKey("note", v)}
            editable={editable}
            onActivate={onActivate}
            className={`block w-full min-h-[1lh] ${CARD_BLOCK_CAPTION_CLASS} ${tone.label}`}
            placeholder={labels.notePlaceholder}
          />
        </p>
      ) : null}
    </Card>
  );
}
