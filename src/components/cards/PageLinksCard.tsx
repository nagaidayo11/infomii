"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { LineIcon, normalizeIconToken } from "./LineIcon";

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

export function PageLinksCard({ card, isSelected = false, locale = "ja" }: PageLinksCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "메뉴", empty: "링크를 추가", item: "항목", titlePlaceholder: "제목", labelPlaceholder: "라벨" }
      : locale === "zh"
        ? { title: "菜单", empty: "请添加链接", item: "项目", titlePlaceholder: "标题", labelPlaceholder: "标签" }
        : locale === "en"
          ? { title: "Menu", empty: "Add links", item: "Item", titlePlaceholder: "Title", labelPlaceholder: "Label" }
          : { title: "メニュー", empty: "リンクを追加", item: "項目", titlePlaceholder: "タイトル", labelPlaceholder: "ラベル" };
  const title = (c?.title as string) ?? labels.title;
  const rawColumns = typeof c?.columns === "number" ? c.columns : Number(c?.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 3;
  const rawIconSize = typeof c?.iconSize === "string" ? c.iconSize : "";
  const iconSize = rawIconSize === "sm" || rawIconSize === "lg" ? rawIconSize : "md";
  const items = (Array.isArray(c?.items) ? c.items : []) as PageLinksItem[];

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };
  const onActivate = () => selectCard(card.id);

  const getHref = (item: PageLinksItem): string => {
    const linkType = item.linkType ?? "page";
    if (linkType === "url" && item.link) return item.link;
    if (linkType === "page" && item.pageSlug) return `/v/${item.pageSlug}`;
    return "#";
  };

  const isExternal = (item: PageLinksItem): boolean => {
    const href = getHref(item);
    return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:");
  };

  const iconWrapClass = iconSize === "sm" ? "h-8 w-8" : iconSize === "lg" ? "h-10 w-10" : "h-9 w-9";
  const iconClass = iconSize === "sm" ? "h-4.5 w-4.5" : iconSize === "lg" ? "h-6 w-6" : "h-5.5 w-5.5";

  return (
    <Card padding="md">
      <h3 className="mb-2.5 font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={title}
          onSave={(v) => update({ title: v })}
          editable={isSelected}
          onActivate={onActivate}
          className="text-slate-800"
          placeholder={labels.titlePlaceholder}
        />
      </h3>
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
                className={`flex min-h-[76px] flex-col items-center justify-center gap-1 ${editorInnerRadiusClassName} bg-slate-50/80 px-2 py-2 transition hover:bg-slate-100`}
              >
                <span className={`flex shrink-0 items-center justify-center rounded-full bg-white text-slate-700 ${iconWrapClass}`}>
                  <LineIcon name={iconDisplay} className={iconClass} />
                </span>
                <span
                  className="w-full text-center font-medium leading-tight text-slate-700 break-words [word-break:keep-all]"
                  style={getBodyFontSizeStyle()}
                >
                  {isSelected ? (
                    <InlineEditable
                      value={item.label ?? ""}
                      onSave={(v) => {
                        const next = [...items];
                        next[i] = { ...next[i], label: v };
                        update({ items: next });
                      }}
                      editable
                      onActivate={onActivate}
                      className="text-slate-700"
                      placeholder={labels.labelPlaceholder}
                    />
                  ) : (
                    (item.label ?? labels.item)
                  )}
                </span>
              </div>
            );

            if (href && href !== "#") {
              return (
                <Link
                  key={i}
                  href={href}
                  target={isExternal(item) ? "_blank" : undefined}
                  rel={isExternal(item) ? "noreferrer" : undefined}
                  className="block touch-manipulation"
                  onClick={(e) => isSelected && e.preventDefault()}
                >
                  {content}
                </Link>
              );
            }
            return (
              <div
                key={i}
                className="block"
                onClick={onActivate}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onActivate()}
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
