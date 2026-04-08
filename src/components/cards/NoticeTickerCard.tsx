"use client";

import { useMemo } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

type NoticeTickerCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type Speed = "slow" | "normal" | "fast";

const DURATION_BY_SPEED: Record<Speed, number> = {
  slow: 24,
  normal: 16,
  fast: 10,
};

export function NoticeTickerCard({ card }: NoticeTickerCardProps) {
  const content = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof content.title === "string" ? content.title : "お知らせ";
  const speed = content.speed === "slow" || content.speed === "fast" ? content.speed : "normal";
  const pauseOnHover = content.pauseOnHover !== false;
  const items = useMemo(
    () =>
      (Array.isArray(content.items) ? content.items : [])
        .filter((it): it is string => typeof it === "string" && it.trim().length > 0)
        .slice(0, 12),
    [content.items]
  );
  const line = items.join("   •   ");
  const shouldAnimate = line.length > 0;

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        {title}
      </p>
      <div
        className={`mt-3 overflow-hidden border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}
        style={getBodyFontSizeStyle()}
      >
        {shouldAnimate ? (
          <div>
            <div
              className={`whitespace-nowrap text-slate-700 ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
              style={{
                animation: `noticeTickerMarquee ${DURATION_BY_SPEED[speed]}s linear infinite`,
              }}
            >
              {line}{"   •   "}{line}
            </div>
          </div>
        ) : (
          <p className="text-slate-500">表示するお知らせを追加してください。</p>
        )}
      </div>
    </Card>
  );
}
