"use client";

import { useCallback } from "react";
import { useSaasEditorStore } from "./store";
import { BLOCK_TYPE_LABELS } from "./types";
import type { SaasBlockType } from "./types";

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
            Style
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center text-sm text-slate-500">
          Select a block on the canvas to edit its style and content.
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

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Style & content
        </h2>
        <p className="mt-0.5 text-sm font-medium text-slate-700">
          {BLOCK_TYPE_LABELS[selected.type as SaasBlockType]}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Content by type */}
        {selected.type === "text" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Content</label>
            <textarea
              value={(content.content as string) ?? ""}
              onChange={(e) => updateContent({ content: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Text..."
            />
          </div>
        )}
        {selected.type === "image" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Image URL</label>
              <input
                type="url"
                value={(content.src as string) ?? ""}
                onChange={(e) => updateContent({ src: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Alt text</label>
              <input
                type="text"
                value={(content.alt as string) ?? ""}
                onChange={(e) => updateContent({ alt: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Description"
              />
            </div>
          </>
        )}
        {selected.type === "button" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Label</label>
              <input
                type="text"
                value={(content.label as string) ?? ""}
                onChange={(e) => updateContent({ label: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Link (href)</label>
              <input
                type="url"
                value={(content.href as string) ?? ""}
                onChange={(e) => updateContent({ href: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
          </>
        )}
        {selected.type === "video" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">YouTube / Vimeo URL</label>
            <input
              type="url"
              value={(content.url as string) ?? (content.embedUrl as string) ?? ""}
              onChange={(e) => updateContent({ url: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://youtube.com/..."
            />
          </div>
        )}
        {selected.type === "map" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Address</label>
              <input
                type="text"
                value={(content.address as string) ?? ""}
                onChange={(e) => updateContent({ address: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Embed URL (optional)</label>
              <input
                type="url"
                value={(content.embedUrl as string) ?? ""}
                onChange={(e) => updateContent({ embedUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
          </>
        )}
        {selected.type === "menu" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
              <input
                type="text"
                value={(content.title as string) ?? ""}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Menu"
              />
            </div>
            <p className="text-xs text-slate-500">
              Menu items: edit in code or extend this panel with item list UI.
            </p>
          </>
        )}

        {/* Common style */}
        <hr className="border-slate-200" />
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Background</label>
            <input
              type="text"
              value={style.backgroundColor ?? ""}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value || undefined })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="#fff or transparent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Text color</label>
            <input
              type="text"
              value={style.color ?? ""}
              onChange={(e) => updateStyle({ color: e.target.value || undefined })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="#000"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Border radius (px)</label>
            <input
              type="number"
              min={0}
              value={style.borderRadius ?? ""}
              onChange={(e) =>
                updateStyle({
                  borderRadius: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="8"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Font size (px)</label>
            <input
              type="number"
              min={8}
              value={style.fontSize ?? ""}
              onChange={(e) =>
                updateStyle({
                  fontSize: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="16"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
