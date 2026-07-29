"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { useCardInlineEdit } from "./card-inline-edit";
import { LineIcon, normalizeIconToken } from "./LineIcon";
import { AppLinkTileIcon } from "./AppLinkTileIcons";
import { NativeLinkIcon } from "./native-guest-icons";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { PAGE_LINK_ICON_SIZES, readPageLinkIconSize } from "@/lib/page-link-styles";

type IconAccordionItem = {
  label?: string;
  description?: string;
  icon?: string;
  body?: string;
};

type IconAccordionCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

function chunkItems<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function IconAccordionCard({ card, locale = "ja" }: IconAccordionCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const rawColumns = typeof c?.columns === "number" ? c.columns : Number(c?.columns);
  const columns = rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const iconSize = readPageLinkIconSize(c?.iconSize);
  const items = (Array.isArray(c?.items) ? c.items : []) as IconAccordionItem[];
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const tileIconSizes = PAGE_LINK_ICON_SIZES.tile[iconSize];
  const rows = chunkItems(items.map((item, index) => ({ item, index })), columns);

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const toggle = (index: number) => {
    if (editable) {
      onActivate?.();
      return;
    }
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  const emptyLabel =
    locale === "en" ? "Add items" : locale === "zh" ? "请添加项目" : locale === "ko" ? "항목을 추가" : "項目を追加";
  const titlePlaceholder =
    locale === "en" ? "Title" : locale === "zh" ? "标题" : locale === "ko" ? "제목" : "タイトル";
  const labelPlaceholder =
    locale === "en" ? "Label" : locale === "zh" ? "标签" : locale === "ko" ? "라벨" : "ラベル";
  const descPlaceholder =
    locale === "en" ? "Subtitle" : locale === "zh" ? "说明" : locale === "ko" ? "설명" : "説明";

  const openItem =
    !editable && openIndex >= 0 && openIndex < items.length ? items[openIndex] : null;
  const openBody = openItem
    ? getLocalizedContent(openItem.body as LocalizedString | undefined, locale)
    : "";

  return (
    <section
      className="pres-block"
      style={{ ["--pres-accent" as string]: accent }}
      onClick={editable ? onActivate : undefined}
    >
      {isNativeUi ? (
        editable || title ? (
          <AppSectionHeader
            title={
              editable ? (
                <InlineEditable
                  value={title}
                  onSave={(v) => update({ title: v })}
                  editable={editable}
                  onActivate={onActivate}
                  className="app-section-header__title"
                  placeholder={titlePlaceholder}
                />
              ) : (
                title
              )
            }
            icon={<NativeLinkIcon />}
            as="div"
          />
        ) : null
      ) : editable || title ? (
        <h3 className="pres-block__title">
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className="pres-block__title"
            placeholder={titlePlaceholder}
          />
        </h3>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="pres-icon-accordion">
          {rows.map((row, rowIndex) => {
            const rowStart = rowIndex * columns;
            const rowEnd = rowStart + row.length - 1;
            const openInRow = openIndex >= rowStart && openIndex <= rowEnd;

            return (
              <div key={rowIndex} className="pres-icon-accordion__row">
                <div className="pres-card-grid" data-cols={String(columns)}>
                  {row.map(({ item, index: i }) => {
                    const open = !editable && openIndex === i;
                    const iconDisplay = normalizeIconToken(item.icon, "info");
                    const description = getLocalizedContent(
                      item.description as LocalizedString | undefined,
                      locale,
                    );
                    const labelText =
                      getLocalizedContent(item.label as LocalizedString | undefined, locale) ||
                      labelPlaceholder;

                    return (
                      <button
                        key={i}
                        type="button"
                        className="pres-card-grid__item pres-icon-accordion__trigger"
                        aria-expanded={open}
                        data-open={open ? "true" : "false"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(i);
                        }}
                      >
                        <span className="pres-card-grid__icon" aria-hidden>
                          {isNativeUi ? (
                            <AppLinkTileIcon name={iconDisplay} />
                          ) : (
                            <LineIcon name={iconDisplay} className={tileIconSizes.icon} />
                          )}
                        </span>
                        <span className="pres-card-grid__label">
                          {editable ? (
                            <InlineEditable
                              value={item.label ?? ""}
                              onSave={(v) => {
                                const next = [...items];
                                next[i] = { ...next[i], label: v };
                                update({ items: next });
                              }}
                              editable={editable}
                              onActivate={onActivate}
                              placeholder={labelPlaceholder}
                            />
                          ) : (
                            labelText
                          )}
                        </span>
                        {editable || description ? (
                          <span className="pres-card-grid__desc">
                            {editable ? (
                              <InlineEditable
                                value={description}
                                onSave={(v) => {
                                  const next = [...items];
                                  next[i] = { ...next[i], description: v };
                                  update({ items: next });
                                }}
                                editable={editable}
                                onActivate={onActivate}
                                placeholder={descPlaceholder}
                              />
                            ) : (
                              description
                            )}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {openInRow && openBody ? (
                    <motion.div
                      key={`body-${openIndex}`}
                      className="pres-icon-accordion__body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="pres-icon-accordion__body-inner">
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">
                          {openBody}
                        </p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
