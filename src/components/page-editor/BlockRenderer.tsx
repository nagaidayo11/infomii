"use client";

import Image from "next/image";
import type { PageBlock } from "./types";
import { usePageEditorStore } from "./store";

type BlockRendererProps = {
  block: PageBlock;
  mode: "canvas" | "preview";
  isSelected?: boolean;
};

export function BlockRenderer({
  block,
  mode,
  isSelected = false,
}: BlockRendererProps) {
  const updateBlock = usePageEditorStore((s) => s.updateBlock);
  const selectBlock = usePageEditorStore((s) => s.selectBlock);

  const editable = mode === "canvas";

  const baseCard =
    "rounded-xl border transition " +
    (isSelected && editable
      ? "border-blue-400/70 bg-ds-card shadow-md ring-2 ring-blue-500/15"
      : "border-ds-border bg-ds-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-slate-300");

  switch (block.type) {
    case "text":
      if (editable) {
        return (
          <div
            className={baseCard + " p-4"}
            onClick={() => selectBlock(block.id)}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              className="min-h-[1.5em] w-full outline-none focus:ring-0"
              onBlur={(e) =>
                updateBlock(block.id, {
                  content: e.currentTarget.textContent ?? "",
                } as Partial<PageBlock>)
              }
              onInput={(e) =>
                updateBlock(block.id, {
                  content: e.currentTarget.textContent ?? "",
                } as Partial<PageBlock>)
              }
            >
              {block.content}
            </div>
          </div>
        );
      }
      return (
        <p className="px-1 py-2 text-base font-medium text-slate-800">
          {block.content || " "}
        </p>
      );

    case "image":
      if (editable) {
        return (
          <div
            className={baseCard + " overflow-hidden p-2"}
            onClick={() => selectBlock(block.id)}
          >
            {block.src ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={block.src}
                  alt={block.alt ?? ""}
                  fill
                  className="object-cover"
                  unoptimized={block.src.startsWith("http")}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                画像URLを入力
              </div>
            )}
            <input
              type="text"
              value={block.src}
              onChange={(e) =>
                updateBlock(block.id, { src: e.target.value } as Partial<PageBlock>)
              }
              placeholder="画像のURLを貼り付け"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        );
      }
      if (!block.src) return null;
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={block.src}
            alt={block.alt ?? ""}
            fill
            className="object-cover"
            unoptimized={block.src.startsWith("http")}
          />
        </div>
      );

    case "button":
      if (editable) {
        return (
          <div
            className={baseCard + " space-y-2 p-4"}
            onClick={() => selectBlock(block.id)}
          >
            <input
              type="text"
              value={block.label}
              onChange={(e) =>
                updateBlock(block.id, { label: e.target.value } as Partial<PageBlock>)
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
            />
            <input
              type="text"
              value={block.href ?? ""}
              onChange={(e) =>
                updateBlock(block.id, { href: e.target.value } as Partial<PageBlock>)
              }
              placeholder="リンクURL"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <span className="inline-flex rounded-xl bg-ds-primary px-4 py-2 text-sm font-medium text-white shadow-sm">
              {block.label}
            </span>
          </div>
        );
      }
      return (
        <a
          href={block.href || "#"}
          className="my-2 inline-flex w-full items-center justify-center rounded-xl bg-ds-primary px-4 py-3 text-sm font-medium text-white shadow-sm"
        >
          {block.label}
        </a>
      );

    case "icon":
      if (editable) {
        return (
          <div
            className={baseCard + " flex flex-wrap items-center gap-3 p-4"}
            onClick={() => selectBlock(block.id)}
          >
            <input
              type="text"
              value={block.icon}
              onChange={(e) =>
                updateBlock(block.id, { icon: e.target.value } as Partial<PageBlock>)
              }
              className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-center text-2xl"
            />
            <input
              type="text"
              value={block.label ?? ""}
              onChange={(e) =>
                updateBlock(block.id, { label: e.target.value } as Partial<PageBlock>)
              }
              placeholder="ラベル"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 py-2">
          <span className="text-2xl">{block.icon}</span>
          {block.label && (
            <span className="text-sm text-slate-700">{block.label}</span>
          )}
        </div>
      );

    case "divider":
      if (editable) {
        return (
          <div
            className={baseCard + " py-3"}
            onClick={() => selectBlock(block.id)}
          >
            <hr className="border-slate-200" />
          </div>
        );
      }
      return <hr className="my-3 border-slate-200" />;

    case "map":
      if (editable) {
        return (
          <div
            className={baseCard + " space-y-2 p-4"}
            onClick={() => selectBlock(block.id)}
          >
            <input
              type="text"
              value={block.address ?? ""}
              onChange={(e) =>
                updateBlock(block.id, {
                  address: e.target.value,
                } as Partial<PageBlock>)
              }
              placeholder="住所"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
              地図プレビュー
            </div>
          </div>
        );
      }
      return (
        <div className="my-2 rounded-xl bg-slate-100 py-8 text-center text-sm text-slate-600">
          {block.address || "地図"}
        </div>
      );

    case "gallery":
      if (editable) {
        return (
          <div
            className={baseCard + " space-y-2 p-4"}
            onClick={() => selectBlock(block.id)}
          >
            <p className="text-xs font-medium text-slate-500">ギャラリー</p>
            {block.items.map((item, i) => (
              <input
                key={item.id}
                type="text"
                value={item.src}
                onChange={(e) => {
                  const items = [...block.items];
                  items[i] = { ...items[i], src: e.target.value };
                  updateBlock(block.id, { items } as Partial<PageBlock>);
                }}
                placeholder={`画像${i + 1}のURLを貼り付け`}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            ))}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-2 gap-2 py-2">
          {block.items
            .filter((i) => i.src)
            .map((item) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
              >
                <Image
                  src={item.src}
                  alt={item.caption ?? ""}
                  fill
                  className="object-cover"
                  unoptimized={item.src.startsWith("http")}
                />
              </div>
            ))}
        </div>
      );

    case "wifi":
      if (editable) {
        return (
          <div className={baseCard + " p-4"} onClick={() => selectBlock(block.id)}>
            <p className="text-xs font-medium text-slate-500">WiFi — 右パネルで編集</p>
            <p className="mt-1 text-sm text-slate-700">{block.label || "WiFi"}</p>
          </div>
        );
      }
      return (
        <div className="rounded-xl border border-ds-border bg-ds-card p-4">
          <p className="text-sm font-medium text-slate-800">📶 {block.label || "WiFi"}</p>
          {block.ssid && <p className="mt-1 text-xs text-slate-600">{block.ssid}</p>}
        </div>
      );

    case "schedule":
      if (editable) {
        return (
          <div className={baseCard + " p-4"} onClick={() => selectBlock(block.id)}>
            <p className="text-xs font-medium text-slate-500">Schedule — 右パネルで編集</p>
            <p className="mt-1 text-sm text-slate-700">{block.title || "営業時間"}</p>
          </div>
        );
      }
      return (
        <div className="rounded-xl border border-ds-border bg-ds-card p-4">
          <p className="text-sm font-medium text-slate-800">{block.title || "営業時間"}</p>
          <p className="mt-1 text-xs text-slate-600">{block.items?.length ?? 0} 件</p>
        </div>
      );

    case "menu":
      if (editable) {
        return (
          <div className={baseCard + " p-4"} onClick={() => selectBlock(block.id)}>
            <p className="text-xs font-medium text-slate-500">Menu — 右パネルで編集</p>
            <p className="mt-1 text-sm text-slate-700">{block.title || "メニュー"}</p>
          </div>
        );
      }
      return (
        <div className="rounded-xl border border-ds-border bg-ds-card p-4">
          <p className="text-sm font-medium text-slate-800">{block.title || "メニュー"}</p>
          <p className="mt-1 text-xs text-slate-600">{block.items?.length ?? 0} 品</p>
        </div>
      );

    default:
      return null;
  }
}
