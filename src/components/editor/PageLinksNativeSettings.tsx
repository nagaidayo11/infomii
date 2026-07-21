"use client";

import { useEffect, useState } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { listPagesForHotel, type PageRow } from "@/lib/storage";
import { IconTokenSelect } from "@/components/editor/IconTokenSelect";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppOptionCard,
  AppOptionCardRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
import { LineIcon, normalizeIconToken } from "@/components/cards/LineIcon";

type PageLinksItem = {
  label?: string;
  description?: string;
  icon?: string;
  linkType?: "page" | "url";
  pageSlug?: string;
  link?: string;
};

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

function ColumnsPreview({ cols }: { cols: 2 | 3 }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: cols }).map((_, i) => (
        <span
          key={i}
          className="h-5 w-2.5 rounded-[3px]"
          style={{ background: "color-mix(in srgb, var(--app-accent) 35%, transparent)" }}
        />
      ))}
    </div>
  );
}

type PageLinksNativeSettingsProps = {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  /** Block title field (localized display string) */
  title: string;
  onTitleChange: (value: string) => void;
};

/** App native settings for pageLinks (Phase 2). */
export function PageLinksNativeSettings({
  content,
  onUpdate,
  title,
  onTitleChange,
}: PageLinksNativeSettingsProps) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    listPagesForHotel().then(setPages);
  }, []);

  const items = (Array.isArray(content.items) ? content.items : []) as PageLinksItem[];
  const rawColumns = typeof content.columns === "number" ? content.columns : Number(content.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const rawStyleVariant = typeof content.styleVariant === "string" ? content.styleVariant : "";
  const styleVariant =
    rawStyleVariant === "circle" ? "circle" : "tile";
  const accentColor =
    typeof content.accentColor === "string" && content.accentColor.trim()
      ? content.accentColor.trim()
      : "#0f766e";
  const defaultPageSlug = pages[0]?.slug ?? "";

  const setItems = (next: PageLinksItem[]) => onUpdate("items", next);
  const updateItem = (index: number, field: keyof PageLinksItem, value: string) => {
    const next = [...items];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setItems(next);
  };
  const addItem = () => {
    const next = [
      ...items,
      { label: "新規", icon: "info", linkType: "page" as const, pageSlug: defaultPageSlug, link: "" },
    ];
    setItems(next);
    setExpandedIndex(next.length - 1);
  };
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setExpandedIndex((cur) => {
      if (cur == null) return null;
      if (cur === index) return null;
      if (cur > index) return cur - 1;
      return cur;
    });
  };

  const openLinkedPageEditor = (slug: string) => {
    if (typeof window === "undefined") return;
    const target = pages.find((p) => p.slug === slug);
    if (!target?.id) return;
    window.open(`/editor/${target.id}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app-native-settings space-y-5">
      <div>
        <AppFieldLabel htmlFor="native-page-links-title">タイトル</AppFieldLabel>
        <AppFieldInput
          id="native-page-links-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="リンク"
        />
      </div>

      <div>
        <AppFieldLabel>表示スタイル</AppFieldLabel>
        <select
          value={styleVariant}
          onChange={(e) => onUpdate("styleVariant", e.target.value)}
          className="app-field-input"
        >
          <option value="tile">カードグリッド</option>
          <option value="circle">サークル</option>
        </select>
      </div>

      {styleVariant !== "circle" ? (
        <div>
          <AppFieldLabel htmlFor="native-page-links-accent">アクセント色</AppFieldLabel>
          <div className="flex items-center gap-2">
            <input
              id="native-page-links-accent"
              type="color"
              value={accentColor}
              onChange={(e) => onUpdate("accentColor", e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-white"
            />
            <AppFieldInput
              value={accentColor}
              onChange={(e) => onUpdate("accentColor", e.target.value)}
              placeholder="#0f766e"
            />
          </div>
        </div>
      ) : null}

      <div>
        <AppFieldLabel>列数</AppFieldLabel>
        <AppOptionCardRow aria-label="列数">
          <AppOptionCard
            label="2列"
            selected={columns === 2}
            preview={<ColumnsPreview cols={2} />}
            onClick={() => onUpdate("columns", 2)}
          />
          <AppOptionCard
            label="3列"
            selected={columns === 3 || columns === 4}
            preview={<ColumnsPreview cols={3} />}
            onClick={() => onUpdate("columns", 3)}
          />
        </AppOptionCardRow>
      </div>

      <div>
        <AppSectionHeader
          title="リンク項目"
          trailing={
            <button
              type="button"
              onClick={addItem}
              className="app-native-add-btn ui-pop-tap"
            >
              + 追加
            </button>
          }
        />

        <div className="mt-2 overflow-hidden rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-[var(--app-text-muted)]">リンクを追加してください</p>
          ) : (
            items.map((item, i) => {
              const label = readJaText(item.label) || "項目";
              const iconName = normalizeIconToken(item.icon, "link");
              const subtitle =
                (item.linkType ?? "page") === "url"
                  ? readJaText(item.link) || "外部URL"
                  : readJaText(item.pageSlug) || "ページ連携";
              const expanded = expandedIndex === i;

              return (
                <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                  <AppListRow
                    title={label}
                    subtitle={subtitle}
                    leading={<LineIcon name={iconName} className="h-5 w-5" />}
                    onClick={() => setExpandedIndex(expanded ? null : i)}
                    trailing={
                      <svg
                        className={
                          "h-5 w-5 shrink-0 text-[var(--app-text-muted)] opacity-60 transition-transform " +
                          (expanded ? "rotate-90" : "")
                        }
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  />
                  {expanded ? (
                    <div className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
                        >
                          削除
                        </button>
                      </div>
                      <div>
                        <AppFieldLabel>ラベル</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.label)}
                          onChange={(e) => updateItem(i, "label", e.target.value)}
                          placeholder="航空券"
                        />
                      </div>
                      {styleVariant !== "circle" ? (
                        <div>
                          <AppFieldLabel>説明（任意）</AppFieldLabel>
                          <AppFieldInput
                            value={readJaText(item.description)}
                            onChange={(e) => updateItem(i, "description", e.target.value)}
                            placeholder="15:00〜 / 客室・ロビー"
                          />
                        </div>
                      ) : null}
                      <IconTokenSelect
                        label="アイコン"
                        value={item.icon}
                        onChange={(next) => updateItem(i, "icon", next)}
                        className="w-full rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-white px-3 py-2 text-sm"
                        labelClassName="mb-1.5 block text-xs font-semibold text-[var(--app-text-muted)]"
                      />
                      <div>
                        <AppFieldLabel>リンク先</AppFieldLabel>
                        <select
                          value={item.linkType ?? "page"}
                          onChange={(e) => {
                            const nextType = e.target.value as "page" | "url";
                            const next = [...items];
                            const current = next[i] ?? {};
                            next[i] = {
                              ...current,
                              linkType: nextType,
                              pageSlug:
                                nextType === "page"
                                  ? (typeof current.pageSlug === "string" && current.pageSlug) ||
                                    defaultPageSlug
                                  : current.pageSlug,
                            };
                            setItems(next);
                          }}
                          className="app-field-input"
                        >
                          <option value="page">Infomii内のページ</option>
                          <option value="url">外部URL</option>
                        </select>
                      </div>
                      {(item.linkType ?? "page") === "page" ? (
                        <div>
                          <AppFieldLabel>ページを選択</AppFieldLabel>
                          <select
                            value={readJaText(item.pageSlug) || defaultPageSlug}
                            onChange={(e) => updateItem(i, "pageSlug", e.target.value)}
                            className="app-field-input"
                          >
                            {pages.length === 0 ? <option value="">ページがありません</option> : null}
                            {pages.map((p) => (
                              <option key={p.id} value={p.slug}>
                                {p.title || p.slug || ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => openLinkedPageEditor(item.pageSlug ?? "")}
                            disabled={!item.pageSlug}
                            className="mt-2 min-h-[44px] w-full rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--app-text)] disabled:opacity-50"
                          >
                            リンク先ページを編集する
                          </button>
                        </div>
                      ) : (
                        <div>
                          <AppFieldLabel>URL</AppFieldLabel>
                          <AppFieldInput
                            value={readJaText(item.link)}
                            onChange={(e) => updateItem(i, "link", e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      )}
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
