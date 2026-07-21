"use client";

import { useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

type TabsInfoCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type TabItem = { label?: string; body?: string; imageSrc?: string };

export function TabsInfoCard({ card }: TabsInfoCardProps) {
  const editor = useCardContentEditor(card);
  const content = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof content.title === "string" ? content.title : "案内";
  const accent =
    typeof content.accentColor === "string" && content.accentColor.trim()
      ? content.accentColor.trim()
      : "#0f766e";
  const defaultIndexRaw = Number(content.defaultIndex);
  const tabs = useMemo(
    () =>
      ((Array.isArray(content.tabs) ? content.tabs : []) as TabItem[])
        .map((t) => ({
          label: typeof t?.label === "string" && t.label.trim() ? t.label : "タブ",
          body: typeof t?.body === "string" ? t.body : "",
          imageSrc: typeof t?.imageSrc === "string" ? t.imageSrc : "",
        }))
        .slice(0, 8),
    [content.tabs],
  );
  const defaultIndex =
    Number.isFinite(defaultIndexRaw) && defaultIndexRaw >= 0
      ? Math.min(defaultIndexRaw, Math.max(0, tabs.length - 1))
      : 0;
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const active = tabs[activeIndex] ?? tabs[0] ?? { label: "タブ", body: "", imageSrc: "" };

  return (
    <section
      className="pres-block"
      style={{ ["--pres-accent" as string]: accent }}
      onClick={bind.editable ? bind.onActivate : undefined}
    >
      {(bind.editable || title) ? (
        <h3 className="pres-block__title">
          <InlineEditable
            value={title}
            onSave={(v) => editor.setPlainField("title", v)}
            editable={bind.editable}
            onActivate={bind.onActivate}
            className="pres-block__title"
            placeholder="案内"
          />
        </h3>
      ) : null}

      {tabs.length === 0 ? (
        <p className="text-sm text-slate-500">タブが未設定です。右パネルの設定から追加してください。</p>
      ) : (
        <>
          <div className="pres-tabs__bar" role="tablist" aria-label={title || "案内"}>
            {tabs.map((tab, idx) => (
              <button
                key={`${tab.label}-${idx}`}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                className="pres-tabs__tab"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
              >
                {bind.editable ? (
                  <PlainInline
                    value={tab.label}
                    onSave={(v) => editor.setArrayItemField("tabs", idx, "label", v, false)}
                    bind={bind}
                    className="text-inherit"
                    placeholder="タブ名"
                  />
                ) : (
                  tab.label
                )}
              </button>
            ))}
          </div>
          <div className="pres-tabs__panel" role="tabpanel">
            {active.imageSrc ? (
              /* Use a padding-top trick so aspect-ratio works with position:absolute child */
              <div
                style={{ position: "relative", width: "100%", paddingTop: "62.5%" /* 16:10 */ }}
                className="overflow-hidden rounded-[var(--pres-radius,0.875rem)] bg-slate-200"
              >
                <EditorCoverImage
                  src={active.imageSrc}
                  alt={active.label}
                  sizes="480px"
                  className="object-cover object-center"
                />
              </div>
            ) : null}
            <p className="pres-tabs__body">
              <PlainInline
                value={active.body}
                onSave={(v) =>
                  editor.setArrayItemField("tabs", activeIndex, "body", v, false)
                }
                bind={bind}
                multiline
                className="block w-full min-h-[1lh] whitespace-pre-line"
                placeholder="説明文を設定してください。"
              />
            </p>
          </div>
        </>
      )}
    </section>
  );
}
