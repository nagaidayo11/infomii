"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { getLocalizedContent } from "@/lib/localized-content";
import { listPagesForHotel, type PageRow } from "@/lib/storage";
import type { LocalizedString } from "@/lib/localized-content";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "./ImageUpload";
import type { EditorCard } from "./types";
import { CARD_TYPE_LABELS } from "./types";
import { useEditor2Store } from "./store";

const TRANSLATE_DEBOUNCE_MS = 1200;
const MIN_TEXT_LENGTH_FOR_TRANSLATE = 2;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

const COLOR_PRESETS = [
  { value: "", label: "標準" },
  { value: "#2563eb", label: "青" },
  { value: "#059669", label: "緑" },
  { value: "#d97706", label: "琥珀" },
  { value: "#dc2626", label: "赤" },
  { value: "#7c3aed", label: "紫" },
];

const BUTTON_STYLE_PRESETS = [
  { value: "primary", label: "メイン" },
  { value: "secondary", label: "サブ" },
  { value: "outline", label: "枠線" },
];

const NOTICE_PRIORITY_PRESETS = [
  { value: "info", label: "情報" },
  { value: "warning", label: "警告" },
];

const BLOCK_STYLE_PRESETS: Array<{
  id: string;
  label: string;
  style: Record<string, string | number | undefined>;
}> = [
  {
    id: "clean",
    label: "クリーン",
    style: {
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 8,
      boxShadow: "",
      padding: 0,
    },
  },
  {
    id: "soft",
    label: "ソフト",
    style: {
      backgroundColor: "#f8fafc",
      borderWidth: 0,
      borderColor: "",
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
      padding: 0,
    },
  },
  {
    id: "emphasis",
    label: "強調",
    style: {
      backgroundColor: "#fff7ed",
      borderWidth: 1,
      borderColor: "#fdba74",
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(249,115,22,0.12)",
      padding: 0,
    },
  },
];

const CUSTOM_PRESET_STORAGE_KEY = "editor:block-style-custom-presets:v1";

type CardUpdatePatch = { content?: Record<string, unknown>; style?: Record<string, unknown> };

export type CardSettingsProps = {
  card: EditorCard | null;
  onUpdate: (id: string, patch: CardUpdatePatch) => void;
  onBulkReplace?: (find: string, replaceTo: string) => { cardsUpdated: number; occurrences: number };
  onRunPrepublishCheck?: () => void;
  /** When set and card.id matches, scroll panel to top instantly (no smooth scroll) so new-card flow feels immediate. */
  lastAddedCardId?: string | null;
};

function isLocalizedObject(v: unknown): v is Record<string, string> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("ja" in v || "en" in v || "zh" in v || "ko" in v)
  );
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
    next[index] = { ...(next[index] ?? {}), [field]: value };
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
          className="text-xs font-medium text-slate-600 hover:text-slate-800"
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
              className="text-xs text-slate-400 hover:text-red-600"
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
    next[index] = { ...(next[index] ?? {}), [field]: value };
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
          className="text-xs font-medium text-slate-600 hover:text-slate-800"
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
              className="text-xs text-slate-400 hover:text-red-600"
            >
              削除
            </button>
          </div>
          <Input
            label="名前"
            value={item.name ?? ""}
            onChange={(e) => updateItem(i, "name", e.target.value)}
            placeholder="スポット名"
          />
          <Input
            label="説明"
            value={item.description ?? ""}
            onChange={(e) => updateItem(i, "description", e.target.value)}
            placeholder="任意"
          />
          <Input
            label="リンクURL"
            value={item.link ?? ""}
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
    next[index] = { ...(next[index] ?? {}), [field]: value };
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
          className="text-xs font-medium text-slate-600 hover:text-slate-800"
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
              className="text-xs text-slate-400 hover:text-red-600"
            >
              削除
            </button>
          </div>
          <Input
            label="質問"
            value={item.q ?? ""}
            onChange={(e) => updateItem(i, "q", e.target.value)}
            placeholder="Q"
          />
          <div className="w-full">
            <label className={labelClass}>回答</label>
            <textarea
              value={item.a ?? ""}
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

