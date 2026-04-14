"use client";

import { useMemo } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage, MenuItemThumb } from "@/components/cards/menu-card-visual";
import { getNowMinutesInTimezone, isMinutesInSlot, parseHHmmToMinutes } from "@/lib/menu-time-utils";

type Slot = {
  label?: string;
  start?: string;
  end?: string;
  items?: Array<Record<string, unknown>>;
};

const EMPTY_SLOTS: Slot[] = [];

export function MenuTimeBandCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "メニュー";
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

  const items = active?.items && Array.isArray(active.items) ? active.items : [];

  const inner = (
    <>
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        {title}
      </p>
      {active ? (
        <>
          <p
            className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-700"
            style={getBodyFontSizeStyle()}
          >
            {bandLabel}
            {active.label ? ` · ${active.label}` : ""}
          </p>
          <div className="mt-3 space-y-2.5">
            {items.map((item, index) => {
              const name = getLocalizedContent(item.name as LocalizedString | undefined, locale) || "";
              const price = getLocalizedContent(item.price as LocalizedString | undefined, locale);
              const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);
              const tag = getLocalizedContent(item.tag as LocalizedString | undefined, locale);
              const imageSrc = typeof item.imageSrc === "string" ? item.imageSrc : "";
              return (
                <div
                  key={index}
                  data-inner-surface
                  className={`flex gap-3 ${editorInnerRadiusClassName} border border-emerald-100 bg-emerald-50/40 p-2.5 shadow-sm`}
                >
                  <MenuItemThumb src={imageSrc} alt={item.imageAlt as LocalizedString | undefined} locale={locale} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-slate-900" style={getBodyFontSizeStyle()}>
                      {name}
                      {price ? ` — ${price}` : ""}
                      {tag ? (
                        <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                          {tag}
                        </span>
                      ) : null}
                    </p>
                    {description ? (
                      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
                        {description}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="px-4 py-3">{inner}</div>
      </Card>
    );
  }

  return <Card padding="md">{inner}</Card>;
}
