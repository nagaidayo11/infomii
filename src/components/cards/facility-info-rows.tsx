"use client";

import type { ReactNode } from "react";
import { CARD_BLOCK_BODY_CLASS, CARD_BLOCK_CAPTION_CLASS } from "@/components/editor/types";

/** Label left / value right — in-room desk card rhythm. */
export function InfoDetailRow({
  label,
  children,
  valueClassName = CARD_BLOCK_BODY_CLASS,
  labelClassName = CARD_BLOCK_CAPTION_CLASS,
}: {
  label: string;
  children: ReactNode;
  valueClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className={`shrink-0 ${labelClassName}`}>{label}</span>
      <div className={`min-w-0 flex-1 text-right ${valueClassName}`}>{children}</div>
    </div>
  );
}

export function InfoDetailList({
  children,
  divideClassName = "divide-slate-200/90 border-slate-200/90",
}: {
  children: ReactNode;
  divideClassName?: string;
}) {
  return <div className={`mt-3 divide-y border-y ${divideClassName}`}>{children}</div>;
}
