"use client";

import { useEffect, useState } from "react";

/**
 * 保存成功時に2秒間表示するトースト
 */
export function SaveToast({ lastSavedAt }: { lastSavedAt: number | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastSavedAt == null) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, [lastSavedAt]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      保存しました
    </div>
  );
}
