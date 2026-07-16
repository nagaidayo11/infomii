"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Dashboard help: explains per-page live-ops (混雑) quick switches.
 */
export function LiveOpsDashboardHelp({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={"relative inline-flex " + className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="app-button-native inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8eb] bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="混雑クイック切替の説明"
        title="混雑クイック切替の説明"
      >
        ?
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="混雑クイック切替の説明"
          className="absolute right-0 top-full z-30 mt-2 w-[min(100vw-2rem,20rem)] rounded-lg border border-[#e6e8eb] bg-white p-3.5 text-left shadow-lg"
        >
          <p className="text-sm font-semibold text-slate-900">混雑のクイック切替</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
            <li>朝食・夕食・大浴場の混雑を、フロントから大きなボタンで更新できます。</li>
            <li>ボタンは、そのブロックがあるページの行にだけ出ます。</li>
            <li>状態はページごとに別々です。ゲスト画面へすぐ反映されます。</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
