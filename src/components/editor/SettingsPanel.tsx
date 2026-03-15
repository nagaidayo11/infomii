"use client";

import { Input } from "@/components/ui/Input";
import type { EditorCard } from "./types";
import { CARD_TYPE_LABELS } from "./types";

type SettingsPanelProps = {
  card: EditorCard | null;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
};

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
                value={(content.content as string) ?? ""}
                onChange={(e) => update("content", e.target.value)}
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
                value={(content.alt as string) ?? ""}
                onChange={(e) => update("alt", e.target.value)}
                placeholder="画像の説明"
              />
            </>
          )}

          {card.type === "wifi" && (
            <>
              <Input
                label="タイトル"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="WiFi"
              />
              <Input
                label="SSID"
                value={(content.ssid as string) ?? ""}
                onChange={(e) => update("ssid", e.target.value)}
                placeholder="ネットワーク名"
              />
              <Input
                label="パスワード"
                value={(content.password as string) ?? ""}
                onChange={(e) => update("password", e.target.value)}
                placeholder="パスワード"
              />
              <Input
                label="説明"
                value={(content.description as string) ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="任意"
              />
            </>
          )}

          {card.type === "breakfast" && (
            <>
              <Input
                label="タイトル"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="朝食"
              />
              <Input
                label="時間"
                value={(content.time as string) ?? ""}
                onChange={(e) => update("time", e.target.value)}
                placeholder="7:00–9:30"
              />
              <Input
                label="会場"
                value={(content.location as string) ?? ""}
                onChange={(e) => update("location", e.target.value)}
                placeholder="1F ダイニング"
              />
              <Input
                label="説明"
                value={(content.description as string) ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="任意"
              />
            </>
          )}

          {card.type === "checkout" && (
            <>
              <Input
                label="タイトル"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="チェックアウト"
              />
              <Input
                label="時刻"
                value={(content.time as string) ?? ""}
                onChange={(e) => update("time", e.target.value)}
                placeholder="11:00"
              />
              <Input
                label="補足"
                value={(content.note as string) ?? ""}
                onChange={(e) => update("note", e.target.value)}
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
                value={(content.linkLabel as string) ?? ""}
                onChange={(e) => update("linkLabel", e.target.value)}
                placeholder="詳細"
              />
            </>
          )}

          {card.type === "map" && (
            <>
              <Input
                label="住所・施設名"
                value={(content.address as string) ?? ""}
                onChange={(e) => update("address", e.target.value)}
                placeholder="ホテル住所"
              />
            </>
          )}

          {card.type === "notice" && (
            <>
              <Input
                label="タイトル"
                value={(content.title as string) ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="お知らせ"
              />
              <div className="w-full">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">本文</label>
                <textarea
                  value={(content.body as string) ?? ""}
                  onChange={(e) => update("body", e.target.value)}
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
                value={(content.label as string) ?? ""}
                onChange={(e) => update("label", e.target.value)}
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
