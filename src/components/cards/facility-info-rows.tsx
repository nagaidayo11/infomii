"use client";

import type { ReactNode } from "react";
import { CARD_BLOCK_BODY_CLASS, CARD_BLOCK_CAPTION_CLASS } from "@/components/editor/types";

/** Label left / value right — compact in-room desk card rhythm. */
export function InfoDetailRow({
  label,
  children,
  valueClassName = CARD_BLOCK_BODY_CLASS,
  labelClassName = CARD_BLOCK_CAPTION_CLASS,
}: {
  label: ReactNode;
  children: ReactNode;
  valueClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2.5 py-1.5 first:pt-0 last:pb-0">
      <div className={`shrink-0 text-[12px] leading-snug ${labelClassName}`}>{label}</div>
      <div className={`min-w-0 flex-1 text-right text-[13px] leading-snug ${valueClassName}`}>{children}</div>
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
  return <div className={`mt-2 divide-y border-y ${divideClassName}`}>{children}</div>;
}
