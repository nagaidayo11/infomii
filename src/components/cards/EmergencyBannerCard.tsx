"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

export function EmergencyBannerCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "緊急のお知らせ";
  const message = typeof c.message === "string" ? c.message : "";
  const level = c.level === "medium" || c.level === "low" ? c.level : "high";
  const tone =
    level === "high"
      ? "border-red-300 bg-red-50 text-red-900"
      : level === "medium"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-sky-300 bg-sky-50 text-sky-900";

  return (
    <Card padding="none">
      <section data-inner-surface className={`${editorInnerRadiusClassName} flex flex-col gap-1.5 border px-3 py-2.5 ${tone}`}>
        <p className="leading-snug" style={getTitleFontSizeStyle()}>
          <PlainInline
            value={title}
            onSave={(v) => editor.setPlainField("title", v)}
            bind={bind}
            className="leading-snug"
            placeholder="緊急のお知らせ"
          />
        </p>
        <p className="text-sm leading-snug" style={getBodyFontSizeStyle()}>
          <PlainInline
            value={message}
            onSave={(v) => editor.setPlainField("message", v)}
            bind={bind}
            multiline
            className="block w-full min-h-[1lh] text-sm leading-snug"
            placeholder="本文"
          />
        </p>
      </section>
    </Card>
  );
}
