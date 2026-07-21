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

type ShortcutItem = {
  label?: string;
  icon?: string;
  linkType?: "page" | "url";
  pageSlug?: string;
  link?: string;
};

type IconShortcutsCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

const MAX_COLUMNS = 3;

function readColumns(raw: unknown, itemCount: number): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  const preferred = n === 2 || n === 3 ? n : MAX_COLUMNS;
  return Math.min(MAX_COLUMNS, preferred, Math.max(1, itemCount));
}

/**
 * Icon+label shortcuts in a balanced grid (max 3 columns — no horizontal clip).
 * Style controls match pageLinks (size / tile|circle / shadow).
 */
export function IconShortcutsCard({ card, locale = "ja" }: IconShortcutsCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(c?.items) ? c.items : []) as ShortcutItem[];
  const columns = readColumns(c?.columns, items.length);
  const iconSize = readPageLinkIconSize(c?.iconSize);
  const styleVariantRaw = readPageLinkStyleVariant(c?.styleVariant);
  const styleVariant = styleVariantRaw === "list" ? "tile" : styleVariantRaw;
  const circleShadowStrength = readPageLinkShadowStrength(c?.circleIconShadowStrength, "md");
  const tileShadowStrength = readPageLinkShadowStrength(c?.tileShadowStrength, "md");
  const iconSizes = PAGE_LINK_ICON_SIZES[styleVariant][iconSize];
  const labels =
    locale === "ko"
      ? { empty: "바로가기를 추가", titlePlaceholder: "제목", labelPlaceholder: "라벨" }
      : locale === "zh"
        ? { empty: "请添加快捷入口", titlePlaceholder: "标题", labelPlaceholder: "标签" }
        : locale === "en"
          ? { empty: "Add shortcuts", titlePlaceholder: "Title", labelPlaceholder: "Label" }
          : { empty: "ショートカットを追加", titlePlaceholder: "タイトル", labelPlaceholder: "ラベル" };

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const getHref = (item: ShortcutItem): string => {
    const linkType = item.linkType ?? "page";
    if (linkType === "url" && item.link) return item.link;
    if (linkType === "page" && item.pageSlug) {
      return resolveGuestHref(`/v/${item.pageSlug}`);
    }
    return "#";
  };

  const isExternal = (item: ShortcutItem): boolean => {
    const href = getHref(item);
    return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:");
  };

  if (isNativeUi) {
    const oddLastSpans = columns === 2 && items.length % 2 === 1;
    return (
      <div className="app-native-section app-native-guest-card" onClick={onActivate}>
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
            className={columns === 1 ? "!grid-cols-1" : columns >= 3 ? "!grid-cols-3" : undefined}
          >
            {items.map((item, index) => {
              const href = getHref(item);
              const label =
                getLocalizedContent(item.label as LocalizedString | undefined, locale) ||
                labels.labelPlaceholder;
              const iconName = normalizeIconToken(item.icon, "link");
              const icon = <AppLinkTileIcon name={iconName} />;
              const span = oddLastSpans && index === items.length - 1;

              if (editable) {
                return (
                  <AppLinkTile
                    key={index}
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
                    key={index}
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

              return <AppLinkTile key={index} label={label} icon={icon} span={span} onClick={onActivate} />;
            })}
          </AppLinkTileGrid>
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

      {items.length === 0 ? (
        <p className={CARD_BLOCK_CAPTION_CLASS} style={getBodyFontSizeStyle()}>
          {labels.empty}
        </p>
      ) : (
        <div
          className="grid gap-x-2 gap-y-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => {
            const href = getHref(item);
            const label = getLocalizedContent(item.label as LocalizedString | undefined, locale) || labels.labelPlaceholder;
            const icon = normalizeIconToken(item.icon, "link");
            const iconWrap = (
              <span
                className={
                  styleVariant === "circle"
                    ? `flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 ${pageLinkShadowClass(circleShadowStrength)} ${iconSizes.wrap}`
                    : `flex shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-700 ${
                        tileShadowStrength !== "none" ? pageLinkShadowClass(tileShadowStrength) : ""
                      } ${iconSizes.wrap}`
                }
              >
                <LineIcon name={icon} className={iconSizes.icon} />
              </span>
            );
            const content = (
              <>
                {iconWrap}
                <span className={`mt-1.5 w-full truncate text-center font-medium ${CARD_BLOCK_CAPTION_CLASS} text-slate-700`}>
                  {editable ? (
                    <InlineEditable
                      value={label}
                      onSave={(v) => {
                        const next = [...items];
                        next[index] = { ...item, label: v };
                        update({ items: next });
                      }}
                      editable={editable}
                      onActivate={onActivate}
                      className={`text-center font-medium ${CARD_BLOCK_CAPTION_CLASS} text-slate-700`}
                      placeholder={labels.labelPlaceholder}
                    />
                  ) : (
                    label
                  )}
                </span>
              </>
            );

            const itemClass = "flex min-w-0 flex-col items-center";

            if (editable || href === "#") {
              return (
                <div
                  key={index}
                  className={itemClass}
                  onClick={(e) => {
                    if (editable) e.preventDefault();
                  }}
                >
                  {content}
                </div>
              );
            }

            if (isExternal(item)) {
              return (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${itemClass} active:opacity-80`}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={index}
                href={href}
                className={`guest-page-link ${itemClass} active:opacity-80`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
