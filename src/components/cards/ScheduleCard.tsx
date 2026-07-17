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
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeCalendarIcon, scheduleGlyphForItem } from "./native-guest-icons";

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

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

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
  const updateCard = useEditor2Store((s) => s.updateCard);
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "운영 시간", day: "구분", time: "시간", label: "메모", titlePh: "제목" }
      : locale === "zh"
        ? { title: "营业时间", day: "分类", time: "时间", label: "备注", titlePh: "标题" }
        : locale === "en"
          ? { title: "Opening Hours", day: "Category", time: "Time", label: "Note", titlePh: "Title" }
          : { title: "予定・日程", day: "区分", time: "時間", label: "補足", titlePh: "見出し" };
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

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const updateItem = (index: number, field: "day" | "time" | "label", value: string) => {
    const next = [...items];
    const row = { ...(next[index] ?? {}) } as Record<string, unknown>;
    const cur = row[field];
    row[field] = isLocalizedObj(cur) ? { ...cur, ja: value } : value;
    next[index] = row;
    updateCard(card.id, { content: { ...c, items: next } });
  };

  /* Phase 1+: native UI (guest + editor preview) */
  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <AppSectionHeader title={title || labels.title} icon={<NativeCalendarIcon />} />
          </div>
          {dynamicEnabled ? (
            <span
              className={
                "ui-pop-badge mt-0.5 inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold " +
                (hasActiveRows ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700")
              }
              aria-live="polite"
            >
              {hasActiveRows ? "Now" : "Closed"}
            </span>
          ) : null}
        </div>
        <div className="app-native-schedule-list">
          {items.slice(0, 5).map((item, index) => {
            const day =
              getLocalizedContent(item.day as LocalizedString | undefined, locale) || labels.day;
            const time =
              getLocalizedContent(item.time as LocalizedString | undefined, locale) || "-";
            const label = getLocalizedContent(item.label as LocalizedString | undefined, locale);
            const active = activeIndices.has(index);
            return (
              <div key={index} className="app-native-schedule-row">
                <div className="app-native-schedule-rail">
                  <span className="app-native-schedule-dot" aria-hidden>
                    {scheduleGlyphForItem(item.icon, index)}
                  </span>
                </div>
                <div
                  className={
                    "app-native-schedule-body " + (dynamicEnabled && active ? "app-native-schedule-body--active" : "")
                  }
                >
                  <p className="font-semibold text-[var(--app-text)]" style={getBodyFontSizeStyle()}>
                    {day}
                    {time && time !== "-" ? ` ${time}` : ""}
                  </p>
                  {label ? (
                    <p className="mt-0.5 text-[var(--app-text-muted)]" style={getBodyFontSizeStyle()}>
                      {label}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card padding="md" className="">
      <div className="flex items-center justify-between gap-2">
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePh}
          />
        </p>
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
          const day =
            getLocalizedContent(item.day as LocalizedString | undefined, locale) || labels.day;
          const time =
            getLocalizedContent(item.time as LocalizedString | undefined, locale) || "-";
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
              <p className="font-normal text-slate-700" style={getBodyFontSizeStyle()}>
                <InlineEditable
                  value={day}
                  onSave={(v) => updateItem(index, "day", v)}
                  editable={editable}
                  onActivate={onActivate}
                  className="inline font-normal text-slate-700"
                  placeholder={labels.day}
                />
                {": "}
                <InlineEditable
                  value={time === "-" ? "" : time}
                  onSave={(v) => updateItem(index, "time", v)}
                  editable={editable}
                  onActivate={onActivate}
                  className="inline font-normal text-slate-700"
                  placeholder={labels.time}
                />
              </p>
              <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                <InlineEditable
                  value={label}
                  onSave={(v) => updateItem(index, "label", v)}
                  editable={editable}
                  onActivate={onActivate}
                  multiline
                  className="block w-full min-h-[1lh] text-slate-500"
                  placeholder={labels.label}
                />
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
