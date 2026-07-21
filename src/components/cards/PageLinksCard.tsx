"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useClientShell } from "@/components/app-shell/useClientShell";
import {
  AppLinkTile,
  AppLinkTileGrid,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
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
} from "@/lib/page-link-styles";

type PageLinksItem = {
  label?: string;
  description?: string;
  icon?: string;
  linkType?: "page" | "url";
  pageSlug?: string;
  link?: string;
};

function getIconDisplay(icon: string | undefined) {
  return normalizeIconToken(icon, "link");
}

type PageLinksCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function PageLinksCard({ card, locale = "ja" }: PageLinksCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? {
          title: "메뉴",
          empty: "링크를 추가",
          item: "항목",
          titlePlaceholder: "제목",
          labelPlaceholder: "라벨",
          descPlaceholder: "설명",
        }
      : locale === "zh"
        ? {
            title: "菜单",
            empty: "请添加链接",
            item: "项目",
            titlePlaceholder: "标题",
            labelPlaceholder: "标签",
            descPlaceholder: "说明",
          }
        : locale === "en"
          ? {
              title: "Menu",
              empty: "Add links",
              item: "Item",
              titlePlaceholder: "Title",
              labelPlaceholder: "Label",
              descPlaceholder: "Description",
            }
          : {
              title: "メニュー",
              empty: "リンクを追加",
              item: "項目",
              titlePlaceholder: "タイトル",
              labelPlaceholder: "ラベル",
              descPlaceholder: "説明",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const rawColumns = typeof c?.columns === "number" ? c.columns : Number(c?.columns);
  const columns = rawColumns === 1 || rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const iconSize = readPageLinkIconSize(c?.iconSize);
  const styleVariant = readPageLinkStyleVariant(c?.styleVariant);
  const circleShadowStrength = readPageLinkShadowStrength(c?.circleIconShadowStrength, "md");
  const items = (Array.isArray(c?.items) ? c.items : []) as PageLinksItem[];
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const getHref = (item: PageLinksItem): string => {
    const linkType = item.linkType ?? "page";
    if (linkType === "url" && item.link) return item.link;
    if (linkType === "page" && item.pageSlug) {
      return resolveGuestHref(`/v/${item.pageSlug}`);
    }
    return "#";
  };

  const isExternal = (item: PageLinksItem): boolean => {
    const href = getHref(item);
    return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:");
  };

  const saveLabel = (index: number, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], label: value };
    update({ items: next });
  };

  const saveDescription = (index: number, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], description: value };
    update({ items: next });
  };

  if (isNativeUi) {
    const gridCols = columns >= 3 ? 3 : columns === 1 ? 1 : 2;
    const oddLastSpans = gridCols === 2 && items.length % 2 === 1;

    if (styleVariant === "circle") {
      const iconSizes = PAGE_LINK_ICON_SIZES.circle[iconSize];
      return (
        <div className="app-native-section app-native-guest-card" onClick={editable ? onActivate : undefined}>
          {(editable || title) ? (
            <AppSectionHeader
              title={
                editable ? (
                  <InlineEditable
                    value={title}
                    onSave={(v) => update({ title: v })}
                    editable={editable}
                    onActivate={onActivate}
                    className="app-section-header__title"
                    placeholder={labels.titlePlaceholder}
                  />
                ) : (
                  title
                )
              }
              icon={<NativeLinkIcon />}
              as="div"
            />
          ) : null}
          {items.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">{labels.empty}</p>
          ) : (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))` }}
            >
              {items.map((item, i) => {
                const href = getHref(item);
                const iconName = getIconDisplay(item.icon);
                const label =
                  getLocalizedContent(item.label as LocalizedString | undefined, locale) ||
                  labels.labelPlaceholder;
                const inner = (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <span
                      className={
                        "app-native-link-circle flex items-center justify-center rounded-full border border-[var(--app-border)] bg-white " +
                        iconSizes.wrap +
                        " " +
                        pageLinkShadowClass(circleShadowStrength)
                      }
                    >
                      <AppLinkTileIcon name={iconName} size={20} className="!bg-transparent" />
                    </span>
                    <span className="app-native-link-circle__label w-full text-center text-sm font-semibold leading-snug text-[var(--app-text)] break-words [word-break:keep-all]">
                      {editable ? (
                        <InlineEditable
                          value={item.label ?? ""}
                          onSave={(v) => saveLabel(i, v)}
                          editable={editable}
                          onActivate={onActivate}
                          placeholder={labels.labelPlaceholder}
                        />
                      ) : (
                        label
                      )}
                    </span>
                  </div>
                );

                if (href && href !== "#" && !editable) {
                  return (
                    <a
                      key={i}
                      href={href}
                      target={isExternal(item) ? "_blank" : undefined}
                      rel={isExternal(item) ? "noreferrer" : undefined}
                      className="guest-page-link block touch-manipulation"
                    >
                      {inner}
                    </a>
                  );
                }

                return (
                  <div
                    key={i}
                    role={editable ? "button" : undefined}
                    tabIndex={editable ? 0 : undefined}
                    onClick={editable ? onActivate : undefined}
                    onKeyDown={editable ? (e) => e.key === "Enter" && onActivate?.() : undefined}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="app-native-section app-native-guest-card" onClick={editable ? onActivate : undefined}>
        {(editable || title) ? (
          <AppSectionHeader
            title={
              editable ? (
                <InlineEditable
                  value={title}
                  onSave={(v) => update({ title: v })}
                  editable={editable}
                  onActivate={onActivate}
                  className="app-section-header__title"
                  placeholder={labels.titlePlaceholder}
                />
              ) : (
                title
              )
            }
            icon={<NativeLinkIcon />}
            as="div"
          />
        ) : null}
        {items.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">{labels.empty}</p>
        ) : (
          <AppLinkTileGrid
            className={gridCols === 1 ? "!grid-cols-1" : gridCols >= 3 ? "!grid-cols-3" : undefined}
          >
            {items.map((item, i) => {
              const href = getHref(item);
              const iconName = getIconDisplay(item.icon);
              const label =
                getLocalizedContent(item.label as LocalizedString | undefined, locale) ||
                labels.labelPlaceholder;
              const icon = <AppLinkTileIcon name={iconName} />;
              const span = oddLastSpans && i === items.length - 1;

              if (editable) {
                return (
                  <AppLinkTile
                    key={i}
                    label={label}
                    icon={icon}
                    span={span}
                    onClick={(e) => {
                      e.preventDefault();
                      onActivate?.();
                    }}
                  />
                );
              }

              if (href && href !== "#") {
                return (
                  <AppLinkTile
                    key={i}
                    as="a"
                    href={href}
                    label={label}
                    icon={icon}
                    span={span}
                    target={isExternal(item) ? "_blank" : undefined}
                    rel={isExternal(item) ? "noreferrer" : undefined}
                    className="guest-page-link"
                  />
                );
              }

              return (
                <AppLinkTile key={i} label={label} icon={icon} span={span} onClick={onActivate} />
              );
            })}
          </AppLinkTileGrid>
        )}
      </div>
    );
  }

  const titleNode =
    editable || title ? (
      <h3 className="pres-block__title">
        <InlineEditable
          value={title}
          onSave={(v) => update({ title: v })}
          editable={editable}
          onActivate={onActivate}
          className="pres-block__title"
          placeholder={labels.titlePlaceholder}
        />
      </h3>
    ) : null;

  /* tile → presentation card grid */
  if (styleVariant === "tile") {
    const gridCols = columns >= 4 ? 4 : columns === 3 ? 3 : 2;
    const tileIconSizes = PAGE_LINK_ICON_SIZES.tile[iconSize];

    return (
      <section
        className="pres-block"
        style={{ ["--pres-accent" as string]: accent }}
        onClick={editable ? onActivate : undefined}
      >
        {titleNode}
        {items.length === 0 ? (
          <p className={CARD_BLOCK_CAPTION_CLASS} style={getBodyFontSizeStyle()}>
            {labels.empty}
          </p>
        ) : (
          <div className="pres-card-grid" data-cols={String(gridCols)}>
            {items.map((item, i) => {
              const href = getHref(item);
              const iconDisplay = getIconDisplay(item.icon);
              const description = getLocalizedContent(
                item.description as LocalizedString | undefined,
                locale,
              );
              const inner = (
                <>
                  <span className="pres-card-grid__icon" aria-hidden>
                    <LineIcon name={iconDisplay} className={tileIconSizes.icon} />
                  </span>
                  <span className="pres-card-grid__label">
                    <InlineEditable
                      value={item.label ?? ""}
                      onSave={(v) => saveLabel(i, v)}
                      editable={editable}
                      onActivate={onActivate}
                      placeholder={labels.labelPlaceholder}
                    />
                  </span>
                  {editable || description ? (
                    <span className="pres-card-grid__desc">
                      <InlineEditable
                        value={description}
                        onSave={(v) => saveDescription(i, v)}
                        editable={editable}
                        onActivate={onActivate}
                        placeholder={labels.descPlaceholder}
                      />
                    </span>
                  ) : null}
                </>
              );

              if (href && href !== "#" && !editable) {
                return (
                  <a
                    key={i}
                    href={href}
                    target={isExternal(item) ? "_blank" : undefined}
                    rel={isExternal(item) ? "noreferrer" : undefined}
                    className="pres-card-grid__item guest-page-link"
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <div
                  key={i}
                  className="pres-card-grid__item"
                  role={editable ? "button" : undefined}
                  tabIndex={editable ? 0 : undefined}
                  onClick={editable ? onActivate : undefined}
                  onKeyDown={editable ? (e) => e.key === "Enter" && onActivate?.() : undefined}
                >
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  /* circle — keep compact icon-grid look */
  const iconSizes = PAGE_LINK_ICON_SIZES.circle[iconSize];
  const iconWrapClass = iconSizes.wrap;
  const iconClass = iconSizes.icon;

  return (
    <Card padding="md">
      {(editable || title) ? (
        <h3 className={`mb-2.5 ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePlaceholder}
          />
        </h3>
      ) : null}
      <div
        className="grid auto-rows-min gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.length === 0 ? (
          <p className={`col-span-full ${CARD_BLOCK_CAPTION_CLASS}`} style={getBodyFontSizeStyle()}>
            {labels.empty}
          </p>
        ) : (
          items.map((item, i) => {
            const href = getHref(item);
            const iconDisplay = getIconDisplay(item.icon);
            const content = (
              <div
                data-inner-surface
                className={`flex min-h-[90px] flex-col items-center justify-center gap-2 px-1.5 py-1.5 ${editorInnerRadiusClassName}`}
              >
                <span
                  data-inner-surface
                  className={`flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 ${pageLinkShadowClass(circleShadowStrength)} ${iconWrapClass}`}
                >
                  <LineIcon name={iconDisplay} className={iconClass} />
                </span>
                <span
                  className={`w-full text-center ${CARD_BLOCK_CAPTION_CLASS} text-slate-700 break-words [word-break:keep-all]`}
                  style={getBodyFontSizeStyle()}
                >
                  <InlineEditable
                    value={item.label ?? ""}
                    onSave={(v) => saveLabel(i, v)}
                    editable={editable}
                    onActivate={onActivate}
                    className="text-slate-700"
                    placeholder={labels.labelPlaceholder}
                  />
                </span>
              </div>
            );

            if (href && href !== "#") {
              if (editable) {
                return (
                  <Link
                    key={i}
                    href={href}
                    className="block touch-manipulation"
                    onClick={(e) => e.preventDefault()}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <a
                  key={i}
                  href={href}
                  target={isExternal(item) ? "_blank" : undefined}
                  rel={isExternal(item) ? "noreferrer" : undefined}
                  className="guest-page-link block touch-manipulation"
                >
                  {content}
                </a>
              );
            }
            return (
              <div
                key={i}
                className="block"
                onClick={onActivate}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onActivate?.()}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
