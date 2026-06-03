"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

export function ContactHubCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "お問い合わせ";
  const phone = typeof c.phone === "string" ? c.phone : "";
  const email = typeof c.email === "string" ? c.email : "";
  const lineUrl = typeof c.lineUrl === "string" ? c.lineUrl : "";
  const mapUrl = typeof c.mapUrl === "string" ? c.mapUrl : "";
  const note = typeof c.note === "string" ? c.note : "";

  const rowClass = `${editorInnerRadiusClassName} block border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700`;

  return (
    <Card padding="md">
      <CardTitleInline title={title} onSave={(v) => editor.setPlainField("title", v)} placeholder="お問い合わせ" bind={bind} />
      <div className="mt-3 space-y-2 text-sm" style={getBodyFontSizeStyle()}>
        <div data-inner-surface className={rowClass}>
          電話:{" "}
          <PlainInline value={phone} onSave={(v) => editor.setPlainField("phone", v)} bind={bind} placeholder="03-0000-0000" />
        </div>
        <div data-inner-surface className={rowClass}>
          メール:{" "}
          <PlainInline value={email} onSave={(v) => editor.setPlainField("email", v)} bind={bind} placeholder="info@example.com" />
        </div>
        <div data-inner-surface className={rowClass}>
          LINE:{" "}
          <PlainInline value={lineUrl} onSave={(v) => editor.setPlainField("lineUrl", v)} bind={bind} placeholder="https://" />
        </div>
        <div data-inner-surface className={rowClass}>
          地図:{" "}
          <PlainInline value={mapUrl} onSave={(v) => editor.setPlainField("mapUrl", v)} bind={bind} placeholder="https://" />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500" style={getBodyFontSizeStyle()}>
        <PlainInline
          value={note}
          onSave={(v) => editor.setPlainField("note", v)}
          bind={bind}
          multiline
          className="block w-full min-h-[1lh] text-xs text-slate-500"
          placeholder="補足"
        />
      </p>
    </Card>
  );
}
