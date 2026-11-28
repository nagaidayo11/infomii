"use client";

import { useState, useRef, useEffect } from "react";

type InlineEditableProps = {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Multiline uses textarea; otherwise single-line input. */
  multiline?: boolean;
  /** When true, clicking switches to edit mode. */
  editable?: boolean;
  /** Called when user clicks to edit while not yet editable (e.g. to select card). Enables one-click inline edit from canvas. */
  onActivate?: () => void;
  /** Empty value shows a red required hint instead of falling back to placeholder copy. */
  required?: boolean;
};

/**
 * Inline text: click to edit, blur to save. No modal.
 * First click on text selects the card (onActivate) and enters edit mode so the canvas is the primary editing surface.
 */
export function InlineEditable({
  value,
  onSave,
  placeholder = "",
  className = "",
  multiline = false,
  editable = true,
  onActivate,
  required = false,
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setLocal(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const prevEditableRef = useRef(editable);
  useEffect(() => {
    if (prevEditableRef.current && !editable && editing) {
      setEditing(false);
      setLocal((prev) => {
        const trimmed = prev.trim();
        if (trimmed !== value) onSave(trimmed);
        return value;
      });
    }
    prevEditableRef.current = editable;
  }, [editable, editing, value, onSave]);

  const handleChange = (next: string) => {
    setLocal(next);
    onSave(next);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = local.trim();
    if (trimmed !== local) {
      setLocal(trimmed);
      if (trimmed !== value) onSave(trimmed);
    } else if (trimmed !== value) {
      onSave(trimmed);
    }
  };

  const canInlineEdit = editable || Boolean(onActivate);

  const startEditing = (e: React.MouseEvent) => {
    if (!canInlineEdit) return;
    e.stopPropagation();
    onActivate?.();
    setEditing(true);
  };

  const handleFocus = () => {
    if (!canInlineEdit) return;
    onActivate?.();
    setEditing(true);
  };

  const requiredHint = (
    <span className="mt-0.5 block text-[11px] font-medium text-rose-600">必須項目です</span>
  );
  const isEmpty = !value.trim();

  /** Guest / preview: plain text only — no focus ring, no keyboard focus, no click-to-edit affordance. */
  if (!canInlineEdit) {
    if (isEmpty) return null;
    return (
      <span
        className={
          multiline ? `whitespace-pre-wrap ${className}`.trim() : className
        }
      >
        {value}
      </span>
    );
  }

  if (editing) {
    /** 16px+ avoids iOS Safari auto-zoom on focus */
    const baseClass =
      "editor-inline-field w-full resize-none border-0 bg-transparent p-0 outline-none rounded px-0.5 py-px text-base leading-normal transition-[box-shadow] duration-150 ease-out focus:ring-0 focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] " +
      className;
    const field = multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            e.stopPropagation();
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
        }}
        className={baseClass}
        rows={Math.min(12, Math.max(1, local.split("\n").length))}
        placeholder={placeholder}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            e.stopPropagation();
          }
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className={baseClass}
        placeholder={placeholder}
      />
    );
    if (!required) return field;
    return (
      <span className="block min-w-0">
        {field}
        {isEmpty ? requiredHint : null}
      </span>
    );
  }

  /** multiline は block + align-top だと行ボックス下に余白が乗り「下だけ広い」見え方になりやすいので align は付けない */
  const displayClass =
    "cursor-text rounded transition-colors duration-150 ease-out hover:bg-slate-100/80 " +
    (multiline
      ? "block w-full max-w-full whitespace-pre-wrap break-words px-0.5 py-0 "
      : "px-0.5 py-px ") +
    className;

  const display = (
    <span role="button" tabIndex={0} className={displayClass} onClick={startEditing} onFocus={handleFocus}>
      {value.trim() ? value : required ? "\u00a0" : placeholder || "\u00a0"}
    </span>
  );
  if (!required) return display;
  return (
    <span className="block min-w-0">
      {display}
      {isEmpty ? requiredHint : null}
    </span>
  );
}
