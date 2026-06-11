"use client";

import { InlineEditable } from "@/components/editor/InlineEditable";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { MenuItemThumb } from "@/components/cards/menu-card-visual";
import type { LocalizedString } from "@/lib/localized-content";

type InlineBind = {
  editable: boolean;
  onActivate?: () => void;
};

export function CardTitleInline({
  title,
  onSave,
  placeholder = "見出し",
  bind,
}: {
  title: string;
  onSave: (v: string) => void;
  placeholder?: string;
  bind: InlineBind;
}) {
  if (!bind.editable && !title.trim()) return null;
  return (
    <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
      <InlineEditable
        value={title}
        onSave={onSave}
        editable={bind.editable}
        onActivate={bind.onActivate}
        className={CARD_BLOCK_TITLE_CLASS}
        placeholder={placeholder}
      />
    </p>
  );
}

type MenuItemInlineRowProps = {
  name: string;
  price?: string;
  description?: string;
  tag?: string;
  sizes?: string;
  note?: string;
  includes?: string;
  imageSrc?: string;
  imageAlt?: LocalizedString;
  locale: string;
  bind: InlineBind;
  onSaveName: (v: string) => void;
  onSavePrice?: (v: string) => void;
  onSaveDescription?: (v: string) => void;
  onSaveTag?: (v: string) => void;
  onSaveSizes?: (v: string) => void;
  onSaveNote?: (v: string) => void;
  onSaveIncludes?: (v: string) => void;
  duration?: string;
  onSaveDuration?: (v: string) => void;
  rowClassName: string;
};

export function MenuItemInlineRow({
  name,
  price,
  description,
  tag,
  sizes,
  note,
  includes,
  imageSrc = "",
  imageAlt,
  locale,
  bind,
  onSaveName,
  onSavePrice,
  onSaveDescription,
  onSaveTag,
  onSaveSizes,
  onSaveNote,
  onSaveIncludes,
  duration,
  onSaveDuration,
  rowClassName,
}: MenuItemInlineRowProps) {
  return (
    <div data-inner-surface className={rowClassName}>
      <MenuItemThumb src={imageSrc} alt={imageAlt} locale={locale} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug text-slate-800" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={name}
            onSave={onSaveName}
            editable={bind.editable}
            onActivate={bind.onActivate}
            className="inline font-semibold text-slate-800"
            placeholder="メニュー名"
          />
          {onSaveDuration ? (
            <span className="ml-2 font-normal text-slate-500">
              （
              <InlineEditable
                value={duration ?? ""}
                onSave={onSaveDuration}
                editable={bind.editable}
                onActivate={bind.onActivate}
                className="inline text-slate-500"
                placeholder="所要時間"
              />
              ）
            </span>
          ) : null}
          {onSavePrice ? (
            <>
              <span className={onSaveDuration ? "ml-1" : ""}>
                {onSaveDuration ? null : " — "}
                <InlineEditable
                  value={price ?? ""}
                  onSave={onSavePrice}
                  editable={bind.editable}
                  onActivate={bind.onActivate}
                  className="inline font-semibold text-slate-800"
                  placeholder="価格"
                />
              </span>
            </>
          ) : null}
          {onSaveTag ? (
            <span className="ml-2 inline-block align-middle">
              <InlineEditable
                value={tag ?? ""}
                onSave={onSaveTag}
                editable={bind.editable}
                onActivate={bind.onActivate}
                className="inline rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600"
                placeholder="タグ"
              />
            </span>
          ) : null}
        </p>
        {onSaveSizes ? (
          <p className="mt-0.5 text-slate-700" style={getBodyFontSizeStyle()}>
            <InlineEditable
              value={sizes ?? ""}
              onSave={onSaveSizes}
              editable={bind.editable}
              onActivate={bind.onActivate}
              className="block w-full text-slate-700"
              placeholder="サイズ・価格"
            />
          </p>
        ) : null}
        {onSaveIncludes ? (
          <p className="mt-1 leading-relaxed text-slate-600" style={getBodyFontSizeStyle()}>
            <InlineEditable
              value={includes ?? ""}
              onSave={onSaveIncludes}
              editable={bind.editable}
              onActivate={bind.onActivate}
              multiline
              className="block w-full min-h-[1lh] text-slate-600"
              placeholder="セット内容"
            />
          </p>
        ) : null}
        {onSaveDescription ? (
          <p className="mt-1 leading-relaxed text-slate-500" style={getBodyFontSizeStyle()}>
            <InlineEditable
              value={description ?? ""}
              onSave={onSaveDescription}
              editable={bind.editable}
              onActivate={bind.onActivate}
              multiline
              className="block w-full min-h-[1lh] text-slate-500"
              placeholder="説明"
            />
          </p>
        ) : null}
        {onSaveNote ? (
          <p className="mt-1 text-xs text-slate-500" style={getBodyFontSizeStyle()}>
            <InlineEditable
              value={note ?? ""}
              onSave={onSaveNote}
              editable={bind.editable}
              onActivate={bind.onActivate}
              className="block w-full text-slate-500"
              placeholder="メモ"
            />
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PlainInline({
  value,
  onSave,
  bind,
  className = "",
  placeholder = "",
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  bind: InlineBind;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <InlineEditable
      value={value}
      onSave={onSave}
      editable={bind.editable}
      onActivate={bind.onActivate}
      className={className}
      placeholder={placeholder}
      multiline={multiline}
    />
  );
}
