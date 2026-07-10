"use client";

import { useMemo } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage } from "@/components/cards/menu-card-visual";
import { getNowMinutesInTimezone, isMinutesInSlot, parseHHmmToMinutes } from "@/lib/menu-time-utils";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, MenuItemInlineRow, PlainInline } from "./card-inline-fields";

type Slot = {
  label?: string;
  start?: string;
  end?: string;
  items?: Array<Record<string, unknown>>;
};

const EMPTY_SLOTS: Slot[] = [];

export function MenuTimeBandCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const bandLabel =
    getLocalizedContent(c?.currentBandLabel as LocalizedString | undefined, locale) || "ただいまのメニュー";
  const outsideMessage =
    getLocalizedContent(c?.outsideMessage as LocalizedString | undefined, locale) ||
    "現在この時間帯の提供メニューはありません。";
  const tz = typeof c?.timezone === "string" && c.timezone.trim() ? c.timezone.trim() : "Asia/Tokyo";
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const hasHero = heroSrc.trim().length > 0;
  const slots = useMemo(() => {
    return Array.isArray(c?.slots) ? (c.slots as Slot[]) : EMPTY_SLOTS;
  }, [c?.slots]);

  const active = useMemo(() => {
    const now = new Date();
    const cur = getNowMinutesInTimezone(now, tz);
    for (const slot of slots) {
      const start = parseHHmmToMinutes(String(slot.start ?? "0:00"));
      const end = parseHHmmToMinutes(String(slot.end ?? "0:00"));
      if (isMinutesInSlot(cur, start, end)) {
        return slot;
      }
    }
    return null;
  }, [slots, tz]);

  const renderSlotItems = (slot: Slot, slotIndex: number) => {
    const items = slot?.items && Array.isArray(slot.items) ? slot.items : [];
    return (
      <div className="mt-2 space-y-2.5">
        {items.map((item, itemIndex) => (
          <MenuItemInlineRow
            key={itemIndex}
            locale={locale}
            bind={bind}
            name={getLocalizedContent(item.name as LocalizedString | undefined, locale)}
            price={getLocalizedContent(item.price as LocalizedString | undefined, locale)}
            description={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
            tag={getLocalizedContent(item.tag as LocalizedString | undefined, locale)}
            imageSrc={typeof item.imageSrc === "string" ? item.imageSrc : ""}
            imageAlt={item.imageAlt as LocalizedString | undefined}
            rowClassName={`flex gap-3 ${editorInnerRadiusClassName} border border-emerald-100 bg-emerald-50/40 p-2.5 shadow-sm`}
            onSaveName={(v) => editor.setTimeBandSlotItemField(slotIndex, itemIndex, "name", v)}
            onSavePrice={(v) => editor.setTimeBandSlotItemField(slotIndex, itemIndex, "price", v)}
            onSaveDescription={(v) => editor.setTimeBandSlotItemField(slotIndex, itemIndex, "description", v)}
            onSaveTag={(v) => editor.setTimeBandSlotItemField(slotIndex, itemIndex, "tag", v)}
          />
        ))}
      </div>
    );
  };

  const inner = bind.editable ? (
    <>
      <CardTitleInline title={title} onSave={(v) => editor.setField("title", v)} placeholder="メニュー" bind={bind} />
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-700" style={getBodyFontSizeStyle()}>
        <PlainInline
          value={bandLabel}
          onSave={(v) => editor.setField("currentBandLabel", v)}
          bind={bind}
          className="text-xs font-medium text-emerald-700"
          placeholder="帯ラベル"
        />
      </p>
      <div className="mt-3 space-y-4">
        {slots.map((slot, slotIndex) => (
          <div
            key={slotIndex}
            data-inner-surface
            className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50/80 p-3`}
          >
            <p className="text-xs font-semibold text-slate-600">
              <PlainInline
                value={getLocalizedContent(slot.label as LocalizedString | undefined, locale)}
                onSave={(v) => editor.setTimeBandSlotField(slotIndex, "label", v)}
                bind={bind}
                className="text-xs font-semibold text-slate-700"
                placeholder="時間帯名"
              />
              <span className="ml-2 font-normal text-slate-400">
                {String(slot.start ?? "")} – {String(slot.end ?? "")}
              </span>
            </p>
            {renderSlotItems(slot, slotIndex)}
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600" style={getBodyFontSizeStyle()}>
        <span className="text-xs text-slate-500">時間外メッセージ: </span>
        <PlainInline
          value={outsideMessage}
          onSave={(v) => editor.setField("outsideMessage", v)}
          bind={bind}
          multiline
          className="block w-full min-h-[1lh] text-sm text-slate-600"
          placeholder="時間外メッセージ"
        />
      </p>
    </>
  ) : (
    <>
      {title ? (
        <p className="font-semibold text-slate-900" style={getTitleFontSizeStyle()}>
          {title}
        </p>
      ) : null}
      {active ? (
        <>
          <p
            className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-700"
            style={getBodyFontSizeStyle()}
          >
            {bandLabel}
            {active.label ? ` · ${active.label}` : ""}
          </p>
          {renderSlotItems(
            active,
            slots.findIndex(
              (s) => s.start === active.start && s.end === active.end && s.label === active.label,
            ),
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600" style={getBodyFontSizeStyle()}>
          {outsideMessage}
        </p>
      )}
    </>
  );

  if (hasHero) {
    return (
      <Card padding="none" className="overflow-hidden">
        <MenuCardHeroImage heroSrc={heroSrc} heroAlt={heroAlt} locale={locale} />
        <div className="px-3 py-3">{inner}</div>
      </Card>
    );
  }

  return <Card padding="md">{inner}</Card>;
}
