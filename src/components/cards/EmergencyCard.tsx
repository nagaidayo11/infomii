"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getBodyFontSizeStyle,
  getTitleFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeEmergencyIcon } from "./native-guest-icons";
import { NativeHotelSection, NativeKvList, NativeKvRow } from "./native-hotel-ui";

type EmergencyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

/** Digits for tel: — keep leading + for international. */
function toTelHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 3) return null;
  return `tel:${digits}`;
}

type ContactRowProps = {
  label: string;
  value: string;
  placeholder: string;
  editable: boolean;
  onActivate?: () => void;
  onSave: (next: string) => void;
  /** Emphasize emergency numbers (fire). */
  emphasize?: boolean;
};

function ContactRow({
  label,
  value,
  placeholder,
  editable,
  onActivate,
  onSave,
  emphasize = false,
}: ContactRowProps) {
  const telHref = !editable ? toTelHref(value) : null;
  const valueClass =
    "min-w-0 flex-1 text-right text-[1.05rem] font-semibold leading-snug tabular-nums tracking-wide " +
    (emphasize ? "text-red-700" : "text-slate-900");

  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className={`shrink-0 ${CARD_BLOCK_CAPTION_CLASS}`}>{label}</span>
      {editable ? (
        <InlineEditable
          value={value}
          onSave={onSave}
          editable
          onActivate={onActivate}
          className={valueClass + " text-left sm:text-right"}
          placeholder={placeholder}
        />
      ) : telHref ? (
        <a href={telHref} className={valueClass + " underline-offset-2 hover:underline"}>
          {value.trim() || placeholder}
        </a>
      ) : (
        <span className={valueClass}>{value.trim() || "—"}</span>
      )}
    </div>
  );
}

/**
 * In-room desk-card style emergency contacts: label left, large number right, row rules.
 */
export function EmergencyCard({ card, isSelected, locale = "ja" }: EmergencyCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "긴급 연락처", fire: "화재", police: "경찰", hospital: "병원", note: "비고", hospitalPlaceholder: "병원명・전화" }
      : locale === "zh"
        ? { title: "紧急联系方式", fire: "火灾", police: "警察", hospital: "医院", note: "备注", hospitalPlaceholder: "医院名・电话" }
        : locale === "en"
          ? {
              title: "Emergency Contacts",
              fire: "Fire",
              police: "Police",
              hospital: "Hospital",
              note: "Note",
              hospitalPlaceholder: "Hospital · phone",
            }
          : {
              title: "緊急連絡先",
              fire: "火災",
              police: "警察",
              hospital: "病院",
              note: "備考",
              hospitalPlaceholder: "病院名・電話",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const fire = (c?.fire as string) ?? "";
  const police = (c?.police as string) ?? "";
  const hospital = getLocalizedContent(c?.hospital as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);

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
      placeholder={labels.title}
    />
  ) : (
    title || labels.title
  );

  if (isNativeUi) {
    return (
      <NativeHotelSection title={titleNode} icon={<NativeEmergencyIcon />} onActivate={onActivate}>
        <NativeKvList>
          <NativeKvRow label={labels.fire} href={!editable ? toTelHref(fire) : undefined}>
            <InlineEditable
              value={fire}
              onSave={(v) => updateCard(card.id, { content: { ...c, fire: v } })}
              editable={editable}
              onActivate={onActivate}
              className="font-semibold tabular-nums text-red-700"
              placeholder="119"
            />
          </NativeKvRow>
          <NativeKvRow label={labels.police} href={!editable ? toTelHref(police) : undefined}>
            <InlineEditable
              value={police}
              onSave={(v) => updateCard(card.id, { content: { ...c, police: v } })}
              editable={editable}
              onActivate={onActivate}
              className="font-semibold tabular-nums"
              placeholder="110"
            />
          </NativeKvRow>
          <NativeKvRow label={labels.hospital} href={!editable ? toTelHref(hospital) : undefined}>
            <InlineEditable
              value={hospital}
              onSave={(v) => updateKey("hospital", v)}
              editable={editable}
              onActivate={onActivate}
              placeholder={labels.hospitalPlaceholder}
            />
          </NativeKvRow>
        </NativeKvList>
        {(editable || note.trim()) ? (
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            <InlineEditable
              value={note}
              onSave={(v) => updateKey("note", v)}
              editable={editable}
              onActivate={onActivate}
              multiline
              className="block w-full min-h-[1lh] text-sm text-[var(--app-text-muted)]"
              placeholder={labels.note}
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
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.title}
          />
        </p>
      ) : null}

      <div
        className="mt-3 divide-y divide-slate-200/90 border-y border-slate-200/90"
        style={getBodyFontSizeStyle()}
      >
        <ContactRow
          label={labels.fire}
          value={fire}
          placeholder="119"
          editable={editable}
          onActivate={onActivate}
          onSave={(v) => updateCard(card.id, { content: { ...c, fire: v } })}
          emphasize
        />
        <ContactRow
          label={labels.police}
          value={police}
          placeholder="110"
          editable={editable}
          onActivate={onActivate}
          onSave={(v) => updateCard(card.id, { content: { ...c, police: v } })}
        />
        <ContactRow
          label={labels.hospital}
          value={hospital}
          placeholder={labels.hospitalPlaceholder}
          editable={editable}
          onActivate={onActivate}
          onSave={(v) => updateKey("hospital", v)}
        />
      </div>

      {(editable || note.trim()) ? (
        <p className={`mt-3 ${CARD_BLOCK_CAPTION_CLASS}`} style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={note}
            onSave={(v) => updateKey("note", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className={`block w-full min-h-[1lh] ${CARD_BLOCK_CAPTION_CLASS}`}
            placeholder={labels.note}
          />
        </p>
      ) : null}
    </Card>
  );
}
