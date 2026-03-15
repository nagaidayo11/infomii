"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type NoticeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function NoticeCard({ card, isSelected }: NoticeCardProps) {
  const c = card.content as { title?: string; body?: string; variant?: string } | undefined;
  const title = c?.title ?? "お知らせ";
  const body = c?.body;
  const variant = c?.variant ?? "info";
  const isWarning = variant === "warning";
  return (
    <Card
      padding="md"
      className={
        (isWarning ? "bg-amber-50 border-amber-200/80 " : "bg-sky-50/80 border-sky-200/80 ") +
        (isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : "")
      }
    >
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {body && <p className="mt-1 text-xs text-slate-600">{body}</p>}
    </Card>
  );
}
