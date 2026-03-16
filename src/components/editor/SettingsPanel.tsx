"use client";

import { useRef, useCallback, useEffect } from "react";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Input } from "@/components/ui/Input";
import type { EditorCard } from "./types";
import { CARD_TYPE_LABELS } from "./types";
import { useEditor2Store } from "./store";

const TRANSLATE_DEBOUNCE_MS = 1200;
const MIN_TEXT_LENGTH_FOR_TRANSLATE = 2;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

const COLOR_PRESETS = [
  { value: "", label: "Default" },
  { value: "#2563eb", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Red" },
  { value: "#7c3aed", label: "Violet" },
];

type SettingsPanelProps = {
  card: EditorCard | null;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
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
        <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
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

export function SettingsPanel({ card, onUpdate }: SettingsPanelProps) {
  const translateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ cardId: string; key: string; ja: string } | null>(null);

  if (!card) {
    return (
      <>
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Card Settings
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            キャンバスでカードを1枚選択すると、ここで編集できます。
          </p>
        </div>
      </>
    );
  }

  const content = card.content as Record<string, unknown>;
  const update = (key: string, value: unknown) => {
    onUpdate(card.id, { ...content, [key]: value });
  };
  /** 多言語フィールドの表示値（日本語を優先） */
  const display = (key: string) =>
    getLocalizedContent(content[key] as LocalizedString | undefined, "ja");

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
        ...(currentCard.content as Record<string, unknown>),
        [key]: { ja, en: result.en, zh: result.zh, ko: result.ko },
      });
    });
  }, [onUpdate]);

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

  useEffect(() => {
    return () => {
      if (translateTimeoutRef.current) clearTimeout(translateTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Card Settings
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {CARD_TYPE_LABELS[card.type]}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Changes update the canvas in real time.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {card.type === "welcome" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="ようこそ"
              />
              <div className="w-full">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">メッセージ</label>
                <textarea
                  value={display("message")}
                  onChange={(e) => updateLocalized("message", e.target.value)}
                  placeholder="おもてなしメッセージ"
                  rows={3}
                  className="w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </div>
            </>
          )}

          {card.type === "text" && (
            <>
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
            </>
          )}

          {card.type === "image" && (
            <>
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="Optional caption"
              />
              <Input
                label="Image URL"
                value={(content.src as string) ?? ""}
                onChange={(e) => update("src", e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Text (alt)"
                value={display("alt")}
                onChange={(e) => updateLocalized("alt", e.target.value)}
                placeholder="Image description"
              />
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
            </>
          )}

          {card.type === "wifi" && (
            <>
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
                <label className={labelClass}>Text</label>
                <textarea
                  value={display("description")}
                  onChange={(e) => updateLocalized("description", e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className={inputClass}
                />
              </div>
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
            </>
          )}

          {card.type === "breakfast" && (
            <>
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
                <label className={labelClass}>Text</label>
                <textarea
                  value={display("menu")}
                  onChange={(e) => updateLocalized("menu", e.target.value)}
                  placeholder="Menu or notes"
                  rows={2}
                  className={inputClass}
                />
              </div>
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
            </>
          )}

          {card.type === "checkout" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="チェックアウト"
              />
              <Input
                label="時刻"
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
            </>
          )}

          {card.type === "taxi" && (
            <>
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
                label="備考"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </>
          )}

          {card.type === "restaurant" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="レストラン"
              />
              <Input
                label="時間"
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
                label="メニュー"
                value={display("menu")}
                onChange={(e) => updateLocalized("menu", e.target.value)}
                placeholder="メニュー・備考"
              />
            </>
          )}

          {card.type === "laundry" && (
            <>
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
            </>
          )}

          {card.type === "emergency" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="緊急連絡先"
              />
              <Input
                label="火災"
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
                label="備考"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </>
          )}

          {card.type === "map" && (
            <>
              <Input
                label="Title"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="e.g. Location"
              />
              <div className="w-full">
                <label className={labelClass}>Text</label>
                <textarea
                  value={display("address")}
                  onChange={(e) => updateLocalized("address", e.target.value)}
                  placeholder="Address or place name"
                  rows={2}
                  className={inputClass}
                />
              </div>
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
            </>
          )}

          {card.type === "nearby" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="周辺案内"
              />
              <NearbyItemsEditor content={content} onUpdate={update} />
            </>
          )}

          {card.type === "spa" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="スパ・温泉"
              />
              <Input
                label="営業時間"
                value={display("hours")}
                onChange={(e) => updateLocalized("hours", e.target.value)}
                placeholder="6:00–24:00"
              />
              <Input
                label="場所"
                value={display("location")}
                onChange={(e) => updateLocalized("location", e.target.value)}
                placeholder="B1F"
              />
              <div className="w-full">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">説明</label>
                <textarea
                  value={display("description")}
                  onChange={(e) => updateLocalized("description", e.target.value)}
                  placeholder="施設の説明"
                  rows={2}
                  className="w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </div>
              <Input
                label="備考"
                value={display("note")}
                onChange={(e) => updateLocalized("note", e.target.value)}
                placeholder="任意"
              />
            </>
          )}

          {card.type === "notice" && (
            <>
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
              <Input
                label="Icon"
                value={(content.icon as string) ?? ""}
                onChange={(e) => update("icon", e.target.value)}
                placeholder="Emoji or icon name"
              />
              <div className="w-full">
                <label className={labelClass}>Color</label>
                <select
                  value={
                    (content.color as string) ??
                    (content.variant === "warning" ? "#d97706" : content.variant === "info" ? "#2563eb" : "")
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    onUpdate(card.id, {
                      ...content,
                      color: v,
                      variant: v === "#d97706" ? "warning" : "info",
                    });
                  }}
                  className={inputClass}
                >
                  {COLOR_PRESETS.map((p) => (
                    <option key={p.value || "default"} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {card.type === "button" && (
            <>
              <Input
                label="Title"
                value={display("label")}
                onChange={(e) => updateLocalized("label", e.target.value)}
                placeholder="Button text"
              />
              <Input
                label="Button link"
                value={(content.href as string) ?? ""}
                onChange={(e) => update("href", e.target.value)}
                placeholder="https://..."
              />
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
            </>
          )}

          {(card.type === "schedule" || card.type === "menu") && (
            <p className="text-sm text-slate-500">
              {card.type === "schedule" ? "営業時間" : "メニュー"}の項目は今後追加できます。
            </p>
          )}
        </div>
      </div>
    </>
  );
}
