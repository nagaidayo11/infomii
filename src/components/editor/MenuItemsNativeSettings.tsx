"use client";

import { useState, type ReactNode } from "react";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  AppFieldInput,
  AppFieldLabel,
  AppListRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";
import { ImageUpload } from "@/components/editor/ImageUpload";

function readJaText(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja");
}

function writeJaTextPreserving(prev: unknown, value: string): string | LocalizedString {
  if (typeof prev === "object" && prev !== null && !Array.isArray(prev) && ("ja" in prev || "en" in prev)) {
    return { ...(prev as Record<string, string>), ja: value };
  }
  return value;
}

type MenuItem = {
  name?: string;
  price?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  tag?: string;
  sizes?: string;
  note?: string;
  includes?: string;
};

type FieldKey = keyof MenuItem;

export function MenuItemsNativeSettings({
  content,
  onUpdate,
  fields = ["name", "price", "description", "image"],
  sectionTitle = "メニュー項目",
  addLabel = "新規メニュー",
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  fields?: Array<FieldKey | "image">;
  sectionTitle?: string;
  addLabel?: string;
}) {
  const items = (Array.isArray(content.items) ? content.items : []) as MenuItem[];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const setItems = (next: MenuItem[]) => onUpdate("items", next);

  const updateItem = (index: number, field: FieldKey, value: string) => {
    const next = [...items];
    next[index] = {
      ...(next[index] ?? {}),
      [field]: writeJaTextPreserving((next[index] as Record<string, unknown> | undefined)?.[field], value),
    };
    setItems(next);
  };

  return (
    <div>
      <AppSectionHeader
        title={sectionTitle}
        trailing={
          <button
            type="button"
            className="app-native-add-btn ui-pop-tap"
            onClick={() => {
              const next = [...items, { name: addLabel, price: "", description: "" }];
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
          <p className="px-4 py-3 text-sm text-[var(--app-text-muted)]">項目を追加してください</p>
        ) : (
          items.map((item, i) => {
            const expanded = expandedIndex === i;
            const name = readJaText(item.name) || `項目 ${i + 1}`;
            const price = readJaText(item.price);
            return (
              <div key={i} className="border-b border-[var(--app-border)] last:border-b-0">
                <AppListRow
                  title={name}
                  subtitle={price || readJaText(item.description) || undefined}
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
                    {fields.includes("name") ? (
                      <div>
                        <AppFieldLabel>メニュー名</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.name)}
                          onChange={(e) => updateItem(i, "name", e.target.value)}
                          placeholder="朝食ビュッフェ"
                        />
                      </div>
                    ) : null}
                    {fields.includes("price") ? (
                      <div>
                        <AppFieldLabel>価格</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.price)}
                          onChange={(e) => updateItem(i, "price", e.target.value)}
                          placeholder="1,800円"
                        />
                      </div>
                    ) : null}
                    {fields.includes("description") ? (
                      <div>
                        <AppFieldLabel>説明</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.description)}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                          placeholder="任意"
                        />
                      </div>
                    ) : null}
                    {fields.includes("tag") ? (
                      <div>
                        <AppFieldLabel>タグ</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.tag)}
                          onChange={(e) => updateItem(i, "tag", e.target.value)}
                          placeholder="人気 / 新作"
                        />
                      </div>
                    ) : null}
                    {fields.includes("sizes") ? (
                      <div>
                        <AppFieldLabel>サイズ価格</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.sizes)}
                          onChange={(e) => updateItem(i, "sizes", e.target.value)}
                          placeholder="S 400 / M 500"
                        />
                      </div>
                    ) : null}
                    {fields.includes("note") ? (
                      <div>
                        <AppFieldLabel>備考</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.note)}
                          onChange={(e) => updateItem(i, "note", e.target.value)}
                          placeholder="任意"
                        />
                      </div>
                    ) : null}
                    {fields.includes("includes") ? (
                      <div>
                        <AppFieldLabel>内容</AppFieldLabel>
                        <AppFieldInput
                          value={readJaText(item.includes)}
                          onChange={(e) => updateItem(i, "includes", e.target.value)}
                          placeholder="サラダ・スープ付き"
                        />
                      </div>
                    ) : null}
                    {fields.includes("image") ? (
                      <>
                        <div>
                          <AppFieldLabel>画像</AppFieldLabel>
                          <ImageUpload
                            onUploaded={(url) => updateItem(i, "imageSrc", url)}
                            className="!items-start !rounded-[var(--app-radius-md)] !border !border-[var(--app-border)] !bg-[var(--app-surface)] !p-3"
                          />
                        </div>
                        <div>
                          <AppFieldLabel>代替テキスト</AppFieldLabel>
                          <AppFieldInput
                            value={readJaText(item.imageAlt)}
                            onChange={(e) => updateItem(i, "imageAlt", e.target.value)}
                            placeholder="任意"
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
  );
}

export function MenuTagItemsNativeSettings({
  items,
  onChange,
}: {
  items: MenuItem[];
  onChange: (next: MenuItem[]) => void;
}) {
  return (
    <MenuItemsNativeSettings
      content={{ items }}
      onUpdate={(_key, value) => onChange(value as MenuItem[])}
      fields={["name", "price", "description", "tag", "image"]}
      sectionTitle="品目"
      addLabel="新品目"
    />
  );
}

export function DrinkItemsNativeSettings({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  return (
    <MenuItemsNativeSettings
      content={content}
      onUpdate={onUpdate}
      fields={["name", "sizes", "note", "image"]}
      sectionTitle="ドリンク"
      addLabel="新規ドリンク"
    />
  );
}

export function ComboItemsNativeSettings({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  return (
    <MenuItemsNativeSettings
      content={content}
      onUpdate={onUpdate}
      fields={["name", "price", "includes", "image"]}
      sectionTitle="セット"
      addLabel="新規セット"
    />
  );
}

export function MenuHeroNativeFields({ children }: { children?: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
