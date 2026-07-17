"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { BlockTitleWithIcon } from "./block-title-with-icon";
import { DESK_TONE } from "./desk-tone";
import { LabelItemStack, LabelItemSurface } from "./label-item-surface";
import type { LineIconName } from "./LineIcon";
import {
  facilityDefaultIcon,
  facilityFieldLabel,
  facilityTitlePlaceholder,
  getFacilityInfoPreset,
  isFacilityFieldVisible,
  readFacilityFieldValue,
  type FacilityFieldDef,
} from "@/lib/editor/facility-info-presets";

type FacilityInfoRowsCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

function toTelHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 3) return null;
  return `tel:${digits}`;
}

function FieldValue({
  field,
  value,
  editable,
  onActivate,
  onSave,
}: {
  field: FacilityFieldDef;
  value: string;
  editable: boolean;
  onActivate?: () => void;
  onSave: (next: string) => void;
}) {
  const telHref = !editable && field.tel ? toTelHref(value) : null;

  if (editable) {
    return (
      <InlineEditable
        value={value}
        onSave={onSave}
        editable
        onActivate={onActivate}
        multiline={field.multiline}
        className="block w-full min-h-[1lh] text-slate-500"
        placeholder={field.placeholder ?? ""}
      />
    );
  }

  if (telHref) {
    return (
      <a href={telHref} className="text-slate-600 underline-offset-2 hover:underline">
        {value.trim() || "—"}
      </a>
    );
  }

  return <span className="whitespace-pre-line text-slate-500">{value.trim() || "—"}</span>;
}

/**
 * Legacy facility types — same nearby-style soft tiles as InfoCard.
 */
export function FacilityInfoRowsCard({ card, locale = "ja" }: FacilityInfoRowsCardProps) {
  const preset = getFacilityInfoPreset(card.type);
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;

  if (!preset) return null;

  const tone = DESK_TONE[preset.tone];
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const titlePh = facilityTitlePlaceholder(preset, locale);

  const hasExplicitIcon = typeof c?.icon === "string" && c.icon.trim().length > 0;
  const iconHidden = c?.icon === "";
  const iconFallback = !iconHidden
    ? (facilityDefaultIcon(card.type) as LineIconName)
    : undefined;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const labelOverrides = (c?.labelOverrides as Record<string, string> | undefined) ?? {};
  const updateLabelOverride = (fieldKey: string, nextLabel: string) => {
    updateCard(card.id, {
      content: {
        ...c,
        labelOverrides: { ...labelOverrides, [fieldKey]: nextLabel },
      },
    });
  };

  const visibleFields = preset.fields.filter((field) =>
    isFacilityFieldVisible(c, field, locale),
  );

  return (
    <Card padding="md">
      {(editable || title) ? (
        <BlockTitleWithIcon
          icon={hasExplicitIcon ? c?.icon : undefined}
          fallbackIcon={iconFallback}
          titleClassName={CARD_BLOCK_TITLE_CLASS}
          titleStyle={getTitleFontSizeStyle()}
        >
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={titlePh}
          />
        </BlockTitleWithIcon>
      ) : null}

      <LabelItemStack>
        {visibleFields.map((field) => {
          const value = readFacilityFieldValue(c, field.key, locale);
          const writeKey =
            field.key === "hours" && c && "time" in c && !("hours" in c)
              ? "time"
              : field.key === "description" && c && "menu" in c && !("description" in c)
                ? "menu"
                : field.key === "address" && c && "location" in c && !("address" in c)
                  ? "location"
                  : field.key;
          const labelText = labelOverrides[field.key] ?? facilityFieldLabel(field, locale);

          return (
            <LabelItemSurface key={field.key} tone={preset.tone}>
              <p className={`font-semibold leading-snug ${tone.title}`} style={getBodyFontSizeStyle()}>
                {editable ? (
                  <InlineEditable
                    value={labelText}
                    onSave={(v) => updateLabelOverride(field.key, v)}
                    editable
                    onActivate={onActivate}
                    className={`font-semibold ${tone.title}`}
                    placeholder={facilityFieldLabel(field, locale)}
                  />
                ) : (
                  labelText
                )}
              </p>
              <div className="mt-0.5" style={getBodyFontSizeStyle()}>
                <FieldValue
                  field={field}
                  value={value}
                  editable={editable}
                  onActivate={onActivate}
                  onSave={(v) => updateKey(writeKey, v)}
                />
              </div>
            </LabelItemSurface>
          );
        })}
      </LabelItemStack>
    </Card>
  );
}
