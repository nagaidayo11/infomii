"use client";

import { useState } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
import { SCHEDULE_ICON_CHOICES, NativeScheduleDot, scheduleGlyphForItem } from "@/components/cards/native-guest-icons";

type ScheduleItem = { day?: string; time?: string; label?: string; icon?: string };

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

type ScheduleNativeSettingsProps = {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
  isBusinessEnabled: boolean;
};

export function ScheduleNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
  isBusinessEnabled,
}: ScheduleNativeSettingsProps) {
  const items = (Array.isArray(content.items) ? content.items : []) as ScheduleItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const dynamicEnabled = content.dynamicEnabled === true;

  const setItems = (next: ScheduleItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => {
    const next = [
      ...items,
      { day: "", time: "", label: "", icon: SCHEDULE_ICON_CHOICES[items.length % SCHEDULE_ICON_CHOICES.length] },
    ];
    setItems(next);
    setExpandedIndex(next.length - 1);
  };
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setExpandedIndex((cur) => {
      if (cur == null) return null;
      if (cur === index) return null;
      if (cur > index) return cur - 1;
      return cur;
    });
  };
  const moveItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setItems(next);
    setExpandedIndex(target);
  };

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel htmlFor="native-schedule-title">タイトル</AppFieldLabel>
        <AppFieldInput
          id="native-schedule-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="今日の予定"
        />
      </div>

      <div>
        <AppSectionHeader
          title="日程項目"
          trailing={
            <button type="button" onClick={addItem} className="app-native-add-btn ui-pop-tap">
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-[var(--app-text-muted)]">日程を追加してください</p>
          ) : (
            items.map((item, i) => {
              const day = readJaText(item.day) || "区分";
              const time = readJaText(item.time);
              const label = readJaText(item.label);
              const glyph = scheduleGlyphForItem(item.icon, i);
              const expanded = expandedIndex === i;
              return (
                <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    leading={<NativeScheduleDot icon={item.icon} index={i} size={16} />}
                    title={time ? `${day} ${time}` : day}
                    subtitle={label || "補足未設定"}
                    onClick={() => setExpandedIndex(expanded ? null : i)}
                    trailing={
                      <svg
                        className={
                          "h-5 w-5 shrink-0 text-[var(--app-text-muted)] opacity-60 transition-transform " +
                          (expanded ? "rotate-90" : "")
                        }
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => moveItem(i, -1)}
                          disabled={i === 0}
                          className="app-native-settings-action disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(i, 1)}
                          disabled={i === items.length - 1}
                          className="app-native-settings-action disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="app-native-settings-action app-native-settings-action--danger"
                        >
                          削除
                        </button>
                      </div>
                      <div>
                        <AppFieldLabel>アイコン</AppFieldLabel>
                        <div className="app-native-icon-pick" role="listbox" aria-label="項目アイコン">
                          {SCHEDULE_ICON_CHOICES.map((choice, choiceIndex) => {
                            const selected = glyph === choice;
                            return (
                              <button
                                key={choice}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className={
                                  "app-native-icon-pick__btn ui-pop-tap" +
                                  (selected ? " app-native-icon-pick__btn--active" : "")
                                }
                                onClick={() => updateItem(i, "icon", choice)}
                              >
                                <NativeScheduleDot icon={choice} index={choiceIndex} size={18} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <AppFieldLabel>曜日・区分</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.day)}
                          onChange={(e) => updateItem(i, "day", e.target.value)}
                          placeholder="1日目"
                        />
                      </div>
                      <div>
                        <AppFieldLabel>時間</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.time)}
                          onChange={(e) => updateItem(i, "time", e.target.value)}
                          placeholder="12:40"
                        />
                      </div>
                      <div>
                        <AppFieldLabel>補足</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.label)}
                          onChange={(e) => updateItem(i, "label", e.target.value)}
                          placeholder="那覇着・レンタカー拾う"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--app-text)]">動的強調（Business）</p>
          <label className="inline-flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
            <input
              type="checkbox"
              checked={dynamicEnabled}
              disabled={!isBusinessEnabled}
              onChange={(e) => onUpdate("dynamicEnabled", e.target.checked)}
              className="rounded border-[var(--app-border)]"
            />
            有効
          </label>
        </div>
        {!isBusinessEnabled ? (
          <p className="mt-2 text-xs leading-relaxed text-amber-800">
            Businessプランで利用できます。未加入時は静的表示になります。
          </p>
        ) : (
          <div className="mt-3">
            <AppFieldLabel>タイムゾーン</AppFieldLabel>
            <AppFieldInput
              value={typeof content.timezone === "string" ? content.timezone : "Asia/Tokyo"}
              onChange={(e) => onUpdate("timezone", e.target.value.trim() || "Asia/Tokyo")}
              placeholder="Asia/Tokyo"
            />
            <p className="mt-2 text-xs text-[var(--app-text-muted)]">
              詳細な動的ルールは Web 版の設定パネルから編集できます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
