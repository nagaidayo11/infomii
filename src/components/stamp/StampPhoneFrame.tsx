"use client";

import type { ReactNode } from "react";

/** Simple device frame for preview — bezel only, light screen, no chrome chrome. */
export function StampPhoneFrame({
  children,
  width = 340,
  label,
}: {
  children: ReactNode;
  width?: number;
  label?: string;
}) {
  const height = Math.round(width * (844 / 390));

  return (
    <div className="stamp-phone-wrap">
      {label ? (
        <p className="mb-2 text-center text-[11px] font-medium tracking-wide text-slate-500">
          {label}
        </p>
      ) : null}
      <div
        className="stamp-phone relative mx-auto overflow-hidden rounded-[2.25rem] bg-slate-900"
        style={{
          width,
          height,
          boxShadow: "0 24px 48px -24px rgba(15,23,42,0.4), 0 0 0 1px rgba(15,23,42,0.2)",
        }}
      >
        <div className="absolute inset-[10px] overflow-y-auto overscroll-contain rounded-[1.75rem] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
