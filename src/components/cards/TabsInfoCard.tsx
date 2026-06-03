"use client";

import { useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

type TabsInfoCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type TabItem = { label?: string; body?: string };

export function TabsInfoCard({ card }: TabsInfoCardProps) {
  const editor = useCardContentEditor(card);
  const content = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof content.title === "string" ? content.title : "案内";
  const defaultIndexRaw = Number(content.defaultIndex);
  const tabs = useMemo(
    () =>
      ((Array.isArray(content.tabs) ? content.tabs : []) as TabItem[])
        .map((t) => ({
          label: typeof t?.label === "string" && t.label.trim() ? t.label : "タブ",
          body: typeof t?.body === "string" ? t.body : "",
        }))
        .slice(0, 8),
    [content.tabs],
  );
  const defaultIndex =
    Number.isFinite(defaultIndexRaw) && defaultIndexRaw >= 0
      ? Math.min(defaultIndexRaw, Math.max(0, tabs.length - 1))
      : 0;
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const active = tabs[activeIndex] ?? tabs[0] ?? { label: "タブ", body: "" };

  if (bind.editable) {
    return (
      <Card padding="md">
        <CardTitleInline title={title} onSave={(v) => editor.setPlainField("title", v)} placeholder="案内" bind={bind} />
        <div className="mt-3 space-y-3">
          {tabs.map((tab, idx) => (
            <div
              key={idx}
              data-inner-surface
              className={`border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}
            >
              <p className="text-xs font-semibold text-slate-500">
                <PlainInline
                  value={tab.label}
                  onSave={(v) => editor.setArrayItemField("tabs", idx, "label", v, false)}
                  bind={bind}
                  className="text-xs font-semibold text-slate-700"
                  placeholder="タブ名"
                />
              </p>
              <p className="mt-2 whitespace-pre-line text-slate-700" style={getBodyFontSizeStyle()}>
                <PlainInline
                  value={tab.body}
                  onSave={(v) => editor.setArrayItemField("tabs", idx, "body", v, false)}
                  bind={bind}
                  multiline
                  className="block w-full min-h-[1lh] whitespace-pre-line text-slate-700"
                  placeholder="説明文"
                />
              </p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <CardTitleInline title={title} onSave={(v) => editor.setPlainField("title", v)} placeholder="案内" bind={bind} />
      {tabs.length > 0 ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {tabs.map((tab, idx) => {
              const activeTab = idx === activeIndex;
              return (
                <button
                  key={`${tab.label}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={
                    `${editorInnerRadiusClassName} px-2.5 py-1 text-xs transition ` +
                    (activeTab
                      ? "bg-slate-900 !text-white font-semibold"
                      : "border border-slate-300 bg-white font-normal text-slate-700 hover:bg-slate-50")
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div
            data-inner-surface
            className={`mt-3 border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}
          >
            <p className="whitespace-pre-line text-slate-700" style={getBodyFontSizeStyle()}>
              {active.body || "説明文を設定してください。"}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500" style={getBodyFontSizeStyle()}>
          タブが未設定です。右パネルの設定から追加してください。
        </p>
      )}
    </Card>
  );
}
