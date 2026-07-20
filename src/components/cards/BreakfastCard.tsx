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
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { InfoDetailList, InfoDetailRow } from "./facility-info-rows";
import { DESK_TONE } from "./desk-tone";
import { NativeDiningIcon } from "./native-guest-icons";
import { NativeHotelSection, NativeKvList, NativeKvRow } from "./native-hotel-ui";

type BreakfastCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

/** Desk-card breakfast with soft amber tint. */
export function BreakfastCard({ card, locale = "ja" }: BreakfastCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const tone = DESK_TONE.amber;
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { time: "시간", location: "장소", titlePlaceholder: "조식", menuPlaceholder: "메뉴", locationPlaceholder: "1층 다이닝" }
      : locale === "zh"
        ? { time: "时间", location: "地点", titlePlaceholder: "早餐", menuPlaceholder: "菜单", locationPlaceholder: "1层餐厅" }
        : locale === "en"
          ? { time: "Hours", location: "Venue", titlePlaceholder: "Breakfast", menuPlaceholder: "Menu", locationPlaceholder: "1F Dining" }
          : { time: "時間", location: "会場", titlePlaceholder: "朝食", menuPlaceholder: "メニュー", locationPlaceholder: "1F ダイニング" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const titleNode = (editable || title) ? (
    <InlineEditable
      value={title}
      onSave={(v) => updateKey("title", v)}
      editable={editable}
      onActivate={onActivate}
      className="app-section-header__title"
      placeholder={labels.titlePlaceholder}
    />
  ) : (
    title || labels.titlePlaceholder
  );

  if (isNativeUi) {
    return (
      <NativeHotelSection title={titleNode} icon={<NativeDiningIcon />} onActivate={onActivate}>
        <NativeKvList>
          <NativeKvRow label={labels.time}>
            <InlineEditable
              value={time}
              onSave={(v) => updateKey("time", v)}
              editable={editable}
              onActivate={onActivate}
              placeholder="7:00–9:30"
            />
          </NativeKvRow>
          <NativeKvRow label={labels.location}>
            <InlineEditable
              value={location}
              onSave={(v) => updateKey("location", v)}
              editable={editable}
              onActivate={onActivate}
              placeholder={labels.locationPlaceholder}
            />
          </NativeKvRow>
        </NativeKvList>
        {(editable || menu) ? (
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            <InlineEditable
              value={menu}
              onSave={(v) => updateKey("menu", v)}
              editable={editable}
              onActivate={onActivate}
              multiline
              className="block w-full min-h-[1lh] text-sm text-[var(--app-text-muted)]"
              placeholder={labels.menuPlaceholder}
            />
          </p>
        ) : null}
      </NativeHotelSection>
    );
  }

  return (
    <Card padding="md" style={{ backgroundColor: tone.surface }}>
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
            value={time}
            onSave={(v) => updateKey("time", v)}
            editable={editable}
            onActivate={onActivate}
            className={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
            placeholder="7:00–9:30"
          />
        </InfoDetailRow>
        <InfoDetailRow
          label={labels.location}
          labelClassName={tone.label}
          valueClassName={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
        >
          <InlineEditable
            value={location}
            onSave={(v) => updateKey("location", v)}
            editable={editable}
            onActivate={onActivate}
            className={`${CARD_BLOCK_BODY_CLASS} font-medium text-slate-900`}
            placeholder={labels.locationPlaceholder}
          />
        </InfoDetailRow>
      </InfoDetailList>

      {(editable || menu) ? (
        <p className={`mt-3 ${CARD_BLOCK_CAPTION_CLASS}`} style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={menu}
            onSave={(v) => updateKey("menu", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className={`block w-full min-h-[1lh] ${CARD_BLOCK_CAPTION_CLASS}`}
            placeholder={labels.menuPlaceholder}
          />
        </p>
      ) : null}
    </Card>
  );
}
