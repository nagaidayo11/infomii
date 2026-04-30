"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { EDITOR_FONT_OPTIONS } from "@/lib/editor-font-options";
import { getLocalizedContent } from "@/lib/localized-content";
import { listPagesForHotel, type PageRow } from "@/lib/storage";
import type { LocalizedString } from "@/lib/localized-content";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "./ImageUpload";
import { IconTokenSelect } from "./IconTokenSelect";
import type { EditorCard } from "./types";
import { BUSINESS_ONLY_CARD_TYPES, CARD_TYPE_LABELS } from "./types";
import { HERO_SLIDER_MAX_ITEMS, createDefaultHeroSliderSlide } from "./types";
import { useEditor2Store } from "./store";

const TRANSLATE_DEBOUNCE_MS = 1200;
const MIN_TEXT_LENGTH_FOR_TRANSLATE = 2;
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";
const addButtonClass =
  "rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]";
const removeButtonClass =
  "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 min-h-[44px]";
const reorderButtonClass =
  "rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[44px] min-w-[44px]";
const checkboxRowClass =
  "flex min-h-[44px] items-center gap-2 rounded-md px-2 text-sm text-slate-700";
const checkboxInlineRowClass =
  "inline-flex min-h-[44px] items-center gap-2 rounded-md px-2 text-sm text-slate-700";
const compactGridClass = "grid grid-cols-1 gap-2.5 md:grid-cols-2";
const contentSectionId = "settings-content";
const displaySectionId = "settings-display";
const appearanceSectionId = "settings-appearance";
const appearanceTypographyId = "appearance-typography";
const appearanceBackgroundId = "appearance-background";
const appearanceBorderId = "appearance-border";
const appearanceSpacingId = "appearance-spacing";

function SettingsSection({
  title,
  children,
  sectionId,
  contentClassName,
}: {
  title: string;
  children: React.ReactNode;
  sectionId?: string;
  contentClassName?: string;
}) {
  return (
    <div id={sectionId} className="space-y-3 scroll-mt-28">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
        {title}
      </h3>
      <div className={`space-y-2.5 ${contentClassName ?? ""}`.trim()}>{children}</div>
    </div>
  );
}

function StyleGroup({
  summary,
  defaultOpen = true,
  children,
}: {
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-slate-200/90 bg-white [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold text-slate-800 outline-none ring-offset-2 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ds-primary/30 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
        <span>{summary}</span>
        <span className="text-[10px] text-slate-400 transition-transform group-open:rotate-180" aria-hidden>
          ▼
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-100 px-3 pb-3 pt-2">{children}</div>
    </details>
  );
}

function isoToLocalInput(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string): string {
  if (!value.trim()) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function normalizeHexColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(v)) return v;
  return undefined;
}

const INNER_SURFACE_PRESETS = [
  { label: "薄灰", value: "#f8fafc" },
  { label: "薄青", value: "#eff6ff" },
  { label: "薄緑", value: "#ecfdf5" },
] as const;

const NOTICE_PRIORITY_PRESETS = [
  { value: "info", label: "情報" },
  { value: "warning", label: "警告" },
];

type CardUpdatePatch = { content?: Record<string, unknown>; style?: Record<string, unknown> };
type SettingsPalette =
  | "content"
  | "appearance"
  | "appearance-background"
  | "appearance-border"
  | "appearance-spacing";

export type CardSettingsProps = {
  card: EditorCard | null;
  onUpdate: (id: string, patch: CardUpdatePatch) => void;
  onDuplicateCard?: (id: string) => void;
  onRemoveCard?: (id: string) => void;
  onBulkReplace?: (find: string, replaceTo: string) => { cardsUpdated: number; occurrences: number };
  onRunPrepublishCheck?: () => void;
  demoMode?: boolean;
  onLockedAction?: (message: string) => void;
  /** When set and card.id matches, scroll panel to top instantly (no smooth scroll) so new-card flow feels immediate. */
  lastAddedCardId?: string | null;
  isBusinessEnabled?: boolean;
};

function isLocalizedObject(v: unknown): v is Record<string, string> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("ja" in v || "en" in v || "zh" in v || "ko" in v)
  );
}

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

function writeJaTextPreserving<T extends string | boolean>(_prev: unknown, value: T): T {
  return value;
}

async function translateJaToEnZhKo(text: string): Promise<{ en: string; zh: string; ko: string } | null> {
  const res = await fetch("/api/ai/translate-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { en?: string; zh?: string; ko?: string };
  if (typeof data.en !== "string" || typeof data.zh !== "string" || typeof data.ko !== "string") return null;
  return { en: data.en, zh: data.zh, ko: data.ko };
}

type NearbyItem = { name?: string; description?: string; link?: string };
type FaqItem = { q?: string; a?: string };
type GalleryImageItem = { src?: string; alt?: string };
type PageLinksItem = { label?: string; icon?: string; linkType?: "page" | "url"; pageSlug?: string; link?: string };
type ChecklistItem = { text?: string; checked?: boolean };
type StepsItem = { title?: string; description?: string };
type KpiItem = { label?: string; value?: string };
type ScheduleItem = { day?: string; time?: string; label?: string };
type ScheduleRule = {
  itemIndex?: number;
  days?: number[];
  start?: string;
  end?: string;
  startDate?: string;
  endDate?: string;
};
type MenuItem = { name?: string; price?: string; description?: string; imageSrc?: string; imageAlt?: string };
type MenuTagItem = {
  name?: string;
  price?: string;
  description?: string;
  tag?: string;
  imageSrc?: string;
  imageAlt?: string;
};
type MenuCategoryRow = { title?: string; imageSrc?: string; imageAlt?: string; items?: MenuTagItem[] };
type DrinkItem = { name?: string; sizes?: string; note?: string; imageSrc?: string; imageAlt?: string };
type SalonItem = { name?: string; duration?: string; price?: string; description?: string; imageSrc?: string; imageAlt?: string };
type ComboItem = { name?: string; includes?: string; price?: string; imageSrc?: string; imageAlt?: string };
type TimeSlotRow = {
  label?: string;
  start?: string;
  end?: string;
  items?: MenuTagItem[];
};
type InfoRowItem = { label?: string; value?: string };
type TabsInfoItem = { label?: string; body?: string };
type HeroSliderItem = {
  src?: string;
  alt?: string;
  caption?: string;
  linkEnabled?: boolean;
  linkType?: "internal" | "external";
  href?: string;
  openInNewTab?: boolean;
};

function getHeroSlideLinkValidation(item: HeroSliderItem): { level: "error" | "hint"; message: string } | null {
  if (item.linkEnabled !== true) return null;
  const href = typeof item.href === "string" ? item.href.trim() : "";
  if (!href) return { level: "error", message: "遷移先URLを入力してください。" };
  if (item.linkType === "external") {
    if (!/^https?:\/\//i.test(href)) return { level: "error", message: "外部URLは http:// または https:// で始めてください。" };
    return null;
  }
  if (!href.startsWith("/")) return { level: "error", message: "内部リンクは / から始めてください（例: /p/sample）。" };
  if (!(href.startsWith("/p/") || href.startsWith("/v/"))) {
    return { level: "hint", message: "推奨: 内部リンクは /p/... または /v/... を使ってください。" };
  }
  return null;
}

function InfoRowsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const rows = (Array.isArray(content.rows) ? content.rows : []) as InfoRowItem[];
  const setRows = (next: InfoRowItem[]) => onUpdate("rows", next);
  const updateRow = (index: number, field: keyof InfoRowItem, value: string) => {
    const next = [...rows];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setRows(next);
  };
  const addRow = () => setRows([...rows, { label: "", value: "" }]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className={labelClass}>行（ラベル・値）</span>
        <button
          type="button"
          onClick={addRow}
          className={`shrink-0 ${addButtonClass}`}
        >
          + 行を追加
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500">行が未設定です。追加するか、キャンバス上のブロックから編集できます。</p>
      ) : null}
      {rows.map((row, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/90 p-3">
          <Input
            label="ラベル"
            value={readJaText(row.label)}
            onChange={(e) => updateRow(i, "label", e.target.value)}
            placeholder="例: ネットワーク名"
          />
          <Input
            label="値"
            value={readJaText(row.value)}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            placeholder="表示する値"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            この行を削除
          </button>
        </div>
      ))}
    </div>
  );
}

function GalleryItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : [{ src: "", alt: "" }]) as GalleryImageItem[];
  const rawColumns = typeof content.columns === "number" ? content.columns : Number(content.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const setItems = (next: GalleryImageItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof GalleryImageItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { src: "", alt: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="w-full">
        <label className={labelClass}>列数</label>
        <select
          value={String(columns)}
          onChange={(e) => onUpdate("columns", Number(e.target.value))}
          className={inputClass}
        >
          <option value="2">2列</option>
          <option value="3">3列</option>
          <option value="4">4列</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">画像</span>
        <button
          type="button"
          onClick={addItem}
          className={addButtonClass}
        >
          + 追加
        </button>
      </div>
      {items.slice(0, 12).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className={removeButtonClass}
            >
              削除
            </button>
          </div>
          <ImageUpload
            onUploaded={(url) => updateItem(i, "src", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input
            label={`画像 ${i + 1} URL`}
            value={items[i]?.src ?? ""}
            onChange={(e) => updateItem(i, "src", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="代替テキスト"
            value={items[i]?.alt ?? ""}
            onChange={(e) => updateItem(i, "alt", e.target.value)}
            placeholder="任意"
          />
        </div>
      ))}
    </div>
  );
}

function HeroSliderItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.slides) ? content.slides : []) as HeroSliderItem[];
  const visibleItems = items.slice(0, HERO_SLIDER_MAX_ITEMS);
  const setItems = (next: HeroSliderItem[]) => onUpdate("slides", next.slice(0, HERO_SLIDER_MAX_ITEMS));
  const updateItem = (index: number, field: keyof HeroSliderItem, value: unknown) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => {
    if (items.length >= HERO_SLIDER_MAX_ITEMS) return;
    setItems([...items, createDefaultHeroSliderSlide(items.length) as HeroSliderItem]);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const moveItem = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(to, 0, row);
    setItems(next);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">スライド画像</span>
        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= HERO_SLIDER_MAX_ITEMS}
          className={`${addButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          + 追加
        </button>
      </div>
      <p className="text-[11px] text-slate-500">最大 {HERO_SLIDER_MAX_ITEMS} 枚まで。3〜5枚目はテンプレ画像と既定キャプションを自動で追加します。</p>
      {visibleItems.map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => moveItem(i, -1)} className={reorderButtonClass}>↑</button>
            <button type="button" onClick={() => moveItem(i, 1)} className={reorderButtonClass}>↓</button>
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>削除</button>
          </div>
          <ImageUpload onUploaded={(url) => updateItem(i, "src", url)} className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3" />
          <Input label="代替テキスト" value={items[i]?.alt ?? ""} onChange={(e) => updateItem(i, "alt", e.target.value)} placeholder="任意" />
          <Input label="キャプション" value={items[i]?.caption ?? ""} onChange={(e) => updateItem(i, "caption", e.target.value)} placeholder="任意" />
          <label className={checkboxRowClass}>
            <input
              type="checkbox"
              checked={items[i]?.linkEnabled === true}
              onChange={(e) => updateItem(i, "linkEnabled", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary"
            />
            ページ遷移を有効化
          </label>
          {items[i]?.linkEnabled ? (
            <>
              <div className="w-full">
                <label className={labelClass}>リンク種別</label>
                <select
                  value={items[i]?.linkType === "external" ? "external" : "internal"}
                  onChange={(e) => updateItem(i, "linkType", e.target.value === "external" ? "external" : "internal")}
                  className={inputClass}
                >
                  <option value="internal">内部ページ</option>
                  <option value="external">外部URL</option>
                </select>
              </div>
              <Input
                label="遷移先"
                value={items[i]?.href ?? ""}
                onChange={(e) => updateItem(i, "href", e.target.value)}
                placeholder={items[i]?.linkType === "external" ? "https://example.com" : "/p/sample または /v/sample"}
              />
              {(() => {
                const validation = getHeroSlideLinkValidation(items[i] ?? {});
                if (!validation) return null;
                return (
                  <p className={`text-xs ${validation.level === "error" ? "text-rose-600" : "text-amber-600"}`}>
                    {validation.message}
                  </p>
                );
              })()}
              {items[i]?.linkType === "external" ? (
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={items[i]?.openInNewTab === true}
                    onChange={(e) => updateItem(i, "openInNewTab", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary"
                  />
                  新しいタブで開く
                </label>
              ) : null}
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function NearbyItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as NearbyItem[];
  const setItems = (next: NearbyItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof NearbyItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { name: "", description: "", link: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">項目</span>
        <button
          type="button"
          onClick={addItem}
          className={addButtonClass}
        >
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className={removeButtonClass}
            >
              削除
            </button>
          </div>
          <Input
            label="名前"
            value={readJaText(item.name)}
            onChange={(e) => updateItem(i, "name", e.target.value)}
            placeholder="スポット名"
          />
          <Input
            label="説明"
            value={readJaText(item.description)}
            onChange={(e) => updateItem(i, "description", e.target.value)}
            placeholder="任意"
          />
          <Input
            label="リンクURL"
            value={readJaText(item.link)}
            onChange={(e) => updateItem(i, "link", e.target.value)}
            placeholder="https://..."
          />
        </div>
      ))}
    </div>
  );
}

function FaqItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as FaqItem[];
  const setItems = (next: FaqItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { q: "", a: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">質問と回答</span>
        <button
          type="button"
          onClick={addItem}
          className={addButtonClass}
        >
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className={removeButtonClass}
            >
              削除
            </button>
          </div>
          <Input
            label="質問"
            value={readJaText(item.q)}
            onChange={(e) => updateItem(i, "q", e.target.value)}
            placeholder="Q"
          />
          <div className="w-full">
            <label className={labelClass}>回答</label>
            <textarea
              value={readJaText(item.a)}
              onChange={(e) => updateItem(i, "a", e.target.value)}
              placeholder="A"
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TabsInfoItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.tabs) ? content.tabs : []) as TabsInfoItem[];
  const setItems = (next: TabsInfoItem[]) => onUpdate("tabs", next);
  const updateItem = (index: number, field: keyof TabsInfoItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { label: "", body: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const moveItem = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(to, 0, row);
    setItems(next);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">タブ項目</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => moveItem(i, -1)} className={reorderButtonClass}>↑</button>
            <button type="button" onClick={() => moveItem(i, 1)} className={reorderButtonClass}>↓</button>
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>削除</button>
          </div>
          <Input
            label="タブラベル"
            value={readJaText(item.label)}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder={`タブ ${i + 1}`}
          />
          <div className="w-full">
            <label className={labelClass}>本文</label>
            <textarea
              value={readJaText(item.body)}
              onChange={(e) => updateItem(i, "body", e.target.value)}
              placeholder="タブに表示する内容"
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TickerItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as string[];
  const setItems = (next: string[]) => onUpdate("items", next);
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
  };
  const addItem = () => setItems([...items, ""]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const moveItem = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(to, 0, row);
    setItems(next);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">お知らせ文</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => moveItem(i, -1)} className={reorderButtonClass}>↑</button>
            <button type="button" onClick={() => moveItem(i, 1)} className={reorderButtonClass}>↓</button>
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>削除</button>
          </div>
          <Input
            label={`メッセージ ${i + 1}`}
            value={item ?? ""}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder="流すお知らせ文"
          />
        </div>
      ))}
    </div>
  );
}

function AccordionItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as Array<{ title?: string; body?: string }>;
  const setItems = (next: Array<{ title?: string; body?: string }>) => onUpdate("items", next);
  const updateItem = (index: number, field: "title" | "body", value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">項目</span>
        <button type="button" onClick={() => setItems([...items, { title: "", body: "" }])} className={addButtonClass}>+ 追加</button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className={removeButtonClass}>削除</button>
          </div>
          <Input label="見出し" value={item.title ?? ""} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder={`項目 ${i + 1}`} />
          <div className="w-full">
            <label className={labelClass}>本文</label>
            <textarea value={item.body ?? ""} onChange={(e) => updateItem(i, "body", e.target.value)} rows={2} className={inputClass} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialLinksItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as Array<{ label?: string; href?: string; handle?: string }>;
  const setItems = (next: Array<{ label?: string; href?: string; handle?: string }>) => onUpdate("items", next);
  const updateItem = (index: number, field: "label" | "href" | "handle", value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">SNS項目</span>
        <button type="button" onClick={() => setItems([...items, { label: "", href: "", handle: "" }])} className={addButtonClass}>+ 追加</button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className={removeButtonClass}>削除</button>
          </div>
          <Input label="名称" value={item.label ?? ""} onChange={(e) => updateItem(i, "label", e.target.value)} placeholder="Instagram" />
          <Input label="ハンドル" value={item.handle ?? ""} onChange={(e) => updateItem(i, "handle", e.target.value)} placeholder="@example" />
          <Input label="URL" value={item.href ?? ""} onChange={(e) => updateItem(i, "href", e.target.value)} placeholder="https://..." />
        </div>
      ))}
    </div>
  );
}

function ProgressItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as Array<{ label?: string; done?: boolean }>;
  const setItems = (next: Array<{ label?: string; done?: boolean }>) => onUpdate("items", next);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">ステップ</span>
        <button type="button" onClick={() => setItems([...items, { label: "", done: false }])} className={addButtonClass}>+ 追加</button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className={removeButtonClass}>削除</button>
          </div>
          <Input label="ラベル" value={readJaText(item.label)} onChange={(e) => {
            const next = [...items];
            next[i] = { ...(next[i] ?? {}), label: writeJaTextPreserving((next[i] as Record<string, unknown> | undefined)?.label, e.target.value) };
            setItems(next);
          }} placeholder={`ステップ ${i + 1}`} />
          <label className={checkboxInlineRowClass}>
            <input type="checkbox" checked={item.done === true} onChange={(e) => {
              const next = [...items];
              next[i] = { ...(next[i] ?? {}), done: e.target.checked };
              setItems(next);
            }} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
            完了済み
          </label>
        </div>
      ))}
    </div>
  );
}

function PageLinksItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const [pages, setPages] = useState<PageRow[]>([]);
  useEffect(() => {
    listPagesForHotel().then(setPages);
  }, []);

  const items = (Array.isArray(content.items) ? content.items : []) as PageLinksItem[];
  const rawColumns = typeof content.columns === "number" ? content.columns : Number(content.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 3;
  const rawIconSize = typeof content.iconSize === "string" ? content.iconSize : "";
  const iconSize = rawIconSize === "sm" || rawIconSize === "lg" ? rawIconSize : "md";
  const setItems = (next: PageLinksItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof PageLinksItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const defaultPageSlug = pages[0]?.slug ?? "";
  const addItem = () =>
    setItems([...items, { label: "新規", icon: "info", linkType: "page", pageSlug: defaultPageSlug, link: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const openLinkedPageEditor = (slug: string) => {
    if (typeof window === "undefined") return;
    const target = pages.find((p) => p.slug === slug);
    if (!target?.id) return;
    window.open(`/editor/${target.id}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-3">
      <div className="w-full">
        <label className={labelClass}>列数</label>
        <select
          value={String(columns)}
          onChange={(e) => onUpdate("columns", Number(e.target.value))}
          className={inputClass}
        >
          <option value="2">2列</option>
          <option value="3">3列</option>
          <option value="4">4列</option>
        </select>
      </div>
      <div className="w-full">
        <label className={labelClass}>アイコンサイズ</label>
        <select
          value={iconSize}
          onChange={(e) => onUpdate("iconSize", e.target.value)}
          className={inputClass}
        >
          <option value="sm">小</option>
          <option value="md">標準</option>
          <option value="lg">大</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">リンク項目</span>
        <button
          type="button"
          onClick={addItem}
          className={addButtonClass}
        >
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className={removeButtonClass}
            >
              削除
            </button>
          </div>
          <Input
            label={(item.linkType ?? "page") === "url" ? "URLラベル" : "ラベル"}
            value={readJaText(item.label)}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="WiFi"
          />
          <IconTokenSelect
            label="アイコン"
            value={item.icon}
            onChange={(next) => updateItem(i, "icon", next)}
            className={inputClass}
            labelClassName={labelClass}
          />
          <div className="w-full">
            <label className={labelClass}>リンク先</label>
            <select
              value={item.linkType ?? "page"}
              onChange={(e) => {
                const nextType = e.target.value as "page" | "url";
                const next = [...items];
                const current = next[i] ?? {};
                next[i] = {
                  ...current,
                  linkType: nextType,
                  pageSlug:
                    nextType === "page"
                      ? (typeof current.pageSlug === "string" && current.pageSlug) || defaultPageSlug
                      : current.pageSlug,
                };
                setItems(next);
              }}
              className={inputClass}
            >
              <option value="page">Infomii内で作成したページと連携する</option>
              <option value="url">外部URL</option>
            </select>
          </div>
          {(item.linkType ?? "page") === "page" ? (
            <div className="w-full">
              <label className={labelClass}>ページを選択</label>
              <select
                value={readJaText(item.pageSlug) || defaultPageSlug}
                onChange={(e) => updateItem(i, "pageSlug", e.target.value)}
                className={inputClass}
              >
                {pages.length === 0 ? <option value="">ページがありません</option> : null}
                {pages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title || p.slug || ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openLinkedPageEditor(item.pageSlug ?? "")}
                disabled={!item.pageSlug}
                className="mt-2 min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                リンク先ページを編集する
              </button>
            </div>
          ) : (
            <>
              <Input
                label="URLラベル"
                value={readJaText(item.label)}
                onChange={(e) => updateItem(i, "label", e.target.value)}
                placeholder="例: 公式サイト"
              />
              <Input
                label="URL"
                value={readJaText(item.link)}
                onChange={(e) => updateItem(i, "link", e.target.value)}
                placeholder="https://..."
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ChecklistItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as ChecklistItem[];
  const setItems = (next: ChecklistItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof ChecklistItem, value: string | boolean) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { text: "", checked: false }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">チェック項目</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input
            label="項目"
            value={readJaText(item.text)}
            onChange={(e) => updateItem(i, "text", e.target.value)}
            placeholder="内容"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.checked === true}
              onChange={(e) => updateItem(i, "checked", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary"
            />
            <span className="text-sm text-slate-700">初期状態を完了にする</span>
          </label>
        </div>
      ))}
    </div>
  );
}

function StepsItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as StepsItem[];
  const setItems = (next: StepsItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof StepsItem, value: string) => {
    const next = [...items];
    const current = (next[index] ?? {}) as Record<string, unknown>;
    const prevField = current[field];
    const localizedValue = isLocalizedObject(prevField) ? { ...prevField, ja: value } : value;
    next[index] = { ...(next[index] ?? {}), [field]: localizedValue };
    setItems(next);
  };
  const addItem = () => setItems([...items, { title: "", description: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">ステップ</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input
            label={`Step ${i + 1} タイトル`}
            value={getLocalizedContent(item.title as LocalizedString | undefined, "ja")}
            onChange={(e) => updateItem(i, "title", e.target.value)}
            placeholder="手順名"
          />
          <div className="w-full">
            <label className={labelClass}>説明</label>
            <textarea
              value={getLocalizedContent(item.description as LocalizedString | undefined, "ja")}
              onChange={(e) => updateItem(i, "description", e.target.value)}
              placeholder="手順の説明"
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as KpiItem[];
  const setItems = (next: KpiItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof KpiItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { label: "", value: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">数値項目</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input
            label="ラベル"
            value={readJaText(item.label)}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="項目名"
          />
          <Input
            label="値"
            value={readJaText(item.value)}
            onChange={(e) => updateItem(i, "value", e.target.value)}
            placeholder="15:00 / 120 / 95%"
          />
        </div>
      ))}
    </div>
  );
}

