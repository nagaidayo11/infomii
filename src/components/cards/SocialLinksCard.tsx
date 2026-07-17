"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";
import {
  SocialPlatformIcon,
  defaultLabelForPlatform,
  resolveSocialPlatform,
  socialPlatformTintClass,
  type SocialPlatform,
} from "./social-platform-icon";

type SocialItem = {
  platform?: SocialPlatform;
  label?: string;
  href?: string;
  handle?: string;
};

export function SocialLinksCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "SNS";
  const labelStyle = c.labelStyle === "icon" ? "icon" : "text";
  const items = (Array.isArray(c.items) ? c.items : []) as SocialItem[];

  return (
    <Card padding="md">
      <CardTitleInline
        title={title}
        onSave={(v) => editor.setPlainField("title", v)}
        placeholder="SNS"
        bind={bind}
      />
      <div className="mt-3 grid grid-cols-1 gap-2">
        {items.map((item, idx) => {
          const href = typeof item.href === "string" ? item.href : "";
          const platform = resolveSocialPlatform(item);
          const label = item.label || defaultLabelForPlatform(platform);
          const handle = item.handle || "";
          const inner = (
            <div
              data-inner-surface
              className={`${editorInnerRadiusClassName} flex flex-col gap-1 border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between`}
            >
              {labelStyle === "icon" ? (
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200/80 ${socialPlatformTintClass(platform)}`}
                    aria-label={label}
                  >
                    <SocialPlatformIcon platform={platform} size={18} />
                  </span>
                  <span className="min-w-0 text-sm font-medium text-slate-800" style={getBodyFontSizeStyle()}>
                    <PlainInline
                      value={handle || label}
                      onSave={(v) => editor.setArrayItemField("items", idx, "handle", v, false)}
                      bind={bind}
                      className="text-sm font-medium text-slate-800"
                      placeholder="@account"
                    />
                  </span>
                </span>
              ) : (
                <>
                  <span className="text-sm font-normal text-slate-800" style={getBodyFontSizeStyle()}>
                    <PlainInline
                      value={label}
                      onSave={(v) => editor.setArrayItemField("items", idx, "label", v, false)}
                      bind={bind}
                      className="text-sm text-slate-800"
                      placeholder="ラベル"
                    />
                  </span>
                  <span className="text-xs text-slate-500" style={getBodyFontSizeStyle()}>
                    <PlainInline
                      value={handle}
                      onSave={(v) => editor.setArrayItemField("items", idx, "handle", v, false)}
                      bind={bind}
                      className="text-xs text-slate-500"
                      placeholder="@account"
                    />
                  </span>
                </>
              )}
              {bind.editable ? (
                <PlainInline
                  value={href}
                  onSave={(v) => editor.setArrayItemField("items", idx, "href", v, false)}
                  bind={bind}
                  className="text-xs text-slate-400"
                  placeholder="https://"
                />
              ) : null}
            </div>
          );
          return href && !bind.editable ? (
            <a key={idx} href={href} target="_blank" rel="noreferrer">
              {inner}
            </a>
          ) : (
            <div key={idx}>{inner}</div>
          );
        })}
      </div>
    </Card>
  );
}
