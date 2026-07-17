"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeStepsIcon } from "./native-guest-icons";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type StepsItem = { title?: string; description?: string };

type StepsCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function StepsCard({ card, isSelected = false, locale = "ja" }: StepsCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const items = (Array.isArray(c?.items) ? c.items : []) as StepsItem[];
  const labels =
    locale === "ko"
      ? { empty: "단계를 추가하세요", titlePlaceholder: "단계" }
      : locale === "zh"
        ? { empty: "请添加步骤", titlePlaceholder: "步骤" }
        : locale === "en"
          ? { empty: "Add steps", titlePlaceholder: "Steps" }
          : { empty: "手順を追加してください", titlePlaceholder: "ステップ" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const updateItem = (index: number, field: "title" | "description", value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    update({ items: next });
  };

  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card">
        <AppSectionHeader
          title={
            editable || title ? (
              <InlineEditable
                value={title}
                onSave={(v) => update({ title: v })}
                editable={editable}
                onActivate={onActivate}
                className="app-section-header__title"
                placeholder={labels.titlePlaceholder}
              />
            ) : (
              labels.titlePlaceholder
            )
          }
          icon={<NativeStepsIcon />}
          as="div"
        />
        <ol className="space-y-3" style={getBodyFontSizeStyle()}>
          {items.length === 0 ? (
            <li className="text-sm text-[var(--app-text-muted)]">{labels.empty}</li>
          ) : (
            items.map((item, i) => (
              <li key={i} className="app-native-step-row">
                <span className="app-native-step-num">{i + 1}</span>
                <div className="app-native-step-body">
                  <p className="font-bold text-[var(--app-text)]">
                    <InlineEditable
                      value={getLocalizedContent(item.title as LocalizedString | undefined, locale)}
                      onSave={(v) => updateItem(i, "title", v)}
                      editable={editable}
                      onActivate={onActivate}
                      className="font-bold text-[var(--app-text)]"
                      placeholder="ステップ名"
                    />
                  </p>
                  <p className="mt-0.5 text-[var(--app-text-muted)]">
                    <InlineEditable
                      value={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
                      onSave={(v) => updateItem(i, "description", v)}
                      editable={editable}
                      onActivate={onActivate}
                      multiline
                      className="block w-full min-h-[1lh] text-[var(--app-text-muted)]"
                      placeholder="説明"
                    />
                  </p>
                </div>
              </li>
            ))
          )}
        </ol>
      </div>
    );
  }

  return (
    <Card padding="md">
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={title}
          onSave={(v) => update({ title: v })}
          editable={editable}
          onActivate={onActivate}
          className={CARD_BLOCK_TITLE_CLASS}
          placeholder={labels.titlePlaceholder}
        />
      </p>
      <ol className="mt-3 space-y-3" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <li className="text-slate-500">{labels.empty}</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {i + 1}
              </span>
              <div data-inner-surface className={`min-w-0 flex-1 ${editorInnerRadiusClassName} bg-slate-50 px-2 py-2`}>
                <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
                  <InlineEditable
                    value={getLocalizedContent(item.title as LocalizedString | undefined, locale)}
                    onSave={(v) => updateItem(i, "title", v)}
                    editable={editable}
                    onActivate={onActivate}
                    className={CARD_BLOCK_TITLE_CLASS}
                    placeholder="ステップ名"
                  />
                </p>
                <p className="mt-0.5 font-normal text-slate-600">
                  <InlineEditable
                    value={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
                    onSave={(v) => updateItem(i, "description", v)}
                    editable={editable}
                    onActivate={onActivate}
                    multiline
                    className="block w-full min-h-[1lh] text-slate-600"
                    placeholder="説明"
                  />
                </p>
              </div>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}
