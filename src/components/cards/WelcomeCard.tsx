"use client";

import { BRAND_ACCENT } from "@/lib/brand-accent";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { GUEST_CARD_PAD_SM_CLASS } from "@/lib/editor/card-width-mode";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { readWelcomeLayout } from "@/lib/editor/welcome-layout";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeHotelSection } from "./native-hotel-ui";

type WelcomeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function WelcomeCard({ card, locale = "ja" }: WelcomeCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const layout = readWelcomeLayout(c?.layout);
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : BRAND_ACCENT;
  const message = getLocalizedContent(c?.message as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { messagePlaceholder: "환영 메시지" }
      : locale === "zh"
        ? { messagePlaceholder: "欢迎信息" }
        : locale === "en"
          ? { messagePlaceholder: "Welcome message" }
          : { messagePlaceholder: "おもてなしメッセージ" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const titleEditable = (className: string) =>
    editable || title ? (
      <InlineEditable
        value={title}
        onSave={(v) => updateKey("title", v)}
        editable={editable}
        onActivate={onActivate}
        className={className}
      />
    ) : (
      title
    );

  const messageEditable = (className: string) => (
    <InlineEditable
      value={message}
      onSave={(v) => updateKey("message", v)}
      editable={editable}
      onActivate={onActivate}
      multiline
      className={className}
      placeholder={labels.messagePlaceholder}
    />
  );

  if (isNativeUi) {
    if (layout === "plain") {
      return (
        <section className="pres-welcome pres-welcome--plain" onClick={onActivate}>
          {(editable || title) ? (
            <h3 className="pres-welcome__title">{titleEditable("pres-welcome__title")}</h3>
          ) : null}
          <div className="pres-welcome__body">{messageEditable("block w-full min-h-[1lh]")}</div>
        </section>
      );
    }
    if (layout === "quote") {
      return (
        <section
          className="pres-welcome pres-welcome--quote"
          style={{ ["--pres-accent" as string]: accent }}
          onClick={onActivate}
        >
          {(editable || title) ? (
            <h3 className="pres-welcome__title">{titleEditable("pres-welcome__title")}</h3>
          ) : null}
          <div className="pres-welcome__body">{messageEditable("block w-full min-h-[1lh]")}</div>
        </section>
      );
    }
    return (
      <NativeHotelSection title={titleEditable("app-section-header__title")} onActivate={onActivate}>
        <div className="app-native-text-block">{messageEditable("block w-full min-h-[1lh]")}</div>
      </NativeHotelSection>
    );
  }

  if (layout === "plain") {
    return (
      <section className="pres-block pres-welcome pres-welcome--plain">
        {(editable || title) ? (
          <h3 className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
            {titleEditable(CARD_BLOCK_TITLE_CLASS)}
          </h3>
        ) : null}
        <div className={`mt-2 ${CARD_BLOCK_BODY_CLASS}`} style={getBodyFontSizeStyle()}>
          {messageEditable(`block w-full min-h-[1lh] ${CARD_BLOCK_BODY_CLASS}`)}
        </div>
      </section>
    );
  }

  if (layout === "quote") {
    return (
      <section
        className="pres-block pres-welcome pres-welcome--quote"
        style={{ ["--pres-accent" as string]: accent }}
      >
        {(editable || title) ? (
          <h3 className="pres-welcome__title" style={getTitleFontSizeStyle()}>
            {titleEditable("pres-welcome__title")}
          </h3>
        ) : null}
        <div className="pres-welcome__body" style={getBodyFontSizeStyle()}>
          {messageEditable("block w-full min-h-[1lh] pres-welcome__body")}
        </div>
      </section>
    );
  }

  return (
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          {titleEditable(CARD_BLOCK_TITLE_CLASS)}
        </p>
      ) : null}
      <div
        data-inner-surface
        className={`mt-2 ${GUEST_CARD_PAD_SM_CLASS} ${editorInnerRadiusClassName} bg-slate-50/80 ${CARD_BLOCK_BODY_CLASS}`}
        style={getBodyFontSizeStyle()}
      >
        {messageEditable(`block w-full min-h-[1lh] ${CARD_BLOCK_BODY_CLASS}`)}
      </div>
    </Card>
  );
}
