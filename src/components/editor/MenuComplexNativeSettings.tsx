"use client";

import { useState } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppOptionCard,
  AppOptionCardRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { MenuTagItemsNativeSettings } from "./MenuItemsNativeSettings";

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

function writeJaTextPreserving(prev: unknown, value: string): string | LocalizedString {
  if (typeof prev === "object" && prev !== null && !Array.isArray(prev) && ("ja" in prev || "en" in prev)) {
    return { ...(prev as Record<string, string>), ja: value };
  }
  return value;
}

type MenuTagItem = {
  name?: string;
  price?: string;
  description?: string;
  tag?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type MenuCategoryRow = {
  title?: string | LocalizedString;
  imageSrc?: string;
  imageAlt?: string | LocalizedString;
  items?: MenuTagItem[];
};

type TimeSlotRow = {
  label?: string;
  start?: string;
  end?: string;
  items?: MenuTagItem[];
};

export function MenuCategoriesNativeSettings({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const categories = (Array.isArray(content.categories) ? content.categories : []) as MenuCategoryRow[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(categories.length > 0 ? 0 : null);
  const setCategories = (next: MenuCategoryRow[]) => onUpdate("categories", next);

  return (
    <div>
      <AppSectionHeader
        title="カテゴリ"
        trailing={
          <button
            type="button"
            className="app-native-add-btn ui-pop-tap"
            onClick={() => {
              const next = [
                ...categories,
                {
                  title: "新規カテゴリ",
                  imageSrc: "",
                  imageAlt: "",
                  items: [{ name: "", price: "", description: "", tag: "", imageSrc: "", imageAlt: "" }],
                },
              ];
              setCategories(next);
              setExpandedIndex(next.length - 1);
            }}
          >
            + 追加
          </button>
        }
      />
      <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
        {categories.length === 0 ? (
          <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">カテゴリを追加してください</p>
        ) : (
          categories.map((cat, ci) => {
            const expanded = expandedIndex === ci;
            const title = readJaText(cat.title) || `カテゴリ ${ci + 1}`;
            const count = Array.isArray(cat.items) ? cat.items.length : 0;
            return (
              <div key={ci} className="border-b border-[var(--app-border)] last:border-b-0">
                <AppListRow
                  title={title}
                  subtitle={`${count}品`}
                  onClick={() => setExpandedIndex(expanded ? null : ci)}
                />
                {expanded ? (
                  <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="app-native-settings-action app-native-settings-action--danger"
                        onClick={() => {
                          setCategories(categories.filter((_, i) => i !== ci));
                          setExpandedIndex(null);
                        }}
                      >
                        削除
                      </button>
                    </div>
                    <div>
                      <AppFieldLabel>カテゴリ名</AppFieldLabel>
                      <AppFieldInput
                        value={readJaText(cat.title)}
                        onChange={(e) => {
                          const next = [...categories];
                          next[ci] = {
                            ...cat,
                            title: writeJaTextPreserving(cat.title, e.target.value),
                          };
                          setCategories(next);
                        }}
                        placeholder="フード / ドリンク"
                      />
                    </div>
                    <div>
                      <AppFieldLabel>カテゴリ画像</AppFieldLabel>
                      <ImageUpload
                        onUploaded={(url) => {
                          const next = [...categories];
                          next[ci] = { ...cat, imageSrc: url };
                          setCategories(next);
                        }}
                        className="!items-start !rounded-[var(--app-radius-md)] !border !border-[var(--app-border)] !bg-[var(--app-surface)] !p-3"
                      />
                    </div>
                    <div>
                      <AppFieldLabel>代替テキスト</AppFieldLabel>
                      <AppFieldInput
                        value={readJaText(cat.imageAlt)}
                        onChange={(e) => {
                          const next = [...categories];
                          next[ci] = {
                            ...cat,
                            imageAlt: writeJaTextPreserving(cat.imageAlt, e.target.value),
                          };
                          setCategories(next);
                        }}
                        placeholder="任意"
                      />
                    </div>
                    <MenuTagItemsNativeSettings
                      items={Array.isArray(cat.items) ? cat.items : []}
                      onChange={(items) => {
                        const next = [...categories];
                        next[ci] = { ...cat, items };
                        setCategories(next);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function MenuTimeBandNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  display: (key: string) => string;
  updateLocalized: (key: string, value: string) => void;
}) {
  const slots = (Array.isArray(content.slots) ? content.slots : []) as TimeSlotRow[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(slots.length > 0 ? 0 : null);
  const setSlots = (next: TimeSlotRow[]) => onUpdate("slots", next);

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイムゾーン（IANA）</AppFieldLabel>
        <AppFieldInput
          value={typeof content.timezone === "string" ? content.timezone : "Asia/Tokyo"}
          onChange={(e) => onUpdate("timezone", e.target.value.trim() || "Asia/Tokyo")}
          placeholder="Asia/Tokyo"
        />
      </div>
      <div>
        <AppFieldLabel>アクティブ帯の見出し</AppFieldLabel>
        <AppFieldInput
          value={display("currentBandLabel")}
          onChange={(e) => updateLocalized("currentBandLabel", e.target.value)}
          placeholder="ただいまのメニュー"
        />
      </div>
      <div>
        <AppFieldLabel>該当なし時のメッセージ</AppFieldLabel>
        <AppFieldInput
          value={display("outsideMessage")}
          onChange={(e) => updateLocalized("outsideMessage", e.target.value)}
          placeholder="現在この時間帯の提供メニューはありません。"
        />
      </div>

      <div>
        <AppSectionHeader
          title="時間帯スロット"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [
                  ...slots,
                  {
                    label: "ランチ",
                    start: "11:00",
                    end: "14:00",
                    items: [{ name: "", price: "", description: "", tag: "", imageSrc: "", imageAlt: "" }],
                  },
                ];
                setSlots(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {slots.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">スロットを追加してください</p>
          ) : (
            slots.map((slot, si) => {
              const expanded = expandedIndex === si;
              const label = slot.label?.trim() || `スロット ${si + 1}`;
              const range = `${slot.start || "—"}–${slot.end || "—"}`;
              return (
                <div key={si} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={label}
                    subtitle={range}
                    onClick={() => setExpandedIndex(expanded ? null : si)}
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="app-native-settings-action app-native-settings-action--danger"
                          onClick={() => {
                            setSlots(slots.filter((_, i) => i !== si));
                            setExpandedIndex(null);
                          }}
                        >
                          削除
                        </button>
                      </div>
                      <div>
                        <AppFieldLabel>表示名</AppFieldLabel>
                        <AppFieldInput
                          value={slot.label ?? ""}
                          onChange={(e) => {
                            const next = [...slots];
                            next[si] = { ...slot, label: e.target.value };
                            setSlots(next);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <AppFieldLabel>開始</AppFieldLabel>
                          <AppFieldInput
                            value={slot.start ?? ""}
                            onChange={(e) => {
                              const next = [...slots];
                              next[si] = { ...slot, start: e.target.value };
                              setSlots(next);
                            }}
                            placeholder="11:00"
                          />
                        </div>
                        <div>
                          <AppFieldLabel>終了</AppFieldLabel>
                          <AppFieldInput
                            value={slot.end ?? ""}
                            onChange={(e) => {
                              const next = [...slots];
                              next[si] = { ...slot, end: e.target.value };
                              setSlots(next);
                            }}
                            placeholder="14:00"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-[var(--app-text-muted)]">同日の範囲のみ（終了は含まない）</p>
                      <MenuTagItemsNativeSettings
                        items={Array.isArray(slot.items) ? slot.items : []}
                        onChange={(items) => {
                          const next = [...slots];
                          next[si] = { ...slot, items };
                          setSlots(next);
                        }}
                      />
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

const GRID_MIN = 2;
const GRID_MAX = 6;

function normalizeRows(rawRows: unknown, columns: number): string[][] {
  if (!Array.isArray(rawRows)) return [];
  return rawRows
    .filter((row) => Array.isArray(row))
    .map((row) => {
      const next = (row as unknown[]).slice(0, columns).map((cell) => String(cell ?? ""));
      while (next.length < columns) next.push("");
      return next;
    });
}

export function MenuGridNativeSettings({
  content,
  onUpdate,
  onPatchContent,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  /** Bulk update columns+rows together */
  onPatchContent: (patch: Record<string, unknown>) => void;
}) {
  const rawColumns = Number(content.columns ?? 3);
  const columns = Math.min(GRID_MAX, Math.max(GRID_MIN, Number.isFinite(rawColumns) ? Math.round(rawColumns) : 3));
  const rows = normalizeRows(content.rows, columns);
  const hasHeader = content.hasHeader !== false;
  const showBorder = content.showBorder !== false;
  const cellPadding = content.cellPadding === "sm" || content.cellPadding === "lg" ? content.cellPadding : "md";
  const [expandedRow, setExpandedRow] = useState<number | null>(rows.length > 0 ? 0 : null);

  const setColumns = (nextColumns: number) => {
    const clamped = Math.min(GRID_MAX, Math.max(GRID_MIN, nextColumns));
    const nextRows = normalizeRows(content.rows, clamped).map((row) => {
      const cells = row.slice(0, clamped);
      while (cells.length < clamped) cells.push("");
      return cells;
    });
    onPatchContent({ columns: clamped, rows: nextRows });
  };
  const setRows = (nextRows: string[][]) => onPatchContent({ columns, rows: nextRows });

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppSectionHeader title="列数" as="p" />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="app-native-settings-action"
            disabled={columns <= GRID_MIN}
            onClick={() => setColumns(columns - 1)}
          >
            − 列
          </button>
          <span className="min-w-[3rem] text-center text-sm font-bold text-[var(--app-text)]">{columns}列</span>
          <button
            type="button"
            className="app-native-settings-action"
            disabled={columns >= GRID_MAX}
            onClick={() => setColumns(columns + 1)}
          >
            + 列
          </button>
        </div>
      </div>

      <label className="flex min-h-[var(--app-tap-min)] items-center gap-3 rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-[var(--app-surface)] px-3">
        <input
          type="checkbox"
          checked={hasHeader}
          onChange={(e) => onUpdate("hasHeader", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)]"
        />
        <span className="text-sm font-medium text-[var(--app-text)]">先頭行をヘッダーにする</span>
      </label>
      <label className="flex min-h-[var(--app-tap-min)] items-center gap-3 rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-[var(--app-surface)] px-3">
        <input
          type="checkbox"
          checked={showBorder}
          onChange={(e) => onUpdate("showBorder", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)]"
        />
        <span className="text-sm font-medium text-[var(--app-text)]">罫線を表示</span>
      </label>

      <div>
        <AppSectionHeader title="セル余白" as="p" />
        <AppOptionCardRow className="mt-2 !grid-cols-3">
          {(["sm", "md", "lg"] as const).map((pad) => (
            <AppOptionCard
              key={pad}
              label={pad === "sm" ? "狭" : pad === "lg" ? "広" : "標準"}
              selected={cellPadding === pad}
              onClick={() => onUpdate("cellPadding", pad)}
            />
          ))}
        </AppOptionCardRow>
      </div>

      <div>
        <AppSectionHeader
          title="行"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const blank = Array.from({ length: columns }, () => "");
                const next = [...rows, blank];
                setRows(next);
                setExpandedRow(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {rows.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">行を追加してください</p>
          ) : (
            rows.map((row, ri) => {
              const expanded = expandedRow === ri;
              const preview = row.filter(Boolean).slice(0, 2).join(" / ") || `行 ${ri + 1}`;
              return (
                <div key={ri} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={hasHeader && ri === 0 ? `ヘッダー: ${preview}` : preview}
                    subtitle={`${row.length}セル`}
                    onClick={() => setExpandedRow(expanded ? null : ri)}
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className="app-native-settings-action"
                          disabled={ri === 0}
                          onClick={() => {
                            if (ri === 0) return;
                            const next = [...rows];
                            const [picked] = next.splice(ri, 1);
                            next.splice(ri - 1, 0, picked);
                            setRows(next);
                            setExpandedRow(ri - 1);
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="app-native-settings-action"
                          disabled={ri >= rows.length - 1}
                          onClick={() => {
                            if (ri >= rows.length - 1) return;
                            const next = [...rows];
                            const [picked] = next.splice(ri, 1);
                            next.splice(ri + 1, 0, picked);
                            setRows(next);
                            setExpandedRow(ri + 1);
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="app-native-settings-action app-native-settings-action--danger"
                          onClick={() => {
                            setRows(rows.filter((_, i) => i !== ri));
                            setExpandedRow(null);
                          }}
                        >
                          削除
                        </button>
                      </div>
                      {row.map((cell, ci) => (
                        <div key={ci}>
                          <AppFieldLabel>
                            {hasHeader && ri === 0 ? `列${ci + 1}（ヘッダー）` : `列${ci + 1}`}
                          </AppFieldLabel>
                          <AppFieldInput
                            value={cell}
                            onChange={(e) => {
                              const next = rows.map((r) => [...r]);
                              next[ri][ci] = e.target.value;
                              setRows(next);
                            }}
                            placeholder="—"
                          />
                        </div>
                      ))}
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
