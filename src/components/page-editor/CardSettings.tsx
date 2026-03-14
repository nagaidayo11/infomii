"use client";

import Image from "next/image";
import { useRef } from "react";
import type { PageBlock, ScheduleItem, MenuItem } from "./types";
import { usePageEditorStore } from "./store";
import { BLOCK_TYPE_LABELS } from "./types";
import { BlockToolbar } from "./BlockToolbar";
import { nanoid } from "nanoid";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

type CardSettingsProps = {
  block: PageBlock | null;
};

export function CardSettings({ block }: CardSettingsProps) {
  const updateBlock = usePageEditorStore((s) => s.updateBlock);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!block) {
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-ds-border bg-ds-card">
        <div className="border-b border-ds-border px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            カード設定
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            プレビューでカードを選択すると編集できます。左からカードを追加できます。
          </p>
        </div>
      </aside>
    );
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateBlock(block.id, { src: dataUrl } as Partial<PageBlock>);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-ds-border bg-ds-bg">
      <div className="flex shrink-0 items-center justify-between border-b border-ds-border bg-ds-card px-4 py-3 shadow-[var(--shadow-ds-xs)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {BLOCK_TYPE_LABELS[block.type]}
        </h2>
        <BlockToolbar blockId={block.id} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {block.type === "text" && (
            <>
              <label className={labelClass}>テキスト</label>
              <textarea
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass + " min-h-[120px] resize-y"}
                placeholder="見出しや本文を入力"
                rows={4}
              />
            </>
          )}

          {block.type === "image" && (
            <>
              <label className={labelClass}>画像URLまたはアップロード</label>
              <input
                type="text"
                value={block.src}
                onChange={(e) =>
                  updateBlock(block.id, { src: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="https://..."
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full rounded-lg border border-dashed border-slate-300 py-2.5 text-xs font-medium text-slate-600 transition hover:border-ds-primary hover:bg-blue-50/50 hover:text-ds-primary"
              >
                画像をアップロード
              </button>
              {block.src && (
                <div className="relative mt-3 aspect-video overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={block.src}
                    alt={block.alt ?? ""}
                    fill
                    className="object-contain"
                    unoptimized={block.src.startsWith("data:") || block.src.startsWith("http")}
                  />
                </div>
              )}
              <label className={labelClass + " mt-3"}>代替テキスト</label>
              <input
                type="text"
                value={block.alt ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { alt: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="画像の説明"
              />
            </>
          )}

          {block.type === "map" && (
            <>
              <label className={labelClass}>住所・施設名</label>
              <input
                type="text"
                value={block.address ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { address: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="住所や施設名"
              />
              <label className={labelClass + " mt-3"}>埋め込みURL（任意）</label>
              <input
                type="text"
                value={block.embedUrl ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { embedUrl: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="Google Maps 埋め込みURL"
              />
            </>
          )}

          {block.type === "button" && (
            <>
              <label className={labelClass}>ボタンラベル</label>
              <input
                type="text"
                value={block.label}
                onChange={(e) =>
                  updateBlock(block.id, { label: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="ボタンのテキスト"
              />
              <label className={labelClass + " mt-3"}>リンクURL</label>
              <input
                type="text"
                value={block.href ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { href: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="https://..."
              />
            </>
          )}

          {block.type === "wifi" && (
            <>
              <label className={labelClass}>ラベル</label>
              <input
                type="text"
                value={block.label ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { label: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="WiFi"
              />
              <label className={labelClass + " mt-3"}>SSID</label>
              <input
                type="text"
                value={block.ssid ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { ssid: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="ネットワーク名"
              />
              <label className={labelClass + " mt-3"}>Password</label>
              <input
                type="text"
                value={block.password ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { password: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="パスワード"
              />
            </>
          )}

          {block.type === "schedule" && (
            <>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={block.title ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="営業時間"
              />
              <div className="mt-4 flex items-center justify-between">
                <label className={labelClass}>項目</label>
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(block.items ?? []), { id: nanoid(6), day: "", time: "", label: "" }];
                    updateBlock(block.id, { items } as Partial<PageBlock>);
                  }}
                  className="text-xs font-medium text-ds-primary hover:underline"
                >
                  + 追加
                </button>
              </div>
              <ul className="mt-2 space-y-2">
                {(block.items ?? []).map((item, i) => (
                  <li key={item.id ?? i} className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                    <input
                      type="text"
                      value={item.day ?? ""}
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], day: e.target.value };
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className={inputClass + " flex-1 text-xs"}
                      placeholder="曜日"
                    />
                    <input
                      type="text"
                      value={item.time ?? ""}
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], time: e.target.value };
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className={inputClass + " w-24 text-xs"}
                      placeholder="時間"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = block.items.filter((_, j) => j !== i);
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {block.type === "menu" && (
            <>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={block.title ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="メニュー"
              />
              <div className="mt-4 flex items-center justify-between">
                <label className={labelClass}>項目</label>
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(block.items ?? []), { id: nanoid(6), name: "", price: "", description: "" }];
                    updateBlock(block.id, { items } as Partial<PageBlock>);
                  }}
                  className="text-xs font-medium text-ds-primary hover:underline"
                >
                  + 追加
                </button>
              </div>
              <ul className="mt-2 space-y-3">
                {(block.items ?? []).map((item, i) => (
                  <li key={item.id ?? i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <input
                      type="text"
                      value={item.name ?? ""}
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], name: e.target.value };
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className={inputClass + " mb-2"}
                      placeholder="品名"
                    />
                    <input
                      type="text"
                      value={item.price ?? ""}
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], price: e.target.value };
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className={inputClass + " mb-2"}
                      placeholder="価格（例: 1,200）"
                    />
                    <input
                      type="text"
                      value={item.description ?? ""}
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], description: e.target.value };
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className={inputClass}
                      placeholder="説明"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = block.items.filter((_, j) => j !== i);
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className="mt-2 text-xs text-slate-400 hover:text-red-600"
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {block.type === "breakfast" && (
            <>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={block.title ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="朝食"
              />
              <label className={labelClass + " mt-3"}>時間</label>
              <input
                type="text"
                value={block.time ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { time: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="7:00–9:30"
              />
              <label className={labelClass + " mt-3"}>会場</label>
              <input
                type="text"
                value={block.place ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { place: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="1F ダイニング"
              />
              <label className={labelClass + " mt-3"}>備考</label>
              <input
                type="text"
                value={block.note ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { note: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="任意"
              />
            </>
          )}

          {block.type === "checkout" && (
            <>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={block.title ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="チェックアウト"
              />
              <label className={labelClass + " mt-3"}>時刻</label>
              <input
                type="text"
                value={block.time ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { time: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="11:00"
              />
              <label className={labelClass + " mt-3"}>補足</label>
              <input
                type="text"
                value={block.note ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { note: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="任意"
              />
              <label className={labelClass + " mt-3"}>リンクURL</label>
              <input
                type="text"
                value={block.linkUrl ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { linkUrl: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="https://..."
              />
              <label className={labelClass + " mt-3"}>リンクラベル</label>
              <input
                type="text"
                value={block.linkLabel ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { linkLabel: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="詳細"
              />
            </>
          )}

          {block.type === "notice" && (
            <>
              <label className={labelClass}>タイトル</label>
              <input
                type="text"
                value={block.title ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="お知らせ"
              />
              <label className={labelClass + " mt-3"}>本文</label>
              <textarea
                value={block.body ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { body: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass + " min-h-[80px] resize-y"}
                placeholder="告知内容"
                rows={3}
              />
              <label className={labelClass + " mt-3"}>種類</label>
              <select
                value={block.variant ?? "info"}
                onChange={(e) =>
                  updateBlock(block.id, {
                    variant: e.target.value === "warning" ? "warning" : "info",
                  } as Partial<PageBlock>)
                }
                className={inputClass}
              >
                <option value="info">お知らせ（青）</option>
                <option value="warning">注意（黄）</option>
              </select>
            </>
          )}

          {block.type === "icon" && (
            <>
              <label className={labelClass}>アイコン（絵文字など）</label>
              <input
                type="text"
                value={block.icon}
                onChange={(e) =>
                  updateBlock(block.id, { icon: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass + " text-2xl"}
                placeholder="📍"
              />
              <label className={labelClass + " mt-3"}>ラベル</label>
              <input
                type="text"
                value={block.label ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { label: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="ラベル"
              />
            </>
          )}

          {block.type === "divider" && (
            <p className="text-sm text-slate-500">設定はありません。ツールバーで複製・削除できます。</p>
          )}

          {block.type === "gallery" && (
            <>
              <label className={labelClass}>画像URL</label>
              {(block.items ?? []).map((item, i) => (
                <input
                  key={item.id}
                  type="text"
                  value={item.src}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[i] = { ...items[i], src: e.target.value };
                    updateBlock(block.id, { items } as Partial<PageBlock>);
                  }}
                  className={inputClass + " mt-2"}
                  placeholder={`画像${i + 1}のURL`}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  const items = [...block.items, { id: `${block.id}-g${block.items.length}`, src: "", caption: "" }];
                  updateBlock(block.id, { items } as Partial<PageBlock>);
                }}
                className="mt-2 text-xs font-medium text-ds-primary hover:underline"
              >
                + 画像を追加
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