const PAGE_LINKS_ICON_OPTIONS = [
  { value: "wifi", label: "WiFi" },
  { value: "breakfast", label: "朝食" },
  { value: "checkout", label: "チェックアウト" },
  { value: "restaurant", label: "レストラン" },
  { value: "spa", label: "スパ・温泉" },
  { value: "parking", label: "駐車場" },
  { value: "map", label: "地図" },
  { value: "nearby", label: "周辺" },
  { value: "notice", label: "お知らせ" },
  { value: "emergency", label: "緊急" },
  { value: "laundry", label: "ランドリー" },
  { value: "taxi", label: "タクシー" },
  { value: "info", label: "情報" },
];

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
  const setItems = (next: PageLinksItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof PageLinksItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () =>
    setItems([...items, { label: "新規", icon: "info", linkType: "page", pageSlug: "", link: "" }]);
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
        <span className="text-xs font-medium text-slate-500">リンク項目</span>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-medium text-slate-600 hover:text-slate-800"
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
              className="text-xs text-slate-400 hover:text-red-600"
            >
              削除
            </button>
          </div>
          <Input
            label="ラベル"
            value={item.label ?? ""}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="WiFi"
          />
          <div className="w-full">
            <label className={labelClass}>アイコン</label>
            <select
              value={item.icon ?? "info"}
              onChange={(e) => updateItem(i, "icon", e.target.value)}
              className={inputClass}
            >
              {PAGE_LINKS_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className={labelClass}>リンク先</label>
            <select
              value={item.linkType ?? "page"}
              onChange={(e) => updateItem(i, "linkType", e.target.value as "page" | "url")}
              className={inputClass}
            >
              <option value="page">この施設のページ</option>
              <option value="url">外部URL</option>
            </select>
          </div>
          {(item.linkType ?? "page") === "page" ? (
            <div className="w-full">
              <label className={labelClass}>ページを選択</label>
              <select
                value={item.pageSlug ?? ""}
                onChange={(e) => updateItem(i, "pageSlug", e.target.value)}
                className={inputClass}
              >
                <option value="">— 選択 —</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title || p.slug || ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="URL"
              value={item.link ?? ""}
              onChange={(e) => updateItem(i, "link", e.target.value)}
              placeholder="https://..."
            />
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
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => setItems([...items, { text: "", checked: false }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">チェック項目</span>
        <button type="button" onClick={addItem} className="text-xs font-medium text-slate-600 hover:text-slate-800">
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600">
              削除
            </button>
          </div>
          <Input
            label="項目"
            value={item.text ?? ""}
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
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => setItems([...items, { title: "", description: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">ステップ</span>
        <button type="button" onClick={addItem} className="text-xs font-medium text-slate-600 hover:text-slate-800">
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600">
              削除
            </button>
          </div>
          <Input
            label={`Step ${i + 1} タイトル`}
            value={item.title ?? ""}
            onChange={(e) => updateItem(i, "title", e.target.value)}
            placeholder="手順名"
          />
          <div className="w-full">
            <label className={labelClass}>説明</label>
            <textarea
              value={item.description ?? ""}
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
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => setItems([...items, { label: "", value: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">数値項目</span>
        <button type="button" onClick={addItem} className="text-xs font-medium text-slate-600 hover:text-slate-800">
          + 追加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600">
              削除
            </button>
          </div>
          <Input
            label="ラベル"
            value={item.label ?? ""}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="項目名"
          />
          <Input
            label="値"
            value={item.value ?? ""}
            onChange={(e) => updateItem(i, "value", e.target.value)}
            placeholder="15:00 / 120 / 95%"
          />
        </div>
      ))}
    </div>
  );
}

/** CardSettings panel: shows Content, Appearance, and Behavior for the selected card. Updates the canvas in real time. */
export function CardSettings({
  card,
  onUpdate,
  onBulkReplace,
  onRunPrepublishCheck,
  lastAddedCardId = null,
}: CardSettingsProps) {
  const translateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ cardId: string; key: string; ja: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [styleMode, setStyleMode] = useState<"standard" | "advanced">("standard");
  const [bulkFind, setBulkFind] = useState("");
  const [bulkReplaceTo, setBulkReplaceTo] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<
    Array<{ id: string; label: string; style: Record<string, string | number | undefined> }>
  >([]);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(CUSTOM_PRESET_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<{ id: string; label: string; style: Record<string, string | number | undefined> }>;
      if (Array.isArray(parsed)) setCustomPresets(parsed.slice(0, 5));
    } catch {
      // ignore
    }
  }, []);

  const persistCustomPresets = useCallback(
    (next: Array<{ id: string; label: string; style: Record<string, string | number | undefined> }>) => {
      setCustomPresets(next);
      if (typeof window === "undefined") return;
      window.localStorage.setItem(CUSTOM_PRESET_STORAGE_KEY, JSON.stringify(next));
    },
    []
  );

  const saveCurrentStyleAsPreset = useCallback(() => {
    if (typeof window === "undefined") return;
    const label = window.prompt("プリセット名を入力してください", "マイプリセット");
    if (!label) return;
    const styleSnapshot = { ...((card?.style ?? {}) as Record<string, string | number | undefined>) };
    const next = [
      { id: `custom-${Date.now()}`, label: label.slice(0, 20), style: styleSnapshot },
      ...customPresets,
    ].slice(0, 5);
    persistCustomPresets(next);
  }, [card?.style, customPresets, persistCustomPresets]);

  const removeCustomPreset = useCallback(
    (id: string) => {
      persistCustomPresets(customPresets.filter((p) => p.id !== id));
    },
    [customPresets, persistCustomPresets]
  );

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
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-700">
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
            </SettingsSection>
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
                className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                一括置換を実行
              </button>
              {bulkStatus ? <p className="text-xs text-slate-500">{bulkStatus}</p> : null}
            </SettingsSection>
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
          </div>
        </div>
      </>
    );
  }

  const content = card.content as Record<string, unknown>;
  const style = (card.style ?? {}) as Record<string, unknown>;
  const update = (key: string, value: unknown) => {
    onUpdate(card.id, { content: { ...content, [key]: value } });
  };
  const updateStyle = (key: string, value: unknown) => {
    const next = value === undefined || value === "" ? undefined : value;
    const nextStyle = next != null ? { ...style, [key]: next } : { ...style };
    if (next === undefined) delete nextStyle[key];
    onUpdate(card.id, { style: nextStyle } as CardUpdatePatch);
  };
  const applyStylePreset = (preset: Record<string, string | number | undefined>) => {
    const nextStyle = { ...style } as Record<string, unknown>;
    for (const [key, value] of Object.entries(preset)) {
      if (value === undefined || value === "") {
        delete nextStyle[key];
      } else {
        nextStyle[key] = value;
      }
    }
    onUpdate(card.id, { style: nextStyle } as CardUpdatePatch);
  };
  /** 多言語フィールドの表示値（日本語を優先） */
  const display = (key: string) =>
    getLocalizedContent(content[key] as LocalizedString | undefined, "ja");

  const isFacilityGuideBlock = card.type === "breakfast" || card.type === "spa";
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

  return (
    <>
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-700">
          ブロック設定
        </h2>
        <p className="mt-1.5 text-sm font-medium text-slate-800">
          {CARD_TYPE_LABELS[card.type]}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">変更はリアルタイムで反映されます</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-6">
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
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Infomii Hotel"
              />
              <div className="w-full">
                <label className={labelClass}>画像</label>
                <ImageUpload onUploaded={(url) => update("image", url)} className="mt-1.5" />
              </div>
              <Input
                label="サブタイトル"
                value={(content.subtitle as string) ?? ""}
                onChange={(e) => update("subtitle", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "info" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Wi-Fi"
              />
              <Input
                label="アイコン"
                value={(content.icon as string) ?? ""}
                onChange={(e) => update("icon", e.target.value)}
                placeholder="wifi / map / info"
              />
              <p className="text-xs text-slate-500">行はコンテンツで編集してください。</p>
            </SettingsSection>
          )}

          {card.type === "highlight" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="重要なお知らせ"
              />
              <div className="w-full">
                <label className={labelClass}>本文</label>
                <textarea
                  value={(content.body as string) ?? ""}
                  onChange={(e) => update("body", e.target.value)}
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
                  <option value="amber">Amber</option>
                  <option value="blue">Blue</option>
                  <option value="emerald">Emerald</option>
                </select>
              </div>
            </SettingsSection>
          )}

          {card.type === "action" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="ラベル"
                value={(content.label as string) ?? ""}
                onChange={(e) => update("label", e.target.value)}
                placeholder="詳しく見る"
              />
              <Input
                label="リンクURL"
                value={(content.href as string) ?? ""}
                onChange={(e) => update("href", e.target.value)}
                placeholder="https://... or #"
              />
            </SettingsSection>
          )}

          {card.type === "text" && (
            <>
              <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="任意の見出し"
                />
                <div className="w-full">
                  <label className={labelClass}>Text</label>
                  <textarea
                    value={display("content")}
                    onChange={(e) => updateLocalized("content", e.target.value)}
                    placeholder="Heading or body text"
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </SettingsSection>
              <SettingsSection title="表示">
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
                <div className="w-full">
                  <label className={labelClass}>色</label>
                  <select
                    value={(content.color as string) ?? ""}
                    onChange={(e) => update("color", e.target.value)}
                    className={inputClass}
                  >
                    {COLOR_PRESETS.map((p) => (
                      <option key={p.value || "default"} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
            </>
          )}

          {card.type === "image" && (
            <>
              <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="任意のキャプション"
                />
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
                  placeholder="Image description"
                />
              </SettingsSection>
              <SettingsSection title="表示">
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
                <div className="w-full">
                  <label className={labelClass}>色</label>
                  <select
                    value={(content.color as string) ?? ""}
                    onChange={(e) => update("color", e.target.value)}
                    className={inputClass}
                  >
                    {COLOR_PRESETS.map((p) => (
                      <option key={p.value || "default"} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
            </>
          )}

          {card.type === "icon" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="アイコン"
                value={(content.icon as string) ?? ""}
                onChange={(e) => update("icon", e.target.value)}
                placeholder="📍"
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
            <>
              <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="e.g. Guest WiFi"
                />
                <Input
                  label="SSID"
                  value={display("ssid")}
                  onChange={(e) => updateLocalized("ssid", e.target.value)}
                  placeholder="Network name"
                />
                <Input
                  label="パスワード"
                  value={display("password")}
                  onChange={(e) => updateLocalized("password", e.target.value)}
                  placeholder="Password"
                />
                <div className="w-full">
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={display("description")}
                    onChange={(e) => updateLocalized("description", e.target.value)}
                    placeholder="任意の説明"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </SettingsSection>
              <SettingsSection title="表示">
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
                <div className="w-full">
                  <label className={labelClass}>色</label>
                  <select
                    value={(content.color as string) ?? ""}
                    onChange={(e) => update("color", e.target.value)}
                    className={inputClass}
                  >
                    {COLOR_PRESETS.map((p) => (
                      <option key={p.value || "default"} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
            </>
          )}

          {isFacilityGuideBlock && (
            <>
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
                  placeholder="1F Dining"
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
              <SettingsSection title="表示">
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
                <div className="w-full">
                  <label className={labelClass}>色</label>
                  <select
                    value={(content.color as string) ?? ""}
                    onChange={(e) => update("color", e.target.value)}
                    className={inputClass}
                  >
                    {COLOR_PRESETS.map((p) => (
                      <option key={p.value || "default"} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
            </>
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
                value={(content.linkUrl as string) ?? ""}
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
                value={(content.phone as string) ?? ""}
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
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
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
                value={(content.fire as string) ?? ""}
                onChange={(e) => update("fire", e.target.value)}
                placeholder="119"
              />
              <Input
                label="警察"
                value={(content.police as string) ?? ""}
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
            <>
              <SettingsSection title="コンテンツ">
                <Input
                  label="タイトル"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="e.g. Location"
                />
                <div className="w-full">
                  <label className={labelClass}>Address</label>
                  <textarea
                    value={display("address")}
                    onChange={(e) => updateLocalized("address", e.target.value)}
                    placeholder="Address or place name"
                    rows={2}
                    className={inputClass}
                  />
                </div>
                <div className="w-full">
                  <label className={labelClass}>Googleマップ埋め込み</label>
                  <textarea
                    value={(content.mapEmbedUrl as string) ?? ""}
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
              <SettingsSection title="表示">
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
                <div className="w-full">
                  <label className={labelClass}>色</label>
                  <select
                    value={(content.color as string) ?? ""}
                    onChange={(e) => update("color", e.target.value)}
                    className={inputClass}
                  >
                    {COLOR_PRESETS.map((p) => (
                      <option key={p.value || "default"} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
            </>
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
                  placeholder="Notice"
                />
                <div className="w-full">
                  <label className={labelClass}>Text</label>
                  <textarea
                    value={display("body")}
                    onChange={(e) => updateLocalized("body", e.target.value)}
                    placeholder="Announcement content"
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </SettingsSection>
              <SettingsSection title="表示">
                <div className="w-full">
                  <label className={labelClass}>Priority style</label>
                  <select
                    value={(content.variant as string) ?? "info"}
                    onChange={(e) => {
                      const v = e.target.value;
                      onUpdate(card.id, {
                        content: {
                          ...content,
                          variant: v,
                          color: v === "warning" ? "#d97706" : "#2563eb",
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
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
              </SettingsSection>
            </>
          )}

          {card.type === "button" && (
            <>
              <SettingsSection title="コンテンツ">
                <Input
                  label="ラベル"
                  value={display("label")}
                  onChange={(e) => updateLocalized("label", e.target.value)}
                  placeholder="Button text"
                />
                <Input
                  label="リンク"
                  value={(content.href as string) ?? ""}
                  onChange={(e) => update("href", e.target.value)}
                  placeholder="https://..."
                />
              </SettingsSection>
              <SettingsSection title="表示">
                <Input
                  label="アイコン"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="icon name (wifi / map / info)"
                />
                <div className="w-full">
                  <label className={labelClass}>Style</label>
                  <select
                    value={(content.style as string) ?? "primary"}
                    onChange={(e) => update("style", e.target.value)}
                    className={inputClass}
                  >
                    {BUTTON_STYLE_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingsSection>
              <SettingsSection title="Behavior">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={content.openInNewTab === true}
                    onChange={(e) => update("openInNewTab", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary"
                  />
                  <span className="text-sm text-slate-700">Open link in new tab</span>
                </label>
              </SettingsSection>
            </>
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
            <SettingsSection title="表示">
              <div className="w-full">
                <label className={labelClass}>Style</label>
                <select
                  value={(content.style as string) ?? "line"}
                  onChange={(e) => update("style", e.target.value)}
                  className={inputClass}
                >
                  <option value="line">Line</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
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

          {card.type === "compare" && (
            <SettingsSection title="コンテンツ">
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="比較"
              />
              <Input
                label="左タイトル"
                value={display("leftTitle")}
                onChange={(e) => updateLocalized("leftTitle", e.target.value)}
                placeholder="スタンダード"
              />
              <Input
                label="左説明"
                value={display("leftBody")}
                onChange={(e) => updateLocalized("leftBody", e.target.value)}
                placeholder="内容"
              />
              <Input
                label="右タイトル"
                value={display("rightTitle")}
                onChange={(e) => updateLocalized("rightTitle", e.target.value)}
                placeholder="プレミアム"
              />
              <Input
                label="右説明"
                value={display("rightBody")}
                onChange={(e) => updateLocalized("rightBody", e.target.value)}
                placeholder="内容"
              />
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

          {(card.type === "schedule" || card.type === "menu") && (
            <p className="text-sm text-slate-500">
              {card.type === "schedule" ? "営業時間" : "メニュー"}の項目は今後追加できます。
            </p>
          )}

          <SettingsSection title="ブロックスタイル">
            <div className="w-full">
              <label className={labelClass}>編集モード</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStyleMode("standard")}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    styleMode === "standard"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  標準
                </button>
                <button
                  type="button"
                  onClick={() => setStyleMode("advanced")}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    styleMode === "advanced"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  詳細
                </button>
              </div>
            </div>
            <div className="w-full">
              <label className={labelClass}>プリセット</label>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyStylePreset(preset.style)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full">
              <button
                type="button"
                onClick={saveCurrentStyleAsPreset}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                現在の見た目をマイプリセット保存
              </button>
            </div>
            {customPresets.length > 0 && (
              <div className="w-full">
                <label className={labelClass}>マイプリセット</label>
                <div className="space-y-2">
                  {customPresets.map((preset) => (
                    <div key={preset.id} className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyStylePreset(preset.style)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {preset.label}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomPreset(preset.id)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-rose-600"
                        aria-label={`${preset.label}を削除`}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="w-full">
              <label className={labelClass}>角丸 (px)</label>
              <input
                type="number"
                min={0}
                max={32}
                value={(style.borderRadius as number | string) ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  updateStyle("borderRadius", v === "" ? undefined : parseInt(v, 10) || 0);
                }}
                placeholder="8"
                className={inputClass}
              />
            </div>
            <div className="w-full">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
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
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
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
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(style.deleteProtected)}
                  onChange={(e) => updateStyle("deleteProtected", e.target.checked ? true : undefined)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                削除保護（全削除/削除キー対象外）
              </label>
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
            {styleMode === "advanced" && (
              <>
                <div className="w-full">
                  <label className={labelClass}>フォントサイズ（全体）</label>
                  <select
                    value={(style.fontSize as string) ?? ""}
                    onChange={(e) => updateStyle("fontSize", e.target.value || undefined)}
                    className={inputClass}
                  >
                    <option value="">標準</option>
                    <option value="xs">極小 (12px)</option>
                    <option value="sm">小 (14px)</option>
                    <option value="base">標準 (16px)</option>
                    <option value="lg">大 (18px)</option>
                    <option value="xl">特大 (20px)</option>
                    <option value="2xl">最大 (24px)</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className={labelClass}>タイトルサイズ</label>
                  <select
                    value={(style.titleFontSize as string) ?? ""}
                    onChange={(e) => updateStyle("titleFontSize", e.target.value || undefined)}
                    className={inputClass}
                  >
                    <option value="">継承（上記に従う）</option>
                    <option value="xs">極小 (12px)</option>
                    <option value="sm">小 (14px)</option>
                    <option value="base">標準 (16px)</option>
                    <option value="lg">大 (18px)</option>
                    <option value="xl">特大 (20px)</option>
                    <option value="2xl">最大 (24px)</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className={labelClass}>本文サイズ</label>
                  <select
                    value={(style.bodyFontSize as string) ?? ""}
                    onChange={(e) => updateStyle("bodyFontSize", e.target.value || undefined)}
                    className={inputClass}
                  >
                    <option value="">継承（上記に従う）</option>
                    <option value="xs">極小 (12px)</option>
                    <option value="sm">小 (14px)</option>
                    <option value="base">標準 (16px)</option>
                    <option value="lg">大 (18px)</option>
                    <option value="xl">特大 (20px)</option>
                    <option value="2xl">最大 (24px)</option>
                  </select>
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
                <div className="w-full">
                  <label className={labelClass}>余白 (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={(style.padding as number | string) ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateStyle("padding", v === "" ? undefined : parseInt(v, 10) || 0);
                    }}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
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
