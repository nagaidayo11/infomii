"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getBodyFontSizeStyle,
  getTitleFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { GUEST_CARD_PAD_CLASS } from "@/lib/editor/card-width-mode";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeWifiIcon } from "./native-guest-icons";
import { NativeHotelSection, NativeKvList, NativeKvRow } from "./native-hotel-ui";

type WifiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function WifiCard({ card, isSelected, locale = "ja" }: WifiCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const ssid = getLocalizedContent(c?.ssid as LocalizedString | undefined, locale);
  const password = getLocalizedContent(c?.password as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { title: "와이파이", ssid: "SSID", password: "비밀번호", desc: "설명(선택)" }
      : locale === "zh"
        ? { title: "Wi-Fi", ssid: "SSID", password: "密码", desc: "说明（可选）" }
        : locale === "en"
          ? { title: "Wi-Fi", ssid: "SSID", password: "Password", desc: "Description (optional)" }
          : { title: "WiFi", ssid: "SSID", password: "パスワード", desc: "説明（任意）" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const titleNode = (editable || title) ? (
    <InlineEditable
      value={title}
      onSave={(v) => updateKey("title", v)}
      editable={editable}
      onActivate={onActivate}
      className="app-section-header__title"
      placeholder={labels.title}
    />
  ) : (
    title || labels.title
  );

  if (isNativeUi) {
    return (
      <NativeHotelSection title={titleNode} icon={<NativeWifiIcon />} onActivate={onActivate}>
        <NativeKvList>
          <NativeKvRow label={labels.ssid}>
            <InlineEditable
              value={ssid}
              onSave={(v) => updateKey("ssid", v)}
              editable={editable}
              onActivate={onActivate}
              placeholder={labels.ssid}
            />
          </NativeKvRow>
          <NativeKvRow label={labels.password}>
            <InlineEditable
              value={password}
              onSave={(v) => updateKey("password", v)}
              editable={editable}
              onActivate={onActivate}
              className="font-mono"
              placeholder={labels.password}
            />
          </NativeKvRow>
        </NativeKvList>
        {(isSelected || description.trim().length > 0 || editable) ? (
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            <InlineEditable
              value={description}
              onSave={(v) => updateKey("description", v)}
              editable={editable}
              onActivate={onActivate}
              multiline
              className="block w-full min-h-[1lh] text-sm text-[var(--app-text-muted)]"
              placeholder={labels.desc}
            />
          </p>
        ) : null}
      </NativeHotelSection>
    );
  }

  return (
    <Card padding="none" className="">
      <div
        data-inner-surface
        className={`flex flex-col gap-1.5 ${GUEST_CARD_PAD_CLASS} ${editorInnerRadiusClassName} bg-slate-50`}
      >
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
      <p className={CARD_BLOCK_BODY_CLASS} style={getBodyFontSizeStyle()}>
        {labels.ssid}:{" "}
        <InlineEditable
          value={ssid}
          onSave={(v) => updateKey("ssid", v)}
          editable={editable}
          onActivate={onActivate}
          className={CARD_BLOCK_BODY_CLASS}
          placeholder={labels.ssid}
        />
      </p>
      <p className={`${CARD_BLOCK_BODY_CLASS} font-mono`} style={getBodyFontSizeStyle()}>
        {labels.password}:{" "}
        <InlineEditable
          value={password}
          onSave={(v) => updateKey("password", v)}
          editable={editable}
          onActivate={onActivate}
          className={`${CARD_BLOCK_BODY_CLASS} font-mono`}
          placeholder={labels.password}
        />
      </p>
      {(isSelected || description.trim().length > 0) && (
        <p className={CARD_BLOCK_CAPTION_CLASS}>
          <InlineEditable
            value={description}
            onSave={(v) => updateKey("description", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className={`block w-full min-h-[1lh] ${CARD_BLOCK_CAPTION_CLASS}`}
            placeholder={labels.desc}
          />
        </p>
      )}
      </div>
    </Card>
  );
}
