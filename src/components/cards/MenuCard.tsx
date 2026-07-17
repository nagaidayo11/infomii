"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage } from "@/components/cards/menu-card-visual";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, MenuItemInlineRow } from "./card-inline-fields";
import { NativeDiningIcon } from "./native-guest-icons";
import { NativeMenuShell, NATIVE_MENU_ITEM_ROW } from "./native-menu-ui";

type MenuCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function MenuCard({ card, locale = "ja" }: MenuCardProps) {
  const editor = useCardContentEditor(card);
  const { isNativeUi } = useClientShell();
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  const hasHero = heroSrc.trim().length > 0;

  if (isNativeUi) {
    const titleNode =
      bind.editable || title.trim() ? (
        <InlineEditable
          value={title}
          onSave={(v) => editor.setField("title", v)}
          editable={bind.editable}
          onActivate={bind.onActivate}
          className="app-section-header__title"
          placeholder="メニュー"
        />
      ) : (
        title
      );

    return (
      <NativeMenuShell
        title={titleNode}
        icon={<NativeDiningIcon />}
        heroSrc={heroSrc}
        heroAlt={heroAlt}
        locale={locale}
        onActivate={bind.onActivate}
      >
        <div className="space-y-2.5">
          {items.slice(0, 12).map((item, index) => (
            <MenuItemInlineRow
              key={index}
              locale={locale}
              bind={bind}
              name={getLocalizedContent(item.name as LocalizedString | undefined, locale)}
              price={getLocalizedContent(item.price as LocalizedString | undefined, locale)}
              description={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
              imageSrc={typeof item.imageSrc === "string" ? item.imageSrc : ""}
              imageAlt={item.imageAlt as LocalizedString | undefined}
              rowClassName={NATIVE_MENU_ITEM_ROW}
              onSaveName={(v) => editor.setArrayItemField("items", index, "name", v)}
              onSavePrice={(v) => editor.setArrayItemField("items", index, "price", v)}
              onSaveDescription={(v) => editor.setArrayItemField("items", index, "description", v)}
            />
          ))}
        </div>
      </NativeMenuShell>
    );
  }

  const body = (
    <>
      <CardTitleInline
        title={title}
        onSave={(v) => editor.setField("title", v)}
        placeholder="メニュー"
        bind={bind}
      />
      <div className="mt-3 space-y-2.5">
        {items.slice(0, 12).map((item, index) => (
          <MenuItemInlineRow
            key={index}
            locale={locale}
            bind={bind}
            name={getLocalizedContent(item.name as LocalizedString | undefined, locale)}
            price={getLocalizedContent(item.price as LocalizedString | undefined, locale)}
            description={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
            imageSrc={typeof item.imageSrc === "string" ? item.imageSrc : ""}
            imageAlt={item.imageAlt as LocalizedString | undefined}
            rowClassName={`flex gap-3 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-sm`}
            onSaveName={(v) => editor.setArrayItemField("items", index, "name", v)}
            onSavePrice={(v) => editor.setArrayItemField("items", index, "price", v)}
            onSaveDescription={(v) => editor.setArrayItemField("items", index, "description", v)}
          />
        ))}
      </div>
    </>
  );

  if (hasHero) {
    return (
      <Card padding="none" className="overflow-hidden">
        <MenuCardHeroImage heroSrc={heroSrc} heroAlt={heroAlt} locale={locale} />
        <div className="px-3 py-3">{body}</div>
      </Card>
    );
  }

  return <Card padding="md">{body}</Card>;
}
