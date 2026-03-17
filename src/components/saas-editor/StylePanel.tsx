"use client";

import { useCallback } from "react";
import { useSaasEditorStore } from "./store";
import { BLOCK_TYPE_LABELS } from "./types";
import type { SaasBlockType } from "./types";

type GalleryItem = { id: string; src: string; alt?: string; caption?: string };

export function StylePanel() {
  const blocks = useSaasEditorStore((s) => s.blocks);
  const selectedBlockId = useSaasEditorStore((s) => s.selectedBlockId);
  const updateBlock = useSaasEditorStore((s) => s.updateBlock);

  const selected = blocks.find((b) => b.id === selectedBlockId);
  if (!selected) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-white">
        <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/50 px-6 py-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-800">プロパティ</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-slate-100 text-3xl" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            ✏️
          </div>
          <p className="max-w-[200px] text-sm font-medium text-slate-600">
            キャンバスでブロックを選択すると、ここで内容とスタイルを編集できます
          </p>
        </div>
      </div>
    );
  }

  const style = selected.style || {};
  const content = selected.content || {};

  const updateStyle = useCallback(
    (patch: Record<string, unknown>) => {
      updateBlock(selected.id, { style: { ...selected.style, ...patch } });
    },
    [selected.id, selected.style, updateBlock]
  );

  const updateContent = useCallback(
    (patch: Record<string, unknown>) => {
      updateBlock(selected.id, { content: { ...selected.content, ...patch } });
    },
    [selected.id, selected.content, updateBlock]
  );

  const labelClass = "mb-2 block text-xs font-medium text-slate-600";
  const inputClass = "w-full rounded-[16px] border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/50 px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-800">プロパティ</h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          {BLOCK_TYPE_LABELS[selected.type as SaasBlockType]}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {selected.type === "hero" && (
          <>
            <div>
              <label className={labelClass}>画像URL</label>
              <input
                type="url"
                value={(content.imageSrc as string) ?? ""}
                onChange={(e) => updateContent({ imageSrc: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
                placeholder="タイトル"
              />
            </div>
            <div>
              <label className={labelClass}>サブタイトル</label>
              <input
                type="text"
                value={(content.subtitle as string) ?? ""}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className={inputClass}
                placeholder="任意"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hero-overlay"
                checked={(content.overlay as boolean) !== false}
                onChange={(e) => updateContent({ overlay: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="hero-overlay" className="text-sm text-slate-600">画像上にグラデーションオーバーレイ</label>
            </div>
          </>
        )}
        {selected.type === "highlight" && (
          <>
            <div>
              <label className={labelClass}>アイコン（1文字）</label>
              <input
                type="text"
                value={(content.icon as string) ?? ""}
                onChange={(e) => updateContent({ icon: e.target.value })}
                className={inputClass}
                placeholder="★"
                maxLength={2}
              />
            </div>
            <div>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
                placeholder="重要なお知らせ"
              />
            </div>
            <div>
              <label className={labelClass}>本文</label>
              <textarea
                value={(content.body as string) ?? ""}
                onChange={(e) => updateContent({ body: e.target.value })}
                className={inputClass}
                rows={3}
                placeholder="強調したい内容"
              />
            </div>
            <div>
              <label className={labelClass}>アクセント色</label>
              <select
                value={(content.accent as string) ?? "amber"}
                onChange={(e) => updateContent({ accent: e.target.value })}
                className={inputClass}
              >
                <option value="amber">アンバー</option>
                <option value="blue">ブルー</option>
                <option value="emerald">エメラルド</option>
                <option value="rose">ローズ</option>
                <option value="violet">バイオレット</option>
              </select>
            </div>
          </>
        )}
        {selected.type === "info" && (
          <>
            <div>
              <label className={labelClass}>アイコン（1文字）</label>
              <input
                type="text"
                value={(content.icon as string) ?? ""}
                onChange={(e) => updateContent({ icon: e.target.value })}
                className={inputClass}
                placeholder="📶"
                maxLength={2}
              />
            </div>
            <div>
              <label className={labelClass}>タイトル（例: Wi-Fi）</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
                placeholder="情報"
              />
            </div>
            <div>
              <label className={labelClass}>行1 ラベル</label>
              <input
                type="text"
                value={((content.rows as { label?: string; value?: string }[])?.[0]?.label as string) ?? ""}
                onChange={(e) => {
                  const rows = (content.rows as { label?: string; value?: string }[]) ?? [];
                  const next = [...rows];
                  next[0] = { ...(next[0] ?? {}), label: e.target.value };
                  updateContent({ rows: next });
                }}
                className={inputClass}
                placeholder="ネットワーク名"
              />
            </div>
            <div>
              <label className={labelClass}>行1 値</label>
              <input
                type="text"
                value={((content.rows as { label?: string; value?: string }[])?.[0]?.value as string) ?? ""}
                onChange={(e) => {
                  const rows = (content.rows as { label?: string; value?: string }[]) ?? [];
                  const next = [...rows];
                  next[0] = { ...(next[0] ?? {}), value: e.target.value };
                  updateContent({ rows: next });
                }}
                className={inputClass}
                placeholder="Hotel_Guest"
              />
            </div>
            <div>
              <label className={labelClass}>行2 ラベル</label>
              <input
                type="text"
                value={((content.rows as { label?: string; value?: string }[])?.[1]?.label as string) ?? ""}
                onChange={(e) => {
                  const rows = (content.rows as { label?: string; value?: string }[]) ?? [];
                  const next = [...rows];
                  next[1] = { ...(next[1] ?? {}), label: e.target.value };
                  updateContent({ rows: next });
                }}
                className={inputClass}
                placeholder="パスワード"
              />
            </div>
            <div>
              <label className={labelClass}>行2 値</label>
              <input
                type="text"
                value={((content.rows as { label?: string; value?: string }[])?.[1]?.value as string) ?? ""}
                onChange={(e) => {
                  const rows = (content.rows as { label?: string; value?: string }[]) ?? [];
                  const next = [...rows];
                  next[1] = { ...(next[1] ?? {}), value: e.target.value };
                  updateContent({ rows: next });
                }}
                className={inputClass}
                placeholder="guest1234"
              />
            </div>
          </>
        )}
        {selected.type === "text" && (
          <>
            <div>
              <label className={labelClass}>テキスト</label>
              <textarea
                value={(content.content as string) ?? ""}
                onChange={(e) => updateContent({ content: e.target.value })}
                className={inputClass}
                rows={3}
                placeholder="ここに入力..."
              />
            </div>
            <div>
              <label className={labelClass}>表示</label>
              <select
                value={(content.variant as string) ?? "body"}
                onChange={(e) => updateContent({ variant: e.target.value })}
                className={inputClass}
              >
                <option value="body">本文</option>
                <option value="heading">見出し</option>
              </select>
            </div>
          </>
        )}
        {selected.type === "image" && (
          <>
            <div>
              <label className={labelClass}>画像URL</label>
              <input
                type="url"
                value={(content.src as string) ?? ""}
                onChange={(e) => updateContent({ src: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>代替テキスト</label>
              <input
                type="text"
                value={(content.alt as string) ?? ""}
                onChange={(e) => updateContent({ alt: e.target.value })}
                className={inputClass}
                placeholder="説明"
              />
            </div>
            <div>
              <label className={labelClass}>キャプション</label>
              <input
                type="text"
                value={(content.caption as string) ?? ""}
                onChange={(e) => updateContent({ caption: e.target.value })}
                className={inputClass}
                placeholder="任意"
              />
            </div>
          </>
        )}
        {selected.type === "button" && (
          <>
            <div>
              <label className={labelClass}>ラベル</label>
              <input
                type="text"
                value={(content.label as string) ?? ""}
                onChange={(e) => updateContent({ label: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>リンクURL</label>
              <input
                type="url"
                value={(content.href as string) ?? ""}
                onChange={(e) => updateContent({ href: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          </>
        )}
        {selected.type === "map" && (
          <>
            <div>
              <label className={labelClass}>住所</label>
              <input
                type="text"
                value={(content.address as string) ?? ""}
                onChange={(e) => updateContent({ address: e.target.value })}
                className={inputClass}
                placeholder="住所を入力"
              />
            </div>
            <div>
              <label className={labelClass}>埋め込みURL（任意）</label>
              <input
                type="url"
                value={(content.embedUrl as string) ?? ""}
                onChange={(e) => updateContent({ embedUrl: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>ボタンラベル</label>
              <input
                type="text"
                value={(content.buttonLabel as string) ?? "地図を開く"}
                onChange={(e) => updateContent({ buttonLabel: e.target.value })}
                className={inputClass}
                placeholder="地図を開く"
              />
            </div>
          </>
        )}
        {selected.type === "gallery" && (
          <>
            <div>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
                placeholder="ギャラリー"
              />
            </div>
            <div>
              <label className={labelClass}>画像URL（1枚目）</label>
              <input
                type="url"
                value={((content.items as GalleryItem[])?.[0]?.src as string) ?? ""}
                onChange={(e) => {
                  const items = (content.items as GalleryItem[]) ?? [{ id: "1", src: "", alt: "", caption: "" }];
                  const next = [...items];
                  next[0] = { ...(next[0] ?? { id: "1", src: "", alt: "", caption: "" }), src: e.target.value };
                  updateContent({ items: next });
                }}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>1枚目キャプション</label>
              <input
                type="text"
                value={((content.items as GalleryItem[])?.[0]?.caption as string) ?? ""}
                onChange={(e) => {
                  const items = (content.items as GalleryItem[]) ?? [{ id: "1", src: "", alt: "", caption: "" }];
                  const next = [...items];
                  next[0] = { ...(next[0] ?? { id: "1", src: "", alt: "", caption: "" }), caption: e.target.value };
                  updateContent({ items: next });
                }}
                className={inputClass}
                placeholder="任意"
              />
            </div>
          </>
        )}
        {selected.type === "notice" && (
          <>
            <div>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
                placeholder="お知らせ"
              />
            </div>
            <div>
              <label className={labelClass}>本文</label>
              <textarea
                value={(content.body as string) ?? ""}
                onChange={(e) => updateContent({ body: e.target.value })}
                className={inputClass}
                rows={3}
                placeholder="内容を入力"
              />
            </div>
            <div>
              <label className={labelClass}>種類</label>
              <select
                value={(content.variant as string) ?? "info"}
                onChange={(e) => updateContent({ variant: e.target.value })}
                className={inputClass}
              >
                <option value="info">お知らせ（青）</option>
                <option value="warning">注意（黄）</option>
              </select>
            </div>
          </>
        )}
        {selected.type === "coupon" && (
          <>
            <div>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
                placeholder="クーポン"
              />
            </div>
            <div>
              <label className={labelClass}>クーポンコード</label>
              <input
                type="text"
                value={(content.code as string) ?? ""}
                onChange={(e) => updateContent({ code: e.target.value })}
                className={inputClass}
                placeholder="COUPON-123"
              />
            </div>
            <div>
              <label className={labelClass}>説明</label>
              <input
                type="text"
                value={(content.description as string) ?? ""}
                onChange={(e) => updateContent({ description: e.target.value })}
                className={inputClass}
                placeholder="利用条件など"
              />
            </div>
            <div>
              <label className={labelClass}>有効期限</label>
              <input
                type="text"
                value={(content.validUntil as string) ?? ""}
                onChange={(e) => updateContent({ validUntil: e.target.value })}
                className={inputClass}
                placeholder="2025/12/31まで"
              />
            </div>
          </>
        )}
        {selected.type === "qr" && (
          <>
            <div>
              <label className={labelClass}>QRコードのURL</label>
              <input
                type="url"
                value={(content.url as string) ?? ""}
                onChange={(e) => updateContent({ url: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>代替テキスト</label>
              <input
                type="text"
                value={(content.alt as string) ?? ""}
                onChange={(e) => updateContent({ alt: e.target.value })}
                className={inputClass}
                placeholder="QRコード"
              />
            </div>
          </>
        )}

        <div className="rounded-[16px] border border-slate-200/80 bg-slate-50/30 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">共通スタイル</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>背景色</label>
            <input
              type="text"
              value={style.backgroundColor ?? ""}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value || undefined })}
              className={inputClass}
              placeholder="#fff または空"
            />
          </div>
          <div>
            <label className={labelClass}>文字色</label>
            <input
              type="text"
              value={style.color ?? ""}
              onChange={(e) => updateStyle({ color: e.target.value || undefined })}
              className={inputClass}
              placeholder="#000"
            />
          </div>
          <div>
            <label className={labelClass}>角丸（px）</label>
            <input
              type="number"
              min={0}
              value={style.borderRadius ?? ""}
              onChange={(e) =>
                updateStyle({
                  borderRadius: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={inputClass}
              placeholder="8"
            />
          </div>
          <div>
            <label className={labelClass}>フォントサイズ（px）</label>
            <input
              type="number"
              min={8}
              value={style.fontSize ?? ""}
              onChange={(e) =>
                updateStyle({
                  fontSize: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={inputClass}
              placeholder="16"
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
