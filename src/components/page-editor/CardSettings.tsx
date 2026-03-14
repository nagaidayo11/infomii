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
            Card settings
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Select a card on the preview to edit its content, or add a card from the left.
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
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-ds-border bg-ds-card">
      <div className="flex shrink-0 items-center justify-between border-b border-ds-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {BLOCK_TYPE_LABELS[block.type]}
        </h2>
        <BlockToolbar blockId={block.id} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {block.type === "text" && (
            <>
              <label className={labelClass}>Text</label>
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
              <label className={labelClass}>Image URL or upload</label>
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
                Upload image
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
              <label className={labelClass + " mt-3"}>Alt text</label>
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
              <label className={labelClass}>Location / Address</label>
              <input
                type="text"
                value={block.address ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { address: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="住所や施設名"
              />
              <label className={labelClass + " mt-3"}>Embed URL (optional)</label>
              <input
                type="text"
                value={block.embedUrl ?? ""}
                onChange={(e) =>
                  updateBlock(block.id, { embedUrl: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="Google Maps embed URL"
              />
            </>
          )}

          {block.type === "button" && (
            <>
              <label className={labelClass}>Button label</label>
              <input
                type="text"
                value={block.label}
                onChange={(e) =>
                  updateBlock(block.id, { label: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass}
                placeholder="ボタンのテキスト"
              />
              <label className={labelClass + " mt-3"}>Link URL</label>
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
              <label className={labelClass}>Label</label>
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
              <label className={labelClass}>Title</label>
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
                <label className={labelClass}>Entries</label>
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(block.items ?? []), { id: nanoid(6), day: "", time: "", label: "" }];
                    updateBlock(block.id, { items } as Partial<PageBlock>);
                  }}
                  className="text-xs font-medium text-ds-primary hover:underline"
                >
                  + Add
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
                      placeholder="Day"
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
                      placeholder="Time"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = block.items.filter((_, j) => j !== i);
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      aria-label="Remove"
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
              <label className={labelClass}>Title</label>
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
                <label className={labelClass}>Items</label>
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(block.items ?? []), { id: nanoid(6), name: "", price: "", description: "" }];
                    updateBlock(block.id, { items } as Partial<PageBlock>);
                  }}
                  className="text-xs font-medium text-ds-primary hover:underline"
                >
                  + Add
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
                      placeholder="Name"
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
                      placeholder="Price (e.g. 1,200)"
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
                      placeholder="Description"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = block.items.filter((_, j) => j !== i);
                        updateBlock(block.id, { items } as Partial<PageBlock>);
                      }}
                      className="mt-2 text-xs text-slate-400 hover:text-red-600"
                    >
                      Remove item
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {block.type === "icon" && (
            <>
              <label className={labelClass}>Icon (emoji or name)</label>
              <input
                type="text"
                value={block.icon}
                onChange={(e) =>
                  updateBlock(block.id, { icon: e.target.value } as Partial<PageBlock>)
                }
                className={inputClass + " text-2xl"}
                placeholder="📍"
              />
              <label className={labelClass + " mt-3"}>Label</label>
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
            <p className="text-sm text-slate-500">No settings. Use duplicate or delete in the toolbar.</p>
          )}

          {block.type === "gallery" && (
            <>
              <label className={labelClass}>Image URLs</label>
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
                  placeholder={`Image ${i + 1} URL`}
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
                + Add image
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
