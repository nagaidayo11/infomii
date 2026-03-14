"use client";

import type { ReactNode } from "react";

type MobileGuestFrameProps = {
  children: ReactNode;
  /** Outer wrapper class */
  className?: string;
  /** Screen width (default 300). Use 375 for editor preview. */
  width?: number;
};

/**
 * iPhone-style device frame around guest content.
 * Mobile-first; content scrolls inside the screen area.
 */
export function MobileGuestFrame({
  children,
  className = "",
  width = 300,
}: MobileGuestFrameProps) {
  return (
    <div
      className={`flex justify-center ${className}`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-[2.35rem] border-[10px] border-stone-900 bg-stone-900 shadow-2xl"
        style={{
          width: width + 20,
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Dynamic Island / notch */}
        <div className="absolute left-1/2 top-2.5 z-20 h-7 w-[100px] -translate-x-1/2 rounded-full bg-stone-950" />
        {/* Screen */}
        <div
          className="mt-10 flex flex-col overflow-hidden rounded-b-[1.5rem] bg-[#fafaf9]"
          style={{ minHeight: Math.min(640, width * 1.6), maxHeight: "70vh" }}
        >
          <div className="template-preview-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
