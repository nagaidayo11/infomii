"use client";

import { useState } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { ImageUpload } from "@/components/editor/ImageUpload";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
import { PageHelp } from "@/components/help/PageHelp";
import { FIELD_HELP } from "@/lib/page-help-content";

type TabsInfoItem = { label?: string; body?: string; imageSrc?: string };

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
  const accentColor =
    typeof content.accentColor === "string" && content.accentColor.trim()
      ? content.accentColor.trim()
      : "#0f766e";

  const setItems = (next: TabsInfoItem[]) => onUpdate("tabs", next);
  const updateItem = (index: number, field: keyof TabsInfoItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => {
    const next = [...items, { label: `タブ ${items.length + 1}`, body: "", imageSrc: "" }];
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
          placeholder="施設のご案内"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <AppFieldLabel htmlFor="native-tabs-default" className="!mb-0">
            初期表示タブ
          </AppFieldLabel>
          <PageHelp
            size="sm"
            align="left"
            title={FIELD_HELP.tabsDefaultIndex.title}
            description={FIELD_HELP.tabsDefaultIndex.description}
            items={[...FIELD_HELP.tabsDefaultIndex.items]}
            label="初期表示タブの説明"
          />
        </div>
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
        <AppFieldLabel htmlFor="native-tabs-accent">アクセント色</AppFieldLabel>
        <div className="flex items-center gap-2">
          <input
            id="native-tabs-accent"
            type="color"
            value={accentColor}
            onChange={(e) => onUpdate("accentColor", e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-white"
          />
          <AppFieldInput
            value={accentColor}
            onChange={(e) => onUpdate("accentColor", e.target.value)}
            placeholder="#0f766e"
          />
        </div>
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
                        <AppFieldLabel>画像（任意）</AppFieldLabel>
                        <ImageUpload
                          onUploaded={(url) => updateItem(i, "imageSrc", url)}
                          className="!items-start !rounded-lg !border !border-[var(--app-border)] !bg-white !p-3"
                        />
                        {item.imageSrc ? (
                          <button
                            type="button"
                            onClick={() => updateItem(i, "imageSrc", "")}
                            className="mt-2 app-native-settings-action"
                          >
                            画像を外す
                          </button>
                        ) : null}
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
