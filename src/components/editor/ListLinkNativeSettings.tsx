"use client";

import { useState, type ReactNode } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppOptionCard,
  AppOptionCardRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
import {
  SOCIAL_PLATFORM_OPTIONS,
  defaultLabelForPlatform,
  isSocialPlatform,
  resolveSocialPlatform,
} from "@/components/cards/social-platform-icon";

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

function writeJaTextPreserving(prev: unknown, value: string): string | LocalizedString {
  if (typeof prev === "object" && prev !== null && !Array.isArray(prev) && ("ja" in prev || "en" in prev)) {
    return { ...(prev as Record<string, string>), ja: value };
  }
  return value;
}

type NearbyItem = { name?: string; description?: string; link?: string };

export function NearbyNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as NearbyItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const setItems = (next: NearbyItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof NearbyItem, value: string) => {
    const next = [...items];
    next[index] = {
      ...(next[index] ?? {}),
      [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value),
    };
    setItems(next);
  };

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイトル</AppFieldLabel>
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="周辺案内" />
      </div>
      <div>
        <AppSectionHeader
          title="スポット"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [...items, { name: "新規スポット", description: "", link: "" }];
                setItems(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">スポットを追加してください</p>
          ) : (
            items.map((item, i) => {
              const expanded = expandedIndex === i;
              const name = readJaText(item.name) || `スポット ${i + 1}`;
              const desc = readJaText(item.description);
              return (
                <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={name}
                    subtitle={desc || readJaText(item.link) || undefined}
                    onClick={() => setExpandedIndex(expanded ? null : i)}
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="app-native-settings-action app-native-settings-action--danger"
                          onClick={() => {
                            setItems(items.filter((_, idx) => idx !== i));
                            setExpandedIndex(null);
                          }}
                        >
                          削除
                        </button>
                      </div>
                      <div>
                        <AppFieldLabel>名前</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.name)}
                          onChange={(e) => updateItem(i, "name", e.target.value)}
                          placeholder="スポット名"
                        />
                      </div>
                      <div>
                        <AppFieldLabel>説明</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.description)}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                          placeholder="任意"
                        />
                      </div>
                      <div>
                        <AppFieldLabel>リンクURL</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.link)}
                          onChange={(e) => updateItem(i, "link", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

type SocialItem = {
  platform?: string;
  label?: string;
  href?: string;
  handle?: string;
};

export function SocialLinksNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as SocialItem[];
  const labelStyle = content.labelStyle === "icon" ? "icon" : "text";
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const setItems = (next: SocialItem[]) => onUpdate("items", next);

  const updateItem = (index: number, field: keyof SocialItem, value: string) => {
    const next = [...items];
    const prev = { ...(next[index] ?? {}) };
    if (field === "platform") {
      prev.platform = value;
      const platformLabel = defaultLabelForPlatform(isSocialPlatform(value) ? value : "other");
      const currentLabel = (prev.label ?? "").trim();
      if (!currentLabel || SOCIAL_PLATFORM_OPTIONS.some((o) => o.label === currentLabel)) {
        prev.label = platformLabel;
      }
    } else {
      prev[field] = writeJaTextPreserving((prev as Record<string, unknown>)[field], value) as string;
    }
    next[index] = prev;
    setItems(next);
  };

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイトル</AppFieldLabel>
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="公式SNS" />
      </div>

      <div>
        <AppSectionHeader title="表示スタイル" as="p" />
        <AppOptionCardRow className="mt-2" aria-label="SNS項目の表示">
          <AppOptionCard
            label="テキスト"
            selected={labelStyle === "text"}
            onClick={() => onUpdate("labelStyle", "text")}
          />
          <AppOptionCard
            label="アイコン"
            selected={labelStyle === "icon"}
            onClick={() => onUpdate("labelStyle", "icon")}
          />
        </AppOptionCardRow>
        <p className="mt-1.5 text-xs text-[var(--app-text-muted)]">
          アイコンは公式ロゴではなく、各SNSを示すオリジナルアイコンです。
        </p>
      </div>

      <div>
        <AppSectionHeader
          title="SNS項目"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [...items, { platform: "other", label: "", href: "", handle: "" }];
                setItems(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">SNSを追加してください</p>
          ) : (
            items.map((item, i) => {
              const expanded = expandedIndex === i;
              const platform = resolveSocialPlatform(item);
              const rowTitle =
                (item.handle || "").trim() ||
                (item.label || "").trim() ||
                defaultLabelForPlatform(platform);
              return (
                <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={rowTitle}
                    subtitle={defaultLabelForPlatform(platform)}
                    onClick={() => setExpandedIndex(expanded ? null : i)}
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="app-native-settings-action app-native-settings-action--danger"
                          onClick={() => {
                            setItems(items.filter((_, idx) => idx !== i));
                            setExpandedIndex(null);
                          }}
                        >
                          削除
                        </button>
                      </div>
                      <div>
                        <AppFieldLabel>SNS</AppFieldLabel>
                        <select
                          aria-label={`SNS ${i + 1}`}
                          value={platform}
                          onChange={(e) => updateItem(i, "platform", e.target.value)}
                          className="app-field-input"
                        >
                          {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {labelStyle === "text" ? (
                        <div>
                          <AppFieldLabel>名称</AppFieldLabel>
                          <AppFieldInput
                            value={item.label ?? ""}
                            onChange={(e) => updateItem(i, "label", e.target.value)}
                            placeholder="Instagram"
                          />
                        </div>
                      ) : null}
                      <div>
                        <AppFieldLabel>ハンドル</AppFieldLabel>
                        <AppFieldInput
                          value={item.handle ?? ""}
                          onChange={(e) => updateItem(i, "handle", e.target.value)}
                          placeholder="@example"
                        />
                      </div>
                      <div>
                        <AppFieldLabel>URL</AppFieldLabel>
                        <AppFieldInput
                          value={item.href ?? ""}
                          onChange={(e) => updateItem(i, "href", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

type InfoRowItem = { label?: string; value?: string; show?: boolean; tel?: boolean; key?: string };

const INFO_TONES = [
  { value: "slate", label: "標準" },
  { value: "amber", label: "アンバー" },
  { value: "sky", label: "スカイ" },
  { value: "emerald", label: "エメラルド" },
  { value: "rose", label: "ローズ" },
] as const;

export function InfoNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
  iconSelect,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  title: string;
  onTitleChange: (value: string) => void;
  iconSelect?: ReactNode;
}) {
  const rows = (Array.isArray(content.rows) ? content.rows : []) as InfoRowItem[];
  const tone = String(content.tone ?? "slate");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(rows.length > 0 ? 0 : null);
  const setRows = (next: InfoRowItem[]) => onUpdate("rows", next);
  const updateRow = (index: number, field: keyof InfoRowItem, value: string | boolean) => {
    const next = [...rows];
    const prev = { ...(next[index] ?? {}) };
    if (field === "show" || field === "tel") {
      (prev as Record<string, unknown>)[field] = value;
    } else {
      (prev as Record<string, unknown>)[field] = writeJaTextPreserving(
        (prev as Record<string, unknown>)[field],
        String(value)
      );
    }
    next[index] = prev;
    setRows(next);
  };

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel>タイトル</AppFieldLabel>
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Wi-Fi" />
      </div>
      {iconSelect}
      <div>
        <AppSectionHeader title="色味" as="p" />
        <AppOptionCardRow className="mt-2 !grid-cols-2" aria-label="色味">
          {INFO_TONES.map((t) => (
            <AppOptionCard
              key={t.value}
              label={t.label}
              selected={tone === t.value}
              onClick={() => onUpdate("tone", t.value)}
            />
          ))}
        </AppOptionCardRow>
      </div>
      <div>
        <AppSectionHeader
          title="行"
          trailing={
            <button
              type="button"
              className="app-native-add-btn ui-pop-tap"
              onClick={() => {
                const next = [...rows, { label: "見出し", value: "", show: true }];
                setRows(next);
                setExpandedIndex(next.length - 1);
              }}
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {rows.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">行を追加してください</p>
          ) : (
            rows.map((row, i) => {
              const expanded = expandedIndex === i;
              const label = readJaText(row.label) || `行 ${i + 1}`;
              const value = readJaText(row.value);
              return (
                <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={label}
                    subtitle={row.show === false ? "非表示" : value || undefined}
                    onClick={() => setExpandedIndex(expanded ? null : i)}
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="app-native-settings-action app-native-settings-action--danger"
                          onClick={() => {
                            setRows(rows.filter((_, idx) => idx !== i));
                            setExpandedIndex(null);
                          }}
                        >
                          削除
                        </button>
                      </div>
                      <label className="flex min-h-[var(--app-tap-min)] items-center gap-3">
                        <input
                          type="checkbox"
                          checked={row.show !== false}
                          onChange={(e) => updateRow(i, "show", e.target.checked)}
                          className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)]"
                        />
                        <span className="text-sm font-medium text-[var(--app-text)]">この行を表示</span>
                      </label>
                      {row.show !== false ? (
                        <>
                          <div>
                            <AppFieldLabel>見出し</AppFieldLabel>
                            <AppFieldInput
                              value={readJaText(row.label)}
                              onChange={(e) => updateRow(i, "label", e.target.value)}
                              placeholder="例: ネットワーク名"
                            />
                          </div>
                          <div>
                            <AppFieldLabel>本文</AppFieldLabel>
                            <AppFieldInput
                              value={readJaText(row.value)}
                              onChange={(e) => updateRow(i, "value", e.target.value)}
                              placeholder="表示する内容"
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