function ScheduleItemsEditor({
  content,
  onUpdate,
  isBusinessEnabled,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  isBusinessEnabled: boolean;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as ScheduleItem[];
  const rules = (Array.isArray(content.rules) ? content.rules : []) as ScheduleRule[];
  const dynamicEnabled = content.dynamicEnabled === true;
  const setItems = (next: ScheduleItem[]) => onUpdate("items", next);
  const setRules = (next: ScheduleRule[]) => onUpdate("rules", next);
  const updateItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { day: "", time: "", label: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const moveItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setItems(next);
    // Keep rules aligned with item reorder.
    const remapped = rules.map((rule) => {
      if (typeof rule.itemIndex !== "number") return rule;
      if (rule.itemIndex === index) return { ...rule, itemIndex: target };
      if (rule.itemIndex === target) return { ...rule, itemIndex: index };
      return rule;
    });
    setRules(remapped);
  };
  const updateRule = (index: number, patch: Partial<ScheduleRule>) => {
    const next = [...rules];
    next[index] = { ...(next[index] ?? {}), ...patch };
    setRules(next);
  };
  const addRule = () =>
    setRules([
      ...rules,
      { itemIndex: 0, days: [1, 2, 3, 4, 5, 6, 0], start: "09:00", end: "18:00", startDate: "", endDate: "" },
    ]);
  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index));
  const dayOptions = [
    { v: 0, label: "日" },
    { v: 1, label: "月" },
    { v: 2, label: "火" },
    { v: 3, label: "水" },
    { v: 4, label: "木" },
    { v: 5, label: "金" },
    { v: 6, label: "土" },
  ] as const;
  const daySummary = (days: number[] | undefined): string => {
    const normalized = Array.isArray(days) ? days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : [];
    if (normalized.length === 7) return "毎日";
    if (normalized.length === 0) return "未指定";
    return normalized.map((d) => dayOptions.find((opt) => opt.v === d)?.label ?? "").join("・");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">営業時間項目</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => moveItem(i, -1)}
              disabled={i === 0}
              className={`${reorderButtonClass} disabled:opacity-40`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveItem(i, 1)}
              disabled={i === items.length - 1}
              className={`${reorderButtonClass} disabled:opacity-40`}
            >
              ↓
            </button>
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input
            label="曜日・区分"
            value={item.day ?? ""}
            onChange={(e) => updateItem(i, "day", e.target.value)}
            placeholder="毎日 / 平日 / 土日"
          />
          <Input
            label="時間"
            value={item.time ?? ""}
            onChange={(e) => updateItem(i, "time", e.target.value)}
            placeholder="7:00-22:00"
          />
          <Input
            label="補足"
            value={item.label ?? ""}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="最終入場 21:30"
          />
        </div>
      ))}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-700">動的強調（Business限定）</p>
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={dynamicEnabled}
              disabled={!isBusinessEnabled}
              onChange={(e) => onUpdate("dynamicEnabled", e.target.checked)}
              className="rounded border-slate-300"
            />
            有効
          </label>
        </div>
        {!isBusinessEnabled ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
            この機能はBusinessプランで利用できます。非Businessでは静的表示にフォールバックします。
          </p>
        ) : null}
        <div className="mt-3 space-y-2">
          <Input
            label="タイムゾーン"
            value={typeof content.timezone === "string" ? content.timezone : "Asia/Tokyo"}
            onChange={(e) => onUpdate("timezone", e.target.value.trim() || "Asia/Tokyo")}
            placeholder="Asia/Tokyo"
            disabled={!isBusinessEnabled}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">動的ルール</span>
            <button
              type="button"
              onClick={addRule}
              disabled={!isBusinessEnabled}
              className={`${addButtonClass} disabled:opacity-40`}
            >
              + ルール追加
            </button>
          </div>
          {rules.map((rule, i) => {
            const selectedDays = Array.isArray(rule.days) ? rule.days : [];
            return (
              <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-slate-700">ルール {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeRule(i)}
                    disabled={!isBusinessEnabled}
                    className={`${removeButtonClass} disabled:opacity-40`}
                  >
                    削除
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={labelClass}>対象行</label>
                    <select
                      value={typeof rule.itemIndex === "number" ? rule.itemIndex : 0}
                      onChange={(e) => updateRule(i, { itemIndex: parseInt(e.target.value, 10) || 0 })}
                      disabled={!isBusinessEnabled}
                      className={inputClass}
                    >
                      {items.map((item, idx) => (
                        <option key={idx} value={idx}>
                          {item.day || `行 ${idx + 1}`} / {item.time || "-"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="開始時刻"
                    value={typeof rule.start === "string" ? rule.start : ""}
                    onChange={(e) => updateRule(i, { start: e.target.value })}
                    placeholder="09:00"
                    disabled={!isBusinessEnabled}
                  />
                  <Input
                    label="終了時刻"
                    value={typeof rule.end === "string" ? rule.end : ""}
                    onChange={(e) => updateRule(i, { end: e.target.value })}
                    placeholder="18:00"
                    disabled={!isBusinessEnabled}
                  />
                  <div>
                    <label className={labelClass}>開始日（任意）</label>
                    <input
                      type="date"
                      value={typeof rule.startDate === "string" ? rule.startDate : ""}
                      onChange={(e) => updateRule(i, { startDate: e.target.value })}
                      className={inputClass}
                      disabled={!isBusinessEnabled}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>終了日（任意）</label>
                    <input
                      type="date"
                      value={typeof rule.endDate === "string" ? rule.endDate : ""}
                      onChange={(e) => updateRule(i, { endDate: e.target.value })}
                      className={inputClass}
                      disabled={!isBusinessEnabled}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-500">曜日</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dayOptions.map((opt) => {
                      const checked = selectedDays.includes(opt.v);
                      return (
                        <label
                          key={opt.v}
                          className={
                            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs " +
                            (checked ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700")
                          }
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? Array.from(new Set([...selectedDays, opt.v]))
                                : selectedDays.filter((d) => d !== opt.v);
                              updateRule(i, { days: next });
                            }}
                            disabled={!isBusinessEnabled}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500">選択: {daySummary(selectedDays)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MenuHeroFields({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const heroSrc = typeof content.heroSrc === "string" ? content.heroSrc : "";
  const heroAlt = typeof content.heroAlt === "string" ? content.heroAlt : "";

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
      <p className="text-xs font-medium text-slate-600">カード上部ヒーロー（任意）</p>
      <ImageUpload
        onUploaded={(url) => onUpdate("heroSrc", url)}
        className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
      />
      <Input
        label="ヒーロー画像URL"
        value={heroSrc}
        onChange={(e) => onUpdate("heroSrc", e.target.value)}
        placeholder="https://..."
      />
      <Input
        label="ヒーロー代替テキスト"
        value={heroAlt}
        onChange={(e) => onUpdate("heroAlt", e.target.value)}
        placeholder="任意（アクセシビリティ）"
      />
    </div>
  );
}

function MenuItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as MenuItem[];
  const setItems = (next: MenuItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof MenuItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { name: "", price: "", description: "", imageSrc: "", imageAlt: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">メニュー項目</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input
            label="メニュー名"
            value={item.name ?? ""}
            onChange={(e) => updateItem(i, "name", e.target.value)}
            placeholder="朝食ビュッフェ"
          />
          <Input
            label="価格"
            value={item.price ?? ""}
            onChange={(e) => updateItem(i, "price", e.target.value)}
            placeholder="1,800円"
          />
          <Input
            label="説明"
            value={item.description ?? ""}
            onChange={(e) => updateItem(i, "description", e.target.value)}
            placeholder="任意"
          />
          <ImageUpload
            onUploaded={(url) => updateItem(i, "imageSrc", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input
            label="品目画像URL"
            value={item.imageSrc ?? ""}
            onChange={(e) => updateItem(i, "imageSrc", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="品目画像の代替テキスト"
            value={item.imageAlt ?? ""}
            onChange={(e) => updateItem(i, "imageAlt", e.target.value)}
            placeholder="任意"
          />
        </div>
      ))}
    </div>
  );
}

function MenuTagItemsEditor({
  items,
  onChange,
}: {
  items: MenuTagItem[];
  onChange: (next: MenuTagItem[]) => void;
}) {
  const updateItem = (index: number, field: keyof MenuTagItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    onChange(next);
  };
  const addItem = () => onChange([...items, { name: "", price: "", description: "", tag: "", imageSrc: "", imageAlt: "" }]);
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">品目</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input label="名前" value={item.name ?? ""} onChange={(e) => updateItem(i, "name", e.target.value)} />
          <Input label="価格" value={item.price ?? ""} onChange={(e) => updateItem(i, "price", e.target.value)} />
          <Input label="説明" value={item.description ?? ""} onChange={(e) => updateItem(i, "description", e.target.value)} />
          <Input label="タグ（任意）" value={item.tag ?? ""} onChange={(e) => updateItem(i, "tag", e.target.value)} placeholder="人気 / 新作" />
          <ImageUpload
            onUploaded={(url) => updateItem(i, "imageSrc", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input label="品目画像URL" value={item.imageSrc ?? ""} onChange={(e) => updateItem(i, "imageSrc", e.target.value)} placeholder="https://..." />
          <Input
            label="品目画像の代替テキスト"
            value={item.imageAlt ?? ""}
            onChange={(e) => updateItem(i, "imageAlt", e.target.value)}
            placeholder="任意"
          />
        </div>
      ))}
    </div>
  );
}

function MenuCategoriesGroupsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const categories = (Array.isArray(content.categories) ? content.categories : []) as MenuCategoryRow[];
  const setCategories = (next: MenuCategoryRow[]) => onUpdate("categories", next);
  const updateCatTitle = (ci: number, title: string) => {
    const next = [...categories];
    next[ci] = { ...(next[ci] ?? {}), title };
    setCategories(next);
  };
  const updateCatField = (ci: number, field: keyof MenuCategoryRow, value: string) => {
    const next = [...categories];
    next[ci] = { ...(next[ci] ?? {}), [field]: writeJaTextPreserving((next[ci] as Record<string, unknown> | undefined)?.[field], value) };
    setCategories(next);
  };
  const updateCatItems = (ci: number, items: MenuTagItem[]) => {
    const next = [...categories];
    next[ci] = { ...(next[ci] ?? {}), items };
    setCategories(next);
  };
  const addCategory = () =>
    setCategories([
      ...categories,
      {
        title: "新規カテゴリ",
        imageSrc: "",
        imageAlt: "",
        items: [{ name: "", price: "", description: "", tag: "", imageSrc: "", imageAlt: "" }],
      },
    ]);
  const removeCategory = (ci: number) => setCategories(categories.filter((_, i) => i !== ci));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">カテゴリ</span>
        <button type="button" onClick={addCategory} className={addButtonClass}>
          + カテゴリ追加
        </button>
      </div>
      {categories.map((cat, ci) => (
        <div key={ci} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeCategory(ci)} className={removeButtonClass}>
              カテゴリを削除
            </button>
          </div>
          <Input
            label="カテゴリ名"
            value={cat.title ?? ""}
            onChange={(e) => updateCatTitle(ci, e.target.value)}
            placeholder="フード / ドリンク"
          />
          <p className="mt-3 text-[11px] font-medium text-slate-500">カテゴリ画像（任意・バナー）</p>
          <ImageUpload
            onUploaded={(url) => updateCatField(ci, "imageSrc", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input
            label="カテゴリ画像URL"
            value={cat.imageSrc ?? ""}
            onChange={(e) => updateCatField(ci, "imageSrc", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="カテゴリ画像の代替テキスト"
            value={cat.imageAlt ?? ""}
            onChange={(e) => updateCatField(ci, "imageAlt", e.target.value)}
            placeholder="任意"
          />
          <div className="mt-3">
            <MenuTagItemsEditor
              items={Array.isArray(cat.items) ? cat.items : []}
              onChange={(items) => updateCatItems(ci, items)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DrinkItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as DrinkItem[];
  const setItems = (next: DrinkItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof DrinkItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { name: "", sizes: "", note: "", imageSrc: "", imageAlt: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">ドリンク</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input label="名称" value={item.name ?? ""} onChange={(e) => updateItem(i, "name", e.target.value)} />
          <Input label="サイズ・価格" value={item.sizes ?? ""} onChange={(e) => updateItem(i, "sizes", e.target.value)} placeholder="S 350円 / L 450円" />
          <Input label="備考" value={item.note ?? ""} onChange={(e) => updateItem(i, "note", e.target.value)} placeholder="ICE/HOT" />
          <ImageUpload
            onUploaded={(url) => updateItem(i, "imageSrc", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input label="品目画像URL" value={item.imageSrc ?? ""} onChange={(e) => updateItem(i, "imageSrc", e.target.value)} />
          <Input label="品目画像の代替テキスト" value={item.imageAlt ?? ""} onChange={(e) => updateItem(i, "imageAlt", e.target.value)} placeholder="任意" />
        </div>
      ))}
    </div>
  );
}

function SalonItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as SalonItem[];
  const setItems = (next: SalonItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof SalonItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { name: "", duration: "", price: "", description: "", imageSrc: "", imageAlt: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">施術</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input label="施術名" value={item.name ?? ""} onChange={(e) => updateItem(i, "name", e.target.value)} />
          <Input label="所要時間" value={item.duration ?? ""} onChange={(e) => updateItem(i, "duration", e.target.value)} placeholder="60分" />
          <Input label="価格" value={item.price ?? ""} onChange={(e) => updateItem(i, "price", e.target.value)} />
          <Input label="説明" value={item.description ?? ""} onChange={(e) => updateItem(i, "description", e.target.value)} />
          <ImageUpload
            onUploaded={(url) => updateItem(i, "imageSrc", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input label="品目画像URL" value={item.imageSrc ?? ""} onChange={(e) => updateItem(i, "imageSrc", e.target.value)} />
          <Input label="品目画像の代替テキスト" value={item.imageAlt ?? ""} onChange={(e) => updateItem(i, "imageAlt", e.target.value)} placeholder="任意" />
        </div>
      ))}
    </div>
  );
}

function ComboItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as ComboItem[];
  const setItems = (next: ComboItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof ComboItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { name: "", includes: "", price: "", imageSrc: "", imageAlt: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">セット</span>
        <button type="button" onClick={addItem} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass}>
              削除
            </button>
          </div>
          <Input label="セット名" value={item.name ?? ""} onChange={(e) => updateItem(i, "name", e.target.value)} />
          <Input label="内容" value={item.includes ?? ""} onChange={(e) => updateItem(i, "includes", e.target.value)} />
          <Input label="価格" value={item.price ?? ""} onChange={(e) => updateItem(i, "price", e.target.value)} />
          <ImageUpload
            onUploaded={(url) => updateItem(i, "imageSrc", url)}
            className="!items-start !rounded-lg !border !border-slate-200 !bg-white !p-3"
          />
          <Input label="品目画像URL" value={item.imageSrc ?? ""} onChange={(e) => updateItem(i, "imageSrc", e.target.value)} />
          <Input label="品目画像の代替テキスト" value={item.imageAlt ?? ""} onChange={(e) => updateItem(i, "imageAlt", e.target.value)} placeholder="任意" />
        </div>
      ))}
    </div>
  );
}

function MenuTimeBandSlotsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const slots = (Array.isArray(content.slots) ? content.slots : []) as TimeSlotRow[];
  const setSlots = (next: TimeSlotRow[]) => onUpdate("slots", next);
  const updateSlot = (si: number, patch: Partial<TimeSlotRow>) => {
    const next = [...slots];
    next[si] = { ...(next[si] ?? {}), ...patch };
    setSlots(next);
  };
  const updateSlotItems = (si: number, items: MenuTagItem[]) => updateSlot(si, { items });
  const addSlot = () =>
    setSlots([
      ...slots,
      {
        label: "ランチ",
        start: "11:00",
        end: "14:00",
        items: [{ name: "", price: "", description: "", tag: "", imageSrc: "", imageAlt: "" }],
      },
    ]);
  const removeSlot = (si: number) => setSlots(slots.filter((_, i) => i !== si));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">時間帯スロット</span>
        <button type="button" onClick={addSlot} className={addButtonClass}>
          + 追加
        </button>
      </div>
      {slots.map((slot, si) => (
        <div key={si} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeSlot(si)} className={removeButtonClass}>
              スロット削除
            </button>
          </div>
          <Input label="表示名" value={slot.label ?? ""} onChange={(e) => updateSlot(si, { label: e.target.value })} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input label="開始 (HH:MM)" value={slot.start ?? ""} onChange={(e) => updateSlot(si, { start: e.target.value })} />
            <Input label="終了 (HH:MM)" value={slot.end ?? ""} onChange={(e) => updateSlot(si, { end: e.target.value })} />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">同日の範囲のみ対応（終了は含まない）</p>
          <div className="mt-3">
            <MenuTagItemsEditor
              items={Array.isArray(slot.items) ? slot.items : []}
              onChange={(items) => updateSlotItems(si, items)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** CardSettings panel: shows Content, Appearance, and Behavior for the selected card. Updates the canvas in real time. */
export function CardSettings({
  card,
  onUpdate,
  onDuplicateCard,
  onRemoveCard,
  onBulkReplace,
  onRunPrepublishCheck,
  demoMode = false,
  onLockedAction,
  lastAddedCardId = null,
  isBusinessEnabled = false,
}: CardSettingsProps) {
  const translateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ cardId: string; key: string; ja: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePalette, setActivePalette] = useState<SettingsPalette>("content");
  const [bulkFind, setBulkFind] = useState("");
  const [bulkReplaceTo, setBulkReplaceTo] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const pageBackgroundMode = useEditor2Store((s) => s.pageBackgroundMode);
  const pageBackgroundColor = useEditor2Store((s) => s.pageBackgroundColor);
  const pageGradientFrom = useEditor2Store((s) => s.pageGradientFrom);
  const pageGradientTo = useEditor2Store((s) => s.pageGradientTo);
  const pageGradientAngle = useEditor2Store((s) => s.pageGradientAngle);
  const setPageBackground = useEditor2Store((s) => s.setPageBackground);

  useEffect(() => {
    if (card?.id) {
      const isNewlyAdded = card.id === lastAddedCardId;
      scrollRef.current?.scrollTo({ top: 0, behavior: isNewlyAdded ? "auto" : "smooth" });
    }
  }, [card?.id, lastAddedCardId]);

  const flushTranslate = useCallback(() => {
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current);
      translateTimeoutRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending) return;
    const { cardId, key, ja } = pending;
    translateJaToEnZhKo(ja).then((result) => {
      if (!result) return;
      const currentCard = useEditor2Store.getState().cards.find((c) => c.id === cardId);
      if (!currentCard) return;
      const curVal = (currentCard.content as Record<string, unknown>)?.[key];
      const currentJa = getLocalizedContent(curVal as LocalizedString | undefined, "ja");
      if (currentJa !== ja) return;
      onUpdate(cardId, {
        content: {
          ...(currentCard.content as Record<string, unknown>),
          [key]: { ja, en: result.en, zh: result.zh, ko: result.ko },
        },
      });
    });
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (translateTimeoutRef.current) clearTimeout(translateTimeoutRef.current);
    };
  }, []);

  const handleBulkReplace = useCallback(() => {
    if (!onBulkReplace) return;
    const needle = bulkFind.trim();
    if (!needle) {
      setBulkStatus("検索文字を入力してください。");
      return;
    }
    const result = onBulkReplace(needle, bulkReplaceTo);
    if (result.occurrences === 0) {
      setBulkStatus("一致する文字が見つかりませんでした。");
      return;
    }
    setBulkStatus(`置換完了: ${result.cardsUpdated}ブロック / ${result.occurrences}箇所`);
  }, [onBulkReplace, bulkFind, bulkReplaceTo]);


  if (!card) {
    return (
      <>
        <div className="border-b border-slate-200 bg-white px-4 py-4 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
          <h2 className="text-sm font-semibold text-slate-700 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
            ブロック設定
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            キャンバスでブロックを選択すると、ここで編集できます。変更はリアルタイムで反映されます。
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-6">
            <SettingsSection title="ページ背景">
              <div className="w-full">
                <label className={labelClass}>背景タイプ</label>
                <select
                  value={pageBackgroundMode}
                  onChange={(e) =>
                    setPageBackground({ mode: e.target.value as "solid" | "gradient" })
                  }
                  className={inputClass}
                >
                  <option value="solid">単色</option>
                  <option value="gradient">グラデーション</option>
                </select>
              </div>
              {pageBackgroundMode === "solid" ? (
                <div className="w-full">
                  <label className={labelClass}>背景色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={pageBackgroundColor}
                      onChange={(e) => setPageBackground({ color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={pageBackgroundColor}
                      onChange={(e) => setPageBackground({ color: e.target.value || "#ffffff" })}
                      placeholder="#ffffff"
                      className={inputClass + " flex-1"}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <label className={labelClass}>開始色</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={pageGradientFrom}
                        onChange={(e) => setPageBackground({ from: e.target.value })}
                        className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                      />
                      <input
                        type="text"
                        value={pageGradientFrom}
                        onChange={(e) => setPageBackground({ from: e.target.value || "#f8fafc" })}
                        placeholder="#f8fafc"
                        className={inputClass + " flex-1"}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className={labelClass}>終了色</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={pageGradientTo}
                        onChange={(e) => setPageBackground({ to: e.target.value })}
                        className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                      />
                      <input
                        type="text"
                        value={pageGradientTo}
                        onChange={(e) => setPageBackground({ to: e.target.value || "#e2e8f0" })}
                        placeholder="#e2e8f0"
                        className={inputClass + " flex-1"}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className={labelClass}>角度 ({pageGradientAngle}deg)</label>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={pageGradientAngle}
                      onChange={(e) => setPageBackground({ angle: parseInt(e.target.value, 10) || 0 })}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              {demoMode && (
                <button
                  type="button"
                  onClick={() =>
                    onLockedAction?.("デモモードでは詳細設定は利用できません。無料登録で解放されます。")
                  }
                  className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                >
                  デモでは背景の詳細設定は利用できません
                </button>
              )}
            </SettingsSection>
            {!demoMode && (
              <SettingsSection title="一括置換（このページ内）">
              <Input
                label="検索文字"
                value={bulkFind}
                onChange={(e) => setBulkFind(e.target.value)}
                placeholder="例: フロント内線 [番号]"
              />
              <Input
                label="置換後"
                value={bulkReplaceTo}
                onChange={(e) => setBulkReplaceTo(e.target.value)}
                placeholder="例: フロント内線 9"
              />
              <button
                type="button"
                onClick={handleBulkReplace}
                disabled={!onBulkReplace}
                className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                一括置換を実行
              </button>
              {bulkStatus ? <p className="text-xs text-slate-500">{bulkStatus}</p> : null}
              </SettingsSection>
            )}
            {!demoMode && (
              <SettingsSection title="公開前チェック">
              <p className="text-sm text-slate-500">
                公開前に未入力やプレースホルダをチェックします。
              </p>
              <button
                type="button"
                onClick={onRunPrepublishCheck}
                disabled={!onRunPrepublishCheck}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                チェックを実行
              </button>
              </SettingsSection>
            )}
          </div>
        </div>
      </>
    );
  }

  const content = card.content as Record<string, unknown>;
  const style = (card.style ?? {}) as Record<string, unknown>;
  const position = (style._position ?? {}) as Record<string, unknown>;
  const rawSpaceHeight = Number(position.h ?? content.height ?? 48);
  const spaceHeight = Number.isFinite(rawSpaceHeight) ? Math.max(0, Math.min(480, rawSpaceHeight)) : 48;
  const update = (key: string, value: unknown) => {
    onUpdate(card.id, { content: { ...content, [key]: value } });
  };
  const updateStyle = (key: string, value: unknown) => {
    const next = value === undefined || value === "" ? undefined : value;
    const nextStyle = next != null ? { ...style, [key]: next } : { ...style };
    if (next === undefined) delete nextStyle[key];
    onUpdate(card.id, { style: nextStyle } as CardUpdatePatch);
  };
  const updateStyles = (patch: Record<string, unknown>) => {
    const nextStyle = { ...style } as Record<string, unknown>;
    for (const [key, value] of Object.entries(patch)) {
      const next = value === undefined || value === "" ? undefined : value;
      if (next === undefined) delete nextStyle[key];
      else nextStyle[key] = next;
    }
    onUpdate(card.id, { style: nextStyle } as CardUpdatePatch);
  };
  /** 多言語フィールドの表示値（日本語を優先） */
  const display = (key: string) =>
    getLocalizedContent(content[key] as LocalizedString | undefined, "ja");

  const isFacilityGuideBlock = card.type === "breakfast" || card.type === "spa";
  const isBusinessOnlyCard = BUSINESS_ONLY_CARD_TYPES.includes(card.type);
  const businessLocked = isBusinessOnlyCard && !isBusinessEnabled;
  const noTextFormattingCardTypes: Array<EditorCard["type"]> = ["image", "divider", "space"];
  const noTitleTypographyCardTypes: Array<EditorCard["type"]> = ["text", "image", "divider", "space"];
  const noBodyTypographyCardTypes: Array<EditorCard["type"]> = ["button", "action", "image", "divider", "space"];
  const noTextAlignCardTypes: Array<EditorCard["type"]> = [
    "action",
    "button",
    "pageLinks",
    "schedule",
    "kpi",
    "compare",
    "campaign_timer",
    "social_links",
    "progress_steps",
    "image",
    "divider",
    "space",
  ];
  const noLineHeightCardTypes: Array<EditorCard["type"]> = [
    "action",
    "button",
    "pageLinks",
    "schedule",
    "kpi",
    "compare",
    "campaign_timer",
    "social_links",
    "progress_steps",
    "image",
    "divider",
    "space",
  ];
  const supportsTextFormatting = !noTextFormattingCardTypes.includes(card.type);
  const supportsTextAlign = !noTextAlignCardTypes.includes(card.type);
  const supportsLineHeight = !noLineHeightCardTypes.includes(card.type);
  const supportsGlobalFontSize = supportsTextFormatting;
  const supportsTitleFontSize = !noTitleTypographyCardTypes.includes(card.type);
  const supportsBodyFontSize = !noBodyTypographyCardTypes.includes(card.type);
  const supportsGlobalFontWeight = supportsGlobalFontSize;
  const supportsTitleFontWeight = supportsTitleFontSize;
  const supportsBodyFontWeight = supportsBodyFontSize;
  const canEditCard = Boolean(onDuplicateCard || onRemoveCard);
  const jumpToSection = (sectionId: string) => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`#${sectionId}`);
    if (!target) return;
    const details = target.closest("details");
    if (details instanceof HTMLDetailsElement) {
      details.open = true;
    }
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - 8;
    container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  };
  const activatePalette = (palette: SettingsPalette, sectionId: string) => {
    setActivePalette(palette);
    jumpToSection(sectionId);
  };
  const handleDuplicateCard = () => {
    if (!card || !onDuplicateCard) return;
    onDuplicateCard(card.id);
  };
  const handleRemoveCard = () => {
    if (!card || !onRemoveCard) return;
    onRemoveCard(card.id);
  };
  const facilityTime = card.type === "spa" ? display("time") || display("hours") : display("time");
  const facilityDetail =
    card.type === "spa"
      ? display("menu") || display("description") || display("note")
      : display("menu");

  /** 多言語フィールドの更新（既存の他言語を保持し ja を更新）。入力後に自動で en/zh/ko を翻訳。 */
  const updateLocalized = (key: string, value: string) => {
    const cur = content[key];
    const next = isLocalizedObject(cur) ? { ...cur, ja: value } : value;
    update(key, next);

    if (value.length < MIN_TEXT_LENGTH_FOR_TRANSLATE) return;
    if (translateTimeoutRef.current) clearTimeout(translateTimeoutRef.current);
    pendingRef.current = { cardId: card.id, key, ja: value };
    translateTimeoutRef.current = setTimeout(flushTranslate, TRANSLATE_DEBOUNCE_MS);
  };

  const updateFacilityLocalized = (key: "title" | "time" | "location" | "menu", value: string) => {
    if (card.type !== "spa") {
      updateLocalized(key, value);
      return;
    }
    if (key === "time") {
      updateLocalized("time", value);
      updateLocalized("hours", value);
      return;
    }
    if (key === "menu") {
      updateLocalized("menu", value);
      updateLocalized("description", value);
      return;
    }
    updateLocalized(key, value);
  };

  if (businessLocked) {
    return (
      <>
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">ブロック設定</h2>
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 text-lg font-extrabold tracking-tight text-slate-950">
                {CARD_TYPE_LABELS[card.type]}
              </p>
              {canEditCard ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDuplicateCard}
                    disabled={!onDuplicateCard}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
                  >
                    コピー
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCard}
                    disabled={!onRemoveCard}
                    className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
                  >
                    削除
                  </button>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">ビジネスプラン限定ブロック</p>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
          <section className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            このブロックの編集はビジネスプランでご利用いただけます。公開ページでの表示は維持されます。
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-700 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">ブロック設定</h2>
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-lg font-extrabold tracking-tight text-slate-950">
              {CARD_TYPE_LABELS[card.type]}
            </p>
            {canEditCard ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDuplicateCard}
                  disabled={!onDuplicateCard}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
                >
                  コピー
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCard}
                  disabled={!onRemoveCard}
                  className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
                >
                  削除
                </button>
              </div>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">変更はリアルタイムで反映されます</p>
          <div className="flex gap-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => activatePalette("content", contentSectionId)}
              className={`rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition min-h-[40px] [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] ${
                activePalette === "content"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              コンテンツ
            </button>
            <button
              type="button"
              onClick={() => activatePalette("appearance", appearanceSectionId)}
              className={`rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition min-h-[40px] [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] ${
                activePalette === "appearance"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              見た目
            </button>
            <button
              type="button"
              onClick={() => activatePalette("appearance-background", appearanceBackgroundId)}
              className={`rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition min-h-[40px] [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] ${
                activePalette === "appearance-background"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              色・背景
            </button>
            <button
              type="button"
              onClick={() => activatePalette("appearance-border", appearanceBorderId)}
              className={`rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition min-h-[40px] [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] ${
                activePalette === "appearance-border"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              枠線
            </button>
            <button
              type="button"
              onClick={() => activatePalette("appearance-spacing", appearanceSpacingId)}
              className={`rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition min-h-[40px] [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] ${
                activePalette === "appearance-spacing"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              サイズ・影
            </button>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
        <div id={contentSectionId} className="space-y-6">
          {card.type === "welcome" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ようこそ"
              />
              <div className="w-full">
                <label className={labelClass}>メッセージ</label>
                <textarea
                  value={display("message")}
                  onChange={(e) => updateLocalized("message", e.target.value)}
                  placeholder="おもてなしメッセージ"
                  rows={3}
                  className={inputClass}
                />
              </div>
            </SettingsSection>
          )}

          {card.type === "hero" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="Infomii Hotel"
              />
              <Input
                label="サブタイトル"
                value={display("subtitle")}
                onChange={(e) => updateLocalized("subtitle", e.target.value)}
                placeholder="任意"
              />
              <div className="w-full">
                <label className={labelClass}>画像</label>
                <ImageUpload onUploaded={(url) => update("image", url)} className="mt-1.5" />
              </div>
            </SettingsSection>
          )}

          {card.type === "hero_slider" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="おすすめ案内"
              />
              <HeroSliderItemsEditor content={content} onUpdate={update} />
              <div className="w-full">
                <label className={labelClass}>高さ</label>
                <select
                  value={(content.height as string) ?? "m"}
                  onChange={(e) => update("height", e.target.value)}
                  className={inputClass}
                >
                  <option value="s">小</option>
                  <option value="m">標準</option>
                  <option value="l">大</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className={checkboxRowClass}>
                  <input type="checkbox" checked={content.autoplay !== false} onChange={(e) => update("autoplay", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  自動再生
                </label>
                <label className={checkboxRowClass}>
                  <input type="checkbox" checked={content.showCaptions !== false} onChange={(e) => update("showCaptions", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  キャプション表示
                </label>
                <label className={checkboxRowClass}>
                  <input type="checkbox" checked={content.transitionEnabled !== false} onChange={(e) => update("transitionEnabled", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  トランジション
                </label>
              </div>
              <div className="w-full">
                <label className={labelClass}>トランジション種別</label>
                <select
                  value={(content.transitionType as string) ?? "fade"}
                  onChange={(e) => update("transitionType", e.target.value)}
                  className={inputClass}
                >
                  <option value="fade">フワッと</option>
                  <option value="slide">スクロール</option>
                  <option value="zoom">ズーム</option>
                </select>
              </div>
              <Input
                label="トランジション時間（ms）"
                type="number"
                min={250}
                max={1200}
                step={50}
                value={(content.transitionDurationMs as number | string | undefined) ?? 500}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    update("transitionDurationMs", "");
                    return;
                  }
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed)) return;
                  update("transitionDurationMs", parsed);
                }}
                onBlur={(e) => {
                  const parsed = Number(e.target.value);
                  update("transitionDurationMs", Number.isFinite(parsed) ? Math.max(250, Math.min(1200, parsed)) : 500);
                }}
                placeholder="250-1200"
              />
              <Input
                label="自動再生間隔（秒）"
                type="number"
                min={2}
                max={10}
                step={1}
                value={(content.intervalSec as number | string | undefined) ?? 4}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    update("intervalSec", "");
                    return;
                  }
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed)) return;
                  update("intervalSec", parsed);
                }}
                onBlur={(e) => {
                  const parsed = Number(e.target.value);
                  update("intervalSec", Number.isFinite(parsed) ? Math.max(2, Math.min(10, parsed)) : 4);
                }}
                placeholder="2-10"
              />
            </SettingsSection>
          )}

          {card.type === "info" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="Wi-Fi"
              />
              <IconTokenSelect
                label="アイコン"
                value={(content.icon as string) ?? ""}
                onChange={(next) => update("icon", next)}
                className={inputClass}
                labelClassName={labelClass}
              />
              <InfoRowsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "highlight" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="重要なお知らせ"
              />
              <div className="w-full">
                <label className={labelClass}>本文</label>
                <textarea
                  value={display("body")}
                  onChange={(e) => updateLocalized("body", e.target.value)}
                  placeholder="強調したい内容"
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="w-full">
                <label className={labelClass}>アクセント</label>
                <select
                  value={(content.accent as string) ?? "amber"}
                  onChange={(e) => update("accent", e.target.value)}
                  className={inputClass}
                >
                  <option value="amber">アンバー</option>
                  <option value="blue">ブルー</option>
                  <option value="emerald">エメラルド</option>
                </select>
              </div>
            </SettingsSection>
          )}

          {card.type === "action" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="ラベル"
                value={display("label")}
                onChange={(e) => update("label", e.target.value)}
                placeholder="詳しく見る"
              />
              <Input
                label="リンクURL"
                value={display("href")}
                onChange={(e) => update("href", e.target.value)}
                placeholder="https://... または #"
              />
            </SettingsSection>
          )}

          {card.type === "text" && (
            <SettingsSection title="コンテンツ">
                <div className="w-full">
                  <label className={labelClass}>テキスト</label>
                  <textarea
                    value={display("content")}
                    onChange={(e) => updateLocalized("content", e.target.value)}
                    placeholder="見出しまたは本文"
                    rows={3}
                    className={inputClass}
                  />
                </div>
            </SettingsSection>
          )}

          {card.type === "heading_body" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="見出しテキスト"
              />
              <div className="w-full">
                <label className={labelClass}>本文</label>
                <textarea
                  value={display("body")}
                  onChange={(e) => updateLocalized("body", e.target.value)}
                  placeholder="本文テキスト"
                  rows={4}
                  className={inputClass}
                />
              </div>
              <label className={checkboxRowClass}>
                <input
                  type="checkbox"
                  checked={content.dividerEnabled === true}
                  onChange={(e) => update("dividerEnabled", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary"
                />
                区切り線を表示
              </label>
              {content.dividerEnabled === true ? (
                <div className="w-full">
                  <label className={labelClass}>線種</label>
                  <select
                    value={(content.dividerStyle as string) === "dashed" ? "dashed" : "solid"}
                    onChange={(e) => update("dividerStyle", e.target.value)}
                    className={inputClass}
                  >
                    <option value="solid">実線</option>
                    <option value="dashed">破線</option>
                  </select>
                </div>
              ) : null}
            </SettingsSection>
          )}

          {card.type === "image" && (
            <SettingsSection title="コンテンツ">
                <div className="w-full">
                  <label className={labelClass}>画像</label>
                  <ImageUpload
                    onUploaded={(url) => update("src", url)}
                    className="mt-1.5"
                  />
                </div>
                <Input
                  label="代替テキスト"
                  value={display("alt")}
                  onChange={(e) => updateLocalized("alt", e.target.value)}
                  placeholder="画像の説明"
                />
            </SettingsSection>
          )}

          {card.type === "icon" && (
            <SettingsSection title="コンテンツ">
              <IconTokenSelect
                label="アイコン"
                value={(content.icon as string) ?? ""}
                onChange={(next) => update("icon", next)}
                className={inputClass}
                labelClassName={labelClass}
              />
              <Input
                label="ラベル"
                value={display("label")}
                onChange={(e) => updateLocalized("label", e.target.value)}
                placeholder="ラベル"
              />
              <Input
                label="補足"
                value={display("description")}
                onChange={(e) => updateLocalized("description", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "wifi" && (
            <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="例: ゲストWi-Fi"
                />
                <Input
                  label="Wi-Fi名（SSID）"
                  value={display("ssid")}
                  onChange={(e) => updateLocalized("ssid", e.target.value)}
                  placeholder="ネットワーク名"
                />
                <Input
                  label="パスワード"
                  value={display("password")}
                  onChange={(e) => updateLocalized("password", e.target.value)}
                  placeholder="パスワード"
                />
            </SettingsSection>
          )}

          {isFacilityGuideBlock && (
            <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateFacilityLocalized("title", e.target.value)}
                  placeholder="施設案内"
                />
                <Input
                  label="時間"
                  value={facilityTime}
                  onChange={(e) => updateFacilityLocalized("time", e.target.value)}
                  placeholder="7:00–9:30"
                />
                <Input
                  label="場所"
                  value={display("location")}
                  onChange={(e) => updateFacilityLocalized("location", e.target.value)}
                  placeholder="1F ダイニング"
                />
                <div className="w-full">
                  <label className={labelClass}>詳細</label>
                  <textarea
                    value={facilityDetail}
                    onChange={(e) => updateFacilityLocalized("menu", e.target.value)}
                    placeholder="メニュー・補足など"
                    rows={2}
                    className={inputClass}
                  />
                </div>
            </SettingsSection>
          )}

          {card.type === "checkout" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="チェックアウト"
              />
              <Input
                label="時間"
                value={display("time")}
                onChange={(e) => updateLocalized("time", e.target.value)}
                placeholder="11:00"
              />
              <Input
                label="補足"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
              <Input
                label="リンクURL"
                value={display("linkUrl")}
                onChange={(e) => update("linkUrl", e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="リンクラベル"
                value={display("linkLabel")}
                onChange={(e) => updateLocalized("linkLabel", e.target.value)}
                placeholder="詳細"
              />
            </SettingsSection>
          )}

          {card.type === "taxi" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="タクシー"
              />
              <Input
                label="電話番号"
                value={display("phone")}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="03-1234-5678"
              />
              <Input
                label="会社名"
                value={display("companyName")}
                onChange={(e) => updateLocalized("companyName", e.target.value)}
                placeholder="〇〇タクシー"
              />
              <Input
                label="補足"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "restaurant" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="レストラン"
              />
              <Input
                label="営業時間"
                value={display("time")}
                onChange={(e) => updateLocalized("time", e.target.value)}
                placeholder="7:00–22:00"
              />
              <Input
                label="場所"
                value={display("location")}
                onChange={(e) => updateLocalized("location", e.target.value)}
                placeholder="1F"
              />
              <Input
                label="メニュー・備考"
                value={display("menu")}
                onChange={(e) => updateLocalized("menu", e.target.value)}
                placeholder="メニュー・備考"
              />
            </SettingsSection>
          )}

          {card.type === "laundry" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ランドリー"
              />
              <Input
                label="営業時間"
                value={display("hours")}
                onChange={(e) => updateLocalized("hours", e.target.value)}
                placeholder="9:00–18:00"
              />
              <Input
                label="料金・備考"
                value={display("priceNote")}
                onChange={(e) => updateLocalized("priceNote", e.target.value)}
                placeholder="料金表・注意事項"
              />
              <Input
                label="連絡先"
                value={display("contact")}
                onChange={(e) => updateLocalized("contact", e.target.value)}
                placeholder="内線1234"
              />
            </SettingsSection>
          )}

          {card.type === "parking" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="駐車場"
              />
              <Input
                label="台数"
                value={display("capacity")}
                onChange={(e) => updateLocalized("capacity", e.target.value)}
                placeholder="50台"
              />
              <Input
                label="料金"
                value={display("fee")}
                onChange={(e) => updateLocalized("fee", e.target.value)}
                placeholder="無料"
              />
              <Input
                label="場所"
                value={display("address")}
                onChange={(e) => updateLocalized("address", e.target.value)}
                placeholder="敷地内"
              />
              <div className="w-full">
                <label className={labelClass}>備考</label>
                <textarea
                  value={display("note")}
                  onChange={(e) => updateLocalized("note", e.target.value)}
                  placeholder="注意事項・利用時間"
                  rows={2}
                  className={inputClass}
                />
              </div>
            </SettingsSection>
          )}

          {card.type === "pageLinks" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="メニュー"
              />
              <PageLinksItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "emergency" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="緊急連絡先"
              />
              <Input
                label="消防"
                value={display("fire")}
                onChange={(e) => update("fire", e.target.value)}
                placeholder="119"
              />
              <Input
                label="警察"
                value={display("police")}
                onChange={(e) => update("police", e.target.value)}
                placeholder="110"
              />
              <Input
                label="病院"
                value={display("hospital")}
                onChange={(e) => updateLocalized("hospital", e.target.value)}
                placeholder="救急病院番号・住所"
              />
              <Input
                label="補足"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "map" && (
            <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="例: 場所"
                />
                <div className="w-full">
                  <label className={labelClass}>住所</label>
                  <textarea
                    value={display("address")}
                    onChange={(e) => updateLocalized("address", e.target.value)}
                    placeholder="住所または場所名"
                    rows={2}
                    className={inputClass}
                  />
                </div>
                <div className="w-full">
                  <label className={labelClass}>Googleマップ埋め込み</label>
                  <textarea
                    value={display("mapEmbedUrl")}
                    onChange={(e) => update("mapEmbedUrl", e.target.value)}
                    placeholder="Googleマップの共有URL または iframe埋め込みコードを貼り付け"
                    rows={3}
                    className={inputClass}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    共有URL・「地図を埋め込む」のiframeコードのどちらでもOKです。
                  </p>
                </div>
            </SettingsSection>
          )}

          {card.type === "nearby" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="周辺案内"
              />
              <NearbyItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}


          {card.type === "notice" && (
            <>
              <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="お知らせ"
                />
                <div className="w-full">
                  <label className={labelClass}>本文</label>
                  <textarea
                    value={display("body")}
                    onChange={(e) => updateLocalized("body", e.target.value)}
                    placeholder="お知らせ内容"
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </SettingsSection>
              <SettingsSection title="表示オプション" sectionId={displaySectionId}>
                <div className="w-full">
                  <label className={labelClass}>重要度スタイル</label>
                  <select
                    value={(content.variant as string) ?? "info"}
                    onChange={(e) => {
                      const v = e.target.value;
                      onUpdate(card.id, {
                        content: {
                          ...content,
                          variant: v,
                        },
                      });
                    }}
                    className={inputClass}
                  >
                    {NOTICE_PRIORITY_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
            </>
          )}

          {card.type === "button" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="ラベル"
                value={display("label")}
                onChange={(e) => updateLocalized("label", e.target.value)}
                placeholder="ボタンテキスト"
              />
              <Input
                label="リンク"
                value={display("href")}
                onChange={(e) => update("href", e.target.value)}
                placeholder="https://..."
              />
            </SettingsSection>
          )}

          {card.type === "campaign_timer" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="キャンペーン名"
              />
              <div className="w-full">
                <label className={labelClass}>説明</label>
                <textarea
                  value={display("description")}
                  onChange={(e) => updateLocalized("description", e.target.value)}
                  placeholder="任意"
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="w-full">
                <label className={labelClass}>開始日時</label>
                <input
                  type="datetime-local"
                  value={isoToLocalInput(content.startAt)}
                  onChange={(e) => update("startAt", localInputToIso(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="w-full">
                <label className={labelClass}>終了日時</label>
                <input
                  type="datetime-local"
                  value={isoToLocalInput(content.endAt)}
                  onChange={(e) => update("endAt", localInputToIso(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className={checkboxRowClass}>
                  <input type="checkbox" checked={content.hideBeforeStart === true} onChange={(e) => update("hideBeforeStart", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  開始前は非表示
                </label>
                <label className={checkboxRowClass}>
                  <input type="checkbox" checked={content.hideAfterEnd === true} onChange={(e) => update("hideAfterEnd", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  終了後は非表示
                </label>
                <label className={checkboxRowClass}>
                  <input type="checkbox" checked={content.showSeconds !== false} onChange={(e) => update("showSeconds", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  秒を表示
                </label>
              </div>
              <Input label="CTAラベル" value={display("ctaLabel")} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="詳細を見る" />
              <Input label="CTA URL" value={display("ctaUrl")} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="https://..." />
            </SettingsSection>
          )}

          {card.type === "gallery" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="任意のギャラリー名"
              />
              <GalleryItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "divider" && (
            <SettingsSection title="表示オプション" sectionId={displaySectionId}>
              <div className="w-full">
                <label className={labelClass}>スタイル</label>
                <select
                  value={(content.style as string) ?? "line"}
                  onChange={(e) => update("style", e.target.value)}
                  className={inputClass}
                >
                  <option value="line">実線</option>
                  <option value="dotted">点線</option>
                </select>
              </div>
            </SettingsSection>
          )}

          {card.type === "space" && (
            <SettingsSection title="コンテンツ" contentClassName={compactGridClass}>
              <div className="w-full">
                <label className={labelClass}>現在の余白 (px)</label>
                <input
                  type="number"
                  value={spaceHeight}
                  readOnly
                  className={inputClass}
                />
              </div>
              <p className="text-xs text-slate-500">
                青枠を上下にドラッグすると余白が変わり、ここに現在のpxが表示されます。
              </p>
            </SettingsSection>
          )}

          {card.type === "faq" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="よくある質問"
              />
              <FaqItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "faq_search" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="よくあるご質問"
              />
              <Input
                label="検索プレースホルダ"
                value={display("placeholder")}
                onChange={(e) => update("placeholder", e.target.value)}
                placeholder="キーワードで検索"
              />
              <FaqItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "quote" && (
            <SettingsSection title="コンテンツ">
              <div className="w-full">
                <label className={labelClass}>引用文</label>
                <textarea
                  value={display("quote")}
                  onChange={(e) => updateLocalized("quote", e.target.value)}
                  placeholder="引用文"
                  rows={3}
                  className={inputClass}
                />
              </div>
              <Input
                label="出典・著者"
                value={display("author")}
                onChange={(e) => updateLocalized("author", e.target.value)}
                placeholder="フロント / レビュー投稿者"
              />
            </SettingsSection>
          )}

          {card.type === "checklist" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="チェックリスト"
              />
              <ChecklistItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "steps" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ご利用ステップ"
              />
              <StepsItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "tabs_info" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="館内案内タブ"
              />
              <div className="w-full">
                <label className={labelClass}>初期表示タブ</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={(content.defaultIndex as number | string | undefined) ?? 0}
                  onChange={(e) => update("defaultIndex", Number(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <TabsInfoItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "compare" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="比較"
              />
              <div className={compactGridClass}>
                <Input
                  label="左タイトル"
                  value={display("leftTitle")}
                  onChange={(e) => updateLocalized("leftTitle", e.target.value)}
                  placeholder="スタンダード"
                />
                <Input
                  label="右タイトル"
                  value={display("rightTitle")}
                  onChange={(e) => updateLocalized("rightTitle", e.target.value)}
                  placeholder="プレミアム"
                />
                <Input
                  label="左説明"
                  value={display("leftBody")}
                  onChange={(e) => updateLocalized("leftBody", e.target.value)}
                  placeholder="内容"
                />
                <Input
                  label="右説明"
                  value={display("rightBody")}
                  onChange={(e) => updateLocalized("rightBody", e.target.value)}
                  placeholder="内容"
                />
              </div>
            </SettingsSection>
          )}

          {card.type === "kpi" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="KPI"
              />
              <KpiItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "notice_ticker" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="お知らせ"
              />
              <div className="w-full">
                <label className={labelClass}>速度</label>
                <select
                  value={(content.speed as string) ?? "normal"}
                  onChange={(e) => update("speed", e.target.value)}
                  className={inputClass}
                >
                  <option value="slow">ゆっくり</option>
                  <option value="normal">標準</option>
                  <option value="fast">はやい</option>
                </select>
              </div>
              <label className={checkboxInlineRowClass}>
                <input
                  type="checkbox"
                  checked={content.pauseOnHover !== false}
                  onChange={(e) => update("pauseOnHover", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                ホバー時に停止
              </label>
              <TickerItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "coupon" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ご宿泊者限定クーポン"
              />
              <Input
                label="クーポンコード"
                value={display("code")}
                onChange={(e) => update("code", e.target.value)}
                placeholder="WELCOME10"
              />
              <Input
                label="有効期限"
                value={display("expiryText")}
                onChange={(e) => update("expiryText", e.target.value)}
                placeholder="有効期限: 2026/12/31"
              />
              <div className="w-full">
                <label className={labelClass}>注意事項</label>
                <textarea
                  value={display("notes")}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="利用条件や注意点"
                  rows={2}
                  className={inputClass}
                />
              </div>
              <Input
                label="CTAラベル（任意）"
                value={display("ctaLabel")}
                onChange={(e) => update("ctaLabel", e.target.value)}
                placeholder="詳細を見る"
              />
              <Input
                label="CTAリンクURL（任意）"
                value={display("ctaUrl")}
                onChange={(e) => update("ctaUrl", e.target.value)}
                placeholder="https://..."
              />
              <div className="w-full">
                <label className={labelClass}>CTA背景色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={(() => {
                      const v = (content.ctaBgColor as string) ?? "#0f172a";
                      const hex = v.startsWith("#") ? v.slice(1) : v;
                      return hex.length >= 6 ? `#${hex.slice(0, 6)}` : "#0f172a";
                    })()}
                    onChange={(e) => update("ctaBgColor", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={(content.ctaBgColor as string) ?? ""}
                    onChange={(e) => update("ctaBgColor", e.target.value || undefined)}
                    placeholder="#0f172a"
                    className={inputClass + " flex-1"}
                  />
                </div>
              </div>
              <div className="w-full">
                <label className={labelClass}>CTA文字色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={(() => {
                      const v = (content.ctaTextColor as string) ?? "#ffffff";
                      const hex = v.startsWith("#") ? v.slice(1) : v;
                      return hex.length >= 6 ? `#${hex.slice(0, 6)}` : "#ffffff";
                    })()}
                    onChange={(e) => update("ctaTextColor", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={(content.ctaTextColor as string) ?? ""}
                    onChange={(e) => update("ctaTextColor", e.target.value || undefined)}
                    placeholder="#ffffff"
                    className={inputClass + " flex-1"}
                  />
                </div>
              </div>
            </SettingsSection>
          )}

          {card.type === "accordion_info" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => updateLocalized("title", e.target.value)} placeholder="よくあるご案内" />
              <AccordionItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "open_status" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => updateLocalized("title", e.target.value)} placeholder="営業時間" />
              <div className="w-full">
                <label className={labelClass}>判定モード</label>
                <select value={(content.mode as string) ?? "manual"} onChange={(e) => update("mode", e.target.value)} className={inputClass}>
                  <option value="manual">手動</option>
                  <option value="hours">時間帯で自動</option>
                </select>
              </div>
              {(content.mode as string) !== "hours" ? (
                <label className={checkboxInlineRowClass}>
                  <input type="checkbox" checked={content.openNow !== false} onChange={(e) => update("openNow", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary" />
                  現在営業中
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input label="開始時刻" value={String(content.startHour ?? 7)} onChange={(e) => update("startHour", Number(e.target.value) || 0)} placeholder="7" />
                  <Input label="終了時刻" value={String(content.endHour ?? 23)} onChange={(e) => update("endHour", Number(e.target.value) || 24)} placeholder="23" />
                </div>
              )}
              <Input label="営業時間テキスト" value={display("hoursText")} onChange={(e) => updateLocalized("hoursText", e.target.value)} placeholder="7:00-23:00" />
              <Input label="営業中ラベル" value={display("openLabel")} onChange={(e) => updateLocalized("openLabel", e.target.value)} placeholder="営業中" />
              <Input label="営業時間外ラベル" value={display("closedLabel")} onChange={(e) => updateLocalized("closedLabel", e.target.value)} placeholder="営業時間外" />
            </SettingsSection>
          )}

          {card.type === "social_links" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => updateLocalized("title", e.target.value)} placeholder="公式SNS" />
              <SocialLinksItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "contact_hub" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => updateLocalized("title", e.target.value)} placeholder="お問い合わせ" />
              <div className={compactGridClass}>
                <Input label="電話番号" value={display("phone")} onChange={(e) => update("phone", e.target.value)} placeholder="03-1234-5678" />
                <Input label="メール" value={display("email")} onChange={(e) => update("email", e.target.value)} placeholder="front@example.com" />
                <Input label="LINE URL" value={display("lineUrl")} onChange={(e) => update("lineUrl", e.target.value)} placeholder="https://..." />
                <Input label="地図URL" value={display("mapUrl")} onChange={(e) => update("mapUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div className="w-full">
                <label className={labelClass}>補足</label>
                <textarea value={display("note")} onChange={(e) => updateLocalized("note", e.target.value)} rows={2} className={inputClass} />
              </div>
            </SettingsSection>
          )}

          {card.type === "progress_steps" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => updateLocalized("title", e.target.value)} placeholder="ご利用の流れ" />
              <Input label="現在ステップ" value={String(content.currentStep ?? 1)} onChange={(e) => update("currentStep", Number(e.target.value) || 1)} placeholder="1" />
              <ProgressItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "emergency_banner" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => {
                updateLocalized("title", e.target.value);
              }} placeholder="緊急のお知らせ" />
              <div className="w-full">
                <label className={labelClass}>本文</label>
                <textarea value={display("message")} onChange={(e) => {
                  updateLocalized("message", e.target.value);
                }} rows={3} className={inputClass} />
              </div>
              <div className="w-full">
                <label className={labelClass}>重要度</label>
                <select value={(content.level as string) ?? "high"} onChange={(e) => {
                  update("level", e.target.value);
                }} className={inputClass}>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </SettingsSection>
          )}

          {card.type === "scheduled_banner" && (
            <SettingsSection title="コンテンツ">
              <Input label="タイトル" value={display("title")} onChange={(e) => {
                updateLocalized("title", e.target.value);
              }} placeholder="期間限定のお知らせ" />
              <div className="w-full">
                <label className={labelClass}>本文</label>
                <textarea value={display("message")} onChange={(e) => {
                  updateLocalized("message", e.target.value);
                }} rows={3} className={inputClass} />
              </div>
              <div className="w-full">
                <label className={labelClass}>開始日時</label>
                <input type="datetime-local" value={isoToLocalInput(content.startAt)} onChange={(e) => {
                  const next = localInputToIso(e.target.value);
                  update("startAt", next);
                }} className={inputClass} />
              </div>
              <div className="w-full">
                <label className={labelClass}>終了日時</label>
                <input type="datetime-local" value={isoToLocalInput(content.endAt)} onChange={(e) => {
                  const next = localInputToIso(e.target.value);
                  update("endAt", next);
                }} className={inputClass} />
              </div>
            </SettingsSection>
          )}

          {card.type === "schedule" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="営業時間"
              />
              <ScheduleItemsEditor content={content} onUpdate={update} isBusinessEnabled={isBusinessEnabled} />
            </SettingsSection>
          )}

          {card.type === "menu" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="メニュー"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <MenuItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "menu_categories" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="メニュー"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <MenuCategoriesGroupsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "daily_special" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="本日のおすすめ"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={content.showDate === true}
                  onChange={(e) => update("showDate", e.target.checked)}
                  className="rounded border-slate-300"
                />
                日付を表示（自動：今日の日付。下記で上書き可）
              </label>
              <Input
                label="日付の上書き（任意）"
                value={typeof content.dateOverride === "string" ? content.dateOverride : ""}
                onChange={(e) => update("dateOverride", e.target.value)}
                placeholder="例: 2026年4月12日（空なら自動）"
              />
              <MenuTagItemsEditor
                items={(Array.isArray(content.items) ? content.items : []) as MenuTagItem[]}
                onChange={(items) => update("items", items)}
              />
            </SettingsSection>
          )}

          {card.type === "drink_menu" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ドリンク"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <DrinkItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "salon_service_menu" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="施術メニュー"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <SalonItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "combo_set_menu" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="セット・コース"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <ComboItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "menu_sheet_sync" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="メニュー"
              />
              <Input
                label="CSVのURL（https・公開リンク）"
                value={typeof content.csvUrl === "string" ? content.csvUrl : ""}
                onChange={(e) => update("csvUrl", e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0"
              />
              <Input
                label="区切り文字"
                value={typeof content.delimiter === "string" ? content.delimiter : ","}
                onChange={(e) => update("delimiter", e.target.value.slice(0, 1) || ",")}
                placeholder=","
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={content.hasHeader !== false}
                  onChange={(e) => update("hasHeader", e.target.checked)}
                  className="rounded border-slate-300"
                />
                1行目をヘッダーとしてスキップ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="名前列（0始まり）"
                  value={String(content.nameColumn ?? 0)}
                  onChange={(e) => update("nameColumn", parseInt(e.target.value, 10) || 0)}
                />
                <Input
                  label="価格列"
                  value={String(content.priceColumn ?? 1)}
                  onChange={(e) => update("priceColumn", parseInt(e.target.value, 10) || 0)}
                />
                <Input
                  label="説明列（-1で無効）"
                  value={String(content.descriptionColumn ?? 2)}
                  onChange={(e) => update("descriptionColumn", parseInt(e.target.value, 10))}
                />
                <Input
                  label="タグ列（-1で無効）"
                  value={String(content.tagColumn ?? -1)}
                  onChange={(e) => update("tagColumn", parseInt(e.target.value, 10))}
                />
              </div>
              <Input
                label="取得失敗時の文言"
                value={display("fallbackText")}
                onChange={(e) => updateLocalized("fallbackText", e.target.value)}
              />
              <Input
                label="クライアントキャッシュ（秒）"
                value={String(content.cacheTtlSec ?? 120)}
                onChange={(e) => update("cacheTtlSec", Math.min(600, Math.max(30, parseInt(e.target.value, 10) || 120)))}
              />
            </SettingsSection>
          )}

          {card.type === "menu_time_band" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="時間帯別メニュー"
              />
              <MenuHeroFields content={content} onUpdate={update} />
              <Input
                label="タイムゾーン（IANA）"
                value={typeof content.timezone === "string" ? content.timezone : "Asia/Tokyo"}
                onChange={(e) => update("timezone", e.target.value.trim() || "Asia/Tokyo")}
                placeholder="Asia/Tokyo"
              />
              <Input
                label="アクティブ帯の見出し"
                value={display("currentBandLabel")}
                onChange={(e) => updateLocalized("currentBandLabel", e.target.value)}
                placeholder="ただいまのメニュー"
              />
              <Input
                label="該当なし時のメッセージ"
                value={display("outsideMessage")}
                onChange={(e) => updateLocalized("outsideMessage", e.target.value)}
              />
              <MenuTimeBandSlotsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          <SettingsSection title="見た目の調整" sectionId={appearanceSectionId}>
            {demoMode ? (
              <button
                type="button"
                onClick={() =>
                  onLockedAction?.("デモモードでは詳細設定は利用できません。無料登録で解放されます。")
                }
                className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
              >
                デモではブロックスタイル詳細設定は利用できません
              </button>
            ) : (
              <>
                <div className="space-y-2">
                  <StyleGroup summary="文字の見やすさを整える" defaultOpen>
            {supportsTextFormatting ? (
              <>
                <div id={appearanceTypographyId} className="w-full">
                  <label className={labelClass}>フォント</label>
                  <select
                    value={(style.fontFamily as string) ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateStyle("fontFamily", v === "" ? undefined : v);
                    }}
                    className={inputClass}
                  >
                    {EDITOR_FONT_OPTIONS.map((opt) => (
                      <option key={opt.label + opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className={labelClass}>フォント色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(() => {
                        const v = (style.textColor as string) ?? "#0f172a";
                        const hex = v.startsWith("#") ? v.slice(1) : v;
                        return hex.length >= 6 ? `#${hex.slice(0, 6)}` : "#0f172a";
                      })()}
                      onChange={(e) => updateStyle("textColor", e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={(style.textColor as string) ?? ""}
                      onChange={(e) => updateStyle("textColor", e.target.value || undefined)}
                      placeholder="#0f172a"
                      className={inputClass + " flex-1"}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">このブロックは文字スタイル設定の対象外です。</p>
            )}
                  </StyleGroup>
                  <StyleGroup summary="背景と内部パーツの見え方" defaultOpen={false}>
            <div id={appearanceBackgroundId} className="w-full">
              <label className={checkboxInlineRowClass}>
                <input
                  type="checkbox"
                  checked={Boolean(style.backgroundTransparent)}
                  onChange={(e) => updateStyle("backgroundTransparent", e.target.checked ? true : undefined)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                ブロック透過
              </label>
            </div>
            <div className="w-full">
              <label className={labelClass}>ブロックカラー</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(() => {
                    const v = (style.backgroundColor as string) ?? "#ffffff";
                    const hex = v.startsWith("#") ? v.slice(1) : v;
                    return hex.length >= 6 ? `#${hex.slice(0, 6)}` : "#ffffff";
                  })()}
                  onChange={(e) => {
                    updateStyle("backgroundTransparent", undefined);
                    updateStyle("backgroundColor", e.target.value);
                  }}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <input
                  type="text"
                  value={(style.backgroundColor as string) ?? ""}
                  onChange={(e) => {
                    updateStyle("backgroundTransparent", undefined);
                    updateStyle("backgroundColor", e.target.value || undefined);
                  }}
                  placeholder="#ffffff（ブロック全体）"
                  className={inputClass + " flex-1"}
                />
              </div>
            </div>
            <div className="w-full">
              <label className={labelClass}>内部要素の背景</label>
              <select
                value={
                  (style.innerSurfaceMode as string) === "transparent" || (style.innerSurfaceMode as string) === "custom"
                    ? (style.innerSurfaceMode as string)
                    : "default"
                }
                onChange={(e) => {
                  const mode = e.target.value as "default" | "transparent" | "custom";
                  if (mode === "default") {
                    updateStyles({ innerSurfaceMode: undefined, innerSurfaceColor: undefined });
                    return;
                  }
                  if (mode === "transparent") {
                    updateStyles({ innerSurfaceMode: "transparent", innerSurfaceColor: undefined });
                    return;
                  }
                  const current = normalizeHexColor(style.innerSurfaceColor as string | undefined) ?? "#f8fafc";
                  updateStyles({ innerSurfaceMode: "custom", innerSurfaceColor: current });
                }}
                className={inputClass}
              >
                <option value="default">デフォルト</option>
                <option value="transparent">透過</option>
                <option value="custom">カスタム</option>
              </select>
            </div>
            <div className="w-full">
              <label className={labelClass}>背景プリセット</label>
              <div className="flex flex-wrap gap-2">
                {INNER_SURFACE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      updateStyles({ innerSurfaceMode: "custom", innerSurfaceColor: preset.value });
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span className="inline-block h-3 w-3 rounded-sm border border-slate-200" style={{ backgroundColor: preset.value }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">カスタム = 内部要素背景に任意色（#RRGGBB）を適用</p>
            {((style.innerSurfaceMode as string) ?? "default") === "custom" ? (
              <div className="w-full">
                <label className={labelClass}>内部要素の背景色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={normalizeHexColor(style.innerSurfaceColor as string | undefined) ?? "#f8fafc"}
                    onChange={(e) => updateStyle("innerSurfaceColor", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={(style.innerSurfaceColor as string) ?? ""}
                    onChange={(e) => updateStyle("innerSurfaceColor", e.target.value || undefined)}
                    onBlur={(e) => {
                      const normalized = normalizeHexColor(e.target.value || undefined);
                      updateStyle("innerSurfaceColor", normalized ?? undefined);
                    }}
                    placeholder="#f8fafc"
                    className={inputClass + " flex-1"}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">#RRGGBB 形式（例: #f8fafc）</p>
              </div>
            ) : null}
                  </StyleGroup>
                  <StyleGroup summary="枠線と誤削除防止" defaultOpen={false}>
            <div id={appearanceBorderId} className="w-full">
              <label className={checkboxInlineRowClass}>
                <input
                  type="checkbox"
                  checked={(style.borderEnabled as boolean | undefined) ?? true}
                  onChange={(e) => updateStyle("borderEnabled", e.target.checked ? true : false)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                枠線を表示
              </label>
            </div>
            <div className="w-full">
              <label className={labelClass}>枠線 (px)</label>
              <input
                type="number"
                min={0}
                max={8}
                value={(style.borderWidth as number | string) ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  updateStyle("borderEnabled", true);
                  updateStyle("borderWidth", v === "" ? undefined : parseInt(v, 10) || 0);
                }}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="w-full">
              <label className={labelClass}>枠線色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(() => {
                    const v = (style.borderColor as string) ?? "#e2e8f0";
                    const hex = v.startsWith("#") ? v.slice(1) : v;
                    return hex.length >= 6 ? `#${hex.slice(0, 6)}` : "#e2e8f0";
                  })()}
                  onChange={(e) => updateStyle("borderColor", e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <input
                  type="text"
                  value={(style.borderColor as string) ?? ""}
                  onChange={(e) => updateStyle("borderColor", e.target.value || undefined)}
                  placeholder="#e2e8f0"
                  className={inputClass + " flex-1"}
                />
              </div>
            </div>
            <div className="w-full">
              <label className={checkboxInlineRowClass}>
                <input
                  type="checkbox"
                  checked={Boolean(style.deleteProtected)}
                  onChange={(e) => updateStyle("deleteProtected", e.target.checked ? true : false)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                削除保護（全削除/削除キー対象外）
              </label>
            </div>
                  </StyleGroup>
                  <StyleGroup summary="細かい調整（サイズ・太さ・影）" defaultOpen={false}>
              <>
                <div id={appearanceSpacingId} className={compactGridClass}>
                {supportsGlobalFontSize || supportsTitleFontSize || supportsBodyFontSize ? (
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 md:col-span-2">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">サイズ</p>
                    <div className={compactGridClass}>
                {supportsGlobalFontSize ? (
                  <div className="w-full">
                    <label className={labelClass}>フォントサイズ（全体）</label>
                    <select
                      value={(style.fontSize as string) ?? ""}
                      onChange={(e) => updateStyle("fontSize", e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">標準</option>
                      <option value="xs">12px</option>
                      <option value="sm">14px</option>
                      <option value="base">16px</option>
                      <option value="lg">18px</option>
                      <option value="xl">20px</option>
                      <option value="2xl">24px</option>
                    </select>
                  </div>
                ) : null}
                {supportsTitleFontSize ? (
                  <div className="w-full">
                    <label className={labelClass}>タイトルサイズ</label>
                    <select
                      value={(style.titleFontSize as string) ?? ""}
                      onChange={(e) => updateStyle("titleFontSize", e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">自動</option>
                      <option value="xs">12px</option>
                      <option value="sm">14px</option>
                      <option value="base">16px</option>
                      <option value="lg">18px</option>
                      <option value="xl">20px</option>
                      <option value="2xl">24px</option>
                    </select>
                  </div>
                ) : null}
                {supportsBodyFontSize ? (
                  <div className="w-full">
                    <label className={labelClass}>本文サイズ</label>
                    <select
                      value={(style.bodyFontSize as string) ?? ""}
                      onChange={(e) => updateStyle("bodyFontSize", e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">自動</option>
                      <option value="xs">12px</option>
                      <option value="sm">14px</option>
                      <option value="base">16px</option>
                      <option value="lg">18px</option>
                      <option value="xl">20px</option>
                      <option value="2xl">24px</option>
                    </select>
                  </div>
                ) : null}
                    </div>
                  </div>
                ) : null}
                {supportsGlobalFontWeight || supportsTitleFontWeight || supportsBodyFontWeight ? (
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 md:col-span-2">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">ウェイト</p>
                    <div className={compactGridClass}>
                {supportsGlobalFontWeight ? (
                  <div className="w-full">
                    <label className={labelClass}>フォントウェイト（全体）</label>
                    <select
                      value={(style.fontWeight as string) ?? ""}
                      onChange={(e) => updateStyle("fontWeight", e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">標準</option>
                      <option value="normal">400</option>
                      <option value="medium">500</option>
                      <option value="semibold">600</option>
                      <option value="bold">700</option>
                    </select>
                  </div>
                ) : null}
                {supportsTitleFontWeight ? (
                  <div className="w-full">
                    <label className={labelClass}>タイトルウェイト</label>
                    <select
                      value={(style.titleFontWeight as string) ?? ""}
                      onChange={(e) => updateStyle("titleFontWeight", e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">自動</option>
                      <option value="normal">400</option>
                      <option value="medium">500</option>
                      <option value="semibold">600</option>
                      <option value="bold">700</option>
                    </select>
                  </div>
                ) : null}
                {supportsBodyFontWeight ? (
                  <div className="w-full">
                    <label className={labelClass}>本文ウェイト</label>
                    <select
                      value={(style.bodyFontWeight as string) ?? ""}
                      onChange={(e) => updateStyle("bodyFontWeight", e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">自動</option>
                      <option value="normal">400</option>
                      <option value="medium">500</option>
                      <option value="semibold">600</option>
                      <option value="bold">700</option>
                    </select>
                  </div>
                ) : null}
                    </div>
                  </div>
                ) : null}
                </div>
                <div className="w-full">
                  <label className={labelClass}>影</label>
                  <select
                    value={(style.boxShadow as string) ?? ""}
                    onChange={(e) => updateStyle("boxShadow", e.target.value || undefined)}
                    className={inputClass}
                  >
                    <option value="">なし</option>
                    <option value="0 1px 3px rgba(0,0,0,0.08)">軽い</option>
                    <option value="0 4px 12px rgba(0,0,0,0.1)">標準</option>
                    <option value="0 8px 24px rgba(0,0,0,0.12)">強め</option>
                  </select>
                </div>
                {supportsTextAlign ? (
                  <div className={compactGridClass}>
                    <div className="w-full">
                      <label className={labelClass}>寄せ</label>
                      <select
                        value={(style.textAlign as string) ?? ""}
                        onChange={(e) => updateStyle("textAlign", e.target.value || undefined)}
                        className={inputClass}
                      >
                        <option value="">標準</option>
                        <option value="left">左寄せ</option>
                        <option value="center">中央寄せ</option>
                        <option value="right">右寄せ</option>
                      </select>
                    </div>
                    {supportsLineHeight ? (
                      <div className="w-full">
                        <label className={labelClass}>行間</label>
                        <select
                          value={(style.lineHeight as string) ?? ""}
                          onChange={(e) => updateStyle("lineHeight", e.target.value || undefined)}
                          className={inputClass}
                        >
                          <option value="">標準</option>
                          <option value="1.3">狭め</option>
                          <option value="1.5">標準</option>
                          <option value="1.7">広め</option>
                          <option value="2">広い</option>
                        </select>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
                  </StyleGroup>
                </div>
              </>
            )}
          </SettingsSection>
        </div>
      </div>
    </>
  );
}

/** @deprecated Use CardSettings instead. */
export const SettingsPanel = CardSettings;
