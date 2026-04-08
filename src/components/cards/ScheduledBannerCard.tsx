"use client";

import { useEffect, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { isWithinSchedule, useServerNow } from "@/lib/server-time";

export function ScheduledBannerCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "期間限定のお知らせ";
  const message = typeof c.message === "string" ? c.message : "";
  const [now, setNow] = useState(() => Date.now()); // immediate paint fallback
  const serverNow = useServerNow();
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const startAtRaw = typeof c.startAt === "string" ? c.startAt : undefined;
  const endAtRaw = typeof c.endAt === "string" ? c.endAt : undefined;
  const visible = isWithinSchedule(serverNow || now, {
    startAt: startAtRaw,
    endAt: endAtRaw,
  });
  if (!visible) return null;
  return (
    <Card padding="md">
      <section className={`${editorInnerRadiusClassName} border border-violet-200 bg-violet-50 px-3 py-3`}>
        <p className="font-semibold text-violet-900" style={getTitleFontSizeStyle()}>{title}</p>
        <p className="mt-1 text-sm text-violet-800" style={getBodyFontSizeStyle()}>{message}</p>
      </section>
    </Card>
  );
}
