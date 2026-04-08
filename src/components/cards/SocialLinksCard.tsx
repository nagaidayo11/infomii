"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

export function SocialLinksCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "SNS";
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ label?: string; href?: string; handle?: string }>;
  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {items.map((item, idx) => {
          const href = typeof item.href === "string" ? item.href : "";
          const label = item.label || `SNS ${idx + 1}`;
          const handle = item.handle || "";
          const inner = (
            <div className={`${editorInnerRadiusClassName} flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2`}>
              <span className="text-sm font-medium text-slate-800" style={getBodyFontSizeStyle()}>{label}</span>
              <span className="text-xs text-slate-500" style={getBodyFontSizeStyle()}>{handle}</span>
            </div>
          );
          return href ? <a key={idx} href={href} target="_blank" rel="noreferrer">{inner}</a> : <div key={idx}>{inner}</div>;
        })}
      </div>
    </Card>
  );
}
