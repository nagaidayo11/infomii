"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { DESK_TONE } from "./desk-tone";

type NoticeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

/** Desk-board notice with soft amber/rose tint. */
export function NoticeCard({ card, locale = "ja" }: NoticeCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const body = getLocalizedContent(c?.body as LocalizedString | undefined, locale);
  const variant = (c?.variant as string) ?? "info";
  const isWarning = variant === "warning";
  const tone = DESK_TONE[isWarning ? "rose" : "amber"];
  const labels =
    locale === "ko"
      ? { eyebrow: isWarning ? "주의" : "안내", bodyPlaceholder: "본문", titlePlaceholder: "제목" }
      : locale === "zh"
        ? { eyebrow: isWarning ? "注意" : "通知", bodyPlaceholder: "正文", titlePlaceholder: "标题" }
        : locale === "en"
          ? { eyebrow: isWarning ? "Notice" : "Info", bodyPlaceholder: "Body", titlePlaceholder: "Title" }
          : { eyebrow: isWarning ? "ご注意" : "お知らせ", bodyPlaceholder: "本文", titlePlaceholder: "タイトル" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  if (isNativeUi) {
    return (
      <div
        className={`app-native-notice app-native-guest-card${isWarning ? " app-native-notice--warn" : ""}`}
        onClick={onActivate}
      >
        <p className="app-native-notice-eyebrow">{labels.eyebrow}</p>
        {(editable || title) ? (
          <p className="app-native-notice-title">
            <InlineEditable
              value={title}
              onSave={(v) => updateKey("title", v)}
              editable={editable}
              onActivate={onActivate}
              className="app-native-notice-title"
              placeholder={labels.titlePlaceholder}
            />
          </p>
        ) : null}
        <div className="app-native-notice-body">
          <InlineEditable
            value={body}
            onSave={(v) => updateKey("body", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className="block w-full min-h-[1lh] app-native-notice-body"
            placeholder={labels.bodyPlaceholder}
          />
        </div>
        {isWarning ? (
          <p className="mt-2 text-xs text-[var(--app-text-muted)]">
            {locale === "en"
              ? "Please follow hotel guidelines."
              : locale === "zh"
                ? "请遵守馆内规定。"
                : locale === "ko"
                  ? "호텔 안내를 확인해 주세요."
                  : "館内ルールにご協力ください。"}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Card padding="md" style={{ backgroundColor: tone.surface }}>
      <p className={"text-[11px] font-semibold uppercase tracking-[0.14em] " + tone.label}>{labels.eyebrow}</p>
      <div className={"mt-1.5 border-t-2 pt-2.5 " + tone.rule}>
        {(editable || title) ? (
          <p className={`${CARD_BLOCK_TITLE_CLASS} ${tone.title}`} style={getTitleFontSizeStyle()}>
            <InlineEditable
              value={title}
              onSave={(v) => updateKey("title", v)}
              editable={editable}
              onActivate={onActivate}
              className={`${CARD_BLOCK_TITLE_CLASS} ${tone.title}`}
              placeholder={labels.titlePlaceholder}
            />
          </p>
        ) : null}
        <div
          className={`min-w-0 whitespace-pre-line ${title || editable ? "mt-2" : ""} ${CARD_BLOCK_BODY_CLASS}`}
          style={getBodyFontSizeStyle()}
        >
          <InlineEditable
            value={body}
            onSave={(v) => updateKey("body", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className={`block w-full min-h-[1lh] ${CARD_BLOCK_BODY_CLASS}`}
            placeholder={labels.bodyPlaceholder}
          />
        </div>
      </div>
      {isWarning ? (
        <p className={`mt-2 ${CARD_BLOCK_CAPTION_CLASS} ${tone.label}`}>
          {locale === "en"
            ? "Please follow hotel guidelines."
            : locale === "zh"
              ? "请遵守馆内规定。"
              : locale === "ko"
                ? "호텔 안내를 확인해 주세요."
                : "館内ルールにご協力ください。"}
        </p>
      ) : null}
    </Card>
  );
}
