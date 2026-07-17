"use client";

import { useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";
import { NativeDiningIcon } from "./native-guest-icons";
import { NativeHotelSection } from "./native-hotel-ui";

type CouponCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function CouponCard({ card }: CouponCardProps) {
  const editor = useCardContentEditor(card);
  const { isNativeUi } = useClientShell();
  const resolveGuestHref = useGuestPageHref();
  const content = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof content.title === "string" ? content.title : "クーポン";
  const code = typeof content.code === "string" ? content.code : "";
  const expiryText = typeof content.expiryText === "string" ? content.expiryText : "";
  const notes = typeof content.notes === "string" ? content.notes : "";
  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel : "";
  const ctaUrl = typeof content.ctaUrl === "string" ? content.ctaUrl : "";
  const ctaBgColor =
    typeof content.ctaBgColor === "string" && content.ctaBgColor.trim()
      ? content.ctaBgColor
      : "#0f172a";
  const ctaTextColor =
    typeof content.ctaTextColor === "string" && content.ctaTextColor.trim()
      ? content.ctaTextColor
      : "#ffffff";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code.trim() || bind.editable) return;
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (isNativeUi) {
    const titleNode =
      bind.editable || title.trim() ? (
        <InlineEditable
          value={title}
          onSave={(v) => editor.setPlainField("title", v)}
          editable={bind.editable}
          onActivate={bind.onActivate}
          className="app-section-header__title"
          placeholder="クーポン"
        />
      ) : (
        title
      );

    return (
      <NativeHotelSection title={titleNode} icon={<NativeDiningIcon />} onActivate={bind.onActivate}>
        <div className="app-native-coupon">
          <p className="text-xs font-normal uppercase tracking-wide text-[var(--app-text-muted)]">クーポンコード</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="app-native-coupon-code">
              <PlainInline
                value={code || "CODE"}
                onSave={(v) => editor.setPlainField("code", v)}
                bind={bind}
                className="app-native-coupon-code"
                placeholder="CODE"
              />
            </p>
            {!bind.editable ? (
              <button type="button" onClick={handleCopy} className="app-native-coupon-copy">
                {copied ? "コピー済み" : "コピー"}
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-[var(--app-text-muted)]">
            <PlainInline
              value={expiryText}
              onSave={(v) => editor.setPlainField("expiryText", v)}
              bind={bind}
              className="text-xs text-[var(--app-text-muted)]"
              placeholder="有効期限"
            />
          </p>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm text-[var(--app-text-muted)]">
          <PlainInline
            value={notes}
            onSave={(v) => editor.setPlainField("notes", v)}
            bind={bind}
            multiline
            className="block w-full min-h-[1lh] whitespace-pre-line text-sm text-[var(--app-text-muted)]"
            placeholder="利用条件など"
          />
        </p>
        {ctaLabel.trim() || bind.editable ? (
          bind.editable ? (
            <div className="mt-3 space-y-1">
              <PlainInline
                value={ctaLabel}
                onSave={(v) => editor.setPlainField("ctaLabel", v)}
                bind={bind}
                className="text-sm font-semibold text-[var(--app-text)]"
                placeholder="ボタン文言"
              />
              <PlainInline
                value={ctaUrl}
                onSave={(v) => editor.setPlainField("ctaUrl", v)}
                bind={bind}
                className="text-xs text-[var(--app-text-muted)]"
                placeholder="リンクURL"
              />
            </div>
          ) : ctaUrl.trim() ? (
            <a
              href={resolveGuestHref(ctaUrl)}
              target={ctaUrl.startsWith("/") ? undefined : "_blank"}
              rel={ctaUrl.startsWith("/") ? undefined : "noreferrer"}
              className="app-native-cta mt-3"
              style={{
                backgroundColor: ctaBgColor,
                color: ctaTextColor,
              }}
            >
              {ctaLabel}
            </a>
          ) : (
            <button
              type="button"
              className="app-native-cta mt-3"
              style={{
                backgroundColor: ctaBgColor,
                color: ctaTextColor,
              }}
            >
              {ctaLabel}
            </button>
          )
        ) : null}
      </NativeHotelSection>
    );
  }

  return (
    <Card padding="md">
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        <PlainInline
          value={title}
          onSave={(v) => editor.setPlainField("title", v)}
          bind={bind}
          className={CARD_BLOCK_TITLE_CLASS}
          placeholder="クーポン"
        />
      </p>
      <div
        data-inner-surface
        className={`mt-3 border border-amber-300 bg-amber-50 px-3 py-3 ${editorInnerRadiusClassName}`}
      >
        <p className="text-xs font-normal uppercase tracking-wide text-amber-700" style={getBodyFontSizeStyle()}>
          クーポンコード
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="font-mono text-lg font-bold text-amber-900" style={getBodyFontSizeStyle()}>
            <PlainInline
              value={code || "CODE"}
              onSave={(v) => editor.setPlainField("code", v)}
              bind={bind}
              className="font-mono text-lg font-bold text-amber-900"
              placeholder="CODE"
            />
          </p>
          {!bind.editable ? (
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 border border-amber-300 bg-white px-2 py-1 text-xs font-normal text-amber-800 hover:bg-amber-100 ${editorInnerRadiusClassName}`}
            >
              {copied ? "コピー済み" : "コピー"}
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-amber-800" style={getBodyFontSizeStyle()}>
          <PlainInline
            value={expiryText}
            onSave={(v) => editor.setPlainField("expiryText", v)}
            bind={bind}
            className="text-xs text-amber-800"
            placeholder="有効期限"
          />
        </p>
      </div>
      <p className="mt-2 whitespace-pre-line text-slate-600" style={getBodyFontSizeStyle()}>
        <PlainInline
          value={notes}
          onSave={(v) => editor.setPlainField("notes", v)}
          bind={bind}
          multiline
          className="block w-full min-h-[1lh] whitespace-pre-line text-slate-600"
          placeholder="利用条件など"
        />
      </p>
      {ctaLabel.trim() || bind.editable ? (
        bind.editable ? (
          <div className="mt-3 space-y-1">
            <PlainInline
              value={ctaLabel}
              onSave={(v) => editor.setPlainField("ctaLabel", v)}
              bind={bind}
              className="text-sm font-semibold text-slate-800"
              placeholder="ボタン文言"
            />
            <PlainInline
              value={ctaUrl}
              onSave={(v) => editor.setPlainField("ctaUrl", v)}
              bind={bind}
              className="text-xs text-slate-500"
              placeholder="リンクURL"
            />
          </div>
        ) : ctaUrl.trim() ? (
          <a
            href={resolveGuestHref(ctaUrl)}
            target={ctaUrl.startsWith("/") ? undefined : "_blank"}
            rel={ctaUrl.startsWith("/") ? undefined : "noreferrer"}
            className={`mt-3 inline-flex px-3 py-2 text-sm font-semibold ${editorInnerRadiusClassName}`}
            style={{
              ...getBodyFontSizeStyle(),
              backgroundColor: ctaBgColor,
              color: ctaTextColor,
            }}
          >
            {ctaLabel}
          </a>
        ) : (
          <button
            type="button"
            className={`mt-3 inline-flex px-3 py-2 text-sm font-semibold ${editorInnerRadiusClassName}`}
            style={{
              ...getBodyFontSizeStyle(),
              backgroundColor: ctaBgColor,
              color: ctaTextColor,
            }}
          >
            {ctaLabel}
          </button>
        )
      ) : null}
    </Card>
  );
}
