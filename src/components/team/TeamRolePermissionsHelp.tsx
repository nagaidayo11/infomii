"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Team page help: role permissions (dashboard-style ? popover). */
export function TeamRolePermissionsHelp({ className = "" }: { className?: string }) {
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

  const roles = [
    { title: "オーナー", body: "メンバー管理 / 承認 / 招待管理 / 履歴確認" },
    { title: "管理者", body: "承認 / 招待管理 / メンバー管理（オーナー除く）" },
    { title: "編集担当", body: "編集 / 公開申請" },
    { title: "閲覧担当", body: "閲覧のみ" },
  ] as const;

  return (
    <div ref={rootRef} className={"relative inline-flex " + className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="app-button-native inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8eb] bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="ロールの権限の説明"
        title="ロールの権限の説明"
      >
        ?
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="ロールの権限"
          className="absolute right-0 top-full z-30 mt-2 w-[min(100vw-2rem,22rem)] rounded-lg border border-[#e6e8eb] bg-white p-3.5 text-left shadow-lg"
        >
          <p className="text-sm font-semibold text-slate-900">ロールの権限</p>
          <p className="mt-1 text-xs text-slate-500">オーナー／管理者／編集／閲覧でできること</p>
          <div className="mt-3 grid gap-2">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <p className="text-xs font-semibold text-slate-800">{role.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
