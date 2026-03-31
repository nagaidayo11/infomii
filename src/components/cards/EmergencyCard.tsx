"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type EmergencyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function EmergencyCard({ card, isSelected, locale = "ja" }: EmergencyCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "긴급 연락처", fire: "화재", police: "경찰", hospital: "병원", note: "비고", hospitalPlaceholder: "연락처" }
      : locale === "zh"
        ? { title: "紧急联系方式", fire: "火灾", police: "警察", hospital: "医院", note: "备注", hospitalPlaceholder: "联系方式" }
        : locale === "en"
          ? { title: "Emergency Contacts", fire: "Fire", police: "Police", hospital: "Hospital", note: "Note", hospitalPlaceholder: "Contact" }
          : { title: "緊急連絡先", fire: "火災", police: "警察", hospital: "病院", note: "備考", hospitalPlaceholder: "連絡先" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.title;
  const fire = (c?.fire as string) ?? "";
  const police = (c?.police as string) ?? "";
  const hospital = getLocalizedContent(c?.hospital as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>
        🆘{" "}
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-medium text-slate-800" />
      </p>
      <ul className="mt-2 space-y-1 text-slate-600" style={getBodyFontSizeStyle()}>
        <li>
          {labels.fire}:{" "}
          <InlineEditable value={fire} onSave={(v) => updateCard(card.id, { content: { ...c, fire: v } })} editable={isSelected} onActivate={onActivate} className="font-medium text-red-600" placeholder="119" />
        </li>
        <li>
          {labels.police}:{" "}
          <InlineEditable value={police} onSave={(v) => updateCard(card.id, { content: { ...c, police: v } })} editable={isSelected} onActivate={onActivate} className="font-medium text-slate-800" placeholder="110" />
        </li>
        <li>
          {labels.hospital}:{" "}
          <InlineEditable value={hospital} onSave={(v) => updateKey("hospital", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.hospitalPlaceholder} />
        </li>
      </ul>
      <p className="mt-2 text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-slate-500" placeholder={labels.note} />
      </p>
    </Card>
  );
}
