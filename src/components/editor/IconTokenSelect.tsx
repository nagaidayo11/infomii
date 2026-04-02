"use client";

import { normalizeIconToken, type LineIconName } from "@/components/cards/LineIcon";
import { LINE_ICON_EDITOR_OPTIONS } from "@/lib/editor-line-icon-options";

type IconTokenSelectProps = {
  id?: string;
  /** 非表示時は select に aria-label を付与 */
  label: string;
  /** true のときラベル行を出さない（キャンバス埋め込み用） */
  hideLabel?: boolean;
  /** 保存値（svg:wifi や旧エイリアスも可 — 表示は正規化） */
  value: string | undefined;
  onChange: (next: LineIconName) => void;
  className: string;
  labelClassName: string;
};

/**
 * LineIcon トークンのみ選択可能（テキスト入力なし）
 */
export function IconTokenSelect({
  id,
  label,
  hideLabel = false,
  value,
  onChange,
  className,
  labelClassName,
}: IconTokenSelectProps) {
  const normalized = normalizeIconToken(value, "info");
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
      <select
        id={id}
        value={normalized}
        onChange={(e) => onChange(e.target.value as LineIconName)}
        className={className}
        aria-label={hideLabel ? label : undefined}
      >
        {LINE_ICON_EDITOR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
