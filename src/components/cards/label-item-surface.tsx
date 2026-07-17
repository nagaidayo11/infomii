"use client";

import type { ReactNode } from "react";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import type { DeskTone } from "./desk-tone";

/** Soft inset surface for label-row / nearby-style items. */
export function LabelItemSurface({
  tone = "slate",
  children,
  className = "",
}: {
  tone?: DeskTone;
  children: ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50/55"
      : tone === "sky"
        ? "bg-sky-50/55"
        : tone === "emerald"
          ? "bg-emerald-50/50"
          : tone === "rose"
            ? "bg-rose-50/50"
            : "bg-slate-50/70";

  return (
    <div
      data-inner-surface
      className={`${editorInnerRadiusClassName} px-3 py-2.5 ${toneClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function LabelItemStack({ children }: { children: ReactNode }) {
  return <div className="mt-3 space-y-2">{children}</div>;
}
