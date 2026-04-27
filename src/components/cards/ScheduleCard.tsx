"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

type ScheduleCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
  businessFeaturesEnabled?: boolean;
};

type ScheduleRule = {
  itemIndex?: number;
  days?: number[];
  start?: string;
  end?: string;
  startDate?: string;
  endDate?: string;
};

function parseHourMinute(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h * 60 + min;
}

function isRuleActive(rule: ScheduleRule, now: Date): boolean {
  const day = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const days = Array.isArray(rule.days) ? rule.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : [];
  if (days.length > 0 && !days.includes(day)) return false;

  const startMinutes = parseHourMinute(typeof rule.start === "string" ? rule.start : undefined);
  const endMinutes = parseHourMinute(typeof rule.end === "string" ? rule.end : undefined);
  if (startMinutes != null && endMinutes != null) {
    // Overnight range support (e.g. 22:00-02:00)
    const inTimeRange =
      startMinutes <= endMinutes
        ? nowMinutes >= startMinutes && nowMinutes <= endMinutes
        : nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    if (!inTimeRange) return false;
  }

  if (typeof rule.startDate === "string" && rule.startDate.trim()) {
    const d = new Date(rule.startDate);
    if (!Number.isNaN(d.getTime()) && now.getTime() < d.getTime()) return false;
  }
  if (typeof rule.endDate === "string" && rule.endDate.trim()) {
    const d = new Date(rule.endDate);
    if (!Number.isNaN(d.getTime()) && now.getTime() > d.getTime()) return false;
  }

  return true;
}

function toDateInTimeZone(base: Date, timeZone: string): Date {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(base);
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const year = Number(map.year);
    const month = Number(map.month);
    const day = Number(map.day);
    const hour = Number(map.hour);
    const minute = Number(map.minute);
    const second = Number(map.second);
    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day) &&
      Number.isFinite(hour) &&
      Number.isFinite(minute) &&
      Number.isFinite(second)
    ) {
      return new Date(year, month - 1, day, hour, minute, second);
    }
  } catch {
    // Ignore invalid timezone and fallback to local date.
  }
  return base;
}

export function ScheduleCard({
  card,
  locale = "ja",
  businessFeaturesEnabled = false,
}: ScheduleCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko" ? { title: "운영 시간", day: "구분" } :
    locale === "zh" ? { title: "营业时间", day: "分类" } :
    locale === "en" ? { title: "Opening Hours", day: "Category" } :
    { title: "営業時間", day: "区分" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  const dynamicEnabled = c?.dynamicEnabled === true && businessFeaturesEnabled;
  const timezone = typeof c?.timezone === "string" && c.timezone.trim() ? c.timezone.trim() : "Asia/Tokyo";
  const rules = Array.isArray(c?.rules) ? (c?.rules as ScheduleRule[]) : [];
  const activeIndices = (() => {
    if (!dynamicEnabled || rules.length === 0) return new Set<number>();
    const now = toDateInTimeZone(new Date(), timezone);
    const next = new Set<number>();
    rules.forEach((rule) => {
      if (!isRuleActive(rule, now)) return;
      if (typeof rule.itemIndex === "number" && rule.itemIndex >= 0) next.add(rule.itemIndex);
    });
    return next;
  })();
  const hasActiveRows = activeIndices.size > 0;

  return (
    <Card padding="md" className="">
      <div className="flex items-center justify-between gap-2">
        {title ? <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>{title}</p> : null}
        {dynamicEnabled ? (
          <span
            className={
              "ui-pop-badge inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold " +
              (hasActiveRows ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700")
            }
            aria-live="polite"
          >
            {hasActiveRows ? "Now" : "Closed"}
          </span>
        ) : null}
      </div>
      <div className="mt-2 space-y-1.5">
        {items.slice(0, 5).map((item, index) => {
          const day = getLocalizedContent(item.day as LocalizedString | undefined, locale) || labels.day;
          const time = getLocalizedContent(item.time as LocalizedString | undefined, locale) || "-";
          const label = getLocalizedContent(item.label as LocalizedString | undefined, locale);
          const active = activeIndices.has(index);
          return (
            <div
              key={index}
              data-inner-surface
              className={
                `${editorInnerRadiusClassName} px-2.5 py-2 ` +
                (dynamicEnabled && active
                  ? "ui-pop-appear border border-emerald-200 bg-emerald-50/90"
                  : "bg-slate-50")
              }
            >
              <p className="font-normal text-slate-700" style={getBodyFontSizeStyle()}>{day}: {time}</p>
              {label ? <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>{label}</p> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
