"use client";

import { useState } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

type ChecklistItem = { text?: string; checked?: boolean };

export function ChecklistNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as ChecklistItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const setItems = (next: ChecklistItem[]) => onUpdate("items", next);

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイトル</AppFieldLabel>
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="チェックリスト" />
      </div>
      <div>
        <AppSectionHeader
          title="項目"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [...items, { text: "新規", checked: false }];
                setItems(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.map((item, i) => {
            const expanded = expandedIndex === i;
            return (
              <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                <AppListRow
                  title={readJaText(item.text) || `項目 ${i + 1}`}
                  subtitle={item.checked ? "チェック済み" : "未チェック"}
                  onClick={() => setExpandedIndex(expanded ? null : i)}
                />
                {expanded ? (
                  <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="app-native-settings-action app-native-settings-action--danger"
                        onClick={() => {
                          setItems(items.filter((_, idx) => idx !== i));
                          setExpandedIndex(null);
                        }}
                      >
                        削除
                      </button>
                    </div>
                    <div>
                      <AppFieldLabel>テキスト</AppFieldLabel>
                      <AppFieldInput
                        value={readJaText(item.text)}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], text: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-[var(--app-text)]">
                      <input
                        type="checkbox"
                        checked={item.checked === true}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], checked: e.target.checked };
                          setItems(next);
                        }}
                      />
                      初期チェック
                    </label>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type FaqItem = { q?: string; a?: string };

export function FaqNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as FaqItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const setItems = (next: FaqItem[]) => onUpdate("items", next);

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイトル</AppFieldLabel>
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="よくある質問" />
      </div>
      <div>
        <AppSectionHeader
          title="Q&A"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [...items, { q: "", a: "" }];
                setItems(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.map((item, i) => {
            const expanded = expandedIndex === i;
            const q = readJaText(item.q) || `質問 ${i + 1}`;
            return (
              <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                <AppListRow
                  title={q}
                  subtitle={readJaText(item.a) ? readJaText(item.a).slice(0, 40) : "回答未設定"}
                  onClick={() => setExpandedIndex(expanded ? null : i)}
                />
                {expanded ? (
                  <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="app-native-settings-action app-native-settings-action--danger"
                        onClick={() => {
                          setItems(items.filter((_, idx) => idx !== i));
                          setExpandedIndex(null);
                        }}
                      >
                        削除
                      </button>
                    </div>
                    <div>
                      <AppFieldLabel>質問</AppFieldLabel>
                      <AppFieldInput
                        value={readJaText(item.q)}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], q: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                    <div>
                      <AppFieldLabel>回答</AppFieldLabel>
                      <textarea
                        className="app-field-input min-h-[5rem] py-2"
                        rows={3}
                        value={readJaText(item.a)}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], a: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type StepsItem = { title?: string; description?: string };

export function StepsNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as StepsItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const setItems = (next: StepsItem[]) => onUpdate("items", next);

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイトル</AppFieldLabel>
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="ステップ" />
      </div>
      <div>
        <AppSectionHeader
          title="手順"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [...items, { title: "", description: "" }];
                setItems(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.map((item, i) => {
            const expanded = expandedIndex === i;
            return (
              <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                <AppListRow
                  title={readJaText(item.title) || `ステップ ${i + 1}`}
                  subtitle={readJaText(item.description) || "説明未設定"}
                  leading={<span className="app-native-step-num !h-7 !w-7 text-[0.7rem]">{i + 1}</span>}
                  onClick={() => setExpandedIndex(expanded ? null : i)}
                />
                {expanded ? (
                  <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="app-native-settings-action app-native-settings-action--danger"
                        onClick={() => {
                          setItems(items.filter((_, idx) => idx !== i));
                          setExpandedIndex(null);
                        }}
                      >
                        削除
                      </button>
                    </div>
                    <div>
                      <AppFieldLabel>ステップ名</AppFieldLabel>
                      <AppFieldInput
                        value={readJaText(item.title)}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], title: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                    <div>
                      <AppFieldLabel>説明</AppFieldLabel>
                      <textarea
                        className="app-field-input min-h-[4rem] py-2"
                        rows={2}
                        value={readJaText(item.description)}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], description: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
