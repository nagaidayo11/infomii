"use client";

import { useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

type TabsInfoCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type TabItem = { label?: string; body?: string };

export function TabsInfoCard({ card }: TabsInfoCardProps) {
  const content = (card.content ?? {}) as Record<string, unknown>;
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
    [content.tabs]
  );
  const defaultIndex =
    Number.isFinite(defaultIndexRaw) && defaultIndexRaw >= 0
      ? Math.min(defaultIndexRaw, Math.max(0, tabs.length - 1))
      : 0;
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const active = tabs[activeIndex] ?? tabs[0] ?? { label: "タブ", body: "" };

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        {title}
      </p>
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
                    `${editorInnerRadiusClassName} px-2.5 py-1 text-xs font-medium transition ` +
                    (activeTab
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div data-inner-surface className={`mt-3 border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}>
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
