"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
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
  icon?: string;
  linkType?: "page" | "url";
  pageSlug?: string;
  link?: string;
};

function getIconDisplay(icon: string | undefined) {
  return normalizeIconToken(icon, "link");
}

type PageLinksCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function PageLinksCard({ card, locale = "ja" }: PageLinksCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "메뉴", empty: "링크를 추가", item: "항목", titlePlaceholder: "제목", labelPlaceholder: "라벨" }
      : locale === "zh"
        ? { title: "菜单", empty: "请添加链接", item: "项目", titlePlaceholder: "标题", labelPlaceholder: "标签" }
        : locale === "en"
          ? { title: "Menu", empty: "Add links", item: "Item", titlePlaceholder: "Title", labelPlaceholder: "Label" }
          : { title: "メニュー", empty: "リンクを追加", item: "項目", titlePlaceholder: "タイトル", labelPlaceholder: "ラベル" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const rawColumns = typeof c?.columns === "number" ? c.columns : Number(c?.columns);
  const columns = rawColumns === 1 || rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const iconSize = readPageLinkIconSize(c?.iconSize);
  const styleVariant = readPageLinkStyleVariant(c?.styleVariant);
  const circleShadowStrength = readPageLinkShadowStrength(c?.circleIconShadowStrength, "md");
  const tileShadowStrength = readPageLinkShadowStrength(c?.tileShadowStrength, "none");
  const items = (Array.isArray(c?.items) ? c.items : []) as PageLinksItem[];

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

  const iconSizes = PAGE_LINK_ICON_SIZES[styleVariant][iconSize];
  const iconWrapClass = iconSizes.wrap;
  const iconClass = iconSizes.icon;

  /* Phase 1+: native UI (guest + editor preview) */
  if (isNativeUi && !editable) {
    const showTitle = Boolean(title);
    const oddLastSpans = columns === 2 && items.length % 2 === 1;

    return (
      <div className="app-native-section app-native-guest-card">
        {showTitle ? <AppSectionHeader title={title} icon={<NativeLinkIcon />} /> : null}
        {items.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">{labels.empty}</p>
        ) : (
          <AppLinkTileGrid
            className={columns === 1 ? "!grid-cols-1" : columns >= 3 ? "!grid-cols-3" : undefined}
          >
            {items.map((item, i) => {
              const href = getHref(item);
              const iconDisplay = getIconDisplay(item.icon);
              const span = oddLastSpans && i === items.length - 1;
              const icon = <LineIcon name={iconDisplay} className="h-[1.125rem] w-[1.125rem]" />;
              const label = item.label?.trim() || labels.item;

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

  /* Editor canvas: same native chrome, inline-editable labels (no navigation) */
  if (isNativeUi && editable) {
    const showTitle = Boolean(title) || editable;
    const oddLastSpans = columns === 2 && items.length % 2 === 1;

    return (
      <div className="app-native-section app-native-guest-card" onClick={onActivate}>
        {showTitle ? (
          <AppSectionHeader
            title={
              <InlineEditable
                value={title}
                onSave={(v) => update({ title: v })}
                editable={editable}
                onActivate={onActivate}
                className="app-section-header__title"
                placeholder={labels.titlePlaceholder}
              />
            }
            icon={<NativeLinkIcon />}
            as="div"
          />
        ) : null}
        {items.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">{labels.empty}</p>
        ) : (
          <AppLinkTileGrid
            className={columns === 1 ? "!grid-cols-1" : columns >= 3 ? "!grid-cols-3" : undefined}
          >
            {items.map((item, i) => {
              const iconDisplay = getIconDisplay(item.icon);
              const span = oddLastSpans && i === items.length - 1;
              return (
                <div
                  key={i}
                  className={"app-link-tile " + (span ? "app-link-tile--span " : "")}
                  role="button"
                  tabIndex={0}
                  onClick={onActivate}
                  onKeyDown={(e) => e.key === "Enter" && onActivate?.()}
                >
                  <span className="app-link-tile__icon">
                    <LineIcon name={iconDisplay} className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <InlineEditable
                      value={item.label ?? ""}
                      onSave={(v) => {
                        const next = [...items];
                        next[i] = { ...next[i], label: v };
                        update({ items: next });
                      }}
                      editable={editable}
                      onActivate={onActivate}
                      className="text-[var(--app-tile-text)]"
                      placeholder={labels.labelPlaceholder}
                    />
                  </span>
                </div>
              );
            })}
          </AppLinkTileGrid>
        )}
      </div>
    );
  }

  if (styleVariant === "list") {
    const listTitle =
      editable || title ? (
        <h3 className={`mb-1 px-4 pt-3 ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePlaceholder}
          />
        </h3>
      ) : null;

    return (
      <div className="overflow-hidden bg-white">
        {listTitle}
        {items.length === 0 ? (
          <p className={`px-4 py-4 ${CARD_BLOCK_CAPTION_CLASS}`} style={getBodyFontSizeStyle()}>
            {labels.empty}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 border-y border-slate-100">
            {items.map((item, i) => {
              const href = getHref(item);
              const iconDisplay = getIconDisplay(item.icon);
              const row = (
                <div className="flex min-h-[56px] items-center gap-3 px-4 py-3.5 active:bg-slate-50">
                  <span className={`flex shrink-0 items-center justify-center text-teal-800 ${iconWrapClass}`}>
                    <LineIcon name={iconDisplay} className={iconClass} />
                  </span>
                  <span
                    className={`min-w-0 flex-1 font-medium ${CARD_BLOCK_BODY_CLASS} text-slate-800`}
                    style={getBodyFontSizeStyle()}
                  >
                    <InlineEditable
                      value={item.label ?? ""}
                      onSave={(v) => {
                        const next = [...items];
                        next[i] = { ...next[i], label: v };
                        update({ items: next });
                      }}
                      editable={editable}
                      onActivate={onActivate}
                      className="text-slate-800"
                      placeholder={labels.labelPlaceholder}
                    />
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
              );

              if (href && href !== "#") {
                if (editable) {
                  return (
                    <li key={i}>
                      <Link href={href} className="block touch-manipulation" onClick={(e) => e.preventDefault()}>
                        {row}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={i}>
                    <a
                      href={href}
                      target={isExternal(item) ? "_blank" : undefined}
                      rel={isExternal(item) ? "noreferrer" : undefined}
                      className="guest-page-link block touch-manipulation"
                    >
                      {row}
                    </a>
                  </li>
                );
              }
              return (
                <li key={i}>
                  <div
                    className="block"
                    onClick={onActivate}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onActivate?.()}
                  >
                    {row}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

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
                className={
                  styleVariant === "circle"
                    ? "flex min-h-[90px] flex-col items-center justify-center gap-2 px-1.5 py-1.5"
                    : [
                        `flex min-h-[76px] flex-col items-center justify-center gap-1 ${editorInnerRadiusClassName} bg-slate-50/80 px-2 py-2 transition hover:bg-slate-100`,
                        tileShadowStrength !== "none"
                          ? `border border-slate-200/80 ${pageLinkShadowClass(tileShadowStrength)}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                }
              >
                <span
                  data-inner-surface
                  className={
                    styleVariant === "circle"
                      ? `flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 ${pageLinkShadowClass(circleShadowStrength)} ${iconWrapClass}`
                      : `flex shrink-0 items-center justify-center text-slate-700 ${iconWrapClass}`
                  }
                >
                  <LineIcon name={iconDisplay} className={iconClass} />
                </span>
                <span
                  className={
                    styleVariant === "circle"
                      ? `w-full text-center ${CARD_BLOCK_CAPTION_CLASS} text-slate-700 break-words [word-break:keep-all]`
                      : `w-full text-center ${CARD_BLOCK_BODY_CLASS} text-slate-700 break-words [word-break:keep-all]`
                  }
                  style={getBodyFontSizeStyle()}
                >
                  <InlineEditable
                    value={item.label ?? ""}
                    onSave={(v) => {
                      const next = [...items];
                      next[i] = { ...next[i], label: v };
                      update({ items: next });
                    }}
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
                    target={isExternal(item) ? "_blank" : undefined}
                    rel={isExternal(item) ? "noreferrer" : undefined}
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
