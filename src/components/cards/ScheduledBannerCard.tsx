"use client";

import { useEffect, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { isWithinSchedule, useServerNow } from "@/lib/server-time";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

export function ScheduledBannerCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const c = editor.content;
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
  if (!visible && !bind.editable) return null;
  return (
    <Card padding="none">
      <section
        data-inner-surface
        className={`${editorInnerRadiusClassName} flex flex-col gap-1.5 border border-violet-200 bg-violet-50 px-3 py-2.5`}
      >
        <p className="leading-snug text-violet-900" style={getTitleFontSizeStyle()}>
          <PlainInline
            value={title}
            onSave={(v) => editor.setPlainField("title", v)}
            bind={bind}
            className="leading-snug text-violet-900"
            placeholder="期間限定のお知らせ"
          />
        </p>
        <p className="text-sm leading-snug text-violet-800" style={getBodyFontSizeStyle()}>
          <PlainInline
            value={message}
            onSave={(v) => editor.setPlainField("message", v)}
            bind={bind}
            multiline
            className="block w-full min-h-[1lh] text-sm text-violet-800"
            placeholder="本文"
          />
        </p>
      </section>
    </Card>
  );
}
