"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { BlockTitleWithIcon } from "./block-title-with-icon";
import { LineIcon, normalizeIconToken, type LineIconName } from "./LineIcon";
import { DESK_TONE, type DeskTone } from "./desk-tone";
import { LabelItemStack, LabelItemSurface } from "./label-item-surface";
import { facilityDefaultIcon } from "@/lib/editor/facility-info-presets";
import { NativeHotelSection, NativeKvList } from "./native-hotel-ui";

type InfoCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

type InfoRow = {
  label?: string;
  value?: string;
  show?: boolean;
  tel?: boolean;
  key?: string;
};

function toTelHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 3) return null;
  return `tel:${digits}`;
}

function coerceTone(value: unknown): DeskTone {
  if (value === "amber" || value === "sky" || value === "emerald" || value === "rose" || value === "slate") {
    return value;
  }
  return "slate";
}

/**
 * Unified label-row layout — nearby-style soft tiles:
 * section title + stacked cards (label as heading, value as body).
 */
export function InfoCard({ card, locale = "ja" }: InfoCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const toneKey = coerceTone(c?.tone);
  const tone = DESK_TONE[toneKey];
  const localeLabels =
    locale === "ko"
      ? { empty: "라벨과 값을 추가", title: "제목", value: "값", label: "라벨", add: "+ 행 추가" }
      : locale === "zh"
        ? { empty: "请添加标签和值", title: "标题", value: "值", label: "标签", add: "+ 添加一行" }
        : locale === "en"
          ? { empty: "Add label and value", title: "Title", value: "Value", label: "Label", add: "+ Add row" }
          : { empty: "ラベルと値を追加", title: "タイトル", value: "値", label: "ラベル", add: "+ 行を追加" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const rows = (c?.rows as InfoRow[]) ?? [];
  const visibleRows = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.show !== false);
  const sourcePreset = typeof c?.sourcePreset === "string" ? c.sourcePreset : "";
  const hasExplicitIcon = typeof c?.icon === "string" && c.icon.trim().length > 0;
  const iconHidden = c?.icon === "";
  const iconFallback =
    !iconHidden && sourcePreset ? (facilityDefaultIcon(sourcePreset) as LineIconName) : undefined;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const rawIcon = typeof c?.icon === "string" ? c.icon.trim() : "";
  const showIcon = Boolean(rawIcon) || Boolean(iconFallback);
  const iconName = showIcon ? normalizeIconToken(rawIcon || iconFallback, iconFallback ?? "info") : null;
  const iconNode = iconName ? <LineIcon name={iconName} className="h-[1.15em] w-[1.15em]" /> : undefined;

  const titleNode = (editable || title) ? (
    <InlineEditable
      value={title}
      onSave={(v) => update({ title: v })}
      editable={editable}
      onActivate={onActivate}
      className="app-section-header__title"
      placeholder={localeLabels.title}
    />
  ) : (
    title
  );

  if (isNativeUi) {
    return (
      <NativeHotelSection
        title={(editable || title || showIcon) ? titleNode : null}
        icon={showIcon ? iconNode : undefined}
        onActivate={onActivate}
      >
        {visibleRows.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">{localeLabels.empty}</p>
        ) : (
          <NativeKvList>
            {visibleRows.map(({ row, index }) => {
              const value = row.value ?? "";
              const telHref = !editable && row.tel ? toTelHref(value) : null;
              return (
                <div key={row.key ?? index} className="app-native-kv-row">
                  <span className="app-native-kv-label">
                    {editable ? (
                      <InlineEditable
                        value={row.label ?? ""}
                        onSave={(v) => {
                          const next = [...rows];
                          next[index] = { ...next[index], label: v };
                          update({ rows: next });
                        }}
                        editable
                        onActivate={onActivate}
                        placeholder={localeLabels.label}
                      />
                    ) : (
                      row.label ?? ""
                    )}
                  </span>
                  {telHref ? (
                    <a href={telHref} className="app-native-kv-value guest-page-link">
                      {value.trim() || "—"}
                    </a>
                  ) : (
                    <div className="app-native-kv-value">
                      {editable ? (
                        <InlineEditable
                          value={value}
                          onSave={(v) => {
                            const next = [...rows];
                            next[index] = { ...next[index], value: v };
                            update({ rows: next });
                          }}
                          editable
                          onActivate={onActivate}
                          multiline
                          className="block w-full min-h-[1lh]"
                          placeholder={localeLabels.value}
                        />
                      ) : (
                        value.trim() || "—"
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </NativeKvList>
        )}
        {editable ? (
          <button
            type="button"
            className="app-native-add-btn mt-2"
            onClick={() => update({ rows: [...rows, { label: "", value: "", show: true }] })}
          >
            {localeLabels.add}
          </button>
        ) : null}
      </NativeHotelSection>
    );
  }

  return (
    <Card padding="md">
      {(editable || title || hasExplicitIcon || iconFallback) ? (
        <BlockTitleWithIcon
          icon={hasExplicitIcon ? c?.icon : undefined}
          fallbackIcon={iconFallback}
          titleClassName={CARD_BLOCK_TITLE_CLASS}
          titleStyle={getTitleFontSizeStyle()}
        >
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={localeLabels.title}
          />
        </BlockTitleWithIcon>
      ) : null}

      {visibleRows.length === 0 ? (
        <p className={`mt-2 ${CARD_BLOCK_CAPTION_CLASS}`}>{localeLabels.empty}</p>
      ) : (
        <LabelItemStack>
          {visibleRows.map(({ row, index }) => {
            const value = row.value ?? "";
            const telHref = !editable && row.tel ? toTelHref(value) : null;
            return (
              <LabelItemSurface key={row.key ?? index} tone={toneKey}>
                <p className={`font-semibold leading-snug ${tone.title}`} style={getBodyFontSizeStyle()}>
                  {editable ? (
                    <InlineEditable
                      value={row.label ?? ""}
                      onSave={(v) => {
                        const next = [...rows];
                        next[index] = { ...next[index], label: v };
                        update({ rows: next });
                      }}
                      editable
                      onActivate={onActivate}
                      className={`font-semibold ${tone.title}`}
                      placeholder={localeLabels.label}
                    />
                  ) : (
                    row.label ?? ""
                  )}
                </p>
                <div className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                  {editable ? (
                    <InlineEditable
                      value={value}
                      onSave={(v) => {
                        const next = [...rows];
                        next[index] = { ...next[index], value: v };
                        update({ rows: next });
                      }}
                      editable
                      onActivate={onActivate}
                      multiline
                      className="block w-full min-h-[1lh] text-slate-500"
                      placeholder={localeLabels.value}
                    />
                  ) : telHref ? (
                    <a href={telHref} className="text-slate-600 underline-offset-2 hover:underline">
                      {value.trim() || "—"}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">{value.trim() || "—"}</span>
                  )}
                </div>
              </LabelItemSurface>
            );
          })}
        </LabelItemStack>
      )}

      {editable ? (
        <button
          type="button"
          className="mt-2.5 text-left text-[12px] font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          onClick={() => update({ rows: [...rows, { label: "", value: "", show: true }] })}
        >
          {localeLabels.add}
        </button>
      ) : null}
    </Card>
  );
}
