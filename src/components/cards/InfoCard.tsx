"use client";

import type { ReactNode } from "react";
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
import { readInfoLayout, type InfoLayout } from "@/lib/editor/info-layout";
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

type LocaleLabels = {
  empty: string;
  title: string;
  value: string;
  label: string;
  add: string;
};

function ValueNode({
  value,
  telHref,
  editable,
  onActivate,
  onSave,
  placeholder,
  className,
  multiline = true,
}: {
  value: string;
  telHref: string | null;
  editable: boolean;
  onActivate?: () => void;
  onSave: (v: string) => void;
  placeholder: string;
  className?: string;
  multiline?: boolean;
}) {
  if (editable) {
    return (
      <InlineEditable
        value={value}
        onSave={onSave}
        editable
        onActivate={onActivate}
        multiline={multiline}
        className={className ?? "block w-full min-h-[1lh]"}
        placeholder={placeholder}
      />
    );
  }
  if (telHref) {
    return (
      <a href={telHref} className={(className ?? "") + " underline-offset-2 hover:underline"}>
        {value.trim() || "—"}
      </a>
    );
  }
  return <span className={"whitespace-pre-line " + (className ?? "")}>{value.trim() || "—"}</span>;
}

function LabelNode({
  value,
  editable,
  onActivate,
  onSave,
  placeholder,
  className,
}: {
  value: string;
  editable: boolean;
  onActivate?: () => void;
  onSave: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  if (editable) {
    return (
      <InlineEditable
        value={value}
        onSave={onSave}
        editable
        onActivate={onActivate}
        className={className}
        placeholder={placeholder}
      />
    );
  }
  return <>{value}</>;
}

/**
 * Unified label-row list with layout variants:
 * - cards: soft stacked tiles (default)
 * - table: single surface, label left / value right
 * - inline: no card chrome, title + plain rows
 */
export function InfoCard({ card, locale = "ja" }: InfoCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const toneKey = coerceTone(c?.tone);
  const tone = DESK_TONE[toneKey];
  const layout = readInfoLayout(c?.layout);
  const localeLabels: LocaleLabels =
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

  const patchRow = (index: number, patch: Partial<InfoRow>) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    update({ rows: next });
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

  const addRowButton = editable ? (
    isNativeUi ? (
      <button
        type="button"
        className="app-native-add-btn mt-2"
        onClick={() => update({ rows: [...rows, { label: "", value: "", show: true }] })}
      >
        {localeLabels.add}
      </button>
    ) : (
      <button
        type="button"
        className="mt-2.5 text-left text-[12px] font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        onClick={() => update({ rows: [...rows, { label: "", value: "", show: true }] })}
      >
        {localeLabels.add}
      </button>
    )
  ) : null;

  const emptyNode = (
    <p className={isNativeUi ? "text-sm text-[var(--app-text-muted)]" : `mt-2 ${CARD_BLOCK_CAPTION_CLASS}`}>
      {localeLabels.empty}
    </p>
  );

  const renderRows = (mode: InfoLayout): ReactNode => {
    if (visibleRows.length === 0) return emptyNode;

    if (mode === "table") {
      return (
        <div className="pres-info-table" data-tone={toneKey}>
          {visibleRows.map(({ row, index }) => {
            const value = row.value ?? "";
            const telHref = !editable && row.tel ? toTelHref(value) : null;
            return (
              <div key={row.key ?? index} className="pres-info-table__row">
                <span className="pres-info-table__label" style={getBodyFontSizeStyle()}>
                  <LabelNode
                    value={row.label ?? ""}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { label: v })}
                    placeholder={localeLabels.label}
                    className="pres-info-table__label"
                  />
                </span>
                <div className="pres-info-table__value" style={getBodyFontSizeStyle()}>
                  <ValueNode
                    value={value}
                    telHref={telHref}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { value: v })}
                    placeholder={localeLabels.value}
                    className="block w-full min-h-[1lh] text-slate-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (mode === "inline") {
      return (
        <div className="pres-info-inline" data-tone={toneKey}>
          {visibleRows.map(({ row, index }) => {
            const value = row.value ?? "";
            const telHref = !editable && row.tel ? toTelHref(value) : null;
            return (
              <div key={row.key ?? index} className="pres-info-inline__row">
                <p className="pres-info-inline__label" style={getBodyFontSizeStyle()}>
                  <LabelNode
                    value={row.label ?? ""}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { label: v })}
                    placeholder={localeLabels.label}
                    className="pres-info-inline__label"
                  />
                </p>
                <div className="pres-info-inline__value" style={getBodyFontSizeStyle()}>
                  <ValueNode
                    value={value}
                    telHref={telHref}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { value: v })}
                    placeholder={localeLabels.value}
                    className="block w-full min-h-[1lh] text-slate-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    /* cards */
    if (isNativeUi) {
      return (
        <div className="pres-info-cards">
          {visibleRows.map(({ row, index }) => {
            const value = row.value ?? "";
            const telHref = !editable && row.tel ? toTelHref(value) : null;
            return (
              <LabelItemSurface key={row.key ?? index} tone={toneKey}>
                <p className={`font-semibold leading-snug ${tone.title}`} style={getBodyFontSizeStyle()}>
                  <LabelNode
                    value={row.label ?? ""}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { label: v })}
                    placeholder={localeLabels.label}
                    className={`font-semibold ${tone.title}`}
                  />
                </p>
                <div className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                  <ValueNode
                    value={value}
                    telHref={telHref}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { value: v })}
                    placeholder={localeLabels.value}
                    className="block w-full min-h-[1lh] text-slate-500"
                  />
                </div>
              </LabelItemSurface>
            );
          })}
        </div>
      );
    }

    return (
      <LabelItemStack>
        {visibleRows.map(({ row, index }) => {
          const value = row.value ?? "";
          const telHref = !editable && row.tel ? toTelHref(value) : null;
          return (
            <LabelItemSurface key={row.key ?? index} tone={toneKey}>
              <p className={`font-semibold leading-snug ${tone.title}`} style={getBodyFontSizeStyle()}>
                <LabelNode
                  value={row.label ?? ""}
                  editable={editable}
                  onActivate={onActivate}
                  onSave={(v) => patchRow(index, { label: v })}
                  placeholder={localeLabels.label}
                  className={`font-semibold ${tone.title}`}
                />
              </p>
              <div className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                <ValueNode
                  value={value}
                  telHref={telHref}
                  editable={editable}
                  onActivate={onActivate}
                  onSave={(v) => patchRow(index, { value: v })}
                  placeholder={localeLabels.value}
                  className="block w-full min-h-[1lh] text-slate-500"
                />
              </div>
            </LabelItemSurface>
          );
        })}
      </LabelItemStack>
    );
  };

  if (isNativeUi) {
    /* table layout keeps the compact native kv list */
    const body =
      layout === "table" && visibleRows.length > 0 ? (
        <NativeKvList>
          {visibleRows.map(({ row, index }) => {
            const value = row.value ?? "";
            const telHref = !editable && row.tel ? toTelHref(value) : null;
            return (
              <div key={row.key ?? index} className="app-native-kv-row">
                <span className="app-native-kv-label">
                  <LabelNode
                    value={row.label ?? ""}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { label: v })}
                    placeholder={localeLabels.label}
                  />
                </span>
                <div className="app-native-kv-value">
                  <ValueNode
                    value={value}
                    telHref={telHref}
                    editable={editable}
                    onActivate={onActivate}
                    onSave={(v) => patchRow(index, { value: v })}
                    placeholder={localeLabels.value}
                    className={telHref ? "guest-page-link" : "block w-full min-h-[1lh]"}
                  />
                </div>
              </div>
            );
          })}
        </NativeKvList>
      ) : (
        renderRows(layout)
      );

    return (
      <NativeHotelSection
        title={(editable || title || showIcon) ? titleNode : null}
        icon={showIcon ? iconNode : undefined}
        onActivate={onActivate}
      >
        {body}
        {addRowButton}
      </NativeHotelSection>
    );
  }

  const titleBlock =
    editable || title || hasExplicitIcon || iconFallback ? (
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
    ) : null;

  if (layout === "inline") {
    return (
      <section className="pres-block pres-info-inline-block">
        {titleBlock}
        {renderRows("inline")}
        {addRowButton}
      </section>
    );
  }

  return (
    <Card padding="md">
      {titleBlock}
      {layout === "table" ? (
        <>
          {visibleRows.length === 0 ? emptyNode : <div className="mt-3">{renderRows("table")}</div>}
        </>
      ) : (
        renderRows("cards")
      )}
      {addRowButton}
    </Card>
  );
}
