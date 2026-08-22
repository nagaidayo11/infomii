"use client";

import { BRAND_ACCENT } from "@/lib/brand-accent";

import { useState, type ReactNode } from "react";
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
import {
  PAGE_LINK_ICON_SIZES,
  pageLinkShadowClass,
  readPageLinkIconSize,
  readPageLinkShadowStrength,
  readPageLinkStyleVariant,
  type PageLinkStyleVariant,
} from "@/lib/page-link-styles";

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

function AccordionBody({ body }: { body: string }) {
  return (
    <motion.div
      className="pres-icon-accordion__body"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pres-icon-accordion__body-inner">
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">{body}</p>
      </div>
    </motion.div>
  );
}

export function IconAccordionCard({ card, locale = "ja" }: IconAccordionCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const rawColumns = typeof c?.columns === "number" ? c.columns : Number(c?.columns);
  const styleVariant: PageLinkStyleVariant = readPageLinkStyleVariant(c?.styleVariant);
  const columns =
    styleVariant === "list"
      ? 1
      : styleVariant === "poster"
        ? rawColumns === 3
          ? 3
          : 2
        : rawColumns === 3 || rawColumns === 4
          ? rawColumns
          : 2;
  const iconSize = readPageLinkIconSize(c?.iconSize);
  const circleShadowStrength = readPageLinkShadowStrength(c?.circleIconShadowStrength, "md");
  const tileShadowStrength = readPageLinkShadowStrength(c?.tileShadowStrength, "md");
  const items = (Array.isArray(c?.items) ? c.items : []) as IconAccordionItem[];
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : BRAND_ACCENT;
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const rows = chunkItems(
    items.map((item, index) => ({ item, index })),
    columns,
  );

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const patchItem = (index: number, patch: Partial<IconAccordionItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    update({ items: next });
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

  const titleNode = isNativeUi ? (
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
  ) : null;

  const labelField = (item: IconAccordionItem, i: number, className?: string) => {
    const labelText =
      getLocalizedContent(item.label as LocalizedString | undefined, locale) || labelPlaceholder;
    if (editable) {
      return (
        <InlineEditable
          value={item.label ?? ""}
          onSave={(v) => patchItem(i, { label: v })}
          editable={editable}
          onActivate={onActivate}
          className={className}
          placeholder={labelPlaceholder}
        />
      );
    }
    return labelText;
  };

  const descField = (item: IconAccordionItem, i: number, className?: string) => {
    const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);
    if (!(editable || description)) return null;
    if (editable) {
      return (
        <InlineEditable
          value={description}
          onSave={(v) => patchItem(i, { description: v })}
          editable={editable}
          onActivate={onActivate}
          className={className}
          placeholder={descPlaceholder}
        />
      );
    }
    return description;
  };

  const renderTriggerContent = (item: IconAccordionItem, i: number, variant: PageLinkStyleVariant): ReactNode => {
    const iconDisplay = normalizeIconToken(item.icon, "info");
    const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);

    if (variant === "circle") {
      const iconSizes = PAGE_LINK_ICON_SIZES.circle[iconSize];
      return (
        <>
          <span
            className={
              "pres-icon-accordion__circle-icon flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 " +
              iconSizes.wrap +
              " " +
              pageLinkShadowClass(circleShadowStrength)
            }
            aria-hidden
          >
            {isNativeUi ? (
              <AppLinkTileIcon name={iconDisplay} size={20} className="!bg-transparent" />
            ) : (
              <LineIcon name={iconDisplay} className={iconSizes.icon} />
            )}
          </span>
          <span className="pres-icon-accordion__circle-label">
            {labelField(item, i)}
          </span>
        </>
      );
    }

    if (variant === "list") {
      const listIconSizes = PAGE_LINK_ICON_SIZES.list[iconSize];
      return (
        <>
          <span
            className={`pres-link-list__icon ${listIconSizes.wrap} ${pageLinkShadowClass(circleShadowStrength)}`}
            aria-hidden
          >
            {isNativeUi ? (
              <AppLinkTileIcon name={iconDisplay} size={18} className="!bg-transparent" />
            ) : (
              <LineIcon name={iconDisplay} className={listIconSizes.icon} />
            )}
          </span>
          <span className="pres-link-list__copy">
            <span className="pres-link-list__label">{labelField(item, i)}</span>
            {editable || description ? (
              <span className="pres-link-list__desc">{descField(item, i)}</span>
            ) : null}
          </span>
          <span className="pres-link-list__chevron" aria-hidden>
            {openIndex === i ? "˄" : "›"}
          </span>
        </>
      );
    }

    if (variant === "poster") {
      return (
        <>
          <span className="pres-link-poster__icon" aria-hidden>
            {isNativeUi ? (
              <AppLinkTileIcon name={iconDisplay} size={20} className="!bg-transparent" />
            ) : (
              <LineIcon name={iconDisplay} className="h-5 w-5" />
            )}
          </span>
          <span className="pres-link-poster__label">{labelField(item, i)}</span>
          {editable || description ? (
            <span className="pres-link-poster__desc">{descField(item, i)}</span>
          ) : null}
        </>
      );
    }

    /* tile */
    const tileIconSizes = PAGE_LINK_ICON_SIZES.tile[iconSize];
    return (
      <>
        <span className="pres-card-grid__icon" aria-hidden>
          {isNativeUi ? (
            <AppLinkTileIcon name={iconDisplay} />
          ) : (
            <LineIcon name={iconDisplay} className={tileIconSizes.icon} />
          )}
        </span>
        <span className="pres-card-grid__label">{labelField(item, i)}</span>
        {editable || description ? (
          <span className="pres-card-grid__desc">{descField(item, i)}</span>
        ) : null}
      </>
    );
  };

  const triggerClass = (variant: PageLinkStyleVariant, open: boolean) => {
    if (variant === "circle") {
      return "pres-icon-accordion__trigger pres-icon-accordion__trigger--circle";
    }
    if (variant === "list") {
      return "pres-icon-accordion__trigger pres-link-list__item" + (open ? " is-open" : "");
    }
    if (variant === "poster") {
      return (
        "pres-icon-accordion__trigger pres-link-poster__item " + pageLinkShadowClass(tileShadowStrength)
      );
    }
    return (
      "pres-card-grid__item pres-icon-accordion__trigger " + pageLinkShadowClass(tileShadowStrength)
    );
  };

  return (
    <section
      className="pres-block"
      style={{ ["--pres-accent" as string]: accent }}
      onClick={editable ? onActivate : undefined}
    >
      {titleNode}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : styleVariant === "list" ? (
        <div className="pres-icon-accordion">
          <div className="pres-link-list">
            {items.map((item, i) => {
              const open = !editable && openIndex === i;
              const body = getLocalizedContent(item.body as LocalizedString | undefined, locale);
              return (
                <div key={i} className="pres-icon-accordion__row">
                  <button
                    type="button"
                    className={triggerClass("list", open)}
                    aria-expanded={open}
                    data-open={open ? "true" : "false"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(i);
                    }}
                  >
                    {renderTriggerContent(item, i, "list")}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && body ? <AccordionBody key={`body-${i}`} body={body} /> : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="pres-icon-accordion">
          {rows.map((row, rowIndex) => {
            const rowStart = rowIndex * columns;
            const rowEnd = rowStart + row.length - 1;
            const openInRow = openIndex >= rowStart && openIndex <= rowEnd;

            return (
              <div key={rowIndex} className="pres-icon-accordion__row">
                {styleVariant === "circle" ? (
                  <div
                    className="pres-icon-accordion__circle-grid"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                  >
                    {row.map(({ item, index: i }) => {
                      const open = !editable && openIndex === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={triggerClass("circle", open)}
                          aria-expanded={open}
                          data-open={open ? "true" : "false"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(i);
                          }}
                        >
                          {renderTriggerContent(item, i, "circle")}
                        </button>
                      );
                    })}
                  </div>
                ) : styleVariant === "poster" ? (
                  <div className="pres-link-poster" data-cols={String(columns)}>
                    {row.map(({ item, index: i }) => {
                      const open = !editable && openIndex === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={triggerClass("poster", open)}
                          aria-expanded={open}
                          data-open={open ? "true" : "false"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(i);
                          }}
                        >
                          {renderTriggerContent(item, i, "poster")}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pres-card-grid" data-cols={String(columns)}>
                    {row.map(({ item, index: i }) => {
                      const open = !editable && openIndex === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={triggerClass("tile", open)}
                          aria-expanded={open}
                          data-open={open ? "true" : "false"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(i);
                          }}
                        >
                          {renderTriggerContent(item, i, "tile")}
                        </button>
                      );
                    })}
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {openInRow && openBody ? (
                    <AccordionBody key={`body-${openIndex}`} body={openBody} />
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
