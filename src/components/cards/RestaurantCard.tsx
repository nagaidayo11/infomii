"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeDiningIcon } from "./native-guest-icons";
import { NativeHotelSection, NativeKvList, NativeKvRow } from "./native-hotel-ui";

type RestaurantCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function RestaurantCard({ card, isSelected, locale = "ja" }: RestaurantCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { time: "시간", location: "장소", titlePlaceholder: "레스토랑", menuPlaceholder: "메뉴" }
      : locale === "zh"
        ? { time: "时间", location: "地点", titlePlaceholder: "餐厅", menuPlaceholder: "菜单" }
        : locale === "en"
          ? { time: "Time", location: "Location", titlePlaceholder: "Restaurant", menuPlaceholder: "Menu" }
          : { time: "時間", location: "場所", titlePlaceholder: "レストラン", menuPlaceholder: "メニュー" };
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
              placeholder="7:00–22:00"
            />
          </NativeKvRow>
          <NativeKvRow label={labels.location}>
            <InlineEditable
              value={location}
              onSave={(v) => updateKey("location", v)}
              editable={editable}
              onActivate={onActivate}
              placeholder="1F"
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
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={editable} onActivate={onActivate} className={CARD_BLOCK_TITLE_CLASS} placeholder={labels.titlePlaceholder} />
        </p>
      ) : null}
      <div data-inner-surface className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.time}:{" "}
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={editable} onActivate={onActivate} className="text-slate-600" placeholder="7:00–22:00" />
      </p>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.location}:{" "}
        <InlineEditable value={location} onSave={(v) => updateKey("location", v)} editable={editable} onActivate={onActivate} className="text-slate-600" placeholder="1F" />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={menu} onSave={(v) => updateKey("menu", v)} editable={editable} onActivate={onActivate} multiline className="block w-full min-h-[1lh] text-slate-500" placeholder={labels.menuPlaceholder} />
      </p>
      </div>
    </Card>
  );
}
