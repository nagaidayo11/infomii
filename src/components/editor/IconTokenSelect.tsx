"use client";

import { LineIcon, normalizeIconToken, type LineIconName } from "@/components/cards/LineIcon";
import { LINE_ICON_EDITOR_OPTIONS } from "@/lib/editor-line-icon-options";

type IconTokenSelectProps = {
  id?: string;
  /** 非表示時は select に aria-label を付与 */
  label: string;
  /** true のときラベル行を出さない（キャンバス埋め込み用） */
  hideLabel?: boolean;
  /** 保存値（svg:wifi や旧エイリアスも可 — 表示は正規化） */
  value: string | undefined;
  onChange: (next: LineIconName | "") => void;
  className: string;
  labelClassName: string;
  /** Allow clearing the icon (shows 「なし」). */
  allowEmpty?: boolean;
};

/**
 * LineIcon トークンをページ設定と同じ視認しやすい格子で選択する。
 */
export function IconTokenSelect({
  id,
  label,
  hideLabel = false,
  value,
  onChange,
  className: _className,
  labelClassName,
  allowEmpty = false,
}: IconTokenSelectProps) {
  void _className;
  const trimmed = typeof value === "string" ? value.trim() : "";
  const normalized = allowEmpty && !trimmed ? "" : normalizeIconToken(value, "info");
  const selectedLabel =
    normalized === ""
      ? "なし"
      : LINE_ICON_EDITOR_OPTIONS.find((opt) => opt.value === normalized)?.label ?? normalized;

  return (
    <div className="w-full">
      {!hideLabel &&
        (id ? (
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
        ) : (
          <span className={labelClassName}>{label}</span>
        ))}
      <div
        id={id}
        role="listbox"
        aria-label={label}
        className="mt-1.5 max-h-[9.5rem] overflow-y-auto overscroll-contain rounded-md border border-slate-200 bg-white p-1.5"
      >
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
          {allowEmpty ? (
            <button
              type="button"
              role="option"
              aria-selected={normalized === ""}
              title="なし"
              aria-label="なし"
              onClick={() => onChange("")}
              className={
                "inline-flex h-9 w-full items-center justify-center rounded-md border text-[10px] font-medium transition " +
                (normalized === ""
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")
              }
            >
              なし
            </button>
          ) : null}
          {LINE_ICON_EDITOR_OPTIONS.map((opt) => {
            const selected = normalized === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                title={opt.label}
                aria-label={opt.label}
                onClick={() => onChange(opt.value)}
                className={
                  "inline-flex h-9 w-full items-center justify-center rounded-md border transition " +
                  (selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                }
              >
                <LineIcon name={opt.value} className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-1 truncate text-[11px] text-slate-500">{selectedLabel}</p>
    </div>
  );
}
