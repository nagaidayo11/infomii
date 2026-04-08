"use client";

import { useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

type CouponCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function CouponCard({ card }: CouponCardProps) {
  const content = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof content.title === "string" ? content.title : "クーポン";
  const code = typeof content.code === "string" ? content.code : "";
  const expiryText = typeof content.expiryText === "string" ? content.expiryText : "";
  const notes = typeof content.notes === "string" ? content.notes : "";
  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel : "";
  const ctaUrl = typeof content.ctaUrl === "string" ? content.ctaUrl : "";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code.trim()) return;
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        {title}
      </p>
      <div className={`mt-3 border border-amber-300 bg-amber-50 px-3 py-3 ${editorInnerRadiusClassName}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700" style={getBodyFontSizeStyle()}>
          クーポンコード
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="font-mono text-lg font-bold text-amber-900" style={getBodyFontSizeStyle()}>
            {code || "CODE"}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 ${editorInnerRadiusClassName}`}
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        </div>
        {expiryText ? (
          <p className="mt-2 text-xs text-amber-800" style={getBodyFontSizeStyle()}>
            {expiryText}
          </p>
        ) : null}
      </div>
      {notes ? (
        <p className="mt-2 whitespace-pre-line text-slate-600" style={getBodyFontSizeStyle()}>
          {notes}
        </p>
      ) : null}
      {ctaLabel && ctaUrl ? (
        <a
          href={ctaUrl}
          target={ctaUrl.startsWith("/") ? undefined : "_blank"}
          rel={ctaUrl.startsWith("/") ? undefined : "noreferrer"}
          className={`mt-3 inline-flex bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 ${editorInnerRadiusClassName}`}
          style={getBodyFontSizeStyle()}
        >
          {ctaLabel}
        </a>
      ) : null}
    </Card>
  );
}
