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
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

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

  const commit = () => {
    setEditing(false);
    const trimmed = local.trim();
    if (trimmed !== value) onSave(trimmed);
    else setLocal(value);
  };

  const startEditing = (e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    onActivate?.();
    setEditing(true);
  };

  const handleFocus = () => {
    if (!editable) return;
    onActivate?.();
    setEditing(true);
  };

  /** Guest / preview: plain text only — no focus ring, no keyboard focus, no click-to-edit affordance. */
  if (!editable) {
    const text = value || placeholder || "\u00a0";
    return (
      <span
        className={
          multiline ? `whitespace-pre-wrap ${className}`.trim() : className
        }
      >
        {text}
      </span>
    );
  }

  if (editing) {
    const baseClass =
      "w-full resize-none border-0 bg-transparent p-0 outline-none rounded px-0.5 py-px transition-[box-shadow] duration-150 ease-out focus:ring-0 focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] " +
      className;
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
          }}
          className={baseClass}
          rows={3}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className={baseClass}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={
        "cursor-text rounded px-0.5 py-px transition-colors duration-150 ease-out hover:bg-slate-100/80 " +
        className
      }
      onClick={startEditing}
      onFocus={handleFocus}
    >
      {value || placeholder || "\u00a0"}
    </span>
  );
}
