"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

export function ContactHubCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "お問い合わせ";
  const phone = typeof c.phone === "string" ? c.phone : "";
  const email = typeof c.email === "string" ? c.email : "";
  const lineUrl = typeof c.lineUrl === "string" ? c.lineUrl : "";
  const mapUrl = typeof c.mapUrl === "string" ? c.mapUrl : "";
  const note = typeof c.note === "string" ? c.note : "";
  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className="mt-3 space-y-2 text-sm" style={getBodyFontSizeStyle()}>
        {phone ? <a data-inner-surface className={`${editorInnerRadiusClassName} block border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700`} href={`tel:${phone}`}>電話: {phone}</a> : null}
        {email ? <a data-inner-surface className={`${editorInnerRadiusClassName} block border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700`} href={`mailto:${email}`}>メール: {email}</a> : null}
        {lineUrl ? <a data-inner-surface className={`${editorInnerRadiusClassName} block border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700`} href={lineUrl} target="_blank" rel="noreferrer">LINEで連絡</a> : null}
        {mapUrl ? <a data-inner-surface className={`${editorInnerRadiusClassName} block border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700`} href={mapUrl} target="_blank" rel="noreferrer">地図を開く</a> : null}
      </div>
      {note ? <p className="mt-2 text-xs text-slate-500" style={getBodyFontSizeStyle()}>{note}</p> : null}
    </Card>
  );
}
