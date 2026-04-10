"use client";

import { useEffect, useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

function formatPart(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function CampaignTimerCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const content = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof content.title === "string" ? content.title : "キャンペーン";
  const description = typeof content.description === "string" ? content.description : "";
  const startAt = toDate(content.startAt);
  const endAt = toDate(content.endAt);
  const hideBeforeStart = content.hideBeforeStart === true;
  const hideAfterEnd = content.hideAfterEnd === true;
  const showSeconds = content.showSeconds !== false;
  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel : "";
  const ctaUrl = typeof content.ctaUrl === "string" ? content.ctaUrl : "";

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const invalidRange = startAt && endAt ? endAt.getTime() < startAt.getTime() : false;

  const state = useMemo(() => {
    if (invalidRange) return "invalid" as const;
    if (!startAt || !endAt) return "missing" as const;
    if (now < startAt.getTime()) return "before" as const;
    if (now > endAt.getTime()) return "after" as const;
    return "during" as const;
  }, [invalidRange, startAt, endAt, now]);

  if ((state === "before" && hideBeforeStart) || (state === "after" && hideAfterEnd)) {
    return null;
  }

  const targetMs = state === "before" ? startAt?.getTime() ?? 0 : state === "during" ? endAt?.getTime() ?? 0 : 0;
  const diff = Math.max(0, targetMs - now);
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const statusLabel =
    state === "before"
      ? "開始まで"
      : state === "during"
        ? "終了まで"
        : state === "after"
          ? "キャンペーン終了"
          : state === "invalid"
            ? "期間設定を確認してください"
            : "期間設定が未完了です";

  return (
    <Card padding="none">
      <section
        data-inner-surface
        className={`${editorInnerRadiusClassName} flex flex-col gap-3 overflow-hidden border border-amber-200 bg-amber-50/80 px-3 py-2.5`}
      >
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold leading-snug text-amber-900" style={getTitleFontSizeStyle()}>{title}</p>
          {description ? (
            <p className="text-sm leading-snug text-amber-900/90" style={getBodyFontSizeStyle()}>{description}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-amber-800" style={getBodyFontSizeStyle()}>{statusLabel}</p>
          {(state === "before" || state === "during") && (
            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-amber-900" style={getBodyFontSizeStyle()}>
              <span>{days}d</span>
              <span>{formatPart(hours)}h</span>
              <span>{formatPart(minutes)}m</span>
              {showSeconds ? <span>{formatPart(seconds)}s</span> : null}
            </div>
          )}
        </div>
        {ctaLabel && ctaUrl ? (
          <a
            href={ctaUrl}
            target={ctaUrl.startsWith("/") ? undefined : "_blank"}
            rel={ctaUrl.startsWith("/") ? undefined : "noreferrer"}
            className={`inline-flex ${editorInnerRadiusClassName} bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800`}
            style={getBodyFontSizeStyle()}
          >
            {ctaLabel}
          </a>
        ) : null}
      </section>
    </Card>
  );
}
