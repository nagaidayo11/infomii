"use client";

import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Input } from "@/components/ui/Input";
import type { EditorCard } from "./types";
import { CARD_TYPE_LABELS } from "./types";

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

export function SettingsPanel({ card, onUpdate }: SettingsPanelProps) {
  if (!card) {
    return (
      <>
        <div className="border-b border-ds-border bg-ds-card px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            カード設定
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            プレビューでカードを選択すると編集できます。左からカードを追加できます。
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
  /** 多言語フィールドの更新（既存の他言語を保持し ja を更新） */
  const updateLocalized = (key: string, value: string) => {
    const cur = content[key];
    const next = isLocalizedObject(cur) ? { ...cur, ja: value } : value;
    update(key, next);
  };

  return (
    <>
      <div className="shrink-0 border-b border-ds-border bg-ds-card px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {CARD_TYPE_LABELS[card.type]}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {card.type === "text" && (
            <>
              <Input
                label="テキスト"
                value={display("content")}
                onChange={(e) => updateLocalized("content", e.target.value)}
                placeholder="見出しや本文を入力"
              />
            </>
          )}

          {card.type === "image" && (
            <>
              <Input
                label="画像URL"
                value={(content.src as string) ?? ""}
                onChange={(e) => update("src", e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="代替テキスト"
                value={display("alt")}
                onChange={(e) => updateLocalized("alt", e.target.value)}
                placeholder="画像の説明"
              />
            </>
          )}

          {card.type === "wifi" && (
            <>
              <Input
                label="SSID"
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
              <Input
                label="説明"
                value={display("description")}
                onChange={(e) => updateLocalized("description", e.target.value)}
                placeholder="任意"
              />
            </>
          )}

          {card.type === "breakfast" && (
            <>
              <Input
                label="時間"
                value={display("time")}
                onChange={(e) => updateLocalized("time", e.target.value)}
                placeholder="7:00–9:30"
              />
              <Input
                label="会場"
                value={display("location")}
                onChange={(e) => updateLocalized("location", e.target.value)}
                placeholder="1F ダイニング"
              />
              <Input
                label="メニュー"
                value={display("menu")}
                onChange={(e) => updateLocalized("menu", e.target.value)}
                placeholder="朝食メニュー・備考"
              />
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
                label="住所・施設名"
                value={display("address")}
                onChange={(e) => updateLocalized("address", e.target.value)}
                placeholder="ホテル住所"
              />
            </>
          )}

          {card.type === "notice" && (
            <>
              <Input
                label="タイトル"
                value={display("title")}
                onChange={(e) => updateLocalized("title", e.target.value)}
                placeholder="お知らせ"
              />
              <div className="w-full">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">本文</label>
                <textarea
                  value={display("body")}
                  onChange={(e) => updateLocalized("body", e.target.value)}
                  placeholder="告知内容"
                  rows={3}
                  className="w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20"
                />
              </div>
              <div className="w-full">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">種類</label>
                <select
                  value={(content.variant as string) ?? "info"}
                  onChange={(e) => update("variant", e.target.value)}
                  className="w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20"
                >
                  <option value="info">お知らせ（青）</option>
                  <option value="warning">注意（黄）</option>
                </select>
              </div>
            </>
          )}

          {card.type === "button" && (
            <>
              <Input
                label="ボタンラベル"
                value={display("label")}
                onChange={(e) => updateLocalized("label", e.target.value)}
                placeholder="ボタンのテキスト"
              />
              <Input
                label="リンクURL"
                value={(content.href as string) ?? ""}
                onChange={(e) => update("href", e.target.value)}
                placeholder="https://..."
              />
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
