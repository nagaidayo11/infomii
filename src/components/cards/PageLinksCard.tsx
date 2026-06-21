"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useCardInlineEdit } from "./card-inline-edit";
import { LineIcon, normalizeIconToken } from "./LineIcon";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

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

/** Box shadow presets for page link tiles / circle icons (`none` | `sm` | `md` | `lg`). */
function pageLinkShadowClass(strength: string): string {
  switch (strength) {
    case "none":
      return "shadow-none";
    case "sm":
      return "shadow-[0_2px_8px_rgba(2,6,23,0.1)]";
    case "lg":
      return "shadow-[0_10px_28px_rgba(2,6,23,0.24)]";
    case "md":
    default:
      return "shadow-[0_4px_12px_rgba(2,6,23,0.16)]";
  }
}

/** Icon + wrapper sizes per variant (sm / md / lg). */
const PAGE_LINK_ICON_SIZES = {
  circle: {
    sm: { wrap: "h-10 w-10", icon: "h-4 w-4" },
    md: { wrap: "h-14 w-14", icon: "h-5.5 w-5.5" },
    lg: { wrap: "h-[4.5rem] w-[4.5rem]", icon: "h-7 w-7" },
  },
  tile: {
    sm: { wrap: "h-7 w-7", icon: "h-4 w-4" },
    md: { wrap: "h-10 w-10", icon: "h-5.5 w-5.5" },
    lg: { wrap: "h-12 w-12", icon: "h-7 w-7" },
  },
} as const;

type PageLinksCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function PageLinksCard({ card, locale = "ja" }: PageLinksCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
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
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const rawIconSize = typeof c?.iconSize === "string" ? c.iconSize : "";
  const iconSize = rawIconSize === "sm" || rawIconSize === "lg" ? rawIconSize : "md";
  const rawStyleVariant = typeof c?.styleVariant === "string" ? c.styleVariant : "";
  const styleVariant = rawStyleVariant === "circle" ? "circle" : "tile";
  const rawCircleShadow =
    typeof c?.circleIconShadowStrength === "string" ? c.circleIconShadowStrength : "";
  const circleShadowStrength =
    rawCircleShadow === "none" || rawCircleShadow === "sm" || rawCircleShadow === "lg"
      ? rawCircleShadow
      : "md";
  const rawTileShadow =
    typeof c?.tileShadowStrength === "string" ? c.tileShadowStrength : "";
  const tileShadowStrength =
    rawTileShadow === "none" || rawTileShadow === "sm" || rawTileShadow === "md" || rawTileShadow === "lg"
      ? rawTileShadow
      : "none";
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

  return (
    <Card padding="md">
      {(editable || title) ? (
        <h3 className={`mb-2.5 ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className="text-slate-800"
            placeholder={labels.titlePlaceholder}
          />
        </h3>
      ) : null}
      <div
        className="grid auto-rows-min gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.length === 0 ? (
          <p className="col-span-full text-slate-500" style={getBodyFontSizeStyle()}>{labels.empty}</p>
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
                      ? "w-full text-center text-[12px] font-normal leading-tight text-slate-700 break-words [word-break:keep-all]"
                      : "w-full text-center font-normal leading-tight text-slate-700 break-words [word-break:keep-all]"
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
