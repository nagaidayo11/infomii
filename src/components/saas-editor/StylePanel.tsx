"use client";

import { useCallback } from "react";
import { useSaasEditorStore } from "./store";
import { BLOCK_TYPE_LABELS } from "./types";
import type { SaasBlockType } from "./types";

type GalleryItem = { id: string; src: string; alt?: string };

export function StylePanel() {
  const blocks = useSaasEditorStore((s) => s.blocks);
  const selectedBlockId = useSaasEditorStore((s) => s.selectedBlockId);
  const updateBlock = useSaasEditorStore((s) => s.updateBlock);

  const selected = blocks.find((b) => b.id === selectedBlockId);
  if (!selected) {
    return (
      <div className="flex h-full flex-col overflow-hidden border-l border-slate-200 bg-white">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            スタイル
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center text-sm text-slate-500">
          キャンバスでブロックを選択すると、ここでスタイルと内容を編集できます。
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

  const labelClass = "mb-1 block text-xs font-medium text-slate-600";
  const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          スタイルとコンテンツ
        </h2>
        <p className="mt-0.5 text-sm font-medium text-slate-700">
          {BLOCK_TYPE_LABELS[selected.type as SaasBlockType]}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {selected.type === "text" && (
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
                  const items = (content.items as GalleryItem[]) ?? [{ id: "1", src: "", alt: "" }];
                  const next = [...items];
                  next[0] = { ...(next[0] ?? { id: "1", src: "", alt: "" }), src: e.target.value };
                  updateContent({ items: next });
                }}
                className={inputClass}
                placeholder="https://..."
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

        <hr className="border-slate-200" />
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
  );
}
