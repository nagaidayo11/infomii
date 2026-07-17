"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativePhoneIcon } from "./native-guest-icons";
import { NativeHotelSection, NativeKvList, NativeKvRow } from "./native-hotel-ui";

function toTelHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 3) return null;
  return `tel:${digits}`;
}

type TaxiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function TaxiCard({ card, isSelected, locale = "ja" }: TaxiCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const phone = (c?.phone as string) ?? "";
  const companyName = getLocalizedContent(c?.companyName as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? {
          company: "회사",
          phone: "전화",
          note: "비고",
          companyPlaceholder: "회사명",
          phonePlaceholder: "전화번호",
          notePlaceholder: "비고",
          titlePlaceholder: "택시",
        }
      : locale === "zh"
        ? {
            company: "公司",
            phone: "电话",
            note: "备注",
            companyPlaceholder: "公司名称",
            phonePlaceholder: "电话号码",
            notePlaceholder: "备注",
            titlePlaceholder: "出租车",
          }
        : locale === "en"
          ? {
              company: "Company",
              phone: "Phone",
              note: "Note",
              companyPlaceholder: "Company",
              phonePlaceholder: "Phone number",
              notePlaceholder: "Note",
              titlePlaceholder: "Taxi",
            }
          : {
              company: "会社",
              phone: "電話",
              note: "備考",
              companyPlaceholder: "会社名",
              phonePlaceholder: "電話番号",
              notePlaceholder: "備考",
              titlePlaceholder: "タクシー",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const titleNode = (editable || title) ? (
    <InlineEditable
      value={title}
      onSave={(v) => updateKey("title", v)}
      editable={editable}
      onActivate={onActivate}
      className="app-section-header__title"
      placeholder={labels.titlePlaceholder}
    />
  ) : (
    title || labels.titlePlaceholder
  );

  const phoneHref = !editable ? toTelHref(phone) : null;

  if (isNativeUi) {
    return (
      <NativeHotelSection title={titleNode} icon={<NativePhoneIcon />} onActivate={onActivate}>
        <NativeKvList>
          {(editable || companyName) ? (
            <NativeKvRow label={labels.company}>
              <InlineEditable
                value={companyName}
                onSave={(v) => updateKey("companyName", v)}
                editable={editable}
                onActivate={onActivate}
                placeholder={labels.companyPlaceholder}
              />
            </NativeKvRow>
          ) : null}
          {(editable || phone) ? (
            <NativeKvRow label={labels.phone} href={phoneHref}>
              <InlineEditable
                value={phone}
                onSave={(v) => updateCard(card.id, { content: { ...c, phone: v } })}
                editable={editable}
                onActivate={onActivate}
                placeholder={labels.phonePlaceholder}
              />
            </NativeKvRow>
          ) : null}
        </NativeKvList>
        {(editable || note) ? (
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            <InlineEditable
              value={note}
              onSave={(v) => updateKey("note", v)}
              editable={editable}
              onActivate={onActivate}
              multiline
              className="block w-full min-h-[1lh] text-sm text-[var(--app-text-muted)]"
              placeholder={labels.notePlaceholder}
            />
          </p>
        ) : null}
      </NativeHotelSection>
    );
  }

  return (
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={editable} onActivate={onActivate} className={CARD_BLOCK_TITLE_CLASS} />
        </p>
      ) : null}
      <div data-inner-surface className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        <InlineEditable value={companyName} onSave={(v) => updateKey("companyName", v)} editable={editable} onActivate={onActivate} className="text-slate-600" placeholder={labels.companyPlaceholder} />
      </p>
      <p className="" style={getBodyFontSizeStyle()}>
        <InlineEditable value={phone} onSave={(v) => updateCard(card.id, { content: { ...c, phone: v } })} editable={editable} onActivate={onActivate} className="font-normal text-ds-primary" placeholder={labels.phonePlaceholder} />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={editable} onActivate={onActivate} multiline className="block w-full min-h-[1lh] text-slate-500" placeholder={labels.notePlaceholder} />
      </p>
      </div>
    </Card>
  );
}
