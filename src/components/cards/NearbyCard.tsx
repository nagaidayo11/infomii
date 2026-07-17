"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useCardInlineEdit } from "./card-inline-edit";
import { LabelItemStack, LabelItemSurface } from "./label-item-surface";

type NearbyItem = { name?: string; description?: string; link?: string };

type NearbyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function NearbyCard({ card, locale = "ja" }: NearbyCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? {
          title: "주변 안내",
          detail: "상세",
          empty: "주변 명소를 추가할 수 있습니다",
          namePlaceholder: "명소명",
          descriptionPlaceholder: "설명",
          linkPlaceholder: "https://",
        }
      : locale === "zh"
        ? {
            title: "周边信息",
            detail: "详情",
            empty: "可添加周边景点",
            namePlaceholder: "景点名称",
            descriptionPlaceholder: "说明",
            linkPlaceholder: "https://",
          }
        : locale === "en"
          ? {
              title: "Nearby Info",
              detail: "Details",
              empty: "You can add nearby spots",
              namePlaceholder: "Spot name",
              descriptionPlaceholder: "Description",
              linkPlaceholder: "https://",
            }
          : {
              title: "周辺案内",
              detail: "詳細",
              empty: "周辺スポットを追加できます",
              namePlaceholder: "スポット名",
              descriptionPlaceholder: "説明",
              linkPlaceholder: "https://",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(c?.items) ? c.items : []) as NearbyItem[];

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const updateItem = (index: number, field: keyof NearbyItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    updateCard(card.id, { content: { ...c, items: next } });
  };

  return (
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.title}
          />
        </p>
      ) : null}
      {items.length > 0 ? (
        <LabelItemStack>
          {items.map((item, i) => (
            <LabelItemSurface key={i}>
              {(editable || item.name) ? (
                <p className="font-semibold leading-snug text-slate-800" style={getBodyFontSizeStyle()}>
                  <InlineEditable
                    value={item.name ?? ""}
                    onSave={(v) => updateItem(i, "name", v)}
                    editable={editable}
                    onActivate={onActivate}
                    className="font-semibold text-slate-800"
                    placeholder={labels.namePlaceholder}
                  />
                </p>
              ) : null}
              {(editable || item.description) ? (
                <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                  <InlineEditable
                    value={item.description ?? ""}
                    onSave={(v) => updateItem(i, "description", v)}
                    editable={editable}
                    onActivate={onActivate}
                    multiline
                    className="block w-full min-h-[1lh] text-slate-500"
                    placeholder={labels.descriptionPlaceholder}
                  />
                </p>
              ) : null}
              {editable ? (
                <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
                  <InlineEditable
                    value={item.link ?? ""}
                    onSave={(v) => updateItem(i, "link", v)}
                    editable={editable}
                    onActivate={onActivate}
                    className="text-slate-600"
                    placeholder={labels.linkPlaceholder}
                  />
                </p>
              ) : item.link ? (
                <a
                  href={resolveGuestHref(item.link)}
                  className="mt-1 inline-block font-normal text-slate-600 underline"
                  style={getBodyFontSizeStyle()}
                >
                  {labels.detail}
                </a>
              ) : null}
            </LabelItemSurface>
          ))}
        </LabelItemStack>
      ) : (
        <p className="mt-2 text-slate-500" style={getBodyFontSizeStyle()}>
          {labels.empty}
        </p>
      )}
    </Card>
  );
}
