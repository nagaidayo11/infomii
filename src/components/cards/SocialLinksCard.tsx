"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { AppListRow, AppSectionHeader } from "@/components/app-shell/primitives";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";
import { NativeSocialIcon } from "./native-guest-icons";
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
  const { isNativeUi } = useClientShell();
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "SNS";
  const labelStyle = c.labelStyle === "icon" ? "icon" : "text";
  const items = (Array.isArray(c.items) ? c.items : []) as SocialItem[];

  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card" onClick={bind.onActivate}>
        {(bind.editable || title) ? (
          <AppSectionHeader
            title={
              bind.editable ? (
                <InlineEditable
                  value={title}
                  onSave={(v) => editor.setPlainField("title", v)}
                  editable={bind.editable}
                  onActivate={bind.onActivate}
                  className="app-section-header__title"
                  placeholder="SNS"
                />
              ) : (
                title
              )
            }
            icon={<NativeSocialIcon />}
            as="div"
          />
        ) : null}
        {items.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">SNSリンクを追加</p>
        ) : (
          <div className="app-native-social-list">
            {items.map((item, idx) => {
              const href = typeof item.href === "string" ? item.href : "";
              const platform = resolveSocialPlatform(item);
              const label = item.label || defaultLabelForPlatform(platform);
              const handle = item.handle || "";
              const rowTitle = handle || label;
              const leading = (
                <span
                  className={`app-native-social-icon ${socialPlatformTintClass(platform)}`}
                  aria-hidden
                >
                  <SocialPlatformIcon platform={platform} size={18} />
                </span>
              );

              if (bind.editable) {
                return (
                  <div key={idx} className="app-native-social-edit-row">
                    {leading}
                    <div className="min-w-0 flex-1 space-y-1">
                      <PlainInline
                        value={rowTitle}
                        onSave={(v) =>
                          editor.setArrayItemField(
                            "items",
                            idx,
                            handle ? "handle" : "label",
                            v,
                            false
                          )
                        }
                        bind={bind}
                        className="text-base font-medium text-[var(--app-text)]"
                        placeholder={handle ? "@account" : "ラベル"}
                      />
                      <PlainInline
                        value={href}
                        onSave={(v) => editor.setArrayItemField("items", idx, "href", v, false)}
                        bind={bind}
                        className="text-sm text-[var(--app-text-muted)]"
                        placeholder="https://"
                      />
                    </div>
                  </div>
                );
              }

              if (href) {
                const isExternal =
                  href.startsWith("http://") ||
                  href.startsWith("https://") ||
                  href.startsWith("mailto:") ||
                  href.startsWith("tel:");
                if (isExternal) {
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="app-list-row app-pressable flex min-h-[var(--app-tap-min)] w-full items-center gap-3 px-4 py-3 guest-page-link"
                    >
                      {leading}
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-base font-medium text-[var(--app-text)]">{rowTitle}</p>
                        {handle && label !== handle ? (
                          <p className="mt-0.5 truncate text-sm text-[var(--app-text-muted)]">{label}</p>
                        ) : null}
                      </div>
                      <svg
                        className="h-5 w-5 shrink-0 text-[var(--app-text-muted)] opacity-60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  );
                }
                return (
                  <AppListRow
                    key={idx}
                    href={href}
                    title={rowTitle}
                    subtitle={handle && label !== handle ? label : undefined}
                    leading={leading}
                    className="guest-page-link"
                  />
                );
              }

              return (
                <AppListRow
                  key={idx}
                  title={rowTitle}
                  subtitle={handle && label !== handle ? label : undefined}
                  leading={leading}
                  onClick={bind.onActivate}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

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
