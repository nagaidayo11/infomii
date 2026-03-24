"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
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

export function PageLinksCard({ card, isSelected = false }: PageLinksCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = (c?.title as string) ?? "メニュー";
  const rawColumns = typeof c?.columns === "number" ? c.columns : Number(c?.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 3;
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

  return (
    <Card padding="md">
      <h3 className="mb-2.5 font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={title}
          onSave={(v) => update({ title: v })}
          editable={isSelected}
          onActivate={onActivate}
          className="text-slate-800"
          placeholder="タイトル"
        />
      </h3>
      <div
        className="grid auto-rows-min gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.length === 0 ? (
          <p className="col-span-full text-slate-500" style={getBodyFontSizeStyle()}>リンクを追加</p>
        ) : (
          items.map((item, i) => {
            const href = getHref(item);
            const iconDisplay = getIconDisplay(item.icon);
            const content = (
              <div className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-xl bg-slate-50/80 px-2 py-2 transition hover:bg-slate-100">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-700">
                  <LineIcon name={iconDisplay} className="h-4.5 w-4.5" />
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
                      placeholder="ラベル"
                    />
                  ) : (
                    (item.label ?? "項目")
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
