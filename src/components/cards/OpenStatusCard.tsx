"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

export function OpenStatusCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "営業時間";
  const mode = c.mode === "hours" ? "hours" : "manual";
  const openNow = c.openNow !== false;
  const startHour = Number(c.startHour ?? 7);
  const endHour = Number(c.endHour ?? 23);
  const nowHour = new Date().getHours();
  const byHour = nowHour >= startHour && nowHour < endHour;
  const isOpen = mode === "hours" ? byHour : openNow;
  const openLabel = typeof c.openLabel === "string" ? c.openLabel : "営業中";
  const closedLabel = typeof c.closedLabel === "string" ? c.closedLabel : "営業時間外";
  const hoursText = typeof c.hoursText === "string" ? c.hoursText : `${startHour}:00-${endHour}:00`;

  return (
    <Card padding="md">
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        <PlainInline
          value={title}
          onSave={(v) => editor.setPlainField("title", v)}
          bind={bind}
          className={CARD_BLOCK_TITLE_CLASS}
          placeholder="営業時間"
        />
      </p>
      <div
        data-inner-surface
        className={`${editorInnerRadiusClassName} mt-3 border px-3 py-2 ${isOpen ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
      >
        <p
          className={`text-sm font-normal ${isOpen ? "text-emerald-700" : "text-slate-700"}`}
          style={getBodyFontSizeStyle()}
        >
          <PlainInline
            value={isOpen ? openLabel : closedLabel}
            onSave={(v) => editor.setPlainField(isOpen ? "openLabel" : "closedLabel", v)}
            bind={bind}
            className={`text-sm ${isOpen ? "text-emerald-700" : "text-slate-700"}`}
            placeholder={isOpen ? "営業中" : "営業時間外"}
          />
        </p>
        <p className="mt-1 text-xs text-slate-600" style={getBodyFontSizeStyle()}>
          <PlainInline
            value={hoursText}
            onSave={(v) => editor.setPlainField("hoursText", v)}
            bind={bind}
            className="text-xs text-slate-600"
            placeholder="7:00-23:00"
          />
        </p>
      </div>
    </Card>
  );
}
