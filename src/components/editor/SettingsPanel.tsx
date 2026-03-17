"use client";

import { useRef, useCallback, useEffect } from "react";
import { getLocalizedContent } from "@/lib/localized-content";
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
  { value: "", label: "Default" },
  { value: "#2563eb", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Red" },
  { value: "#7c3aed", label: "Violet" },
];

const BUTTON_STYLE_PRESETS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
];

const NOTICE_PRIORITY_PRESETS = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
];

type CardUpdatePatch = { content?: Record<string, unknown>; style?: Record<string, unknown> };

export type CardSettingsProps = {
  card: EditorCard | null;
  onUpdate: (id: string, patch: CardUpdatePatch) => void;
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

function GalleryItemsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : [{ src: "", alt: "" }]) as GalleryImageItem[];
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
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Images</span>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-medium text-slate-600 hover:text-slate-800"
        >
          + Add
        </button>
      </div>
      {items.slice(0, 6).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-xs text-slate-400 hover:text-red-600"
            >
              Remove
            </button>
          </div>
          <Input
            label={`Image ${i + 1} URL`}
            value={items[i]?.src ?? ""}
            onChange={(e) => updateItem(i, "src", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Alt text"
            value={items[i]?.alt ?? ""}
            onChange={(e) => updateItem(i, "alt", e.target.value)}
            placeholder="Optional"
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
        <span className="text-xs font-medium text-slate-500">Q&A</span>
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

/** CardSettings panel: shows Content, Appearance, and Behavior for the selected card. Updates the canvas in real time. */
export function CardSettings({ card, onUpdate, lastAddedCardId = null }: CardSettingsProps) {
  const translateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ cardId: string; key: string; ja: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (!card) {
    return (
      <>
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Card Settings
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Select a card on the canvas to edit its settings here. Changes update the canvas in real time.
          </p>
        </div>
      </>
    );
  }

  const content = card.content as Record<string, unknown>;
  const style = (card.style ?? {}) as Record<string, unknown>;
  const update = (key: string, value: unknown) => {
    onUpdate(card.id, { content: { ...content, [key]: value } });
  };
  const updateStyle = (key: string, value: string | number | undefined) => {
    const next = value === undefined || value === "" ? undefined : value;
    const nextStyle = next != null ? { ...style, [key]: next } : { ...style };
    if (next === undefined) delete nextStyle[key];
    onUpdate(card.id, { style: nextStyle } as CardUpdatePatch);
  };
  /** 多言語フィールドの表示値（日本語を優先） */
  const display = (key: string) =>
    getLocalizedContent(content[key] as LocalizedString | undefined, "ja");

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

  return (
    <>
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Card Settings
        </h2>
        <p className="mt-1.5 text-sm font-medium text-slate-800">
          {CARD_TYPE_LABELS[card.type]}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Changes update the canvas in real time.</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-6">
          {card.type === "welcome" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ようこそ"
              />
              <div className="w-full">
                <label className={labelClass}>Message</label>
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
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Infomii Hotel"
              />
              <div className="w-full">
                <label className={labelClass}>画像</label>
                <ImageUpload onUploaded={(url) => update("image", url)} className="mt-1.5" />
              </div>
              <Input
                label="Subtitle"
                value={(content.subtitle as string) ?? ""}
                onChange={(e) => update("subtitle", e.target.value)}
                placeholder="Optional subtitle"
              />
            </SettingsSection>
          )}

          {card.type === "info" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Wi-Fi"
              />
              <Input
                label="Icon"
                value={(content.icon as string) ?? ""}
                onChange={(e) => update("icon", e.target.value)}
                placeholder="📶"
              />
              <p className="text-xs text-slate-500">行はコンテンツで編集してください。</p>
            </SettingsSection>
          )}

          {card.type === "highlight" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="重要なお知らせ"
              />
              <div className="w-full">
                <label className={labelClass}>Body</label>
                <textarea
                  value={(content.body as string) ?? ""}
                  onChange={(e) => update("body", e.target.value)}
                  placeholder="強調したい内容"
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="w-full">
                <label className={labelClass}>Accent</label>
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
            <SettingsSection title="Content">
              <Input
                label="Label"
                value={(content.label as string) ?? ""}
                onChange={(e) => update("label", e.target.value)}
                placeholder="詳しく見る"
              />
              <Input
                label="Link URL"
                value={(content.href as string) ?? ""}
                onChange={(e) => update("href", e.target.value)}
                placeholder="https://... or #"
              />
            </SettingsSection>
          )}

          {card.type === "text" && (
            <>
              <SettingsSection title="Content">
                <Input
                  label="Title"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="Optional heading"
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
              <SettingsSection title="Appearance">
                <Input
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Emoji or icon name"
                />
                <div className="w-full">
                  <label className={labelClass}>Color</label>
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
              <SettingsSection title="Content">
                <Input
                  label="Title"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="Optional caption"
                />
                <div className="w-full">
                  <label className={labelClass}>画像</label>
                  <ImageUpload
                    onUploaded={(url) => update("src", url)}
                    className="mt-1.5"
                  />
                </div>
                <Input
                  label="Alt text"
                  value={display("alt")}
                  onChange={(e) => updateLocalized("alt", e.target.value)}
                  placeholder="Image description"
                />
              </SettingsSection>
              <SettingsSection title="Appearance">
                <Input
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Optional emoji or icon"
                />
                <div className="w-full">
                  <label className={labelClass}>Color</label>
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

          {card.type === "wifi" && (
            <>
              <SettingsSection title="Content">
                <Input
                  label="Title"
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
                  label="Password"
                  value={display("password")}
                  onChange={(e) => updateLocalized("password", e.target.value)}
                  placeholder="Password"
                />
                <div className="w-full">
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={display("description")}
                    onChange={(e) => updateLocalized("description", e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </SettingsSection>
              <SettingsSection title="Appearance">
                <Input
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Emoji or icon name"
                />
                <div className="w-full">
                  <label className={labelClass}>Color</label>
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

          {card.type === "breakfast" && (
            <>
              <SettingsSection title="Content">
                <Input
                  label="Title"
                  value={display("title")}
                  onChange={(e) => updateLocalized("title", e.target.value)}
                  placeholder="e.g. Breakfast"
                />
                <Input
                  label="Time"
                  value={display("time")}
                  onChange={(e) => updateLocalized("time", e.target.value)}
                  placeholder="7:00–9:30"
                />
                <Input
                  label="Location"
                  value={display("location")}
                  onChange={(e) => updateLocalized("location", e.target.value)}
                  placeholder="1F Dining"
                />
                <div className="w-full">
                  <label className={labelClass}>Menu / notes</label>
                  <textarea
                    value={display("menu")}
                    onChange={(e) => updateLocalized("menu", e.target.value)}
                    placeholder="Menu or notes"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </SettingsSection>
              <SettingsSection title="Appearance">
                <Input
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Emoji or icon name"
                />
                <div className="w-full">
                  <label className={labelClass}>Color</label>
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
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="チェックアウト"
              />
              <Input
                label="Time"
                value={display("time")}
                onChange={(e) => updateLocalized("time", e.target.value)}
                placeholder="11:00"
              />
              <Input
                label="Note"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
              <Input
                label="Link URL"
                value={(content.linkUrl as string) ?? ""}
                onChange={(e) => update("linkUrl", e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Link label"
                value={display("linkLabel")}
                onChange={(e) => updateLocalized("linkLabel", e.target.value)}
                placeholder="詳細"
              />
            </SettingsSection>
          )}

          {card.type === "taxi" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="タクシー"
              />
              <Input
                label="Phone"
                value={(content.phone as string) ?? ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="03-1234-5678"
              />
              <Input
                label="Company name"
                value={display("companyName")}
                onChange={(e) => updateLocalized("companyName", e.target.value)}
                placeholder="〇〇タクシー"
              />
              <Input
                label="Note"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "restaurant" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="レストラン"
              />
              <Input
                label="Hours"
                value={display("time")}
                onChange={(e) => updateLocalized("time", e.target.value)}
                placeholder="7:00–22:00"
              />
              <Input
                label="Location"
                value={display("location")}
                onChange={(e) => updateLocalized("location", e.target.value)}
                placeholder="1F"
              />
              <Input
                label="Menu / notes"
                value={display("menu")}
                onChange={(e) => updateLocalized("menu", e.target.value)}
                placeholder="メニュー・備考"
              />
            </SettingsSection>
          )}

          {card.type === "laundry" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ランドリー"
              />
              <Input
                label="Hours"
                value={display("hours")}
                onChange={(e) => updateLocalized("hours", e.target.value)}
                placeholder="9:00–18:00"
              />
              <Input
                label="Price / notes"
                value={display("priceNote")}
                onChange={(e) => updateLocalized("priceNote", e.target.value)}
                placeholder="料金表・注意事項"
              />
              <Input
                label="Contact"
                value={display("contact")}
                onChange={(e) => updateLocalized("contact", e.target.value)}
                placeholder="内線1234"
              />
            </SettingsSection>
          )}

          {card.type === "emergency" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="緊急連絡先"
              />
              <Input
                label="Fire"
                value={(content.fire as string) ?? ""}
                onChange={(e) => update("fire", e.target.value)}
                placeholder="119"
              />
              <Input
                label="Police"
                value={(content.police as string) ?? ""}
                onChange={(e) => update("police", e.target.value)}
                placeholder="110"
              />
              <Input
                label="Hospital"
                value={display("hospital")}
                onChange={(e) => updateLocalized("hospital", e.target.value)}
                placeholder="救急病院番号・住所"
              />
              <Input
                label="Note"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "map" && (
            <>
              <SettingsSection title="Content">
                <Input
                  label="Title"
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
              </SettingsSection>
              <SettingsSection title="Appearance">
                <Input
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Emoji or icon name"
                />
                <div className="w-full">
                  <label className={labelClass}>Color</label>
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
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="周辺案内"
              />
              <NearbyItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "spa" && (
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="スパ・温泉"
              />
              <Input
                label="Hours"
                value={display("hours")}
                onChange={(e) => updateLocalized("hours", e.target.value)}
                placeholder="6:00–24:00"
              />
              <Input
                label="Location"
                value={display("location")}
                onChange={(e) => updateLocalized("location", e.target.value)}
                placeholder="B1F"
              />
              <div className="w-full">
                <label className={labelClass}>Description</label>
                <textarea
                  value={display("description")}
                  onChange={(e) => updateLocalized("description", e.target.value)}
                  placeholder="施設の説明"
                  rows={2}
                  className={inputClass}
                />
              </div>
              <Input
                label="Note"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </SettingsSection>
          )}

          {card.type === "notice" && (
            <>
              <SettingsSection title="Content">
                <Input
                  label="Title"
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
              <SettingsSection title="Appearance">
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
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Emoji or icon name"
                />
              </SettingsSection>
            </>
          )}

          {card.type === "button" && (
            <>
              <SettingsSection title="Content">
                <Input
                  label="Label"
                  value={display("label")}
                  onChange={(e) => updateLocalized("label", e.target.value)}
                  placeholder="Button text"
                />
                <Input
                  label="Link"
                  value={(content.href as string) ?? ""}
                  onChange={(e) => update("href", e.target.value)}
                  placeholder="https://..."
                />
              </SettingsSection>
              <SettingsSection title="Appearance">
                <Input
                  label="Icon"
                  value={(content.icon as string) ?? ""}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="Emoji or icon name"
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
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="Optional gallery title"
              />
              <GalleryItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {card.type === "divider" && (
            <SettingsSection title="Appearance">
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
            <SettingsSection title="Content">
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="よくある質問"
              />
              <FaqItemsEditor content={content} onUpdate={update} />
            </SettingsSection>
          )}

          {(card.type === "schedule" || card.type === "menu") && (
            <p className="text-sm text-slate-500">
              {card.type === "schedule" ? "営業時間" : "メニュー"}の項目は今後追加できます。
            </p>
          )}

          <SettingsSection title="ブロックスタイル">
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
              <label className={labelClass}>背景色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(() => {
                    const v = (style.backgroundColor as string) ?? "#ffffff";
                    const hex = v.startsWith("#") ? v.slice(1) : v;
                    return hex.length >= 6 ? `#${hex.slice(0, 6)}` : "#ffffff";
                  })()}
                  onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <input
                  type="text"
                  value={(style.backgroundColor as string) ?? ""}
                  onChange={(e) => updateStyle("backgroundColor", e.target.value || undefined)}
                  placeholder="#ffffff"
                  className={inputClass + " flex-1"}
                />
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </>
  );
}

/** @deprecated Use CardSettings instead. */
export const SettingsPanel = CardSettings;
