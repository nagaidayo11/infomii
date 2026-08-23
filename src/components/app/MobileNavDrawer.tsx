"use client";

import { useEffect } from "react";
import Link from "next/link";
import { getNavItemsByGroup, PRODUCT_TAGLINE } from "./app-nav-items";
import { AppNavLink } from "./AppNavLink";
import { useHotelName } from "@/lib/use-hotel-name";
import { SidebarPlanHint } from "./SidebarPlanHint";
import { InfomiiAppMark } from "./InfomiiAppMark";
import { LayoutGroup } from "framer-motion";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-height slide-in navigation for viewports below `lg`.
 * Locks body scroll while open.
 */
export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { hotelName, loaded: hotelNameLoaded } = useHotelName();
  const groups = getNavItemsByGroup();

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
        className="ui-overlay-fade absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="メニューを閉じる"
      />
      <nav
        className="ui-drawer-in absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-slate-200/80 bg-[#f3f4f6] shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="px-3 pb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5" onClick={onClose}>
            <InfomiiAppMark className="h-8 w-8 drop-shadow-[0_1px_1px_rgba(15,23,42,0.12)]" />
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold leading-none tracking-tight text-slate-900">
                Infomii
              </span>
              {hotelNameLoaded && hotelName ? (
                <span className="mt-1 block truncate text-[11px] font-medium leading-snug text-slate-500" title={hotelName}>
                  {hotelName}
                </span>
              ) : (
                <span className="mt-1 block text-[11px] leading-snug text-slate-500">{PRODUCT_TAGLINE}</span>
              )}
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 pb-2">
          <LayoutGroup id="app-mobile-nav">
            {groups.map((group) => (
              <div key={group.id}>
                <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <AppNavLink key={item.href} item={item} onClick={onClose} />
                  ))}
                </div>
              </div>
            ))}
          </LayoutGroup>
        </div>
        <div className="border-t border-slate-200/80 p-2.5">
          <SidebarPlanHint />
          <Link
            href="/lp/business"
            onClick={onClose}
            className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-200/50 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            サービス紹介
          </Link>
        </div>
      </nav>
    </div>
  );
}
