"use client";

import { useState } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";

type TabsInfoItem = { label?: string; body?: string };

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

type TabsInfoNativeSettingsProps = {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
};

export function TabsInfoNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: TabsInfoNativeSettingsProps) {
  const items = (Array.isArray(content.tabs) ? content.tabs : []) as TabsInfoItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const defaultIndex =
    typeof content.defaultIndex === "number"
      ? content.defaultIndex
      : Number(content.defaultIndex) || 0;

  const setItems = (next: TabsInfoItem[]) => onUpdate("tabs", next);
  const updateItem = (index: number, field: keyof TabsInfoItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => {
    const next = [...items, { label: `タブ ${items.length + 1}`, body: "" }];
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
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(to, 0, row);
    setItems(next);
    setExpandedIndex(to);
  };

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel htmlFor="native-tabs-title">タイトル</AppFieldLabel>
        <AppFieldInput
          id="native-tabs-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="誰が何やるか"
        />
      </div>

      <div>
        <AppFieldLabel htmlFor="native-tabs-default">初期表示タブ（0始まり）</AppFieldLabel>
        <AppFieldInput
          id="native-tabs-default"
          type="number"
          min={0}
          max={10}
          value={String(defaultIndex)}
          onChange={(e) => onUpdate("defaultIndex", Number(e.target.value) || 0)}
        />
      </div>

      <div>
        <AppSectionHeader
          title="タブ項目"
          trailing={
            <button type="button" onClick={addItem} className="app-native-add-btn ui-pop-tap">
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-[var(--app-text-muted)]">タブを追加してください</p>
          ) : (
            items.map((item, i) => {
              const label = readJaText(item.label) || `タブ ${i + 1}`;
              const body = readJaText(item.body);
              const expanded = expandedIndex === i;
              return (
                <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={label}
                    subtitle={body ? body.slice(0, 40) + (body.length > 40 ? "…" : "") : "本文未設定"}
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
                        <AppFieldLabel>タブラベル</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.label)}
                          onChange={(e) => updateItem(i, "label", e.target.value)}
                          placeholder={`タブ ${i + 1}`}
                        />
                      </div>
                      <div>
                        <AppFieldLabel>本文</AppFieldLabel>
                        <textarea
                          value={readJaText(item.body)}
                          onChange={(e) => updateItem(i, "body", e.target.value)}
                          placeholder="タブに表示する内容"
                          rows={3}
                          className="app-field-input min-h-[5rem] py-2"
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
    </div>
  );
}
