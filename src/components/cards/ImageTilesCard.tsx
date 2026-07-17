"use client";

import Link from "next/link";
import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import {
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeTilesIcon } from "./native-guest-icons";

type TileItem = {
  src?: string;
  label?: string;
  alt?: string;
  linkType?: "page" | "url";
  pageSlug?: string;
  link?: string;
};

type ImageTilesCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

/**
 * 2-column image tiles with labels (facility showcase grid).
 * Inset matches text blocks (`px-3`); hero stays full-bleed separately.
 */
export function ImageTilesCard({ card, locale = "ja" }: ImageTilesCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const content = card.content as Record<string, unknown>;
  const title = getLocalizedContent(content?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(content?.items) ? content.items : []) as TileItem[];
  const rawColumns = typeof content?.columns === "number" ? content.columns : Number(content?.columns);
  const columns = rawColumns === 2 || rawColumns === 3 ? rawColumns : 2;
  const labels =
    locale === "ko"
      ? { emptyImage: "이미지", titlePlaceholder: "시설 안내", labelPlaceholder: "라벨" }
      : locale === "zh"
        ? { emptyImage: "图片", titlePlaceholder: "设施介绍", labelPlaceholder: "标签" }
        : locale === "en"
          ? { emptyImage: "Image", titlePlaceholder: "Facilities", labelPlaceholder: "Label" }
          : { emptyImage: "画像", titlePlaceholder: "施設案内", labelPlaceholder: "ラベル" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = content?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...content, [key]: next } });
  };

  const updateItems = (next: TileItem[]) => {
    updateCard(card.id, { content: { ...content, items: next } });
  };

  const getHref = (item: TileItem): string => {
    const linkType = item.linkType ?? "page";
    if (linkType === "url" && item.link) return item.link;
    if (linkType === "page" && item.pageSlug) {
      return resolveGuestHref(`/v/${item.pageSlug}`);
    }
    return "#";
  };

  const isExternal = (item: TileItem): boolean => {
    const href = getHref(item);
    return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:");
  };

  const renderTileBody = (item: TileItem, i: number, label: string) => (
    <>
      <div
        data-inner-surface={!isNativeUi ? true : undefined}
        className={
          isNativeUi
            ? "app-native-tile-media"
            : `relative aspect-[4/3] overflow-hidden ${editorInnerRadiusClassName} bg-slate-100`
        }
      >
        {item?.src ? (
          <EditorCoverImage
            src={item.src}
            alt={label}
            sizes="200px"
            className="object-cover object-center"
          />
        ) : (
          <div
            className={
              isNativeUi
                ? "flex h-full items-center justify-center text-[var(--app-text-muted)]"
                : "flex h-full items-center justify-center text-slate-400"
            }
            style={getBodyFontSizeStyle()}
          >
            {labels.emptyImage}
          </div>
        )}
      </div>
      <div className={isNativeUi ? "app-native-tile-label" : "mt-1.5 px-0.5"}>
        {editable ? (
          <InlineEditable
            value={label}
            onSave={(v) => {
              const next = [...items];
              next[i] = { ...item, label: v };
              updateItems(next);
            }}
            editable={editable}
            onActivate={onActivate}
            className={
              isNativeUi
                ? "text-sm font-semibold text-[var(--app-text)]"
                : "text-sm font-medium text-slate-800"
            }
            placeholder={labels.labelPlaceholder}
          />
        ) : (
          <p
            className={
              isNativeUi
                ? "truncate text-sm font-semibold text-[var(--app-text)]"
                : "truncate text-sm font-medium text-slate-800"
            }
            style={getBodyFontSizeStyle()}
          >
            {label}
          </p>
        )}
      </div>
    </>
  );

  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card" onClick={onActivate}>
        {(editable || title) ? (
          <AppSectionHeader
            title={
              editable ? (
                <InlineEditable
                  value={title}
                  onSave={(v) => updateKey("title", v)}
                  editable={editable}
                  onActivate={onActivate}
                  className="app-section-header__title"
                  placeholder={labels.titlePlaceholder}
                />
              ) : (
                title
              )
            }
            icon={<NativeTilesIcon />}
            as="div"
          />
        ) : null}

        <div
          className="app-native-tile-grid"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {items.slice(0, 12).map((item, i) => {
            const href = getHref(item);
            const label =
              getLocalizedContent(item.label as LocalizedString | undefined, locale) ||
              getLocalizedContent(item.alt as LocalizedString | undefined, locale) ||
              labels.labelPlaceholder;
            const tile = renderTileBody(item, i, label);

            if (editable || href === "#") {
              return (
                <div
                  key={i}
                  className="min-w-0"
                  onClick={(e) => {
                    if (editable) e.preventDefault();
                  }}
                >
                  {tile}
                </div>
              );
            }

            if (isExternal(item)) {
              return (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 active:opacity-90"
                >
                  {tile}
                </a>
              );
            }

            return (
              <Link key={i} href={href} className="guest-page-link min-w-0 active:opacity-90">
                {tile}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card padding="md">
      {(editable || title) ? (
        <p className={`mb-3 ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePlaceholder}
          />
        </p>
      ) : null}

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.slice(0, 12).map((item, i) => {
          const href = getHref(item);
          const label =
            getLocalizedContent(item.label as LocalizedString | undefined, locale) ||
            getLocalizedContent(item.alt as LocalizedString | undefined, locale) ||
            labels.labelPlaceholder;
          const tile = renderTileBody(item, i, label);

          if (editable || href === "#") {
            return (
              <div
                key={i}
                className="min-w-0"
                onClick={(e) => {
                  if (editable) e.preventDefault();
                }}
              >
                {tile}
              </div>
            );
          }

          if (isExternal(item)) {
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 active:opacity-90"
              >
                {tile}
              </a>
            );
          }

          return (
            <Link key={i} href={href} className="guest-page-link min-w-0 active:opacity-90">
              {tile}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
