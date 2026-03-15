"use client";

import { useState, useRef, useEffect } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type TextCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function TextCard({ card, isSelected, locale = "ja" }: TextCardProps) {
  const raw = card.content?.content;
  const content = getLocalizedContent(raw as LocalizedString | undefined, locale);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content || "");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(content || "");
  }, [content]);

  useEffect(() => {
    if (editing && isSelected) inputRef.current?.focus();
  }, [editing, isSelected]);

  const save = () => {
    setEditing(false);
    const cur = card.content?.content;
    const next = typeof cur === "object" && cur !== null && "ja" in cur
      ? { ...(cur as Record<string, string>), ja: value }
      : value;
    updateCard(card.id, { ...card.content, content: next });
  };

  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50" : ""}>
      {isSelected && editing ? (
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          className="w-full resize-none border-0 bg-transparent p-0 text-base font-medium text-slate-800 outline-none"
          rows={3}
        />
      ) : (
        <p
          className="min-h-[1.5em] text-base font-medium text-slate-800"
          onDoubleClick={() => isSelected && setEditing(true)}
        >
          {content || " "}
        </p>
      )}
    </Card>
  );
}
