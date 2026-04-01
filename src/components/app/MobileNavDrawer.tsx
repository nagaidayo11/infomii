"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_ITEMS, PRODUCT_TAGLINE } from "./app-nav-items";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-height slide-in navigation for viewports below `lg`.
 * Locks body scroll while open.
 */
export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="メインメニュー">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="メニューを閉じる"
      />
      <nav
        className="absolute inset-y-0 left-0 flex w-[min(100%,288px)] flex-col border-r border-slate-200/90 bg-slate-50 shadow-2xl"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="border-b border-slate-200/60 px-4 pb-3">
          <Link href="/dashboard" className="block rounded-xl py-0.5" onClick={onClose}>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Infomii</span>
            <p className="mt-0.5 text-[11px] font-normal text-slate-500">{PRODUCT_TAGLINE}</p>
          </Link>
        </div>
        <div className="app-stagger flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {APP_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={
                  "app-interactive flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                  (isActive
                    ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900")
                }
              >
                <span
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                    (isActive ? "bg-slate-100 text-slate-800" : "text-slate-500")
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div
          className="border-t border-slate-200/60 p-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/"
            className="app-interactive flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-700"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            トップへ
          </Link>
        </div>
      </nav>
    </div>
  );
}
